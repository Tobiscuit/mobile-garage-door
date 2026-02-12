import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { headers } from 'next/headers';
import { serviceRequestService } from '@/services/serviceRequestService';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { ActiveRequestList } from '@/components/portal/ActiveRequestList';
import { ServiceHistory } from '@/components/portal/ServiceHistory';
import { AccountSidebar } from '@/components/portal/AccountSidebar';

export const dynamic = 'force-dynamic';

export default async function PortalDashboard() {
  const payload = await getPayload({ config: configPromise });
  // Get user from auth
  const headerList = await headers();
  const { user } = await payload.auth({ headers: headerList });

  if (!user) return null; // Should be handled by layout/middleware

  const customer = user as any;

  // Use Service Layer for data fetching
  const activeRequests = await serviceRequestService.getActiveRequests(payload, user.id);
  const pastRequests = await serviceRequestService.getPastRequests(payload, user.id);

  const activeMapped = activeRequests.docs.map(doc => ({
    id: String(doc.id),
    ticketId: (doc as any).ticketId,
    status: (doc as any).status,
    issueDescription: (doc as any).issueDescription,
    scheduledTime: (doc as any).scheduledTime,
  }));

  const pastMapped = pastRequests.docs.map(doc => ({
    id: String(doc.id),
    ticketId: (doc as any).ticketId,
    issueDescription: (doc as any).issueDescription,
    createdAt: doc.createdAt,
  }));

  return (
    <div className="space-y-8">
      <PortalHeader customerName={customer.name} />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <ActiveRequestList requests={activeMapped as any} />
          <ServiceHistory requests={pastMapped as any} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AccountSidebar customer={{
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          }} />
        </div>
      </div>
    </div>
  );
}
