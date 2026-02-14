import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import TestSection from './components/TestSection';
import './App.css';

const AchievementsSection = lazy(() => import('./components/AchievementsSection'));
const LeaderboardSection = lazy(() => import('./components/LeaderboardSection'));
const ShopSection = lazy(() => import('./components/ShopSection'));
const ClansSection = lazy(() => import('./components/ClansSection'));
const HistorySection = lazy(() => import('./components/HistorySection'));
const ProfileSection = lazy(() => import('./components/ProfileSection'));

function App() {
  return (
    <AppProvider>
      <Layout>
        <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
          <Routes>
            <Route path="/" element={<TestSection />} />
            <Route path="/achievements" element={<AchievementsSection />} />
            <Route path="/leaderboard" element={<LeaderboardSection />} />
            <Route path="/shop" element={<ShopSection />} />
            <Route path="/clans" element={<ClansSection />} />
            <Route path="/history" element={<HistorySection />} />
            <Route path="/profile" element={<ProfileSection />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </AppProvider>
  );
}

export default App;
