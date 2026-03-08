import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { serviceRequestService } from '@/services/serviceRequestService';
import { getDB } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@/lib/cloudflare";
import TechJobActions from '@/features/dashboard/TechJobActions';

export const dynamic = 'force-dynamic';

export default async function TechnicianDashboard() {
  const { env } = await getCloudflareContext();
  const db = getDB(env.DB);
  let headerList = new Headers();
  let isStaticPass = false;
  try {
    headerList = await headers();
  } catch (e) {
    isStaticPass = true;
  }
  const { getSessionSafe } = await import('@/lib/get-session-safe');
  const session = await getSessionSafe(headerList);
  if (!session && !isStaticPass) {
    redirect('/login');
  }

  const user = session.user as any;

  if (!user || (user.role !== 'technician' && user.role !== 'admin')) {
    redirect('/app');
  }

  const assignedJobs = await serviceRequestService.getAssignedRequests(env.DB, user.id!);

  // Fetch customer details for each job
  const jobsWithCustomers = await Promise.all(assignedJobs.map(async (job) => {
    const customer = job.customerId ? await db.select().from(users).where(eq(users.id, job.customerId)).limit(1) : [];
    return { ...job, customer: customer[0] };
  }));

  return (
    <div className="min-h-screen bg-charcoal-blue text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
          <div>
            <div className="text-[#f1c40f] font-mono text-sm uppercase tracking-widest mb-2">Technician Portal</div>
            <h1 className="text-4xl font-black">Field Operations</h1>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xl font-bold">{user.name}</div>
            <div className="text-gray-400 text-sm">Unit ID: {String(user.id).substring(0, 8)}</div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid gap-6">
          {jobsWithCustomers.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10">
              <div className="text-2xl font-bold text-gray-400 mb-2">No Active Assignments</div>
              <p className="text-gray-500">You're currently clear. Stand by for dispatch.</p>
            </div>
          ) : (
            jobsWithCustomers.map((job: any) => (
              <div key={job.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#f1c40f]/50 transition-colors group">
                <div className="flex flex-col md:flex-row gap-6 justify-between">

                  {/* Status Column */}
                  <div className="md:w-48 flex-shrink-0">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 \${
                      job.urgency === 'emergency' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {job.urgency}
                    </div>
                    <div className="text-sm text-gray-400 font-mono mb-1">Ticket ID</div>
                    <div className="text-xl font-bold text-white font-mono">{job.ticketId}</div>
                  </div>

                  {/* Details Column */}
                  <div className="flex-grow">
                    <div className="mb-4">
                      <div className="text-sm text-gray-400 font-mono mb-1">Customer</div>
                      <div className="text-lg font-bold">{job.customer?.name || 'Unknown'}</div>
                      <div className="text-gray-400">{job.customer?.phone || ''}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 font-mono mb-1">Issue</div>
                      <p className="text-gray-300 leading-relaxed">{job.issueDescription}</p>
                    </div>
                  </div>

                  {/* Action Column */}
                  <div className="md:w-64 flex-shrink-0 flex flex-col justify-between border-l border-white/10 pl-6 border-dashed">
                    <div className="text-right mb-4">
                      <div className="text-sm text-gray-400 font-mono mb-1">Scheduled For</div>
                      <div className="text-[#f1c40f] font-bold text-lg">
                        {job.scheduledTime ? new Date(job.scheduledTime).toLocaleString() : 'TBD'}
                      </div>
                    </div>

                    <TechJobActions
                      jobId={job.id}
                      ticketId={job.ticketId}
                      currentStatus={job.status || 'pending'}
                    />
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
