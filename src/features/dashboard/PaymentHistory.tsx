'use client';

import React, { useEffect, useState } from 'react';
import { getRecentPayments, resetAndSyncSquarePayments } from '@/app/(site)/dashboard/actions';

export function PaymentHistory() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await getRecentPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleHardSync = async () => {
      setSyncing(true);
      try {
          await resetAndSyncSquarePayments();
          await fetchPayments();
      } catch (e) {
          console.error(e);
      } finally {
          setSyncing(false);
      }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
          <p className="text-sm" style={{ color: 'var(--staff-muted)' }}>Recent transactions</p>
          <button 
            onClick={handleHardSync}
            disabled={syncing}
            className="text-xs bg-[var(--staff-accent)]/10 text-[var(--staff-accent)] hover:bg-[var(--staff-accent)]/20 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
          >
             {syncing ? 'Syncing...' : 'Force Sync with Square'}
          </button>
      </div>

      {loading ? (
        <div className="space-y-3">
            {[1,2,3].map(i => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--staff-surface-alt)' }} />
            ))}
        </div>
      ) : (
        <div className="space-y-3">
          {payments.length === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--staff-muted)' }}>No payments found</div>
          )}
          {payments.map((payment) => (
            <div key={payment.id} className="p-3 rounded-xl flex justify-between items-center transition-colors" style={{ backgroundColor: 'var(--staff-surface)', border: '1px solid var(--staff-border)' }}>
              <div>
                <div className="font-bold" style={{ color: 'var(--staff-text)' }}>{formatCurrency(payment.amount)}</div>
                <div className="text-xs" style={{ color: 'var(--staff-muted)' }}>{formatDate(payment.createdAt)}</div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${
                    payment.status === 'COMPLETED' || payment.status === 'APPROVED' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {payment.status}
                </span>
                <div className="text-[10px] mt-1 uppercase" style={{ color: 'var(--staff-muted)' }}>{payment.sourceType}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
