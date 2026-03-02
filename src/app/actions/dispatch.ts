'use server';

import { getDB } from "@/db";
import { users, serviceRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import webpush from 'web-push';
import { getCloudflareContext } from "vinext/cloudflare";

// Configure Web Push
try {
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
            'mailto:admin@mobilegaragedoor.com',
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    } else {
        console.warn('VAPID Keys missing - Push Notifications disabled');
    }
} catch (err) {
    console.error('Error configuring Web Push:', err);
}

export async function assignJobToTechnician(jobId: number, technicianId: string) {
    try {
        const { env } = await getCloudflareContext();
        const db = getDB(env.DB);

        // 1. Update the Service Request
        const updatedJobs = await db.update(serviceRequests)
            .set({
                status: 'dispatched',
                assignedTechId: technicianId,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(serviceRequests.id, jobId))
            .returning();

        const updatedJob = updatedJobs[0];

        // 2. Fetch Technician's Push Subscription
        const techResult = await db.select().from(users).where(eq(users.id, technicianId)).limit(1);
        const tech = techResult[0];
        
        if (tech && tech.pushSubscription) {
             try {
                 const subscription = JSON.parse(tech.pushSubscription);
                 await webpush.sendNotification(
                     subscription,
                     JSON.stringify({ 
                         title: 'New Mission Assigned!', 
                         body: `Ticket #${updatedJob.ticketId}: ${updatedJob.issueDescription}`,
                         url: `/technician`
                     })
                 );
                 console.log(`Push notification sent to ${tech.email}`);
             } catch (pushError) {
                 console.error('Failed to send push notification:', pushError);
             }
        }

        console.log(`Job ${jobId} assigned to Tech ${technicianId}.`);

        return { success: true };

    } catch (error) {
        console.error('Error assigning job:', error);
        return { success: false, error: 'Failed to assign job' };
    }
}
