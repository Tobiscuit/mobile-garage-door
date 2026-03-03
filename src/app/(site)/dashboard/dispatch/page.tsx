import { DispatchClient } from './DispatchClient';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionSafe } from '@/lib/get-session-safe';
import { getDB } from "@/db";
import { users, serviceRequests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCloudflareContext } from "@/lib/cloudflare";

export default async function DispatchPage() {
    const headersList = await headers();
    const session = await getSessionSafe(headersList);

    if (!session) {
        redirect('/login');
    }

    const { env } = await getCloudflareContext();
    const db = getDB(env.DB);

    const jobs = await db.select({
        id: serviceRequests.id,
        ticketId: serviceRequests.ticketId,
        urgency: serviceRequests.urgency,
        issueDescription: serviceRequests.issueDescription,
        createdAt: serviceRequests.createdAt,
        customerName: users.name,
        customerEmail: users.email,
        customerAddress: users.address,
    })
    .from(serviceRequests)
    .leftJoin(users, eq(serviceRequests.customerId, users.id))
    .where(eq(serviceRequests.status, 'confirmed'))
    .orderBy(desc(serviceRequests.createdAt));

    const technicians = await db.select().from(users).where(eq(users.role, 'technician'));

    const serializedJobs = jobs.map(job => ({
        id: job.id,
        ticketId: job.ticketId,
        urgency: job.urgency,
        issueDescription: job.issueDescription,
        customer: {
            name: job.customerName || job.customerEmail || 'Unknown Customer',
            address: job.customerAddress || 'No Address Provided',
        },
        createdAt: job.createdAt
    }));

    const serializedTechs = technicians.map(tech => ({
        id: tech.id,
        name: tech.name || tech.email,
        pushSubscription: !!tech.pushSubscription
    }));

    return (
        <div className="container mx-auto">
            <DispatchClient jobs={serializedJobs} technicians={serializedTechs} />
        </div>
    );
}
