import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [toast, setToast] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (token) {
      auth.session()
        .then(u => { setUser(u); setLoading(false); })
        .catch(async () => {
          // Access token expired — try refreshing
          if (refresh) {
            try {
              const res = await fetch(
                (import.meta.env.VITE_API_URL || '') + '/api/auth/token/refresh/',
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }) }
              );
              if (res.ok) {
                const data = await res.json();
                localStorage.setItem('access_token', data.access);
                if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
                const u = await auth.session();
                setUser(u);
                setLoading(false);
                return;
              }
            } catch {}
          }
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  const showToast = useCallback((message, isSuccess = true) => {
    setToast({ message, isSuccess });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await auth.session();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  const value = {
    user, setUser, loading, theme, toggleTheme,
    toast, showToast,
    refreshUser, showAuthModal, setShowAuthModal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
