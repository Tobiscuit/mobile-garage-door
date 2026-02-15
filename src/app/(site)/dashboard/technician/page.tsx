import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { serviceRequestService } from '@/services/serviceRequestService';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TechnicianDashboard() {
  const payload = await getPayload({ config: configPromise });
  const headerList = await headers();
  const { user } = await payload.auth({ headers: headerList });

  if (!user || (user.role !== 'technician' && user.role !== 'admin')) {
    redirect('/login');
  }

  const assignedJobs = await serviceRequestService.getAssignedRequests(payload, user.id);

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
          {assignedJobs.docs.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10">
              <div className="text-2xl font-bold text-gray-400 mb-2">No Active Assignments</div>
              <p className="text-gray-500">You're currently clear. Stand by for dispatch.</p>
            </div>
          ) : (
            assignedJobs.docs.map((job: any) => (
              <div key={job.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#f1c40f]/50 transition-colors group">
                <div className="flex flex-col md:flex-row gap-6 justify-between">
                  
                  {/* Status Column */}
                  <div className="md:w-48 flex-shrink-0">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${
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
                        <div className="text-lg font-bold">{typeof job.customer === 'object' ? job.customer.name : 'Unknown'}</div>
                        <div className="text-gray-400">{typeof job.customer === 'object' ? job.customer.phone : ''}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-400 font-mono mb-1">Issue</div>
                        <p className="text-gray-300 leading-relaxed">{job.issueDescription}</p>
                    </div>
                  </div>

                  {/* Action Column */}
                  <div className="md:w-64 flex-shrink-0 flex flex-col justify-between items-end border-l border-white/10 pl-6 border-dashed">
                    <div className="text-right mb-4">
                        <div className="text-sm text-gray-400 font-mono mb-1">Scheduled For</div>
                        <div className="text-[#f1c40f] font-bold text-lg">
                            {job.scheduledTime ? new Date(job.scheduledTime).toLocaleString() : 'TBD'}
                        </div>
                    </div>
                    
                    <a 
                        href={`/admin/collections/service-requests/${job.id}`} 
                        className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg text-center hover:bg-[#f1c40f] transition-colors"
                    >
                        Update Status
                    </a>
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