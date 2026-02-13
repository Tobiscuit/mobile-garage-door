'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function getAvailableJobs() {
    try {
        const payload = await getPayload({ config: configPromise });

        const result = await payload.find({
            collection: 'service-requests',
            where: {
                status: {
                    equals: 'confirmed'
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
