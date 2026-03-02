'use server';

import { getDB } from "@/db";
import { users, serviceRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCloudflareContext } from "vinext/cloudflare";

export async function getUnassignedJobs() {
    try {
        const { env } = await getCloudflareContext();
        const db = getDB(env.DB);

        const results = await db.select({
            id: serviceRequests.id,
            ticketId: serviceRequests.ticketId,
            customerName: users.name,
            customerAddress: users.address,
            issue: serviceRequests.issueDescription,
            urgency: serviceRequests.urgency,
            timestamp: serviceRequests.createdAt,
        })
        .from(serviceRequests)
        .leftJoin(users, eq(serviceRequests.customerId, users.id))
        .where(eq(serviceRequests.status, 'confirmed'));

        return results.map(row => ({
            ...row,
            customerName: row.customerName || 'Unknown',
            customerAddress: row.customerAddress || 'No address',
        }));
    } catch (error) {
        console.error('Error fetching unassigned jobs:', error);
        return [];
    }
}

export async function getAllTechnicians() {
    try {
        const { env } = await getCloudflareContext();
        const db = getDB(env.DB);

        const result = await db.select().from(users).where(eq(users.role, 'technician'));

        return result.map(tech => ({
            id: tech.id,
            name: tech.name,
            email: tech.email,
            isOnline: !!tech.pushSubscription
        }));
    } catch (error) {
        console.error('Error fetching technicians:', error);
        return [];
    }
}
