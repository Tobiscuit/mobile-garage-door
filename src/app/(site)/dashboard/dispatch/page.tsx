import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { DispatchClient } from './DispatchClient';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionSafe } from '@/lib/get-session-safe';

export default async function DispatchPage() {
    const headersList = await headers();
    const session = await getSessionSafe(headersList);
    const payload = await getPayload({ config: configPromise });

    if (!session) {
        redirect('/login');
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
            name: (job.customer as any).name || (job.customer as any).email || 'Unknown Customer',
            address: (job.customer as any).address || 'No Address Provided',
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
