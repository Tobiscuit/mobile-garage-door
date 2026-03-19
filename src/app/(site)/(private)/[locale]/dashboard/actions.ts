'use server';

import { getDB } from "@/db";
import { users, serviceRequests, payments as paymentsTable } from "@/db/schema";
import { eq, and, or, not, inArray, like, notLike, desc } from "drizzle-orm";
import { revalidatePath } from 'next/cache';
import { SquareClient, SquareEnvironment } from 'square';
import { getCloudflareContext } from "@/lib/cloudflare";

// SquareClient is dynamically instantiated inside functions that need it using getCloudflareContext().env

export async function getDashboardStats() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);

    const requests = await db.select().from(serviceRequests).limit(1000);
    const payments = await db.select().from(paymentsTable).limit(1000);
    const techs = await db.select().from(users).where(eq(users.role, 'technician'));

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfWeekDate = new Date(now);
    startOfWeekDate.setDate(now.getDate() - now.getDay());
    const startOfWeek = startOfWeekDate.toISOString();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    let lifetimeRevenue = 0;
    let monthlyRevenue = 0;
    let weeklyRevenue = 0;
    let todayRevenue = 0;

    let activeRequestsCount = 0;
    let pendingQuotes = 0;

    requests.forEach((req) => {
      if (['pending', 'confirmed', 'dispatched', 'on_site'].includes(req.status || '')) {
        activeRequestsCount++;
      }
      if (req.status === 'pending') {
        pendingQuotes++;
      }
    });

    payments.forEach((p) => {
      if (p.status !== 'COMPLETED' && p.status !== 'APPROVED') return;

      const amountDollars = (p.amount || 0) / 100;
      lifetimeRevenue += amountDollars;

      const pDate = p.createdAt;
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
        active: activeRequestsCount,
        pending: pendingQuotes,
        total: requests.length,
      },
      technicians: {
        total: techs.length,
        online: techs.length,
      },
    };
  } catch (error) {
    console.error("DASHBOARD STATS CRASH:", error);
    return {
      revenue: { lifetime: 0, monthly: 0, weekly: 0, today: 0 },
      jobs: { active: 0, pending: 0, total: 0 },
      technicians: { total: 0, online: 0 }
    };
  }
}

export async function createManualPayment(amount: number, sourceType: 'CASH' | 'EXTERNAL', note: string) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);

    if (amount <= 0) throw new Error('Invalid amount');

    const manualId = `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await db.insert(paymentsTable).values({
      squarePaymentId: manualId,
      amount: Math.round(amount * 100),
      currency: 'USD',
      status: 'COMPLETED',
      sourceType,
      note,
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
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);

    const squareClient = new SquareClient({
      token: env.SQUARE_ACCESS_TOKEN,
      environment: env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });

    const response = await squareClient.payments.list({
      limit: 100,
      sortOrder: 'DESC',
      sortField: 'CREATED_AT'
    });

    let count = 0;

    for await (const payment of response) {
      if (count >= 100) break;

      const squarePaymentId = payment.id;
      if (!squarePaymentId) continue;

      const status = payment.status;
      const amount = Number(payment.amountMoney?.amount || 0);
      const currency = payment.amountMoney?.currency || 'USD';
      const sourceType = payment.sourceType;
      const note = payment.note || '';

      const existing = await db.select().from(paymentsTable).where(eq(paymentsTable.squarePaymentId, squarePaymentId)).limit(1);

      if (existing.length === 0) {
        await db.insert(paymentsTable).values({
          squarePaymentId,
          amount,
          currency,
          status,
          sourceType,
          note,
        });
        count++;
      } else {
        if (existing[0].status !== status) {
          await db.update(paymentsTable)
            .set({ status, updatedAt: new Date().toISOString() })
            .where(eq(paymentsTable.id, existing[0].id));
        }
      }
    }

    revalidatePath('/dashboard');
    return { success: true, count };
  } catch (error: any) {
    console.error('Sync Square Error:', error);
    return { success: false, error: error.message || 'Failed to sync payments' };
  }
}

export async function resetAndSyncSquarePayments() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);

    const squareClient = new SquareClient({
      token: env.SQUARE_ACCESS_TOKEN,
      environment: env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
    });

    await db.delete(paymentsTable).where(notLike(paymentsTable.squarePaymentId, 'MANUAL-%'));

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

      await db.insert(paymentsTable).values({
        squarePaymentId,
        amount,
        currency,
        status,
        sourceType,
        note,
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
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);
    const result = await db.select().from(paymentsTable).orderBy(desc(paymentsTable.createdAt)).limit(limit);
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    return [];
  }
}

export async function getActiveJobsList() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);

    const results = await db.select({
      id: serviceRequests.id,
      ticketId: serviceRequests.ticketId,
      status: serviceRequests.status,
      customerName: users.name,
      customerEmail: users.email,
      urgency: serviceRequests.urgency,
      quotedPrice: serviceRequests.quotedPrice,
      createdAt: serviceRequests.createdAt,
      issue: serviceRequests.issueDescription
    })
      .from(serviceRequests)
      .leftJoin(users, eq(serviceRequests.customerId, users.id))
      .where(
        inArray(serviceRequests.status, ['pending', 'confirmed', 'dispatched', 'on_site'])
      )
      .orderBy(desc(serviceRequests.createdAt))
      .limit(20);

    const plainResult = results.map(row => ({
      ...row,
      customerName: row.customerName || 'Unknown Customer'
    }));
    return JSON.parse(JSON.stringify(plainResult));
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    return [];
  }
}

export async function getTechnicianStatusList() {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);

    const techs = await db.select().from(users).where(eq(users.role, 'technician'));

    const plainTechs = techs.map(tech => ({
      id: tech.id,
      name: tech.name,
      email: tech.email,
      status: 'online',
      lastActive: new Date().toISOString()
    }));
    return JSON.parse(JSON.stringify(plainTechs));
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return [];
  }
}

export async function getRecentTechnicians(limit = 5) {
  try {
    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);

    const result = await db.select()
      .from(users)
      .where(eq(users.role, 'technician'))
      .orderBy(desc(users.lastLogin))
      .limit(limit);

    const plainResult = result.map((tech) => ({
      id: tech.id,
      email: tech.email,
      lastLogin: tech.lastLogin,
    }));
    return JSON.parse(JSON.stringify(plainResult));
  } catch (error) {
    console.error('Error fetching recent technicians:', error);
    return [];
  }
}
