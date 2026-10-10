import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from './BrandLogo';
import {
  Search,
  Flame,
  Zap,
  Bell,
  Sun,
  Moon,
  Menu,
  User,
  LogOut,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export default function Topbar({ setMobileOpen, pageTitle }) {
  const { user, logout, loadDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/practice?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="topbar">
      {/* Left side */}
      <div className="topbar-left">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="icon-btn mobile-menu-btn"
          title="Open navigation menu"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>

        {/* Mobile brand badge for quick navigation and brand presence */}
        <div className="mobile-brand-wrapper">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <BrandLogo size="small" showTagline={false} />
          </Link>
        </div>

        {pageTitle && (
          <h2 className="topbar-page-title" title={pageTitle}>
            {pageTitle}
          </h2>
        )}
      </div>

      {/* Right side */}
      <div className="topbar-right">
        {/* Desktop Global Search */}
        <form onSubmit={handleSearchSubmit} className="global-search desktop-search">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search problems, topics, algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Mobile Search Icon Toggle */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="icon-btn mobile-search-trigger"
          title="Search problems"
          aria-label="Toggle search"
        >
          {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
        </button>

        {/* Streak Pill */}
        <div className="streak-pill" title={`${user?.streak || 7} Day Continuous Streak! Keep practising daily to protect it.`}>
          <Flame size={15} color="#f59e0b" fill="#f59e0b" style={{ flexShrink: 0 }} />
          <span className="streak-full">{user?.streak || 7} Days</span>
          <span className="streak-short">{user?.streak || 7}d</span>
        </div>

        {/* XP Badge */}
        <div className="xp-pill" title={`Level ${user?.level || 4} Scholar (${user?.xp || 1450} XP)`}>
          <Zap size={15} color="var(--brand-violet)" fill="var(--brand-violet)" style={{ flexShrink: 0 }} />
          <span className="xp-full">{user?.xp || 1450} XP</span>
          <span className="xp-short">{user?.xp || 1450}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="icon-btn theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} color="#2563eb" />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowProfileDropdown(false);
            }}
            className="icon-btn"
            style={{ position: 'relative' }}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '7px',
                height: '7px',
                backgroundColor: 'var(--brand-gold)',
                borderRadius: '50%',
                boxShadow: '0 0 6px var(--brand-gold)'
              }}
            />
          </button>

          {showNotifDropdown && (
            <div
              className="topbar-dropdown notif-dropdown"
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: '16px',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Notifications</span>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifDropdown(false)}
                  style={{ fontSize: '0.78rem', color: 'var(--brand-blue)', fontWeight: 600 }}
                >
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderLeft: '3px solid var(--brand-gold)',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} /> Revision Ready
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    1 pending revision in Mistake Memory (Binary Search boundary error).
                  </div>
                </div>

                <div style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderLeft: '3px solid var(--status-success)',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} /> Daily Target
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    1 / 3 questions solved today. Keep your streak alive!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 8px 4px 4px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.88rem'
            }}>
              {user?.displayName ? user.displayName.charAt(0) : 'G'}
            </div>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.displayName || "Student"}
            </span>
          </button>

          {showProfileDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '240px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: '14px',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{user?.displayName}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                <div style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--brand-cyan)',
                  marginTop: '4px'
                }}>
                  {user?.target || "Campus Placements 2026"}
                </div>
              </div>

              <Link
                to="/onboarding"
                onClick={() => setShowProfileDropdown(false)}
                className="nav-item"
                style={{ fontSize: '0.85rem' }}
              >
                <Sparkles size={16} /> Update Study Goals
              </Link>

              <Link
                to="/settings"
                onClick={() => setShowProfileDropdown(false)}
                className="nav-item"
                style={{ fontSize: '0.85rem' }}
              >
                <User size={16} /> Profile & Settings
              </Link>

              <button
                onClick={() => {
                  loadDemoUser();
                  setShowProfileDropdown(false);
                }}
                className="nav-item"
                style={{ fontSize: '0.85rem', color: 'var(--brand-gold)' }}
              >
                <BookOpen size={16} /> Switch to Demo Mode
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowProfileDropdown(false);
                  navigate('/login');
                }}
                className="nav-item"
                style={{ fontSize: '0.85rem', color: 'var(--status-error)' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="mobile-search-bar">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px' }}>
            <Search size={16} color="var(--brand-cyan)" />
            <input
              type="text"
              placeholder="Search problems, topics, algorithms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
              Search
            </button>
            <button type="button" onClick={() => setMobileSearchOpen(false)} className="icon-btn" style={{ width: '28px', height: '28px' }}>
              <X size={16} />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
