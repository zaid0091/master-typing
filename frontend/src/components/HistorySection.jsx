import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { tests } from '../services/api';

export default function HistorySection() {
  const { showToast } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await tests.history();
      setHistory(data || []);
    } catch {}
    setLoading(false);
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to delete all your typing stats?')) return;
    try {
      await tests.clearHistory();
      setHistory([]);
      showToast('History cleared');
    } catch (err) { showToast(err.message, false); }
  };

  const handleExport = () => {
    if (history.length === 0) { showToast('No data to export', false); return; }
    const csv = 'Date,WPM,CPM,Accuracy,Errors,Time,Difficulty,Mode\n' +
      history.map(r => `${new Date(r.created_at).toLocaleString()},${r.wpm},${r.cpm},${r.accuracy},${r.errors},${r.time}s,${r.difficulty},${r.mode}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'typing-history.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported!');
  };

  const getWpmBadge = (wpm) => {
    if (wpm >= 100) return 'badge-elite';
    if (wpm >= 80) return 'badge-pro';
    if (wpm >= 50) return 'badge-intermediate';
    return 'badge-normal';
  };

  return (
    <section className="active-section">
      <div className="history-header">
        <h2>Typing History</h2>
        <div className="history-actions">
          <button className="icon-btn" title="Export CSV" onClick={handleExport}>📥 Export</button>
          <button className="icon-btn danger" title="Clear History" onClick={handleClear}>🗑️ Clear</button>
        </div>
      </div>
      <div id="history-list">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : history.length === 0 ? (
          <div className="empty-state">No typing history yet. Complete a test to see your results!</div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Time</th>
                <th>Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r, i) => (
                <tr key={i}>
                  <td>
                    <div className="col-date">
                      <span className="history-date">{new Date(r.created_at).toLocaleDateString()}</span>
                      <span className="history-time">{new Date(r.created_at).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td><span className={`wpm-badge ${getWpmBadge(r.wpm)}`}>{r.wpm} WPM</span></td>
                  <td className={r.accuracy >= 95 ? 'text-success' : r.accuracy < 80 ? 'text-warning' : ''}>{r.accuracy}%</td>
                  <td>{r.time}s</td>
                  <td><span className={`mode-tag ${r.difficulty === 'hard' ? 'mode-hard' : ''}`}>{r.difficulty}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
