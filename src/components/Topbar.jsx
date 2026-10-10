import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  AlertTriangle
} from 'lucide-react';

export default function Topbar({ setMobileOpen, pageTitle }) {
  const { user, logout, loadDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/practice?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="topbar">
      {/* Left side */}
      <div className="topbar-left">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="icon-btn mobile-menu-btn"
          style={{ display: 'none' }}
        >
          <Menu size={20} />
        </button>

        {pageTitle && (
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            {pageTitle}
          </h2>
        )}
      </div>

      {/* Right side */}
      <div className="topbar-right">
        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="global-search">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search problems, topics, algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Streak Pill */}
        <div className="streak-pill" title={`${user?.streak || 7} Day Continuous Streak! Keep practising daily to protect it.`}>
          <Flame size={16} color="#f59e0b" fill="#f59e0b" />
          <span>{user?.streak || 7} Days</span>
        </div>

        {/* XP Badge */}
        <div className="xp-pill" title={`Level ${user?.level || 4} Scholar`}>
          <Zap size={16} color="var(--brand-violet)" fill="var(--brand-violet)" />
          <span>{user?.xp || 1450} XP</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="icon-btn"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#2563eb" />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="icon-btn"
            style={{ position: 'relative' }}
            title="Notifications"
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                backgroundColor: 'var(--brand-gold)',
                borderRadius: '50%',
                boxShadow: '0 0 6px var(--brand-gold)'
              }}
            />
          </button>

          {showNotifDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
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
    </header>
  );
}
