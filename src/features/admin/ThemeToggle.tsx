'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const lightBtnRef = useRef<HTMLButtonElement>(null);
  const darkBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem('app-theme') as Theme | null) || 'light';
    document.documentElement.setAttribute('data-app-theme', saved);
    setTheme(saved);
  }, []);

  const applyTheme = (next: Theme) => {
    setTheme(next);
    localStorage.setItem('app-theme', next);
    document.documentElement.setAttribute('data-app-theme', next);
  };

  const switchTheme = (next: Theme, e: React.MouseEvent<HTMLButtonElement>) => {
    if (next === theme) return;

    // Get exact click/touch coordinates for circular reveal origin
    const x = e.clientX;
    const y = e.clientY;

    // Calculate the max radius to cover the full viewport
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Use View Transition API if available
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const transition = (document as any).startViewTransition(() => {
        applyTheme(next);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      applyTheme(next);
    }
  };

  return (
    <>
      <style>{`
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
        ::view-transition-old(root) {
          z-index: 1;
        }
        ::view-transition-new(root) {
          z-index: 9999;
        }
      `}</style>
      <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--staff-surface-alt)' }}>
        <button
          ref={lightBtnRef}
          type="button"
          onClick={(e) => switchTheme('light', e)}
          className="flex-1 px-3 py-1.5 rounded text-xs font-bold text-center justify-center transition-all flex items-center gap-1.5"
          style={{
            backgroundColor: theme === 'light' ? 'var(--staff-accent)' : 'transparent',
            color: theme === 'light' ? '#2c3e50' : 'var(--staff-muted)',
          }}
        >
          <Sun className="w-3.5 h-3.5" /> Light
        </button>
        <button
          ref={darkBtnRef}
          type="button"
          onClick={(e) => switchTheme('dark', e)}
          className="flex-1 px-3 py-1.5 rounded text-xs font-bold text-center justify-center transition-all flex items-center gap-1.5"
          style={{
            backgroundColor: theme === 'dark' ? 'var(--staff-accent)' : 'transparent',
            color: theme === 'dark' ? '#2c3e50' : 'var(--staff-muted)',
          }}
        >
          <Moon className="w-3.5 h-3.5" /> Dark
        </button>
      </div>
    </>
  );
}

