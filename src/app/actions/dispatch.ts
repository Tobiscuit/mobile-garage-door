'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import webpush from 'web-push';

// Configure Web Push (Move to global config if used elsewhere)
webpush.setVapidDetails(
    'mailto:admin@mobilegaragedoor.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function assignJobToTechnician(jobId: string, technicianId: string) {
    try {
        const payload = await getPayload({ config: configPromise });

        // 1. Update the Service Request
        const updatedJob = await payload.update({
            collection: 'service-requests',
            id: jobId,
            data: {
                status: 'dispatched',
                assignedTech: Number(technicianId), // Ensure it's a number for SQLite/Postgres relation or correct type
            },
        });

        // 2. Fetch Technician's Push Subscription (Assuming it's stored on the User profile)
        // NOTE: We need to add a 'pushSubscription' field to the Users collection first.
        // For now, we will simulate the push notification log.
        
        /* 
        const tech = await payload.findByID({ collection: 'users', id: technicianId });
        if (tech.pushSubscription) {
             await webpush.sendNotification(
                 tech.pushSubscription,
                 JSON.stringify({ 
                     title: 'New Mission Assigned!', 
                     body: `Ticket #${updatedJob.ticketId}: ${updatedJob.issueDescription}`,
                     url: `/technician`
                 })
             );
        }
        */

        console.log(`Job ${jobId} assigned to Tech ${technicianId}. Push Notification Sent (Simulated).`);

        return { success: true };

    } catch (error) {
        console.error('Error assigning job:', error);
        return { success: false, error: 'Failed to assign job' };
    }
}
