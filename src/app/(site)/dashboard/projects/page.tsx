
import React from 'react';
import Link from 'next/link';
import { getProjects } from './actions';
import { DataTable } from '@/features/admin/ui/DataTable';
import { Project } from '@/payload-types';
import Image from 'next/image';

export default async function ProjectsPage() {
  const projects = await getProjects();

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
                Operations
              </span>
           </div>
           <h1 className="text-4xl font-black text-[var(--staff-text)]">Projects</h1>
        </div>

        <Link 
          href="/dashboard/projects/create" 
          className="
            flex items-center gap-2 bg-[#f1c40f] text-[#2c3e50] font-bold px-6 py-3 rounded-xl 
            shadow-[0_4px_20px_rgba(241,196,15,0.3)] hover:shadow-[0_6px_25px_rgba(241,196,15,0.5)] 
            hover:-translate-y-1 transition-all duration-300
          "
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Project</span>
        </Link>
      </div>

      {/* DATA TABLE */}
      <DataTable 
        data={projects}
        columns={[
          {
            header: 'Project',
            cell: (item: any) => (
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-[var(--staff-surface-alt)] relative overflow-hidden shrink-0 border border-[var(--staff-border)]">
                      {item.coverImage?.url ? (
                         <Image src={item.coverImage.url} alt={item.title} fill className="object-cover" />
                      ) : (
                         <div className="flex items-center justify-center h-full text-[#547085]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         </div>
                      )}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-[var(--staff-text)] group-hover:text-[#f1c40f] transition-colors">{item.title}</div>
                    <div className="text-xs text-[var(--staff-muted)]">{item.client}</div>
                  </div>
               </div>
            )
          },
          {
            header: 'Location',
            cell: (item: any) => (
                <div className="text-sm font-medium text-[var(--staff-muted)]">
                    {item.location || 'N/A'}
                </div>
            )
          },
          {
             header: 'Completion',
             cell: (item: any) => (
                <div className="text-xs font-mono text-[#547085] uppercase tracking-wider">
                    {item.completionDate ? new Date(item.completionDate).toLocaleDateString() : 'Ongoing'}
                </div>
             )
          },
          {
            header: '',
            className: 'text-right',
            cell: (item: any) => (
              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Link 
                    href={`/dashboard/projects/${item.id}`}
                    className="p-2 bg-[var(--staff-surface-alt)] hover:bg-[#f1c40f] hover:text-[#2c3e50] rounded-lg transition-colors"
                 >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
