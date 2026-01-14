"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({ children, defaultTheme = "dark", storageKey = "instant-theme" }) {
  const [theme, setThemeState] = useState(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setThemeState(stored);
      }
    } catch (e) {}
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    try {
      localStorage.setItem(storageKey, theme);
    } catch (e) {}
  }, [theme, mounted, storageKey]);

  // Respond to system preference changes when no explicit localStorage set
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) {
          setThemeState(e.matches ? 'dark' : 'light');
        }
      } catch (err) {}
    };
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
    };
  }, [storageKey]);

  const setTheme = (t) => setThemeState(t);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
