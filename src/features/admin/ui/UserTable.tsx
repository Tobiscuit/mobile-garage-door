'use client';
import React from 'react';
import { DataTable } from './DataTable';
import { format } from 'date-fns';
import Link from 'next/link';

export function UserTable({ initialUsers }: { initialUsers: any[] }) {
  const columns = [
    {
      header: 'Name',
      accessorKey: 'name' as const, // Cast to verify key
      cell: (user: any) => (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--staff-accent)] to-[var(--staff-bg)] flex items-center justify-center text-[var(--staff-surface-alt)] font-bold text-xs">
                {(user.name?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()}
            </div>
            <div>
                <div className="font-bold" style={{ color: 'var(--staff-text)' }}>{user.name || 'Unknown'}</div>
                <div className="text-xs" style={{ color: 'var(--staff-muted)' }}>{user.email}</div>
            </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessorKey: 'role' as const,
       cell: (user: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
            user.role === 'admin' ? 'bg-[#e74c3c]/20 text-[#e74c3c]' : 'bg-[#3498db]/20 text-[#3498db]'
        }`}>
            {user.role}
        </span>
      )
    },
     {
      header: 'Joined',
      accessorKey: 'createdAt' as const,
      cell: (user: any) => <span className="text-sm" style={{ color: 'var(--staff-muted)' }}>{user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '-'}</span>
    },
    {
        header: 'Actions',
        cell: (user: any) => (
            <div className="flex gap-2">
                <Link href={`/dashboard/users/${user.id}`} className="text-[var(--staff-accent)] hover:opacity-80 text-xs font-bold uppercase tracking-wider">
                    Edit
                </Link>
            </div>
        )
    }
  ];

  // We map the string columns to the object shape expected by DataTable if needed, 
  // but here we just pass the columns definition which matches DataTable's expectation.
  // Note: DataTable expects Column<T> where T extends { id: string | number }
  
  return <DataTable data={initialUsers} columns={columns} />;
}
