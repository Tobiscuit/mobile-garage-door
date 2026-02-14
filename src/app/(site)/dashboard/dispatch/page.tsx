import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { DispatchClient } from './DispatchClient';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DispatchPage() {
    const payload = await getPayload({ config: configPromise });
    const headersList = await headers();
    const { user } = await payload.auth({ headers: headersList });

    // Type guard: user must exist and have a 'role' property (User collection)
    if (!user || !('role' in user) || (user.role !== 'admin' && user.role !== 'dispatcher')) {
        redirect('/admin/login');
    }

    // 1. Fetch unassigned (confirmed) jobs
    const jobs = await payload.find({
        collection: 'service-requests',
        where: {
            status: { equals: 'confirmed' }
        },
        depth: 1, // Populate customer details
        sort: '-createdAt'
    });

    // 2. Fetch technicians
    const technicians = await payload.find({
        collection: 'users',
        where: {
            role: { equals: 'technician' }
        }
    });

    // Transform data for client component
    const serializedJobs = jobs.docs.map(job => ({
        id: job.id,
        ticketId: job.ticketId,
        urgency: job.urgency,
        issueDescription: job.issueDescription,
        customer: {
            name: (job.customer as any).name || 'Unknown',
            address: (job.customer as any).address || 'No Address',
        },
        createdAt: job.createdAt
    }));

    const serializedTechs = technicians.docs.map(tech => ({
        id: tech.id,
        name: tech.name || tech.email,
        pushSubscription: !!(tech as any).pushSubscription
    }));

    return (
        <div className="container mx-auto">
            <DispatchClient jobs={serializedJobs} technicians={serializedTechs} />
        </div>
    );
}
