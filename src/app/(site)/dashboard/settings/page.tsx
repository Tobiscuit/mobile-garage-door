import React from 'react';
import Link from 'next/link';
import { getSettings } from './actions';
import SettingsForm from '@/features/admin/settings/SettingsForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Site Settings | Mobil Garage Dashboard',
};

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Link href="/dashboard" className="hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors" style={{ color: 'var(--staff-muted)' }}>
                Command Center
              </Link>
              <span style={{ color: 'var(--staff-border)' }}>/</span>
              <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
                Configuration
              </span>
           </div>
           <h1 className="text-4xl font-black" style={{ color: 'var(--staff-text)' }}>Global Settings</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
            <SettingsForm initialData={settings} />
        </div>
        
        {/* SIDEBAR HELP / CONTEXT */}
        <div className="space-y-6">
            <div className="rounded-3xl p-6 backdrop-blur-sm sticky top-8" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--staff-text)' }}>Why this matters</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--staff-muted)' }}>
                    These settings control global variables used across the entire site. Keeping them updated ensures consistency in:
                </p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--staff-muted)' }}>
                    <li className="flex items-center gap-2">
                        <span className="text-[#f1c40f]">●</span> Contact Information (Footer/Header)
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-[#f1c40f]">●</span> SEO Metadata (Schemas)
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-[#f1c40f]">●</span> AI Content Generation Tone
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-[#f1c40f]">●</span> Trust Signals (License/Insurance)
                    </li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
