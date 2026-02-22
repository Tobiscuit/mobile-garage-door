import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServiceById } from '../actions';
import ServiceForm from '@/features/admin/services/ServiceForm';

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/services" className="text-[#7f8c8d] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
            Services
            </Link>
            <span className="text-[#ffffff20]">/</span>
            <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
            Edit
            </span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">Edit Service</h1>
        <div className="text-[#547085] font-mono text-xs mt-2">ID: {service.id}</div>
      </div>

      <ServiceForm initialData={service} isEdit={true} />
    </div>
  );
}
