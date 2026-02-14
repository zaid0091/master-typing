import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from './Navbar';
import Toast from './Toast';
import AuthModal from './AuthModal';
import ParticleBackground from './ParticleBackground';

const PET_MAP = {
  'pet-owl': '🦉',
  'pet-dragon': '🐉',
};

const TITLES = {
  '/': 'Typing Master',
  '/achievements': 'Achievements | Typing Master',
  '/leaderboard': 'Leaderboard | Typing Master',
  '/shop': 'Shop | Typing Master',
  '/clans': 'Clans | Typing Master',
  '/history': 'History | Typing Master',
  '/profile': 'Profile | Typing Master',
};

const AUTH_REQUIRED = ['/achievements', '/shop', '/clans', '/history', '/profile'];

export default function Layout({ children }) {
  const { user, loading, showAuthModal, setShowAuthModal, showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Update page title
  useEffect(() => {
    document.title = TITLES[location.pathname] || 'Typing Master';
  }, [location.pathname]);

  // Apply equipped shop theme to document
  useEffect(() => {
    const el = document.documentElement;
    if (user?.equipped_theme) {
      el.setAttribute('data-shop-theme', user.equipped_theme);
    } else {
      el.removeAttribute('data-shop-theme');
    }
    if (user?.equipped_aura) {
      el.setAttribute('data-aura', user.equipped_aura);
    } else {
      el.removeAttribute('data-aura');
    }
  }, [user?.equipped_theme, user?.equipped_aura]);

  // Redirect guests away from auth-required pages
  useEffect(() => {
    if (!loading && !user && AUTH_REQUIRED.includes(location.pathname)) {
      navigate('/', { replace: true });
      showToast('Login to access this feature', false);
      setShowAuthModal(true);
    }
  }, [location.pathname, user, loading, navigate, showToast, setShowAuthModal]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-color)' }}>Loading...</div>;
  }

  const petEmoji = user?.equipped_pet ? PET_MAP[user.equipped_pet] : null;

  return (
      <>
        <ParticleBackground />
        <Navbar />
        <main>
          <div className="main-container">
            {children}
          </div>
        </main>
        {petEmoji && (
          <div className="equipped-pet" title={user.equipped_pet === 'pet-dragon' ? 'Fire Drake' : 'Wise Owl'}>
            {petEmoji}
          </div>
        )}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        <Toast />
      </>
    );
}
