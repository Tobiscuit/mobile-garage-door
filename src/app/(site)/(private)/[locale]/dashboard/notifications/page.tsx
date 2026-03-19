'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from '@/shared/ui/Link';

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  blog_draft: '📝',
  tech_dispatched: '⚡',
  job_accepted: '✅',
  tracking_update: '📍',
};

const typeColors: Record<string, string> = {
  blog_draft: '#6366f1',
  tech_dispatched: '#f39c12',
  job_accepted: '#2ecc71',
  tracking_update: '#3498db',
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => {
        setItems(data.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    startTransition(async () => {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    });
  };

  const markRead = (id: number) => {
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    });
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = items.filter(n => !n.read).length;

  return (
    <div className="animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-[var(--staff-muted)] hover:text-[#f1c40f] text-sm font-bold uppercase tracking-widest transition-colors">
              Command Center
            </Link>
            <span className="text-[var(--staff-border)]">/</span>
            <span className="text-[#f1c40f] text-sm font-bold uppercase tracking-widest">
              Notifications
            </span>
          </div>
          <h1 className="text-4xl font-black text-[var(--staff-text)]">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 text-lg font-bold text-[#f39c12] animate-pulse">
                {unreadCount} new
              </span>
            )}
          </h1>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={isPending}
            className="text-sm font-bold text-[var(--staff-muted)] hover:text-[var(--staff-accent)] transition-colors"
          >
            {isPending ? 'Marking...' : '✓ Mark all as read'}
          </button>
        )}
      </div>

      {/* FEED */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--staff-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔔</div>
          <h2 className="text-xl font-bold text-[var(--staff-text)] mb-2">All caught up!</h2>
          <p className="text-[var(--staff-muted)]">No notifications yet. They'll appear here when things happen.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const icon = typeIcons[item.type] || '📢';
            const color = typeColors[item.type] || '#95a5a6';
            const Wrapper = item.actionUrl ? Link : 'div';
            const wrapperProps = item.actionUrl ? { href: item.actionUrl } : {};

            return (
              <Wrapper
                key={item.id}
                {...(wrapperProps as any)}
                onClick={() => !item.read && markRead(item.id)}
                className={`
                  block p-4 rounded-xl border transition-all duration-200 cursor-pointer
                  ${!item.read
                    ? 'bg-[var(--staff-surface-alt)] border-[var(--staff-border)] shadow-[0_2px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
                    : 'bg-transparent border-transparent opacity-60 hover:opacity-80'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Indicator */}
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-xl">{icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ color, backgroundColor: `${color}20` }}
                      >
                        {item.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-[var(--staff-muted)]">
                        {timeAgo(item.createdAt)}
                      </span>
                      {!item.read && (
                        <div className="w-2 h-2 rounded-full bg-[#f39c12] animate-pulse ml-auto flex-shrink-0" />
                      )}
                    </div>
                    <h3 className="font-bold text-[var(--staff-text)] mt-1 line-clamp-1">
                      {item.title}
                    </h3>
                    {item.body && (
                      <p className="text-sm text-[var(--staff-muted)] mt-0.5 line-clamp-2">
                        {item.body}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  {item.actionUrl && (
                    <svg className="w-4 h-4 text-[var(--staff-muted)] flex-shrink-0 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}
