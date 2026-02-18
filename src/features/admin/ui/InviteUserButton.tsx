'use client';
import React from 'react';
import Link from 'next/link';

export function InviteUserButton() {
  return (
    <Link 
      href="/dashboard/users/invite" 
      className="px-4 py-2 bg-[#f1c40f] text-[#2c3e50] font-bold rounded-lg shadow-lg hover:bg-[#f39c12] transition-colors flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      <span>Invite User</span>
    </Link>
  );
}
