'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import webpush from 'web-push';

// Configure Web Push (Move to global config if used elsewhere)
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

        // 2. Fetch Technician's Push Subscription
        const tech = await payload.findByID({ collection: 'users', id: technicianId });
        
        // Cast to any because pushSubscription type might not be generated yet or is 'unknown'
        const subscription = (tech as any).pushSubscription;

        if (subscription) {
             try {
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
