import { useState, useEffect, useRef } from 'react';
import { tests, leaderboard as lbApi } from '../services/api';

const CACHE_TTL = 60000; // 1 minute

export default function LeaderboardSection() {
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const cache = useRef({});

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    const now = Date.now();
    const cached = cache.current[filter];
    if (cached && (now - cached.ts) < CACHE_TTL) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    try {
      let result;
      if (filter === 'global') {
        result = (await lbApi.global()) || [];
      } else {
        const history = (await tests.history()) || [];
        let filtered = [...history];
        if (filter === 'weekly') {
          filtered = filtered.filter(r => (now - new Date(r.created_at).getTime()) < 7 * 86400000);
        } else if (filter === 'monthly') {
          filtered = filtered.filter(r => (now - new Date(r.created_at).getTime()) < 30 * 86400000);
        } else if (filter === 'hard') {
          filtered = filtered.filter(r => r.difficulty === 'hard');
        }
        filtered.sort((a, b) => b.wpm - a.wpm);
        result = filtered.slice(0, 10);
      }
      cache.current[filter] = { data: result, ts: now };
      setData(result);
    } catch (err) {
      console.error(err);
      setData([]);
    }
    setLoading(false);
  };

  const filters = [
    { id: 'all', label: 'All Time' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'hard', label: 'Hard Mode' },
    { id: 'global', label: '🌎 Global' },
  ];

  return (
    <section className="active-section">
      <h2>{filter === 'global' ? 'Global' : 'Local'} Leaderboard</h2>
      <div className="filter-controls">
        {filters.map(f => (
          <button
            key={f.id}
            className={`filter-btn ${filter === f.id ? 'active' : ''} ${f.id === 'global' ? 'global-btn' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div id="leaderboard-list">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : data.length === 0 ? (
          <div className="empty-state">No records found yet.</div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr><th>Rank</th><th>Player</th><th>WPM</th><th>Acc</th><th>Diff</th><th>Date</th></tr>
            </thead>
            <tbody>
              {data.map((entry, i) => {
                const rank = i + 1;
                const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
                const date = new Date(entry.created_at || entry.date || Date.now()).toLocaleDateString();
                return (
                  <tr key={i}>
                    <td><span className={`rank-badge ${rankClass}`}>{rank}</span></td>
                    <td><span style={{ fontSize: '1.2rem', marginRight: 8 }}>{entry.avatar || '👤'}</span><strong>{entry.username || 'You'}</strong></td>
                    <td className="wpm-cell">{entry.wpm}</td>
                    <td>{entry.accuracy}%</td>
                    <td><span className={`diff-tag ${(entry.difficulty || '').toLowerCase()}`}>{entry.difficulty}</span></td>
                    <td style={{ opacity: 0.6, fontSize: '0.8rem' }}>{date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
