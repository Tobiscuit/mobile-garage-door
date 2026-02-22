'use client';

import { useEffect, useState } from 'react';
import { PwaInstallModal } from './PwaInstallModal';

export function PwaRegistry() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Detect Platform
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /Android/.test(ua);
    setPlatform(isIOS ? 'ios' : isAndroid ? 'android' : 'other');

    // 2. Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasPrompted = localStorage.getItem('pwa-prompt-shown');

    // 3. Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          // Add listener for updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content available, trigger update
                    installingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              };
            }
          };
        });
      });

      // Auto-reload when new worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    // 4. Handle Install Prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      if (!isStandalone && !hasPrompted) {
        // Show after a short delay for better UX
        setTimeout(() => setShowModal(true), 3000);
      }
    };

    // 5. iOS Manual Prompt Strategy
    if (isIOS && !isStandalone && !hasPrompted) {
        setTimeout(() => setShowModal(true), 3000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install');
    }
    
    setInstallPrompt(null);
    setShowModal(false);
    localStorage.setItem('pwa-prompt-shown', 'true');
  };

  const handleClose = () => {
    setShowModal(false);
    // Don't show again for 7 days if they dismiss it
    localStorage.setItem('pwa-prompt-shown', 'true');
  };

  return (
    <PwaInstallModal 
        show={showModal} 
        onClose={handleClose} 
        onInstall={handleInstall} 
        platform={platform} 
    />
  );
}
