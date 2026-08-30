'use client';

import React, { useEffect } from 'react';
import { useSettingsStore } from '../lib/store/useSettingsStore';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storeTheme = useSettingsStore((s) => s.canvas.theme);

  const applyTheme = (themeName: string) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;
    const finalTheme = themeName || 'dark-glass';

    root.setAttribute('data-theme', finalTheme);
    body.setAttribute('data-theme', finalTheme);
    body.dataset.theme = finalTheme;

    // Remove old theme classes and add new one
    ['theme-dark-glass', 'theme-deep-slate', 'theme-neon-purple', 'theme-midnight-navy'].forEach((cls) => {
      root.classList.remove(cls);
      body.classList.remove(cls);
    });

    root.classList.add(`theme-${finalTheme}`);
    body.classList.add(`theme-${finalTheme}`);
  };

  useEffect(() => {
    // Initial mount check from localStorage
    const saved = localStorage.getItem('hf_workspace_theme');
    const active = storeTheme || saved || 'dark-glass';
    applyTheme(active);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hf_workspace_theme' && e.newValue) {
        applyTheme(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storeTheme]);

  return <>{children}</>;
};
