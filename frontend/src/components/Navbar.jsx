import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { auth } from '../services/api';

const NAV_ITEMS = [
  { to: '/', label: 'Test', guestAllowed: true },
  { to: '/achievements', label: 'Achievements', guestAllowed: false },
  { to: '/leaderboard', label: 'Leaderboard', guestAllowed: true },
  { to: '/shop', label: 'Shop', guestAllowed: false },
  { to: '/clans', label: 'Clans', guestAllowed: false },
  { to: '/history', label: 'History', guestAllowed: false },
];

export default function Navbar() {
  const { user, toggleTheme, theme, showToast, setUser, setShowAuthModal } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const navigate = useNavigate();

  const level = user ? user.level : 1;
  const xpPct = user ? (user.xp_in_current_level / 1000) * 100 : 0;
  const bits = user ? user.bits : 0;

  const navItems = user ? NAV_ITEMS : NAV_ITEMS.filter(i => i.guestAllowed);

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch {
      // ignore errors
    }
    setUser(null);
    navigate('/');
    showToast('Logged out');
    setMenuOpen(false);
  };

  const handleMobileNav = () => {
    setMenuOpen(false);
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target) &&
            hamburgerRef.current && !hamburgerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

    return (
      <>
        <nav className="navbar">
          <NavLink to="/" style={{ textDecoration: 'none' }}>
            <div className="nav-logo">Typing<span>Master</span></div>
          </NavLink>

          {/* Desktop nav links */}
          <ul className="nav-links">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop level/bits/actions */}
          <div className="nav-desktop-right">
            {user ? (
              <>
                <div className="level-container" title="Your Typing Level">
                  <div className="level-badge">
                    Lv. <span>{level}</span>
                    {user?.equipped_title && (
                      <span className="title-tag">{user.equipped_title}</span>
                    )}
                  </div>
                  <div className="xp-bar-outer">
                    <div className="xp-bar-inner" style={{ width: xpPct + '%' }}></div>
                  </div>
                </div>
                <div className="bits-display" title="Your Bits (Currency)">
                  <span className="bits-icon">🪙</span>
                  <span>{bits.toLocaleString()}</span>
                </div>
                <div className="nav-actions">
                  <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'dark' ? '🌙' : '☀️'}
                  </button>
                  <button className="theme-toggle" onClick={() => navigate('/profile')} title="View Profile">
                    {user?.avatar || '👤'}
                  </button>
                  <button className="theme-toggle" onClick={handleLogout} title="Logout" style={{ fontSize: '0.85rem' }}>
                    🚪
                  </button>
                </div>
              </>
            ) : (
              <div className="nav-actions">
                <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                  {theme === 'dark' ? '🌙' : '☀️'}
                </button>
                <button className="nav-login-btn" onClick={() => setShowAuthModal(true)}>
                  Login
                </button>
              </div>
            )}
          </div>

          {/* Hamburger button (mobile only) */}
          <button
            ref={hamburgerRef}
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>

        {/* Mobile backdrop - outside navbar to avoid clipping */}
        <div className={`mobile-backdrop ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

        {/* Mobile slide-out menu - outside navbar to avoid clipping */}
        <div ref={menuRef} className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            &times;
          </button>
          {user && (
            <div className="mobile-menu-header">
              <div className="level-container" title="Your Typing Level">
                <div className="level-badge">
                  Lv. <span>{level}</span>
                  {user?.equipped_title && (
                    <span className="title-tag">{user.equipped_title}</span>
                  )}
                </div>
                <div className="xp-bar-outer">
                  <div className="xp-bar-inner" style={{ width: xpPct + '%' }}></div>
                </div>
              </div>
              <div className="bits-display" title="Your Bits (Currency)">
                <span className="bits-icon">🪙</span>
                <span>{bits.toLocaleString()}</span>
              </div>
            </div>
          )}

          <ul className="mobile-nav-links">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleMobileNav}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mobile-menu-footer">
            <button className="mobile-action-btn" onClick={toggleTheme}>
              {theme === 'dark' ? '🌙' : '☀️'} Toggle Theme
            </button>
            {user ? (
              <>
                <button className="mobile-action-btn" onClick={() => { navigate('/profile'); setMenuOpen(false); }}>
                  {user?.avatar || '👤'} Profile
                </button>
                <button className="mobile-action-btn logout" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </>
            ) : (
              <button className="mobile-action-btn" onClick={() => { setShowAuthModal(true); setMenuOpen(false); }}>
                🔑 Login
              </button>
            )}
          </div>
        </div>
      </>
    );
}
