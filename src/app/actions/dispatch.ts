'use server';

import { getDB } from "@/db";
import { users, serviceRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPushNotification, sendPushToUser } from "@/lib/push";
import { getCloudflareContext } from "@/lib/cloudflare";

export async function assignJobToTechnician(jobId: number, technicianId: string) {
    try {
        const { env } = await getCloudflareContext();
        const db = getDB(env.DB);

        // 1. Update the Service Request
        const updatedJobs = await db.update(serviceRequests)
            .set({
                status: 'confirmed',
                assignedTechId: technicianId,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(serviceRequests.id, jobId))
            .returning();

        const updatedJob = updatedJobs[0];

        // 2. Notify the technician
        const techResult = await db.select().from(users).where(eq(users.id, technicianId)).limit(1);
        const tech = techResult[0];
        
        if (tech && tech.pushSubscription) {
             try {
                 await sendPushNotification(
                     tech.pushSubscription,
                     { 
                         title: 'New Mission Assigned!', 
                         body: `Ticket #${updatedJob.ticketId}: ${updatedJob.issueDescription}`,
                         data: { url: '/technician' },
                     },
                     env as any
                 );
                 console.log(`Push notification sent to ${tech.email}`);
             } catch (pushError) {
                 console.error('Failed to send push notification:', pushError);
             }
        }

        // 3. Notify the customer that their tech is on the way
        if (updatedJob.customerId) {
            try {
                const techName = tech?.name || 'Your technician';
                await sendPushToUser(
                    updatedJob.customerId,
                    {
                        title: '✅ Technician Assigned!',
                        body: `${techName} has been assigned to your service request. We'll notify you when they're on the way.`,
                        tag: 'job-assigned',
                        data: { url: `/portal/track/${updatedJob.ticketId}`, ticketId: updatedJob.ticketId },
                    },
                    env as any
                );
            } catch (pushError) {
                console.error('Failed to send customer push:', pushError);
            }
        }

        console.log(`Job ${jobId} assigned to Tech ${technicianId}.`);

        return { success: true };

    } catch (error) {
        console.error('Error assigning job:', error);
        return { success: false, error: 'Failed to assign job' };
    }
}

