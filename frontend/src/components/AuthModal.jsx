import { useState } from 'react';
import { auth } from '../services/api';
import { useApp } from '../context/AppContext';

export default function AuthModal({ onClose }) {
  const { setUser, showToast } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = isLogin
          ? await auth.login(username, password)
          : await auth.register(username, password);
          setUser(data.user);
          showToast(`Welcome, ${data.user.username}!`);
        if (onClose) onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        {onClose && (
          <button onClick={onClose} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', color: 'var(--text-color)', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.7 }}>&times;</button>
        )}
        <div className="modal-icon">🎮</div>
        <h3>Typing<span style={{ color: 'var(--accent-color)' }}>Master</span></h3>
        <p>{isLogin ? 'Sign in to continue' : 'Create an account'}</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <input
              type="text"
              className="modal-input"
              placeholder="Username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              disabled={submitting}
            />
            <input
              type="password"
              className="modal-input"
              placeholder="Password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={submitting}
            />
          {error && <div style={{ color: 'var(--wrong-color)', fontSize: '0.85rem' }}>{error}</div>}
          <button type="submit" className="modal-btn primary" style={{ width: '100%', position: 'relative' }} disabled={submitting}>
            {submitting ? (
              <span className="auth-spinner" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.7, cursor: 'pointer' }} onClick={() => { if (!submitting) setIsLogin(!isLogin); }}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </p>
      </div>
    </div>
  );
}
