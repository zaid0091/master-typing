import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] = useState('test');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    auth.session().then(u => {
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
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
    toast, showToast, activeSection, setActiveSection,
    refreshUser, showAuthModal, setShowAuthModal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
