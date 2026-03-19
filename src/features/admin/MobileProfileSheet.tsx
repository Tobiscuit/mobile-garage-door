'use client';

import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import PushSubscriptionManager from './PushSubscriptionManager';

/**
 * Mobile Profile Sheet — slides up from the bottom nav.
 * 2026 bleeding-edge pattern: bottom sheet with backdrop blur,
 * spring animation, and swipe-to-dismiss.
 */
export default function MobileProfileSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when sheet is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 200); // wait for exit animation
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] transition-opacity duration-200"
        style={{
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          opacity: isAnimating ? 1 : 0,
        }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl pb-safe transition-transform duration-200 ease-out"
        style={{
          backgroundColor: 'var(--staff-surface)',
          borderTop: '1px solid var(--staff-border)',
          transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.15)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--staff-border)' }} />
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Section: Appearance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--staff-muted)' }}>
              Appearance
            </h4>
            <ThemeToggle />
          </div>

          {/* Section: Push Notifications */}
          <PushSubscriptionManager />

          {/* Section: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--staff-muted)' }}>
              Quick Links
            </h4>
            <div className="space-y-2">
              <a
                href="/dashboard/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all active:scale-95"
                style={{ backgroundColor: 'var(--staff-surface-alt)', color: 'var(--staff-text)' }}
              >
                <svg className="w-5 h-5" style={{ color: 'var(--staff-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="font-semibold text-sm">Site Settings</span>
              </a>
              <a
                href="/portal"
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all active:scale-95"
                style={{ backgroundColor: 'var(--staff-surface-alt)', color: 'var(--staff-text)' }}
              >
                <svg className="w-5 h-5" style={{ color: 'var(--staff-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                <span className="font-semibold text-sm">Customer View</span>
              </a>
            </div>
          </div>

          {/* Section: Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--staff-muted)' }}>
              Security
            </h4>
            <button
              onClick={async () => {
                try {
                  const { authClient } = await import('@/lib/auth-client');
                  // Check if passkey is available
                  const passkey = (authClient as any).passkey;
                  if (passkey) {
                    await passkey.addPasskey();
                  }
                } catch (err) {
                  console.error('Passkey setup error:', err);
                  alert('Passkey setup failed. Please try again.');
                }
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all text-left active:scale-95"
              style={{ backgroundColor: 'var(--staff-surface-alt)', color: 'var(--staff-text)' }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--staff-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <div>
                <div className="font-semibold text-sm">Set Up Passkey</div>
                <div className="text-xs" style={{ color: 'var(--staff-muted)' }}>Biometric login for faster access</div>
              </div>
            </button>
          </div>

          {/* Log Out */}
          <button
            onClick={async () => {
              try {
                const { authClient } = await import('@/lib/auth-client');
                await authClient.signOut();
                window.location.href = '/login';
              } catch (err) {
                console.error(err);
                window.location.href = '/login';
              }
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 transition-all active:scale-95 text-left"
            style={{ backgroundColor: 'var(--staff-surface-alt)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="font-bold text-sm">Log Out</span>
          </button>

          {/* Version */}
          <div className="text-center pt-2">
            <span className="text-[10px] font-mono" style={{ color: 'var(--staff-muted)' }}>Mobil Garage v2.1</span>
          </div>
        </div>
      </div>
    </>
  );
}
