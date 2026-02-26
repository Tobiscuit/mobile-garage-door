'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ManualPaymentModal } from './ManualPaymentModal';
import { syncSquarePayments } from '@/app/(site)/dashboard/actions';

export function QuickActions() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
        const result = await syncSquarePayments();
        if (result.success) {
            // Optional: Toast notification
            console.log(`Synced ${result.count} payments.`);
        } else {
            console.error('Sync failed');
        }
    } catch (e) {
        console.error('Detailed Sync Error:', e);
        // If it's an object with a message, log that too
        if (e instanceof Error) {
            console.error('Error Message:', e.message);
            console.error('Error Stack:', e.stack);
        }
    } finally {
        setIsSyncing(false);
    }
  };

  return (
    <div className="lg:col-span-2">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: 'var(--staff-text)' }}>
          <span className="w-1.5 h-8 bg-[var(--staff-accent)] rounded-full shadow-[0_0_10px_var(--staff-accent)]"></span>
          Quick Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => setIsPaymentModalOpen(true)}
            className="group p-6 rounded-2xl hover:bg-[#2ecc71] transition-all flex items-center gap-4 text-left w-full"
            style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}
          >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors" style={{ backgroundColor: 'var(--staff-surface-alt)' }}>
                  <svg className="w-6 h-6 text-[#2ecc71] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                  <div className="font-bold text-lg group-hover:text-white" style={{ color: 'var(--staff-text)' }}>Record Payment</div>
                  <div className="text-sm group-hover:text-white/80" style={{ color: 'var(--staff-muted)' }}>Cash or external check</div>
              </div>
          </button>

          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="group p-6 rounded-2xl hover:bg-[#3498db] transition-all flex items-center gap-4 text-left w-full disabled:opacity-50"
            style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}
          >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors" style={{ backgroundColor: 'var(--staff-surface-alt)' }}>
                  {isSyncing ? (
                       <svg className="w-6 h-6 text-[#3498db] animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                       <svg className="w-6 h-6 text-[#3498db] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  )}
              </div>
              <div>
                  <div className="font-bold text-lg group-hover:text-white" style={{ color: 'var(--staff-text)' }}>Sync Square</div>
                  <div className="text-sm group-hover:text-white/80" style={{ color: 'var(--staff-muted)' }}>Fetch recent payments</div>
              </div>
          </button>

          <Link href="/dashboard/projects/create" className="group p-6 rounded-2xl hover:bg-[var(--staff-accent)] transition-all flex items-center gap-4" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors" style={{ backgroundColor: 'var(--staff-surface-alt)' }}>
                  <svg className="w-6 h-6 text-[var(--staff-accent)] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                  <div className="font-bold text-lg group-hover:text-[#2c3e50]" style={{ color: 'var(--staff-text)' }}>New Project</div>
                  <div className="text-sm group-hover:text-[#2c3e50]/70" style={{ color: 'var(--staff-muted)' }}>Showcase recent work</div>
              </div>
          </Link>

          <Link href="/dashboard/posts/create" className="group p-6 rounded-2xl hover:bg-[var(--staff-accent)] transition-all flex items-center gap-4" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors" style={{ backgroundColor: 'var(--staff-surface-alt)' }}>
                  <svg className="w-6 h-6 text-[var(--staff-accent)] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <div>
                  <div className="font-bold text-lg group-hover:text-[#2c3e50]" style={{ color: 'var(--staff-text)' }}>Write Post</div>
                  <div className="text-sm group-hover:text-[#2c3e50]/70" style={{ color: 'var(--staff-muted)' }}>Publish blog content</div>
              </div>
          </Link>
      </div>

      <ManualPaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </div>
  );
}
