import React from 'react';
import Link from 'next/link';
import { getUsers } from './actions';
import { DataTable } from '@/components/admin/ui/DataTable';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Link href="/admin" className="text-[#7f8c8d] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
                Command Center
              </Link>
              <span className="text-[#ffffff20]">/</span>
              <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
                Configuration
              </span>
           </div>
           <h1 className="text-4xl font-black text-white">Users</h1>
        </div>

        <Link 
          href="/admin/users/create" 
          className="
            flex items-center gap-2 bg-[#f1c40f] text-[#2c3e50] font-bold px-6 py-3 rounded-xl 
            shadow-[0_4px_20px_rgba(241,196,15,0.3)] hover:shadow-[0_6px_25px_rgba(241,196,15,0.5)] 
            hover:-translate-y-1 transition-all duration-300
          "
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>New User</span>
        </Link>
      </div>

      <DataTable 
        data={users}
        columns={[
          {
            header: 'User Account',
            cell: (item: any) => (
               <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[#34495e] flex items-center justify-center text-[#ecf0f1] font-bold text-xs">
                        {item.email?.substring(0, 2).toUpperCase()}
                   </div>
                   <div className="font-bold text-white group-hover:text-[#f1c40f] transition-colors">
                     {item.email}
                   </div>
               </div>
            )
          },
          {
            header: 'ID',
            cell: (item: any) => (
                <div className="text-xs text-[#7f8c8d] font-mono">
                   {item.id}
                </div>
            )
          },
          {
            header: 'Joined',
            cell: (item: any) => (
                <div className="text-sm text-[#bdc3c7]">
                   {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                </div>
            )
          },
        ]}
      />
    </div>
  );
}
