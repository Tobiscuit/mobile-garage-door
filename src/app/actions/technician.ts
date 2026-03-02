'use server';

import { getDB } from "@/db";
import { users, serviceRequests } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { headers } from 'next/headers';
import { getCloudflareContext } from "vinext/cloudflare";

export async function savePushSubscription(subscription: any) {
    try {
        const { env } = await getCloudflareContext();
        const db = getDB(env.DB);
        const headersList = await headers();
        const { getSessionSafe } = await import('@/lib/get-session-safe');
        const session = await getSessionSafe(headersList);
        
        if (!session?.user) {
            console.error('No authenticated user found for subscription');
            return { success: false, error: 'Unauthorized' };
        }

        const user = session.user;

        await db.update(users)
            .set({
                pushSubscription: JSON.stringify(subscription)
            })
            .where(eq(users.id, user.id));
        return { success: true };

    } catch (error) {
        console.error('Error saving subscription:', error);
        return { success: false };
    }
}

export async function getAvailableJobs() {
    try {
        const { env } = await getCloudflareContext();
        const db = getDB(env.DB);
        const headersList = await headers();
        const { getSessionSafe } = await import('@/lib/get-session-safe');
        const session = await getSessionSafe(headersList);

        if (!session?.user) {
             return [];
        }

        const user = session.user;

        const results = await db.select({
            id: serviceRequests.id,
            ticketId: serviceRequests.ticketId,
            customerName: users.name,
            customerAddress: users.address,
            issue: serviceRequests.issueDescription,
            urgency: serviceRequests.urgency,
            timestamp: serviceRequests.createdAt,
            status: serviceRequests.status
        })
        .from(serviceRequests)
        .leftJoin(users, eq(serviceRequests.customerId, users.id))
        .where(
            and(
                eq(serviceRequests.assignedTechId, user.id),
                ne(serviceRequests.status, 'completed')
            )
        );

        return results.map(row => ({
            ...row,
            customerName: row.customerName || 'Unknown',
            customerAddress: row.customerAddress || 'No address',
        }));

    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
}

export async function acceptJob(jobId: number) {
    try {
        const { env } = await getCloudflareContext();
        const db = getDB(env.DB);

        await db.update(serviceRequests)
            .set({
                status: 'dispatched',
                updatedAt: new Date().toISOString()
            })
            .where(eq(serviceRequests.id, jobId));

        return { success: true };
    } catch (error) {
        console.error('Error accepting job:', error);
        return { success: false };
    }
}
