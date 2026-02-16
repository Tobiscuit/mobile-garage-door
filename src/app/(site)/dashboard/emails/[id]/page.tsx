import React from 'react';
import Link from 'next/link';
import { getThreadDetails } from '../actions'; // We'll update actions.ts to export this
import { notFound } from 'next/navigation';
import { ChatInterface } from '@/components/admin/emails/ChatInterface'; // We will create this

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmailThreadPage({ params }: PageProps) {
  const { id } = await params;
  const threadData = await getThreadDetails(id);

  if (!threadData) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-4">
           <Link 
              href="/dashboard/emails" 
              className="p-2 hover:bg-[#ffffff05] rounded-lg transition-colors text-[#7f8c8d] hover:text-white"
           >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
           </Link>
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[#f1c40f] text-xs font-bold uppercase tracking-widest">
                   {threadData.thread.status}
                 </span>
                 <span className="text-[#ffffff20]">|</span>
                 <span className="text-[#7f8c8d] text-xs">
                   #{threadData.thread.id.slice(-6)}
                 </span>
              </div>
              <h1 className="text-2xl font-black text-white">{threadData.thread.subject}</h1>
           </div>
        </div>
      </div>

      {/* MAIN LAYOUT: Chat (Left) + CRM Sidebar (Right) */}
      <div className="flex-1 flex gap-6 overflow-hidden">
         {/* LEFT: Chat Interface */}
         <div className="flex-1 bg-[#ffffff02] border border-[#ffffff08] rounded-2xl overflow-hidden flex flex-col">
            <ChatInterface 
                threadId={id} 
                initialMessages={threadData.messages} 
            />
         </div>

         {/* RIGHT: Context Sidebar */}
         <div className="w-[350px] shrink-0 bg-[#ffffff02] border border-[#ffffff08] rounded-2xl p-6 hidden xl:block overflow-y-auto custom-scrollbar">
            {/* 1. Customer Profile */}
            <div className="mb-8">
               <h3 className="text-xs font-bold text-[#7f8c8d] uppercase tracking-widest mb-4">Customer Profile</h3>
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f1c40f] to-[#f39c12] flex items-center justify-center text-[#2c3e50] font-black text-xl shadow-[0_0_15px_rgba(241,196,15,0.3)]">
                     {/* Initials from first participant or '?' */}
                     {threadData.messages[0]?.from?.[0].toUpperCase() || '?'}
                  </div>
                  <div>
                     <div className="font-bold text-white text-lg">
                        {/* We would look this up from Users collection */}
                        {threadData.messages.find(m => m.direction === 'inbound')?.from || 'Unknown'}
                     </div>
                     <div className="text-sm text-[#7f8c8d]">Residential Customer</div>
                  </div>
               </div>
               
               {/* Quick Stats */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#ffffff05] border border-[#ffffff05]">
                     <div className="text-xs text-[#7f8c8d] mb-1">Lifetime Value</div>
                     <div className="text-lg font-bold text-white">$0.00</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#ffffff05] border border-[#ffffff05]">
                     <div className="text-xs text-[#7f8c8d] mb-1">Active Jobs</div>
                     <div className="text-lg font-bold text-[#f1c40f]">0</div>
                  </div>
               </div>
            </div>

            {/* 2. Active Tickets */}
            <div className="mb-8">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#7f8c8d] uppercase tracking-widest">Active Tickets</h3>
                  <button className="text-[10px] bg-[#f1c40f] text-[#2c3e50] px-2 py-1 rounded font-bold hover:bg-white transition-colors">
                     + NEW
                  </button>
               </div>
               <div className="text-sm text-[#547085] italic text-center py-4 border border-dashed border-[#ffffff10] rounded-lg">
                  No active service requests
               </div>
            </div>

            {/* 3. Recent Invoices */}
            <div>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#7f8c8d] uppercase tracking-widest">Invoices</h3>
                  <button className="text-[10px] bg-[#ffffff10] text-white px-2 py-1 rounded font-bold hover:bg-white hover:text-[#2c3e50] transition-colors">
                     + CREATE
                  </button>
               </div>
               {/* Invoice List would go here */}
            </div>
         </div>
      </div>
    </div>
  );
}
