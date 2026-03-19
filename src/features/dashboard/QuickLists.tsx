'use client';

import React, { useEffect, useState } from 'react';
import { getActiveJobsList, getTechnicianStatusList } from '@/app/(site)/(private)/[locale]/dashboard/actions';
import { SendInvoiceModal } from './SendInvoiceModal';

export function ActiveJobsList() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceJob, setInvoiceJob] = useState<any | null>(null);

  useEffect(() => {
    getActiveJobsList().then(data => {
      setJobs(data || []);
      setLoading(false);
    }).catch(error => {
      console.error('Failed to fetch active jobs:', error);
      setJobs([]);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl" style={{ backgroundColor: 'var(--staff-surface-alt)' }} />)}</div>;

  if (jobs.length === 0) return <div className="text-center py-8" style={{ color: 'var(--staff-muted)' }}>No active jobs found</div>;

  return (
    <>
      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.id} className="p-4 rounded-xl transition-colors group" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                ${job.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                ${job.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' : ''}
                ${job.status === 'dispatched' ? 'bg-purple-500/20 text-purple-400' : ''}
                ${job.status === 'on_site' ? 'bg-green-500/20 text-green-400' : ''}
              `}>
                {job.status.replace('_', ' ')}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--staff-muted)' }} suppressHydrationWarning>{new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' }).format(new Date(job.createdAt))}</span>
            </div>
            <div className="font-bold mb-1 group-hover:text-[var(--staff-accent)] transition-colors" style={{ color: 'var(--staff-text)' }}>{job.issue || 'Service Request'}</div>
            <div className="flex items-center justify-between">
              <div className="text-xs" style={{ color: 'var(--staff-muted)' }}>{job.customerName}</div>
              <button
                onClick={() => setInvoiceJob(job)}
                className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(39,174,96,0.2)',
                }}
              >
                💰 Invoice
              </button>
            </div>
            {job.quotedPrice && (
              <div className="mt-1 text-[10px] text-green-400">
                Quoted: ${(job.quotedPrice / 100).toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </div>

      {invoiceJob && (
        <SendInvoiceModal
          job={invoiceJob}
          onClose={() => setInvoiceJob(null)}
        />
      )}
    </>
  );
}

export function TechnicianList() {
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTechnicianStatusList().then(data => {
      setTechs(data || []);
      setLoading(false);
    }).catch(error => {
      console.error('Failed to fetch technician status:', error);
      setTechs([]);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2].map(i => <div key={i} className="h-12 rounded-xl" style={{ backgroundColor: 'var(--staff-surface-alt)' }} />)}</div>;

  if (techs.length === 0) return <div className="text-center py-8" style={{ color: 'var(--staff-muted)' }}>No technicians found</div>;

  return (
    <div className="space-y-3">
      {techs.map(tech => (
        <div key={tech.id} className="p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3498db]/20 flex items-center justify-center text-[#3498db] font-bold text-xs">
              {tech.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--staff-text)' }}>{tech.name}</div>
              <div className="text-[10px]" style={{ color: 'var(--staff-muted)' }}>{tech.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>
      ))}
    </div>
  );
}
