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

    // 2. Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    installingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              };
            }
          };
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    let timeoutId: NodeJS.Timeout;

    // 3. Logic to check if we should show the modal
    const checkAndShowModal = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // We check localStorage right at evaluation time to avoid stale React closures
      const hasPrompted = localStorage.getItem('pwa-prompt-shown') === 'true';
      
      if (!isStandalone && !hasPrompted) {
        timeoutId = setTimeout(() => {
          // Double check right before showing in case they dismissed it on another tab
          if (localStorage.getItem('pwa-prompt-shown') !== 'true') {
            setShowModal(true);
          }
        }, 3000);
      }
    };

    // 4. Handle Install Prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      checkAndShowModal();
    };

    // 5. Trigger
    if (isIOS) {
        // iOS doesn't fire beforeinstallprompt, so we trigger manually
        checkAndShowModal();
    } else {
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
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
