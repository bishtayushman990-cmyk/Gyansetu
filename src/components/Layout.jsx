import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Page titles map
  const pageTitles = {
    '/dashboard': 'Student Learning Dashboard',
    '/learn': 'Structured Learning Paths & Sheets',
    '/practice': 'Practice Lab — Coding & MCQs',
    '/mistakes': 'Mistake Memory & Detective',
    '/study-planner': 'Adaptive Study Planner',
    '/ai-study-buddy': 'AI Study Buddy — Concept & Code Tutor',
    '/arena': 'GyaanSetu Arena & Challenges',
    '/skill-tree': 'Knowledge & Skill Tree',
    '/interview-prep': 'Comprehensive Interview Preparation',
    '/project-interview': 'Project Interview Defense Lab',
    '/weekly-test': 'Weekend Mastery Assessment',
    '/analytics': 'Learning Progress & Analytics',
    '/notifications': 'Notification Center',
    '/settings': 'Account & Preference Settings'
  };

  const currentTitle = pageTitles[location.pathname] || (
    location.pathname.startsWith('/practice/') ? 'Coding Workspace' : ''
  );

  return (
    <div className="app-container">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-wrapper">
        <Topbar setMobileOpen={setMobileOpen} pageTitle={currentTitle} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
