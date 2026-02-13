'use server';

import { getPayload } from 'payload';
import configPromise from '@payload-config';

export async function getUnassignedJobs() {
    try {
        const payload = await getPayload({ config: configPromise });
        const result = await payload.find({
            collection: 'service-requests',
            where: {
                status: {
                    equals: 'confirmed' // Jobs that are paid/confirmed but not dispatched
                }
            },
            depth: 1,
        });

        return result.docs.map(doc => ({
            id: doc.id,
            ticketId: doc.ticketId,
            customerName: (doc.customer as any).name || 'Unknown',
            customerAddress: (doc.customer as any).address || 'No address',
            issue: doc.issueDescription,
            urgency: doc.urgency,
            timestamp: doc.createdAt,
        }));
    } catch (error) {
        console.error('Error fetching unassigned jobs:', error);
        return [];
    }
}

export async function getAllTechnicians() {
    try {
        const payload = await getPayload({ config: configPromise });
        const result = await payload.find({
            collection: 'users',
            where: {
                role: {
                    equals: 'technician'
                }
            }
        });

        return result.docs.map(tech => ({
            id: tech.id,
            name: tech.name,
            email: tech.email,
            isOnline: !!(tech as any).pushSubscription // Rough proxy for "online" if they have a sub
        }));
    } catch (error) {
        console.error('Error fetching technicians:', error);
        return [];
    }
}