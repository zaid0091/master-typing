import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { tests } from '../services/api';
import { achievements as achievementsConfig } from '../data/texts';

export default function AchievementsSection() {
  const { user } = useApp();
  const [unlocked, setUnlocked] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    tests.achievements().then(data => setUnlocked(data.map(a => a.achievement_id))).catch(() => {});
    tests.stats().then(setStats).catch(() => {});
  }, []);

  return (
    <section className="active-section">
      <h2>Achievements</h2>
      <div className="badges-grid">
        {achievementsConfig.map(a => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div key={a.id} className={`badge ${isUnlocked ? 'unlocked' : 'locked'}`}>
              <div className="badge-icon">{a.icon}</div>
              <div className="badge-name">{a.name}</div>
              <div className="badge-desc">{a.description}</div>
            </div>
          );
        })}
      </div>
      <div className="achievements-stats-container">
        <div className="streak-container glass-panel">
          <h3>Current Streak</h3>
          <div className="streak-count">{stats?.streak || 0} Days</div>
          <p>Practice daily to keep your streak alive!</p>
        </div>
        <div className="pr-container glass-panel">
          <h3>Personal Record</h3>
          <div className="pr-wpm">{stats?.best_wpm || 0} WPM</div>
        </div>
      </div>
    </section>
  );
}
