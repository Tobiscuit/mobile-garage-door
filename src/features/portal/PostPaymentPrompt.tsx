'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle } from 'lucide-react';

const translations = {
  en: {
    ios_title: 'Get arrival alerts on your phone',
    ios_desc: 'Add Mobil Garage Door to your home screen to receive notifications when your technician is nearby.',
    ios_btn: 'Show me how',
    ios_instructions_title: 'Add to Home Screen',
    ios_step1_pre: 'Tap the ',
    ios_step1_bold: 'Share',
    ios_step1_post: ' button',
    ios_step2_pre: 'Scroll down and tap ',
    ios_step2_bold: '"Add to Home Screen"',
    ios_step3_pre: 'Tap ',
    ios_step3_bold: 'Add',
    ios_step3_post: ' — then open the app from your home screen',
    ios_later: "I'll do it later",
    push_title: 'Know when your tech arrives',
    push_desc: 'Get a notification when your technician is 15 minutes away and when they arrive.',
    push_btn: 'Enable notifications',
    not_now: 'Not now',
    done_title: "You're all set!",
    done_desc: "We'll notify you when your technician is on the way.",
  },
  es: {
    ios_title: 'Recibe alertas de llegada en tu teléfono',
    ios_desc: 'Agrega Mobil Garage Door a tu pantalla de inicio para recibir notificaciones cuando tu técnico esté cerca.',
    ios_btn: 'Muéstrame cómo',
    ios_instructions_title: 'Agregar a pantalla de inicio',
    ios_step1_pre: 'Toca el botón ',
    ios_step1_bold: 'Compartir',
    ios_step1_post: '',
    ios_step2_pre: 'Desplázate y toca ',
    ios_step2_bold: '"Agregar a inicio"',
    ios_step3_pre: 'Toca ',
    ios_step3_bold: 'Agregar',
    ios_step3_post: ' — luego abre la app desde tu inicio',
    ios_later: 'Lo haré después',
    push_title: 'Sé cuándo llega tu técnico',
    push_desc: 'Recibe una notificación cuando tu técnico esté a 15 minutos y cuando llegue.',
    push_btn: 'Activar notificaciones',
    not_now: 'Ahora no',
    done_title: '¡Listo!',
    done_desc: 'Te notificaremos cuando tu técnico esté en camino.',
  },
  vi: {
    ios_title: 'Nhận thông báo khi kỹ thuật viên đến',
    ios_desc: 'Thêm Mobil Garage Door vào màn hình chính để nhận thông báo khi kỹ thuật viên đến gần.',
    ios_btn: 'Hướng dẫn',
    ios_instructions_title: 'Thêm vào màn hình chính',
    ios_step1_pre: 'Nhấn nút ',
    ios_step1_bold: 'Chia sẻ',
    ios_step1_post: '',
    ios_step2_pre: 'Cuộn xuống và nhấn ',
    ios_step2_bold: '"Thêm vào màn hình chính"',
    ios_step3_pre: 'Nhấn ',
    ios_step3_bold: 'Thêm',
    ios_step3_post: ' — rồi mở ứng dụng từ màn hình chính',
    ios_later: 'Để sau',
    push_title: 'Biết khi kỹ thuật viên đến',
    push_desc: 'Nhận thông báo khi kỹ thuật viên còn 15 phút và khi họ đến nơi.',
    push_btn: 'Bật thông báo',
    not_now: 'Không phải bây giờ',
    done_title: 'Hoàn tất!',
    done_desc: 'Chúng tôi sẽ thông báo khi kỹ thuật viên đang trên đường đến.',
  },
} as const;

interface PostPaymentPromptProps {
  locale?: string;
}

export default function PostPaymentPrompt({ locale = 'en' }: PostPaymentPromptProps) {
  const t = translations[locale as keyof typeof translations] || translations.en;
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
          <h3 className="push-prompt-title">{t.ios_title}</h3>
          <p className="push-prompt-desc">{t.ios_desc}</p>
          <button className="push-prompt-btn" onClick={() => setStep('ios-instructions')}>
            {t.ios_btn}
          </button>
          <button className="push-prompt-link" onClick={handleDismiss}>{t.not_now}</button>
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
          <h3 className="push-prompt-title">{t.ios_instructions_title}</h3>
          <ol className="push-prompt-steps">
            <li>{t.ios_step1_pre}<strong>{t.ios_step1_bold}</strong>{t.ios_step1_post} <span className="push-prompt-icon">⬆️</span></li>
            <li>{t.ios_step2_pre}<strong>{t.ios_step2_bold}</strong></li>
            <li>{t.ios_step3_pre}<strong>{t.ios_step3_bold}</strong>{t.ios_step3_post}</li>
          </ol>
          <button className="push-prompt-link" onClick={handleDismiss}>{t.ios_later}</button>
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
          <p className="push-prompt-emoji"><Bell className="w-8 h-8" /></p>
          <h3 className="push-prompt-title">{t.push_title}</h3>
          <p className="push-prompt-desc">{t.push_desc}</p>
          <button className="push-prompt-btn" onClick={handleEnableNotifications}>
            {t.push_btn}
          </button>
          <button className="push-prompt-link" onClick={handleDismiss}>{t.not_now}</button>
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
          <p className="push-prompt-emoji"><CheckCircle className="w-8 h-8" /></p>
          <h3 className="push-prompt-title">{t.done_title}</h3>
          <p className="push-prompt-desc">{t.done_desc}</p>
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
