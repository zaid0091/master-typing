import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import TestSection from './components/TestSection';
import AchievementsSection from './components/AchievementsSection';
import LeaderboardSection from './components/LeaderboardSection';
import ShopSection from './components/ShopSection';
import ClansSection from './components/ClansSection';
import HistorySection from './components/HistorySection';
import ProfileSection from './components/ProfileSection';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Layout>
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
      </Layout>
    </AppProvider>
  );
}

export default App;
