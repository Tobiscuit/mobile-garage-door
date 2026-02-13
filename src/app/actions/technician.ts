'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function savePushSubscription(subscription: any) {
    // In a real app, use auth() to get current user ID
    // const session = await auth();
    // const userId = session.user.id;
    
    // For MVP/Demo: We'll assume the first user with role 'technician' is the one using this device
    // Or we just skip this step if we don't have auth fully wired up yet.
    
    try {
         const payload = await getPayload({ config: configPromise });
         
         // Find a demo technician (or the logged in one)
         const techs = await payload.find({
             collection: 'users',
             where: { role: { equals: 'technician' } },
             limit: 1
         });

         if (techs.totalDocs > 0) {
            await payload.update({
                collection: 'users',
                id: techs.docs[0].id,
                data: {
                    pushSubscription: subscription
                } as any
            });
            return { success: true };
        }
         return { success: false, error: 'No technician found' };

    } catch (error) {
        console.error('Error saving subscription:', error);
        return { success: false };
    }
}

export async function getAvailableJobs() {
    try {
        const payload = await getPayload({ config: configPromise });

        // Fetch jobs assigned to "me" (Demo: Fetch all dispatched jobs for now, or specific to demo tech)
        // AND fetch 'confirmed' jobs (pool) if that's the model, 
        // BUT user said: "client assigns it... who gets notification".
        // So Tech Dashboard should probably only show assigned jobs.

        const result = await payload.find({
            collection: 'service-requests',
            where: {
                status: {
                    in: ['dispatched', 'confirmed'] // For now show both so we can see movement
                }
            },
            depth: 1, // Populate customer details
        });

        // Serialize data for client
        return result.docs.map(doc => ({
            id: doc.id,
            ticketId: doc.ticketId,
            customerName: (doc.customer as any).name || 'Unknown',
            customerAddress: (doc.customer as any).address || 'No address',
            issue: doc.issueDescription,
            urgency: doc.urgency,
            timestamp: doc.createdAt,
            status: doc.status
        }));

    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
}

export async function acceptJob(jobId: string) {
    // In a real app, we'd check the current user's ID
    // For now, we'll just update the status to 'dispatched'
    try {
        const payload = await getPayload({ config: configPromise });

        await payload.update({
            collection: 'service-requests',
            id: jobId,
            data: {
                status: 'dispatched'
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error accepting job:', error);
        return { success: false };
    }
}
