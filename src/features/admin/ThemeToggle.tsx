'use client';

import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = (localStorage.getItem('app-theme') as Theme | null) || 'light';
    document.documentElement.setAttribute('data-app-theme', saved);
    setTheme(saved);
  }, []);

  const switchTheme = (next: Theme) => {
    setTheme(next);
    localStorage.setItem('app-theme', next);
    document.documentElement.setAttribute('data-app-theme', next);
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--staff-surface-alt)' }}>
      <button
        type="button"
        onClick={() => switchTheme('light')}
        className="flex-1 px-3 py-1.5 rounded text-xs font-bold text-center justify-center transition-all"
        style={{
          backgroundColor: theme === 'light' ? 'var(--staff-accent)' : 'transparent',
          color: theme === 'light' ? '#2c3e50' : 'var(--staff-muted)',
        }}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => switchTheme('dark')}
        className="flex-1 px-3 py-1.5 rounded text-xs font-bold text-center justify-center transition-all"
        style={{
          backgroundColor: theme === 'dark' ? 'var(--staff-accent)' : 'transparent',
          color: theme === 'dark' ? '#2c3e50' : 'var(--staff-muted)',
        }}
      >
        Dark
      </button>
    </div>
  );
}
