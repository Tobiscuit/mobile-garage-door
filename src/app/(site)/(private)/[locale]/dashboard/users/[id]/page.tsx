import { requireAdmin } from '@/lib/require-role';
import React from 'react';
import { notFound } from 'next/navigation';
import Link from '@/shared/ui/Link';
import { getUserById } from '../actions';
import { UserProfileCard } from '@/features/admin/ui/UserProfileCard';

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const resolvedParams = await params;
  const user = await getUserById(resolvedParams.id);

  if (!user) {
    notFound();
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-8 pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-1">
          <Link href="/dashboard" className="text-[var(--staff-muted)] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
            Command Center
          </Link>
          <span className="text-[var(--staff-border)]">/</span>
          <Link href="/dashboard/users" className="text-[var(--staff-muted)] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
            Users
          </Link>
          <span className="text-[var(--staff-border)]">/</span>
          <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
            {user.name || 'User Profile'}
          </span>
      </div>

      <UserProfileCard user={user} />
    </div>
  );
}
