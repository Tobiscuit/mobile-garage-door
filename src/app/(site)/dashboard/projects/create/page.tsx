import React from 'react';
import Link from 'next/link';
import ProjectForm from '@/components/admin/projects/ProjectForm';

export default function CreateProjectPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/projects" className="text-[#7f8c8d] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
            Projects
            </Link>
            <span className="text-[#ffffff20]">/</span>
            <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
            New
            </span>
        </div>
        <h1 className="text-4xl font-black text-white">Create Project</h1>
      </div>

      <ProjectForm />
    </div>
  );
}
