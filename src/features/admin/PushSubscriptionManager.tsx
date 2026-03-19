'use client';

import React, { useState, useEffect, useCallback } from 'react';

/**
 * Convert a URL-safe base64 string to a Uint8Array (for applicationServerKey).
 * This is the same encoding format used by VAPID public keys.
 */
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

type PushStatus = 'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed';

/**
 * PushSubscriptionManager — lets admin users toggle push notifications.
 *
 * How it works:
 * 1. Checks if browser supports Push API + has a service worker
 * 2. Checks current push permission state
 * 3. If not subscribed → shows "Enable" button
 * 4. If subscribed → shows "Disable" button
 * 5. On subscribe: requests permission → subscribes via pushManager → saves to server
 * 6. On unsubscribe: unsubscribes from pushManager → removes from server
 */
export default function PushSubscriptionManager() {
  const [status, setStatus] = useState<PushStatus>('loading');
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    checkPushStatus();
  }, []);

  async function checkPushStatus() {
    // Feature detection
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }

    // Check if permission was denied
    if (Notification.permission === 'denied') {
      setStatus('denied');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? 'subscribed' : 'unsubscribed');
    } catch {
      setStatus('unsubscribed');
    }
  }

  const handleSubscribe = useCallback(async () => {
    setIsToggling(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'unsubscribed');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        console.error('VAPID public key not configured');
        return;
      }

      const keyArray = urlBase64ToUint8Array(publicKey);
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyArray.buffer as ArrayBuffer,
      });

      // Save to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (res.ok) {
        setStatus('subscribed');
      }
    } catch (err) {
      console.error('Push subscribe error:', err);
    } finally {
      setIsToggling(false);
    }
  }, []);

  const handleUnsubscribe = useCallback(async () => {
    setIsToggling(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        await sub.unsubscribe();
      }

      // Remove from server
      await fetch('/api/push/subscribe', { method: 'DELETE' });
      setStatus('unsubscribed');
    } catch (err) {
      console.error('Push unsubscribe error:', err);
    } finally {
      setIsToggling(false);
    }
  }, []);

  // Don't render anything during loading
  if (status === 'loading') return null;

  const isOn = status === 'subscribed';

  return (
    <div>
      <h4
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: 'var(--staff-muted)' }}
      >
        Push Notifications
      </h4>

      {status === 'unsupported' ? (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--staff-surface-alt)', color: 'var(--staff-muted)' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <span>Push notifications aren't supported on this browser</span>
        </div>
      ) : status === 'denied' ? (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--staff-surface-alt)', color: '#e74c3c' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <div>
            <div className="font-semibold">Notifications blocked</div>
            <div className="text-xs opacity-70">Reset in your browser's site settings</div>
          </div>
        </div>
      ) : (
        <button
          onClick={isOn ? handleUnsubscribe : handleSubscribe}
          disabled={isToggling}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all text-left active:scale-95"
          style={{ backgroundColor: 'var(--staff-surface-alt)', color: 'var(--staff-text)' }}
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            style={{ color: isOn ? '#2ecc71' : 'var(--staff-accent)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <div className="flex-1">
            <div className="font-semibold text-sm">
              {isToggling
                ? (isOn ? 'Disabling...' : 'Enabling...')
                : (isOn ? 'Push Notifications On' : 'Enable Push Notifications')
              }
            </div>
            <div className="text-xs" style={{ color: 'var(--staff-muted)' }}>
              {isOn
                ? 'Get alerts for new AI drafts and job updates'
                : 'Be notified when things need your attention'
              }
            </div>
          </div>

          {/* Toggle visual */}
          <div
            className="w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0"
            style={{ backgroundColor: isOn ? '#2ecc71' : 'var(--staff-border)' }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: isOn ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </div>
        </button>
      )}
    </div>
  );
}
