'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * PostPaymentPrompt — shown after successful Square payment.
 * Platform-aware:
 *   - Android/Desktop: Just push permission (no install nagging)
 *   - iOS (not installed): Add to Home Screen instructions + push
 *   - iOS (installed): Just push permission
 */
export default function PostPaymentPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isInstalled, setIsInstalled] = useState(false);
  const [pushGranted, setPushGranted] = useState(false);
  const [step, setStep] = useState<'prompt' | 'ios-instructions' | 'done'>('prompt');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check dismissal cooldown (30 days)
    const dismissed = localStorage.getItem('push-prompt-dismissed');
    if (dismissed) {
      const dismissDate = new Date(dismissed);
      const daysSince = (Date.now() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) return;
    }

    // Already has push permission
    if (Notification.permission === 'granted') {
      setPushGranted(true);
      return;
    }

    // Detect platform
    const ua = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const android = /Android/.test(ua);
    setPlatform(iOS ? 'ios' : android ? 'android' : 'desktop');

    // Detect if installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(standalone);

    // Show after a short delay (1.5s after payment success renders)
    const timer = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnableNotifications = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Register push subscription
        const reg = await navigator.serviceWorker.ready;
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
          console.error('VAPID public key not configured');
          setStep('done');
          return;
        }

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // Save subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        });

        setPushGranted(true);
      }
    } catch (err) {
      console.error('Push subscription error:', err);
    }
    setStep('done');
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem('push-prompt-dismissed', new Date().toISOString());
    setShow(false);
  }, []);

  if (!show || pushGranted) return null;

  // iOS needs install before push
  if (platform === 'ios' && !isInstalled && step === 'prompt') {
    return (
      <div className="push-prompt">
        <div className="push-prompt-card">
          <button className="push-prompt-close" onClick={handleDismiss} aria-label="Close">×</button>
          <p className="push-prompt-emoji">📲</p>
          <h3 className="push-prompt-title">Get arrival alerts on your phone</h3>
          <p className="push-prompt-desc">
            Add Mobil Garage Door to your home screen to receive notifications when your technician is nearby.
          </p>
          <button className="push-prompt-btn" onClick={() => setStep('ios-instructions')}>
            Show me how
          </button>
          <button className="push-prompt-link" onClick={handleDismiss}>Not now</button>
        </div>
        <PromptStyles />
      </div>
    );
  }

  // iOS instructions
  if (step === 'ios-instructions') {
    return (
      <div className="push-prompt">
        <div className="push-prompt-card">
          <button className="push-prompt-close" onClick={handleDismiss} aria-label="Close">×</button>
          <p className="push-prompt-emoji">📱</p>
          <h3 className="push-prompt-title">Add to Home Screen</h3>
          <ol className="push-prompt-steps">
            <li>Tap the <strong>Share</strong> button <span className="push-prompt-icon">⬆️</span></li>
            <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></li>
            <li>Tap <strong>Add</strong> — then open the app from your home screen</li>
          </ol>
          <button className="push-prompt-link" onClick={handleDismiss}>I&apos;ll do it later</button>
        </div>
        <PromptStyles />
      </div>
    );
  }

  // Android/Desktop — just push permission
  if (step === 'prompt') {
    return (
      <div className="push-prompt">
        <div className="push-prompt-card">
          <button className="push-prompt-close" onClick={handleDismiss} aria-label="Close">×</button>
          <p className="push-prompt-emoji">🔔</p>
          <h3 className="push-prompt-title">Know when your tech arrives</h3>
          <p className="push-prompt-desc">
            Get a notification when your technician is 15 minutes away and when they arrive.
          </p>
          <button className="push-prompt-btn" onClick={handleEnableNotifications}>
            Enable notifications
          </button>
          <button className="push-prompt-link" onClick={handleDismiss}>Not now</button>
        </div>
        <PromptStyles />
      </div>
    );
  }

  // Done state
  if (step === 'done' && pushGranted) {
    return (
      <div className="push-prompt">
        <div className="push-prompt-card push-prompt-success">
          <p className="push-prompt-emoji">✅</p>
          <h3 className="push-prompt-title">You&apos;re all set!</h3>
          <p className="push-prompt-desc">
            We&apos;ll notify you when your technician is on the way.
          </p>
        </div>
        <PromptStyles />
      </div>
    );
  }

  return null;
}

function PromptStyles() {
  return (
    <style>{`
      .push-prompt {
        position: fixed;
        bottom: 1.5rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        width: 90%;
        max-width: 380px;
        animation: slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      }

      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }

      .push-prompt-card {
        background: rgba(17, 17, 17, 0.98);
        border-radius: 1.25rem;
        border: 1px solid rgba(255,255,255,0.1);
        padding: 1.5rem;
        text-align: center;
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        position: relative;
      }

      .push-prompt-success {
        border-color: rgba(16, 185, 129, 0.3);
        animation: fadeOut 3s 2s forwards;
      }

      @keyframes fadeOut {
        to { opacity: 0; transform: translateY(20px); }
      }

      .push-prompt-close {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: none;
        border: none;
        color: rgba(255,255,255,0.4);
        font-size: 1.5rem;
        cursor: pointer;
        line-height: 1;
        padding: 0.25rem;
      }

      .push-prompt-emoji {
        font-size: 2.5rem;
        margin-bottom: 0.75rem;
      }

      .push-prompt-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #fff;
        margin: 0 0 0.5rem;
      }

      .push-prompt-desc {
        font-size: 0.85rem;
        color: rgba(255,255,255,0.5);
        margin: 0 0 1.25rem;
        line-height: 1.5;
      }

      .push-prompt-btn {
        display: block;
        width: 100%;
        padding: 0.75rem;
        background: linear-gradient(135deg, #3B82F6, #2563EB);
        color: #fff;
        font-weight: 700;
        font-size: 0.9rem;
        border: none;
        border-radius: 0.75rem;
        cursor: pointer;
        margin-bottom: 0.75rem;
        transition: transform 0.15s;
      }

      .push-prompt-btn:active {
        transform: scale(0.97);
      }

      .push-prompt-link {
        background: none;
        border: none;
        color: rgba(255,255,255,0.35);
        font-size: 0.8rem;
        cursor: pointer;
        padding: 0.25rem;
      }

      .push-prompt-steps {
        text-align: left;
        list-style: decimal;
        padding-left: 1.25rem;
        margin: 0 0 1.25rem;
        color: rgba(255,255,255,0.6);
        font-size: 0.85rem;
        line-height: 2;
      }

      .push-prompt-steps strong {
        color: #fff;
      }

      .push-prompt-icon {
        font-size: 1rem;
      }
    `}</style>
  );
}

/**
 * Convert a URL-safe base64 string to a Uint8Array (for applicationServerKey)
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
