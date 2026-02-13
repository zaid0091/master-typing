import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { clans } from '../services/api';
import { CLAN_MILESTONES } from '../data/texts';

export default function ClansSection() {
  const { user, showToast, refreshUser } = useApp();
  const [myClan, setMyClan] = useState(null);
  const [clanList, setClanList] = useState([]);
  const [clanName, setClanName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadClans(); }, []);

  const loadClans = async () => {
    setLoading(true);
    try {
      const mine = await clans.mine();
      setMyClan(mine);
    } catch { setMyClan(null); }
    try {
      const list = await clans.list();
      setClanList(list || []);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async () => {
    if (clanName.length < 3 || clanName.length > 12) {
      showToast('Clan name must be 3-12 characters', false);
      return;
    }
    try {
      await clans.create(clanName);
      showToast('Clan created!');
      await refreshUser();
      await loadClans();
    } catch (err) { showToast(err.message, false); }
  };

  const handleJoin = async (clanId) => {
    try {
      await clans.join(clanId);
      showToast('Joined clan!');
      await refreshUser();
      await loadClans();
    } catch (err) { showToast(err.message, false); }
  };

  const handleLeave = async () => {
    try {
      await clans.leave();
      showToast('Left clan');
      await refreshUser();
      await loadClans();
    } catch (err) { showToast(err.message, false); }
  };

  if (loading) return <section className="active-section"><div className="loading-spinner">Loading...</div></section>;

  if (myClan) {
    const totalWords = myClan.total_words || 0;
    const currentMilestone = CLAN_MILESTONES.find(m => totalWords < m.words) || CLAN_MILESTONES[CLAN_MILESTONES.length - 1];
    const prevMilestone = CLAN_MILESTONES[CLAN_MILESTONES.indexOf(currentMilestone) - 1];
    const base = prevMilestone ? prevMilestone.words : 0;
    const progress = Math.min(100, ((totalWords - base) / (currentMilestone.words - base)) * 100);
    const petMilestone = [...CLAN_MILESTONES].reverse().find(m => totalWords >= m.words);

    return (
      <section className="active-section">
        <div className="clan-main-container">
          <div className="clan-header-ui">
            <div className="clan-banner-large">{myClan.banner || '🚩'}</div>
            <div className="clan-titles">
              <h2>{myClan.name}</h2>
              <div className="mode-tag">Stronghold Level {myClan.level || 1}</div>
            </div>
            <button className="icon-btn danger" onClick={handleLeave}>Leave Clan</button>
          </div>

          <div className="clan-grid">
            <div className="profile-card glass-panel full-width">
              <h3>Shared Stronghold Progress</h3>
              <div className="progress-container">
                <div className="progress-labels">
                  <span>{totalWords.toLocaleString()} / {currentMilestone.words.toLocaleString()} words</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="xp-bar-outer">
                  <div className="xp-bar-inner" style={{ width: progress + '%' }}></div>
                </div>
              </div>
              <p className="subtitle">Next Unlock: {currentMilestone.name}</p>
            </div>

            <div className="profile-card glass-panel">
              <h3>Shared Guardian</h3>
              <div className="clan-hall-pet">
                <div className="clan-pet-display">{petMilestone ? petMilestone.pet : '🥚'}</div>
                <p>{petMilestone ? petMilestone.name : 'Unlocks at Milestone 1'}</p>
              </div>
            </div>

            <div className="profile-card glass-panel">
              <h3>Clan Hall</h3>
              <div className="member-list">
                {(myClan.members || []).map((m, i) => (
                  <div key={i} className="member-card">
                    <span>{m.avatar || '👤'} {m.username}</span>
                    <span style={{ opacity: 0.6, fontSize: '0.85rem' }}>Lv. {m.level || 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="active-section">
      <div className="clan-main-container">
        <div className="clan-overview">
          <h2>Clan Strongholds</h2>
          <p className="subtitle">Join forces with other typists to unlock exclusive rewards.</p>

          <div className="clan-actions-grid">
            <div className="profile-card glass-panel">
              <h3>Create a Clan</h3>
              <p>Lead your own stronghold.</p>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Clan Name (3-12 chars)"
                  maxLength={12}
                  value={clanName}
                  onChange={e => setClanName(e.target.value)}
                />
                <button className="shop-btn buy" onClick={handleCreate}>Create (1000 🪙)</button>
              </div>
            </div>

            <div className="profile-card glass-panel">
              <h3>Find Clans</h3>
              <p>Join an existing stronghold.</p>
              <div className="discovery-list">
                {clanList.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>No public clans found yet.</div>
                ) : clanList.map(c => (
                  <div key={c.id} className="member-card" style={{ marginBottom: '0.5rem' }}>
                    <span>{c.name} ({c.member_count} members)</span>
                    <button className="shop-btn buy" style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => handleJoin(c.id)}>Join</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
