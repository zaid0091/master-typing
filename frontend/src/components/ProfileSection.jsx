import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { auth, tests } from '../services/api';
import { TITLES, AVATARS } from '../data/texts';

export default function ProfileSection() {
  const { user, showToast, refreshUser } = useApp();
  const [stats, setStats] = useState(null);
  const [titles, setTitles] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    tests.stats().then(setStats).catch(() => {});
    tests.titles().then(data => setTitles((data || []).map(t => t.title_id))).catch(() => {});
  }, []);

  const handleAvatar = async (avatar) => {
    try {
      await auth.updateProfile({ avatar });
      refreshUser();
      setShowAvatarModal(false);
      showToast('Avatar updated!');
    } catch (err) { showToast(err.message, false); }
  };

  const handleEquipTitle = async (titleId) => {
    try {
      await auth.updateProfile({ equipped_title: titleId });
      refreshUser();
      showToast('Title equipped!');
    } catch (err) { showToast(err.message, false); }
  };

  const level = user?.level || 1;
  const xp = user?.xp_in_current_level || 0;
  const xpPct = (xp / 1000) * 100;
  const totalTime = stats?.total_time || 0;
  const hours = Math.floor(totalTime / 3600);
  const mins = Math.floor((totalTime % 3600) / 60);

  const gardenItems = ['🌱', '🌿', '🌳', '🌸', '🌺', '🌻', '🍄', '🦋', '🐝'];
  const totalWords = stats?.total_words || 0;
  const gardenCount = Math.min(gardenItems.length, Math.floor(totalWords / 500));

  return (
    <section className="active-section">
      <div className="profile-header"><h2>Player Profile</h2></div>

      <div className="profile-grid">
        <div className="profile-card player-card glass-panel">
          <div className="profile-avatar clickable" title="Change Avatar" onClick={() => setShowAvatarModal(true)}>
            {user?.avatar || '👤'}
          </div>
          <div className="profile-info">
            <h3>Level {level}</h3>
            <p>{xp} / 1000 XP</p>
            {user?.equipped_title && <div className="profile-title-tag">{user.equipped_title}</div>}
            <div className="profile-xp-bar-outer">
              <div className="profile-xp-bar-inner" style={{ width: xpPct + '%' }}></div>
            </div>
          </div>
        </div>

        <div className="profile-card titles-card glass-panel">
          <h3>Player Titles</h3>
          <p className="subtitle">Equip your hard-earned titles</p>
          <div className="titles-grid">
            {TITLES.map(t => {
              const isUnlocked = titles.includes(t.id);
              const isEquipped = user?.equipped_title === t.name;
              return (
                <div
                  key={t.id}
                  className={`title-item tier-${t.tier} ${isUnlocked ? 'unlocked' : ''} ${isEquipped ? 'equipped' : ''}`}
                  onClick={() => isUnlocked && handleEquipTitle(t.name)}
                >
                  <span className="title-name">{t.name}</span>
                  <span className="title-requirement">{t.requirement}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="profile-card stats-summary-card glass-panel">
          <h3>Lifetime Stats</h3>
          <div className="brief-stats-grid">
            <div className="brief-stat">
              <span className="label">Total Tests</span>
              <span className="value">{stats?.total_tests || 0}</span>
            </div>
            <div className="brief-stat">
              <span className="label">Total Time</span>
              <span className="value">{hours}h {mins}m</span>
            </div>
            <div className="brief-stat">
              <span className="label">Avg. WPM</span>
              <span className="value">{stats?.avg_wpm || 0}</span>
            </div>
            <div className="brief-stat">
              <span className="label">Avg. Accuracy</span>
              <span className="value">{stats?.avg_acc || 0}%</span>
            </div>
          </div>
        </div>

        <div className="profile-card records-card glass-panel">
          <h3>Personal Bests</h3>
          <div className="pb-list">
            <div className="pb-item">
              <span className="difficulty-label">Easy</span>
              <span className="pb-value">{stats?.pb_easy || 0} WPM</span>
            </div>
            <div className="pb-item">
              <span className="difficulty-label">Medium</span>
              <span className="pb-value">{stats?.pb_medium || 0} WPM</span>
            </div>
            <div className="pb-item">
              <span className="difficulty-label">Hard</span>
              <span className="pb-value">{stats?.pb_hard || 0} WPM</span>
            </div>
          </div>
        </div>

        <div className="profile-card zen-garden-card glass-panel full-width">
          <div className="garden-header">
            <h3>Your Zen Garden</h3>
            <span className="subtitle">{totalWords} words typed towards next milestone</span>
          </div>
          <div className="garden-area">
            {Array.from({ length: gardenCount }).map((_, i) => (
              <div key={i} className="garden-item" style={{ left: `${10 + (i * 10)}%` }}>
                {gardenItems[i]}
              </div>
            ))}
            <div className="garden-ground"></div>
          </div>
        </div>
      </div>

      {showAvatarModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setShowAvatarModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">📸</div>
            <h3>Choose Avatar</h3>
            <p>Select an icon to represent you.</p>
            <div className="avatar-grid">
              {AVATARS.map(a => (
                <div
                  key={a}
                  className={`avatar-item ${user?.avatar === a ? 'selected' : ''}`}
                  onClick={() => handleAvatar(a)}
                >
                  {a}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setShowAvatarModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
