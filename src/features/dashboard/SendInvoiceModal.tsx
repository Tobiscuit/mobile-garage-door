'use client';

import React, { useState } from 'react';
import { sendSquareInvoice } from '@/app/actions/invoice';
import { CheckCircle } from 'lucide-react';

interface SendInvoiceModalProps {
  job: {
    id: number;
    ticketId: string;
    customerName: string;
    customerEmail: string | null;
    issue: string | null;
    quotedPrice: number | null;
  };
  onClose: () => void;
}

export function SendInvoiceModal({ job, onClose }: SendInvoiceModalProps) {
  const [amount, setAmount] = useState(job.quotedPrice ? (job.quotedPrice / 100).toFixed(2) : '');
  const [note, setNote] = useState(job.issue || 'Garage door repair service');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string; publicUrl?: string } | null>(null);

  const handleSend = async () => {
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      setResult({ success: false, error: 'Please enter a valid amount' });
      return;
    }

    setSending(true);
    const res = await sendSquareInvoice(job.id, amountCents, note);
    setResult(res);
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md mx-4 rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-black mb-1" style={{ color: 'var(--staff-text)' }}>
          Send Invoice
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--staff-muted)' }}>
          {job.ticketId} — {job.customerName}
          {job.customerEmail && <span className="ml-1">({job.customerEmail})</span>}
        </p>

        {result?.success ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2"><CheckCircle className="w-8 h-8 mx-auto" style={{ color: 'var(--staff-accent)' }} /></div>
            <div className="font-bold text-green-400 mb-1">Invoice Sent!</div>
            <div className="text-xs" style={{ color: 'var(--staff-muted)' }}>
              The customer will receive a branded email with a payment link.
            </div>
            {result.publicUrl && (
              <a href={result.publicUrl} target="_blank" rel="noopener" className="text-xs text-blue-400 underline mt-2 block">
                View Invoice
              </a>
            )}
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 rounded-xl text-sm font-bold"
              style={{ backgroundColor: 'var(--staff-surface-alt)', color: 'var(--staff-text)' }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--staff-muted)' }}>
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="350.00"
                  className="w-full px-4 py-3 rounded-xl text-lg font-bold outline-none"
                  style={{
                    backgroundColor: 'var(--staff-surface-alt)',
                    color: 'var(--staff-text)',
                    border: '1px solid var(--staff-border)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--staff-muted)' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Spring replacement + labor"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--staff-surface-alt)',
                    color: 'var(--staff-text)',
                    border: '1px solid var(--staff-border)',
                  }}
                />
              </div>
            </div>

            {result?.error && (
              <div className="text-xs text-red-400 mb-3 p-2 rounded-lg bg-red-500/10">
                {result.error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: 'var(--staff-surface-alt)', color: 'var(--staff-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !amount}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[#2c3e50] transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  boxShadow: '0 4px 14px rgba(39,174,96,0.3)',
                }}
              >
                {sending ? 'Sending...' : `Send $${amount || '0'} Invoice`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
