import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from './Navbar';
import Toast from './Toast';
import AuthModal from './AuthModal';
import TestSection from './TestSection';
import AchievementsSection from './AchievementsSection';
import LeaderboardSection from './LeaderboardSection';
import ShopSection from './ShopSection';
import ClansSection from './ClansSection';
import HistorySection from './HistorySection';
import ProfileSection from './ProfileSection';
import ParticleBackground from './ParticleBackground';

const PET_MAP = {
  'pet-owl': '🦉',
  'pet-dragon': '🐉',
};

export default function Layout() {
  const { activeSection, user, loading, showAuthModal, setShowAuthModal, setActiveSection, showToast } = useApp();

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

  // Redirect guests to test section if they navigate to auth-required sections
  useEffect(() => {
    if (!user && !['test', 'leaderboard'].includes(activeSection)) {
      setActiveSection('test');
      showToast('Login to access this feature', false);
      setShowAuthModal(true);
    }
  }, [activeSection, user, setActiveSection, showToast, setShowAuthModal]);

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
            {activeSection === 'test' && <TestSection />}
            {activeSection === 'achievements' && <AchievementsSection />}
            {activeSection === 'leaderboard' && <LeaderboardSection />}
            {activeSection === 'shop' && <ShopSection />}
            {activeSection === 'clans' && <ClansSection />}
            {activeSection === 'stats' && <HistorySection />}
            {activeSection === 'profile' && <ProfileSection />}
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
