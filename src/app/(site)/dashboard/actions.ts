'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { revalidatePath } from 'next/cache';
import { SquareClient, SquareEnvironment } from 'square';

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

export async function getDashboardStats() {
  const payload = await getPayload({ config: configPromise });

  // 1. Fetch Service Requests (for Revenue & Job Stats)
  const { docs: requests } = await payload.find({
    collection: 'service-requests',
    limit: 1000,
    depth: 0,
  });

  // 1b. Fetch External/Manual Payments
  const { docs: payments } = await payload.find({
    collection: 'payments',
    where: {
      sourceType: {
        in: ['CASH', 'EXTERNAL']
      }
    },
    limit: 1000,
  });

  // 2. Fetch Technicians
  const { totalDocs: techCount } = await payload.find({
    collection: 'users',
    where: {
      role: { equals: 'technician' },
    },
    limit: 0, 
  });

  // 3. Calculate Metrics
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let lifetimeRevenue = 0;
  let monthlyRevenue = 0;
  let weeklyRevenue = 0;
  let todayRevenue = 0;
  
  let activeRequests = 0;
  let pendingQuotes = 0;

  // Process Service Request Payments (Square Online)
  requests.forEach((req) => {
    // Revenue Calculation
    if (req.tripFeePayment && typeof req.tripFeePayment === 'object') {
      const payment = req.tripFeePayment as any;
      const amountCents = Number(payment.amountMoney?.amount || 0);
      const amountDollars = amountCents / 100;

      lifetimeRevenue += amountDollars;

      const reqDate = new Date(req.createdAt);
      if (reqDate >= startOfMonth) monthlyRevenue += amountDollars;
      if (reqDate >= startOfWeek) weeklyRevenue += amountDollars;
      if (reqDate >= startOfToday) todayRevenue += amountDollars;
    }

    // Job Status Counts
    if (['pending', 'confirmed', 'dispatched', 'on_site'].includes(req.status || '')) {
      activeRequests++;
    }
    
    if (req.status === 'pending') {
      pendingQuotes++;
    }
  });

  // Process Manual/External Payments
  payments.forEach((p) => {
      const amountCents = Number(p.amount || 0);
      const amountDollars = amountCents / 100; // Assuming stored in cents like Square
      
      lifetimeRevenue += amountDollars;

      const pDate = new Date(p.createdAt);
      if (pDate >= startOfMonth) monthlyRevenue += amountDollars;
      if (pDate >= startOfWeek) weeklyRevenue += amountDollars;
      if (pDate >= startOfToday) todayRevenue += amountDollars;
  });

  return {
    revenue: {
      lifetime: lifetimeRevenue,
      monthly: monthlyRevenue,
      weekly: weeklyRevenue,
      today: todayRevenue,
    },
    jobs: {
      active: activeRequests,
      pending: pendingQuotes,
      total: requests.length,
    },
    technicians: {
      total: techCount,
      online: techCount, 
    },
  };
}

export async function createManualPayment(amount: number, sourceType: 'CASH' | 'EXTERNAL', note: string) {
    try {
        const payload = await getPayload({ config: configPromise });
        
        // Ensure amount is valid (positive)
        if (amount <= 0) throw new Error('Invalid amount');

        // Create Payment Record
        // We'll generate a pseudo-ID for manual payments: MANUAL-{TIMESTAMP}
        const manualId = `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await payload.create({
            collection: 'payments',
            data: {
                squarePaymentId: manualId, // Using this unique field for our ID
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'USD',
                status: 'COMPLETED',
                sourceType,
                note,
            } as any // Type casting until types are regenerated
        });

        return { success: true };

    } catch (error) {
        console.error('Manual Payment Error:', error);
        return { success: false, error: 'Failed to record payment' };
    }
}

export async function syncSquarePayments() {
  try {
    const payload = await getPayload({ config: configPromise });
    
    // List payments from Square (last 100)
    // Using list() instead of listPayments() for newer Square SDK
    // sortOrder is not explicitly supported in the list() options in recent versions, usually returns newest first.
    const response = await squareClient.payments.list({
      limit: 100,
    });
    
    let count = 0;
    // The response is async iterable in the new SDK
    for await (const payment of response) {
        if (count >= 100) break; // Limit to 100
        
        const squarePaymentId = payment.id;
        if (!squarePaymentId) continue;

        const status = payment.status;
        const amount = Number(payment.amountMoney?.amount || 0);
        const currency = payment.amountMoney?.currency || 'USD';
        const sourceType = payment.sourceType;
        const note = payment.note || '';

        // Check if exists
        const existingPayments = await payload.find({
          collection: 'payments',
          where: {
            squarePaymentId: { equals: squarePaymentId },
          },
        });

        if (existingPayments.totalDocs === 0) {
           await payload.create({
            collection: 'payments',
            data: {
              squarePaymentId,
              amount,
              currency,
              status,
              sourceType,
              note,
            } as any
          });
          count++;
        } else {
             // Optional: Update status if changed
             if (existingPayments.docs[0].status !== status) {
                 await payload.update({
                     collection: 'payments',
                     id: existingPayments.docs[0].id,
                     data: { status } as any
                 });
             }
        }
    }
    
    revalidatePath('/dashboard');
    return { success: true, count };
  } catch (error) {
    console.error('Sync Square Error:', error);
    return { success: false, error: 'Failed to sync payments' };
  }
}
