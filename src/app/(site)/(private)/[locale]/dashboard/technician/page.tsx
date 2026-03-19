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
    <div className="p-2 md:p-6 font-sans" style={{ color: 'var(--staff-text)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-end mb-12 pb-6" style={{ borderBottom: '1px solid var(--staff-border)' }}>
          <div>
            <div className="font-mono text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--staff-accent)' }}>Technician Portal</div>
            <h1 className="text-4xl font-black" style={{ color: 'var(--staff-text)' }}>Field Operations</h1>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xl font-bold" style={{ color: 'var(--staff-text)' }}>{user.name}</div>
            <div className="text-sm" style={{ color: 'var(--staff-muted)' }}>Unit ID: {String(user.id).substring(0, 8)}</div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid gap-6">
          {jobsWithCustomers.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: 'var(--staff-border)', border: '1px solid var(--staff-border)' }}>
              <div className="text-2xl font-bold mb-2" style={{ color: 'var(--staff-muted)' }}>No Active Assignments</div>
              <p style={{ color: 'var(--staff-muted)' }}>You're currently clear. Stand by for dispatch.</p>
            </div>
          ) : (
            jobsWithCustomers.map((job: any) => (
              <div key={job.id} className="rounded-2xl p-6 transition-colors group" style={{ backgroundColor: 'var(--staff-border)', border: '1px solid var(--staff-border)' }}>
                <div className="flex flex-col md:flex-row gap-6 justify-between">

                  {/* Status Column */}
                  <div className="md:w-48 flex-shrink-0">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${
                      job.urgency === 'emergency' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {job.urgency}
                    </div>
                    <div className="text-sm font-mono mb-1" style={{ color: 'var(--staff-muted)' }}>Ticket ID</div>
                    <div className="text-xl font-bold font-mono" style={{ color: 'var(--staff-text)' }}>{job.ticketId}</div>
                  </div>

                  {/* Details Column */}
                  <div className="flex-grow">
                    <div className="mb-4">
                      <div className="text-sm font-mono mb-1" style={{ color: 'var(--staff-muted)' }}>Customer</div>
                      <div className="text-lg font-bold" style={{ color: 'var(--staff-text)' }}>{job.customer?.name || 'Unknown'}</div>
                      {job.customer?.phone && (
                        <a href={`tel:${job.customer.phone}`} className="text-sm underline" style={{ color: 'var(--staff-muted)' }}>{job.customer.phone}</a>
                      )}
                    </div>
                    {job.customer?.address && (
                      <div className="mb-4">
                        <div className="text-sm font-mono mb-1" style={{ color: 'var(--staff-muted)' }}>Address</div>
                        <div className="leading-relaxed mb-2" style={{ color: 'var(--staff-text)' }}>{job.customer.address}</div>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.customer.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                          style={{ backgroundColor: 'var(--staff-accent)', color: '#000' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                          Navigate
                        </a>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-mono mb-1" style={{ color: 'var(--staff-muted)' }}>Issue</div>
                      <p className="leading-relaxed" style={{ color: 'var(--staff-muted)' }}>{job.issueDescription}</p>
                    </div>
                  </div>

                  {/* Action Column */}
                  <div className="md:w-64 flex-shrink-0 flex flex-col justify-between pl-6 border-dashed" style={{ borderLeft: '1px solid var(--staff-border)' }}>
                    <div className="text-right mb-4">
                      <div className="text-sm font-mono mb-1" style={{ color: 'var(--staff-muted)' }}>Scheduled For</div>
                      <div className="font-bold text-lg" style={{ color: 'var(--staff-accent)' }}>
                        {job.scheduledTime === 'ASAP' ? <span className="text-red-400 animate-pulse">🚨 ASAP</span> : job.scheduledTime ? new Date(job.scheduledTime).toLocaleString() : 'TBD'}
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
