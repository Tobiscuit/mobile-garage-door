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

  // 1b. Fetch ALL Payments (Square + Manual)
  // This is the Financial Source of Truth
  const { docs: payments } = await payload.find({
    collection: 'payments',
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

  // Process Service Requests (Job Stats Only)
  requests.forEach((req) => {
    // Job Status Counts
    if (['pending', 'confirmed', 'dispatched', 'on_site'].includes(req.status || '')) {
      activeRequests++;
    }
    
    if (req.status === 'pending') {
      pendingQuotes++;
    }
  });

  // Process ALL Payments for Revenue
  payments.forEach((p) => {
      // Only count COMPLETED or APPROVED payments
      if (p.status !== 'COMPLETED' && p.status !== 'APPROVED') return;

      const amountCents = Number(p.amount || 0);
      const amountDollars = amountCents / 100; // Assuming stored in cents
      
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

        revalidatePath('/dashboard');
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
    const response = await squareClient.payments.list({
        limit: 100,
        sortOrder: 'DESC',
        sortField: 'CREATED_AT'
    });
    
    let count = 0;
    
    // Iterate over the Page object (AsyncIterable)
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
  } catch (error: any) {
    console.error('Sync Square Error:', error);
    
    // Check if it's a JSON serialization error from the Square SDK response
    if (error.message?.includes('JSON') || error.type === 'invalid_json') {
         return { success: false, error: 'Square API returned invalid JSON. Check API version or network.' };
    }

    return { success: false, error: error.message || 'Failed to sync payments' };
  }
}

// NEW: Force Reset & Sync to ensure 100% accuracy with Square
export async function resetAndSyncSquarePayments() {
    try {
        const payload = await getPayload({ config: configPromise });

        // 1. Delete ALL payments that are NOT manual (assuming manual start with MANUAL-)
        // Actually, to be safe and "Mirror Square", we should probably keep Manual ones but delete Square ones.
        // But the user wants "accurate as to what Square has".
        // Let's delete all payments where squarePaymentId does NOT start with MANUAL
        
        await payload.delete({
            collection: 'payments',
            where: {
                squarePaymentId: {
                    not_like: 'MANUAL-%'
                }
            }
        });

        // 2. Fetch fresh from Square using the async iterator pattern
        const response = await squareClient.payments.list({
            limit: 100,
            sortOrder: 'DESC',
            sortField: 'CREATED_AT'
        });

        let totalSynced = 0;

        for await (const payment of response) {
            const squarePaymentId = payment.id;
            if (!squarePaymentId) continue;
    
            const status = payment.status;
            const amount = Number(payment.amountMoney?.amount || 0);
            const currency = payment.amountMoney?.currency || 'USD';
            const sourceType = payment.sourceType;
            const note = payment.note || '';

            // We know we deleted them, so just create
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
             totalSynced++;
        }

        revalidatePath('/dashboard');
        return { success: true, count: totalSynced };

    } catch (error: any) {
        console.error('Reset Sync Error:', error);
        return { success: false, error: error.message };
    }
}

export async function getRecentPayments(limit = 20) {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'payments',
    sort: '-createdAt',
    limit,
  });
  return docs;
}

// === NEW ACTIONS FOR KPI SHEETS ===

export async function getActiveJobsList() {
    try {
        const payload = await getPayload({ config: configPromise });
        const result = await payload.find({
            collection: 'service-requests',
            where: {
                status: {
                    in: ['pending', 'confirmed', 'dispatched', 'on_site']
                }
            },
            sort: '-createdAt',
            limit: 20,
            depth: 0,
        });

        return result.docs.map(doc => ({
            id: doc.id,
            status: doc.status,
            customerName: (doc.customer as any)?.name || 'Unknown Customer', // If customer is populated or not
            urgency: doc.urgency,
            createdAt: doc.createdAt,
            issue: doc.issueDescription
        }));
    } catch (error) {
        console.error('Error fetching active jobs:', error);
        return [];
    }
}

export async function getTechnicianStatusList() {
    try {
        const payload = await getPayload({ config: configPromise });
        const result = await payload.find({
            collection: 'users',
            where: {
                role: { equals: 'technician' }
            }
        });

        // In a real app, we'd check a "lastSeen" or "status" field.
        // For now, we'll assume they are "Online" if they exist.
        return result.docs.map(tech => ({
            id: tech.id,
            name: tech.name,
            email: tech.email,
            status: 'online', // Mock status
            lastActive: new Date().toISOString() // Mock time
        }));
    } catch (error) {
        console.error('Error fetching technicians:', error);
        return [];
    }
}

export async function getRecentTechnicians(limit = 5) {
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: 'users',
      where: {
        role: { equals: 'technician' },
      },
      sort: '-lastLogin',
      limit,
      depth: 0,
    });

    return result.docs.map((tech) => ({
      id: tech.id,
      email: tech.email,
      lastLogin: tech.lastLogin,
    }));
  } catch (error) {
    console.error('Error fetching recent technicians:', error);
    return [];
  }
}
