import React from 'react';
import Link from 'next/link';
import { getServices } from './actions';
import { DataTable } from '@/features/admin/ui/DataTable';
import { Service } from '@/payload-types';

// This is a Server Component
export default async function ServicesPage() {
  const services = await getServices();

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
           <h1 className="text-4xl font-black text-[var(--staff-text)]">Services</h1>
        </div>

        <Link 
          href="/dashboard/services/create" 
          className="
            flex items-center gap-2 bg-[#f1c40f] text-[#2c3e50] font-bold px-6 py-3 rounded-xl 
            shadow-[0_4px_20px_rgba(241,196,15,0.3)] hover:shadow-[0_6px_25px_rgba(241,196,15,0.5)] 
            hover:-translate-y-1 transition-all duration-300
          "
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Service</span>
        </Link>
      </div>

      {/* DATA TABLE */}
      <DataTable 
        data={services}
        columns={[
          {
            header: 'Service Name',
            cell: (item: any) => (
               <div>
                  <div className="font-bold text-lg text-[var(--staff-text)] group-hover:text-[#f1c40f] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-[var(--staff-muted)] line-clamp-1">{item.description}</div>
               </div>
            )
          },
          {
            header: 'Category',
            cell: (item: any) => (
                <span className="inline-block px-3 py-1 rounded-md bg-[var(--staff-surface-alt)] border border-[var(--staff-border)] text-xs font-bold text-[var(--staff-muted)]">
                    {item.category}
                </span>
            )
          },
          {
            header: 'Price',
            cell: (item: any) => (
                <div className="text-[#2ecc71] font-bold font-mono">
                    ${item.price}
                </div>
            )
          },
           {
             header: 'Highlight',
             cell: (item: any) => (
                item.highlight ? <span className="text-[#f1c40f] text-xs font-bold uppercase">Featured</span> : <span className="text-[var(--staff-muted)] text-xs">-</span>
             )
           },
          {
            header: '',
            className: 'text-right',
            cell: (item: any) => (
              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Link 
                    href={`/dashboard/services/${item.id}`}
                    className="p-2 bg-[var(--staff-surface-alt)] hover:bg-[#f1c40f] hover:text-[#2c3e50] rounded-lg transition-colors"
                    title="Edit Service"
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
