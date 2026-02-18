import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { headers } from 'next/headers';
import { serviceRequestService } from '@/services/serviceRequestService';
import { PortalHeader } from '@/features/portal/PortalHeader';
import { ActiveRequestList } from '@/features/portal/ActiveRequestList';
import { ServiceHistory } from '@/features/portal/ServiceHistory';
import { AccountSidebar } from '@/features/portal/AccountSidebar';
import { getSessionSafe } from '@/lib/get-session-safe';

export const dynamic = 'force-dynamic';

export default async function PortalDashboard() {
  const headerList = await headers();
  const session = await getSessionSafe(headerList);

  if (!session) return null; // Handled by layout/middleware

  const payload = await getPayload({ config: configPromise });
  const user = session.user;
  const customer = user as any;
  const isBuilder = customer.customerType === 'builder';

  // Use Service Layer for data fetching
  // Ensure we are passing a valid user ID string
  const activeRequests = await serviceRequestService.getActiveRequests(payload, String(user.id));
  const pastRequests = await serviceRequestService.getPastRequests(payload, String(user.id));

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
      <PortalHeader customerName={customer.companyName || customer.name} isBuilder={isBuilder} />
      
      {isBuilder && (
         <div className="bg-blue-900/10 border border-blue-900/20 rounded-xl p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="bg-blue-900 text-white p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <div>
                    <h3 className="font-bold text-charcoal-blue">Builder Account</h3>
                    <p className="text-sm text-gray-600">You have access to multi-site management features.</p>
                </div>
            </div>
            {/* Future: Add "Add Job Site" button */}
         </div>
      )}

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
