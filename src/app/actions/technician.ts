'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { headers } from 'next/headers';

export async function savePushSubscription(subscription: any) {
    try {
        const payload = await getPayload({ config: configPromise });
        const headersList = await headers();
        const { user } = await payload.auth({ headers: headersList });

        if (!user) {
            console.error('No authenticated user found for subscription');
            return { success: false, error: 'Unauthorized' };
        }

        await payload.update({
            collection: 'users',
            id: user.id,
            data: {
                pushSubscription: subscription
            } as any
        });
        return { success: true };

    } catch (error) {
        console.error('Error saving subscription:', error);
        return { success: false };
    }
}

export async function getAvailableJobs() {
    try {
        const payload = await getPayload({ config: configPromise });
        const headersList = await headers();
        const { user } = await payload.auth({ headers: headersList });

        if (!user) {
             return [];
        }

        // Fetch jobs assigned to "me" (the logged in technician)
        // OR jobs that are 'confirmed' (waiting for assignment) IF we want a hybrid model
        // But strict assignment means only showing jobs where assignedTechId = user.id

        const result = await payload.find({
            collection: 'service-requests',
            where: {
                and: [
                    {
                        assignedTech: {
                            equals: user.id
                        }
                    },
                    {
                        status: {
                            not_equals: 'completed'
                        }
                    }
                ]
            },
            depth: 1, 
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
