'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Get our specific sw.js registration (not vinext's worker) */
async function getSwRegistration(): Promise<ServiceWorkerRegistration | null> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  // Find our sw.js specifically
  const ours = registrations.find(r =>
    r.active?.scriptURL?.endsWith('/sw.js') ||
    r.installing?.scriptURL?.endsWith('/sw.js') ||
    r.waiting?.scriptURL?.endsWith('/sw.js')
  );
  if (ours) return ours;
  // Fallback: register it ourselves
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
}

type BannerState = 'loading' | 'show' | 'hidden' | 'unsupported';

export default function PushNotificationBanner() {
  const [state, setState] = useState<BannerState>('loading');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      // Check dismissed
      if (localStorage.getItem('push-banner-dismissed')) {
        setState('hidden');
        return;
      }

      // Feature detection
      if (!('serviceWorker' in navigator)) {
        console.warn('[PushBanner] No serviceWorker support');
        setDebugInfo('No SW support');
        setState('unsupported');
        return;
      }

      if (!('PushManager' in window)) {
        console.warn('[PushBanner] No PushManager support');
        setDebugInfo('No PushManager');
        setState('unsupported');
        return;
      }

      if (typeof Notification === 'undefined') {
        console.warn('[PushBanner] No Notification API');
        setDebugInfo('No Notification API');
        setState('unsupported');
        return;
      }

      // If permission denied, we can't do anything
      if (Notification.permission === 'denied') {
        console.warn('[PushBanner] Permission denied');
        setDebugInfo('Permission denied');
        setState('hidden');
        return;
      }

      // Get our specific sw.js registration
      const swReg = await getSwRegistration();

      if (!swReg) {
        console.warn('[PushBanner] Could not find sw.js registration');
        setState('show');
        return;
      }

      const existingSub = await swReg.pushManager.getSubscription();
      
      if (existingSub) {
        // Browser has a subscription — auto-sync to server
        console.log('[PushBanner] Found existing subscription, syncing to server...');
        try {
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ subscription: existingSub.toJSON() }),
          });
          console.log('[PushBanner] Synced existing subscription to server');
        } catch (syncErr) {
          console.error('[PushBanner] Sync failed:', syncErr);
        }
        setState('hidden');
        return;
      }

      // No subscription — show banner
      setState('show');
    } catch (err) {
      console.error('[PushBanner] checkStatus error:', err);
      // Show banner anyway — let user try
      setState('show');
    }
  }

  const handleEnable = useCallback(async () => {
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[PushBanner] Permission not granted:', permission);
        setState('hidden');
        return;
      }

      const reg = await getSwRegistration();
      if (!reg) {
        setDebugInfo('SW not found');
        return;
      }
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        console.error('[PushBanner] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set');
        setDebugInfo('Missing VAPID key');
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (res.ok) {
        console.log('[PushBanner] Subscribed successfully!');
        setState('hidden');
      } else {
        const text = await res.text();
        console.error('[PushBanner] Subscribe API error:', res.status, text);
        setDebugInfo(`API error: ${res.status}`);
      }
    } catch (err: any) {
      console.error('[PushBanner] Enable error:', err);
      setDebugInfo(err.message || 'Unknown error');
    } finally {
      setIsSubscribing(false);
    }
  }, []);

  const handleDismiss = () => {
    setState('hidden');
    localStorage.setItem('push-banner-dismissed', '1');
  };

  // Don't render when hidden or loading
  if (state === 'hidden') return null;
  if (state === 'loading') return null;

  return (
    <div
      className="relative mb-6 px-5 py-4 rounded-2xl border animate-in slide-in-from-top-2 fade-in duration-500 flex items-center gap-4 flex-wrap"
      style={{
        background: state === 'unsupported'
          ? 'linear-gradient(135deg, rgba(150,150,150,0.08), rgba(150,150,150,0.02))'
          : 'linear-gradient(135deg, rgba(241,196,15,0.08), rgba(241,196,15,0.02))',
        borderColor: state === 'unsupported'
          ? 'rgba(150,150,150,0.3)'
          : 'rgba(241,196,15,0.3)',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'rgba(241,196,15,0.15)' }}
      >
        <svg className="w-5 h-5 text-[#f1c40f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm" style={{ color: 'var(--staff-text)' }}>
          {state === 'unsupported' ? 'Push not supported' : 'Stay in the loop'}
        </div>
        <div className="text-xs" style={{ color: 'var(--staff-muted)' }}>
          {state === 'unsupported'
            ? `This browser doesn't support push notifications. ${debugInfo}`
            : 'Enable push notifications for new AI drafts, job updates, and more.'}
          {debugInfo && state !== 'unsupported' && (
            <span className="ml-1 text-red-400">({debugInfo})</span>
          )}
        </div>
      </div>

      {state === 'show' && (
        <button
          onClick={handleEnable}
          disabled={isSubscribing}
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-[#2c3e50] transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-50 flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #f1c40f, #f39c12)',
            boxShadow: '0 4px 14px rgba(241,196,15,0.3)',
          }}
        >
          {isSubscribing ? 'Enabling...' : <><Bell className="w-4 h-4 inline -mt-0.5" /> Enable</>}
        </button>
      )}

      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full opacity-40 hover:opacity-80 transition-opacity"
        style={{ color: 'var(--staff-muted)' }}
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
