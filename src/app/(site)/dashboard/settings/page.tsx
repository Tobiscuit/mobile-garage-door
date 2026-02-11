import React from 'react';
import Link from 'next/link';
import { getSettings } from './actions';
import SettingsForm from '@/components/admin/settings/SettingsForm';
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
              <Link href="/dashboard" className="text-[#7f8c8d] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
                Command Center
              </Link>
              <span className="text-[#ffffff20]">/</span>
              <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
                Configuration
              </span>
           </div>
           <h1 className="text-4xl font-black text-white">Global Settings</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
            <SettingsForm initialData={settings} />
        </div>
        
        {/* SIDEBAR HELP / CONTEXT */}
        <div className="space-y-6">
            <div className="bg-[#2c3e50]/40 border border-[#ffffff08] rounded-3xl p-6 backdrop-blur-sm sticky top-8">
                <h3 className="text-lg font-bold text-white mb-4">Why this matters</h3>
                <p className="text-[#bdc3c7] text-sm leading-relaxed mb-4">
                    These settings control global variables used across the entire site. Keeping them updated ensures consistency in:
                </p>
                <ul className="space-y-2 text-sm text-[#bdc3c7]">
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
