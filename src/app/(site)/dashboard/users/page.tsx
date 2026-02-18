import React from 'react';
import Link from 'next/link';
import { getUsers } from './actions';
import { UserTable } from '@/features/admin/ui/UserTable';
import { InviteUserButton } from '@/features/admin/ui/InviteUserButton';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Link href="/dashboard" className="text-[#7f8c8d] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
                Command Center
              </Link>
              <span className="text-[#ffffff20]">/</span>
              <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
                Configuration
              </span>
           </div>
           <h1 className="text-4xl font-black text-white">Users</h1>
        </div>

          <InviteUserButton />
      </div>

      <UserTable initialUsers={users} />

    </div>
  );
}
