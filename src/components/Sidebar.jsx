import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  BrainCircuit,
  Calendar,
  Sparkles,
  Swords,
  GitFork,
  Briefcase,
  FolderGit2,
  Timer,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Mic,
  X
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);

  const mainNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/learn', label: 'Learn Roadmaps', icon: BookOpen },
    { path: '/practice', label: 'Practice Lab', icon: Code2, badge: 'Hot' },
    { path: '/mistakes', label: 'Mistake Memory', icon: BrainCircuit, badge: 'Core' },
    { path: '/communication-gym', label: 'Communication Gym', icon: Mic, badge: 'New' },
    { path: '/study-planner', label: 'Study Planner', icon: Calendar },
    { path: '/ai-study-buddy', label: 'AI Study Buddy', icon: Sparkles },
    { path: '/arena', label: 'GyaanSetu Arena', icon: Swords },
    { path: '/skill-tree', label: 'Skill Tree', icon: GitFork },
    { path: '/interview-prep', label: 'Interview Prep', icon: Briefcase },
    { path: '/project-interview', label: 'Project Interview', icon: FolderGit2 },
    { path: '/weekly-test', label: 'Mastery Test', icon: Timer },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <Link to="/" onClick={() => setMobileOpen(false)} className="sidebar-brand-link">
            <BrandLogo size="small" className={collapsed ? "logo-only desktop-only" : ""} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Desktop collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="icon-btn desktop-collapse-btn"
              style={{ width: '30px', height: '30px' }}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Mobile close drawer button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="icon-btn mobile-close-btn"
              title="Close navigation menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {!collapsed && "Platform Navigation"}
          </div>

          {mainNav.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={19} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className="nav-badge"
                    style={{
                      background: item.badge === 'Core'
                        ? 'linear-gradient(135deg, #ef4444, #f59e0b)'
                        : 'var(--brand-violet)'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div style={{ margin: '16px 0', borderTop: '1px solid var(--border-subtle)' }} />

          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings size={19} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </nav>

        {/* Footer info */}
        <div className="sidebar-footer">
          {!collapsed && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(6, 182, 212, 0.1))',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              fontSize: '0.8rem'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#06b6d4" />
                Continuous Learning Loop
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                Practise → Detect Mistake → Revise → Retry & Master
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
