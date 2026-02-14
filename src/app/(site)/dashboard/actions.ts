'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function getDashboardStats() {
  const payload = await getPayload({ config: configPromise });

  // 1. Fetch Service Requests (for Revenue & Job Stats)
  // In a real app with thousands of records, we'd use an aggregation query or raw SQL.
  // For now, fetching all is fine for a small business dashboard.
  const { docs: requests } = await payload.find({
    collection: 'service-requests',
    limit: 1000, // Reasonable limit for now
    depth: 0, // We only need the data, not relations
  });

  // 2. Fetch Technicians
  const { totalDocs: techCount } = await payload.find({
    collection: 'users',
    where: {
      role: { equals: 'technician' },
    },
    limit: 0, // Just count
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
