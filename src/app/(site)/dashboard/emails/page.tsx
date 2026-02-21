import React from 'react';
import Link from 'next/link';
import { getEmailThreads } from './actions';
import { DataTable } from '@/features/admin/ui/DataTable';

export const dynamic = 'force-dynamic';

export default async function EmailsPage() {
  const threads = await getEmailThreads();

  return (
    <div className="animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Link href="/dashboard" className="text-[var(--staff-muted)] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
                Command Center
              </Link>
              <span className="text-[var(--staff-border)]">/</span>
              <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
                Communication
              </span>
           </div>
           <h1 className="text-4xl font-black text-[var(--staff-text)]">Inbox</h1>
        </div>
      </div>

      {/* DATA TABLE */}
      <DataTable 
        data={threads}
        columns={[
          {
            header: 'Subject',
            cell: (item: any) => (
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f1c40f]/10 text-[#f1c40f] flex items-center justify-center font-bold">
                    {/* Initials could go here, using generic icon for now */}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-[var(--staff-text)] group-hover:text-[#f1c40f] transition-colors">{item.subject}</div>
                    <div className="text-xs text-[var(--staff-muted)]">
                        Last message: {new Date(item.lastMessageAt).toLocaleString()}
                    </div>
                  </div>
               </div>
            )
          },
          {
            header: 'Status',
            cell: (item: any) => {
                const isClosed = item.status === 'closed';
                return (
                    <div className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${isClosed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}
                    `}>
                        {item.status}
                    </div>
                )
            }
          },
          {
            header: '',
            className: 'text-right',
            cell: (item: any) => (
              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Link 
                    href={`/dashboard/emails/${item.id}`}
                    className="p-2 bg-[var(--staff-surface-alt)] hover:bg-[#f1c40f] hover:text-[#2c3e50] rounded-lg transition-colors"
                 >
                    <span className="sr-only">View Thread</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                 </Link>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
