import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import LearnPage from './pages/LearnPage';
import PracticeLabPage from './pages/PracticeLabPage';
import QuestionWorkspacePage from './pages/QuestionWorkspacePage';
import MistakeMemoryPage from './pages/MistakeMemoryPage';
import CommunicationGymPage from './pages/CommunicationGymPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import AIStudyBuddyPage from './pages/AIStudyBuddyPage';
import ArenaPage from './pages/ArenaPage';
import SkillTreePage from './pages/SkillTreePage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import ProjectInterviewPage from './pages/ProjectInterviewPage';
import WeeklyTestPage from './pages/WeeklyTestPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public & Landing Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Main Application Authenticated Layout */}
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/practice" element={<PracticeLabPage />} />
                <Route path="/practice/:questionId" element={<QuestionWorkspacePage />} />
                <Route path="/mistakes" element={<MistakeMemoryPage />} />
                <Route path="/communication-gym" element={<CommunicationGymPage />} />
                <Route path="/study-planner" element={<StudyPlannerPage />} />
                <Route path="/ai-study-buddy" element={<AIStudyBuddyPage />} />
                <Route path="/arena" element={<ArenaPage />} />
                <Route path="/skill-tree" element={<SkillTreePage />} />
                <Route path="/interview-prep" element={<InterviewPrepPage />} />
                <Route path="/project-interview" element={<ProjectInterviewPage />} />
                <Route path="/weekly-test" element={<WeeklyTestPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
