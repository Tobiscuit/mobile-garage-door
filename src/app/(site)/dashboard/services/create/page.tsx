import React from 'react';
import Link from 'next/link';
import ServiceForm from '@/features/admin/services/ServiceForm';

export default function CreateServicePage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/services" className="text-[#7f8c8d] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
            Services
            </Link>
            <span className="text-[#ffffff20]">/</span>
            <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
            New
            </span>
        </div>
        <h1 className="text-4xl font-black text-white">Create Service</h1>
      </div>

      <ServiceForm />
    </div>
  );
}
