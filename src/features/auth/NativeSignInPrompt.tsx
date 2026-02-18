'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { authClient } from '@/lib/auth-client';

const PROMPT_KEY = 'native_signin_prompt_v1';

function getPlatformLabel() {
  if (typeof navigator === 'undefined') return 'your device security';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod') || ua.includes('mac')) {
    return 'Face ID / Touch ID';
  }
  if (ua.includes('windows')) return 'Windows Hello';
  if (ua.includes('android')) return 'your fingerprint or screen lock';
  return 'your device security';
}

export default function NativeSignInPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSupported =
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined';

  const platformLabel = useMemo(() => getPlatformLabel(), []);

  useEffect(() => {
    const init = async () => {
      if (!isSupported) return;

      try {
        const dismissed = localStorage.getItem(PROMPT_KEY);
        if (dismissed === 'dismissed' || dismissed === 'enabled') return;

        const res = await fetch('/api/auth/passkey/list-user-passkeys', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) return;
        const existing = (await res.json()) as Array<{ id: string }>;
        if (Array.isArray(existing) && existing.length > 0) {
          localStorage.setItem(PROMPT_KEY, 'enabled');
          return;
        }

        setVisible(true);
      } catch {
        // silent: this is a progressive enhancement
      }
    };

    init();
  }, [isSupported]);

  const handleEnable = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await authClient.passkey.addPasskey({
        name: 'This device',
        authenticatorAttachment: 'platform',
      });

      if (result.data) {
        localStorage.setItem(PROMPT_KEY, 'enabled');
        setVisible(false);
      } else {
        setError(result.error?.message || 'Could not enable quick sign-in.');
      }
    } catch {
      setError('Could not enable quick sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotNow = () => {
    localStorage.setItem(PROMPT_KEY, 'dismissed');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
        <h3 className="text-xl font-black text-charcoal-blue mb-2">Turn on quicker sign-in?</h3>
        <p className="text-sm text-gray-600 mb-5">
          Use {platformLabel} next time so signing in is instant on this device.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleNotNow}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-charcoal-blue text-white font-bold hover:bg-dark-charcoal transition-colors disabled:opacity-60"
          >
            {loading ? 'Please wait...' : 'Continue'}
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>
    </div>
  );
}

