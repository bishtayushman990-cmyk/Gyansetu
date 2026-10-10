import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MistakeCard from '../components/MistakeCard';
import StudentTestimonials from '../components/StudentTestimonials';
import {
  Flame,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Code2,
  Calendar,
  Sparkles,
  Trophy,
  Compass,
  RotateCcw,
  Clock,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [studyTasks, setStudyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [anRes, misRes, stRes] = await Promise.all([
          fetch('/api/analytics', { headers: { 'x-user-id': user?.id || 'demo-user' } }),
          fetch('/api/mistakes', { headers: { 'x-user-id': user?.id || 'demo-user' } }),
          fetch('/api/study-planner', { headers: { 'x-user-id': user?.id || 'demo-user' } })
        ]);

        if (anRes.ok) setAnalytics(await anRes.json());
        if (misRes.ok) {
          const mData = await misRes.json();
          setMistakes(mData.mistakes || []);
        }
        if (stRes.ok) {
          const sData = await stRes.json();
          setStudyTasks(sData.tasks || []);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const unresolvedMistakes = mistakes.filter(m => m.status !== 'Corrected on Retry');
  const todayTasks = studyTasks.filter(t => !t.completed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner / Welcome */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(11, 19, 43, 0.95) 0%, rgba(14, 26, 61, 0.85) 100%)',
        border: '1px solid var(--border-subtle)',
        padding: 'clamp(18px, 4vw, 28px) clamp(16px, 4vw, 32px)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--brand-cyan)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
            <Sparkles size={14} /> Placement Roadmap 2026
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 800 }}>
            Welcome back, {user?.displayName || "Scholar"}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', lineHeight: 1.5 }}>
            {user?.target || "Campus Placements SDE-1"} • Target daily pace: {user?.availableStudyTime || "2 hours / day"}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Daily Solved Goal</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {user?.dailySolvedToday || 1} / {user?.dailyGoal || 3} Questions
            </div>
          </div>
          <Link to="/practice" className="btn btn-primary">
            <Code2 size={16} /> Practise Now
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Streak</span>
            <Flame size={20} color="#f59e0b" fill="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
            {user?.streak || 7} Days
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Keep solving today to hit 8 days!
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Knowledge XP</span>
            <Zap size={20} color="var(--brand-violet)" fill="var(--brand-violet)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-violet)' }}>
            {user?.xp || 1450} XP
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Level {user?.level || 4} Master Solver
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Solved Questions</span>
            <CheckCircle2 size={20} color="var(--status-success)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-success)' }}>
            {analytics?.summary?.solvedCount || 4} / {analytics?.summary?.totalQuestions || 10}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {analytics?.summary?.accuracyRate || 80}% Accuracy Rate
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mistakes Memorized</span>
            <AlertTriangle size={20} color="var(--status-error)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-error)' }}>
            {unresolvedMistakes.length} Pending
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {analytics?.summary?.correctedMistakes || 1} Corrected on retry!
          </div>
        </div>
      </div>

      {/* Prominent Recommendation: "What Should I Learn Next?" */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
        border: '1.5px solid rgba(6, 182, 212, 0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-cyan)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px' }}>
            <Compass size={18} />
            WHAT SHOULD I LEARN NEXT? (Adaptive Recommendation)
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px' }}>
            {unresolvedMistakes.length > 0
              ? `Resolve Mistake: ${unresolvedMistakes[0].questionTitle} (${unresolvedMistakes[0].category})`
              : "Next Step: Maximum Subarray (Kadane's Algorithm)"}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {unresolvedMistakes.length > 0
              ? `You previously hit an issue with: "${unresolvedMistakes[0].explanation}". Retrying this problem with inclusive loop bounds will solidify your interval invariants before advancing to Dynamic Programming.`
              : "You've successfully solved array fundamentals and binary search. Kadane's algorithm is the essential bridge to understanding dynamic programming and subarray state transitions."}
          </p>
        </div>

        <button
          onClick={() => {
            if (unresolvedMistakes.length > 0) {
              navigate(`/practice/${unresolvedMistakes[0].questionId}`);
            } else {
              navigate('/practice/q-max-subarray');
            }
          }}
          className="btn btn-gold"
          style={{ whiteSpace: 'nowrap' }}
        >
          <RotateCcw size={16} /> Take Recommended Action
        </button>
      </div>

      {/* Two Columns: Recent Mistakes Revision Queue vs Today's Study Tasks */}
      <div className="grid-2">
        {/* Left: Mistake Memory Focus */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="var(--brand-gold)" />
              Mistake Memory — Priority Revisions
            </h3>
            <Link to="/mistakes" style={{ fontSize: '0.82rem', color: 'var(--brand-blue)', fontWeight: 600 }}>
              View All ({mistakes.length})
            </Link>
          </div>

          {unresolvedMistakes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
              <CheckCircle2 size={32} color="var(--status-success)" style={{ margin: '0 auto 12px' }} />
              <h4>All Mistakes Resolved!</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                You have no pending revisions in Mistake Memory. Great job verifying improvements!
              </p>
            </div>
          ) : (
            unresolvedMistakes.slice(0, 2).map(m => (
              <MistakeCard key={m.id} mistake={m} />
            ))
          )}
        </div>

        {/* Right: Study Tasks & Quick Practice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--brand-cyan)" />
              Today's Adaptive Study Schedule
            </h3>
            <Link to="/study-planner" style={{ fontSize: '0.82rem', color: 'var(--brand-blue)', fontWeight: 600 }}>
              Open Planner
            </Link>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todayTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <CheckCircle2 size={28} color="var(--status-success)" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.86rem' }}>All tasks for today are completed!</p>
              </div>
            ) : (
              todayTasks.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: task.priority === 'High' ? 'var(--status-error)' : 'var(--brand-cyan)'
                    }} />
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{task.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {task.durationMinutes} mins • {task.type}
                      </div>
                    </div>
                  </div>

                  {task.relatedQuestionId && (
                    <button
                      onClick={() => navigate(`/practice/${task.relatedQuestionId}`)}
                      className="btn btn-outline btn-sm"
                    >
                      Start
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="grid-2">
            <Link to="/arena" className="card card-interactive" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={20} color="var(--brand-gold)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>GyaanSetu Arena</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Daily speed challenge</div>
                </div>
              </div>
            </Link>

            <Link to="/project-interview" className="card card-interactive" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} color="var(--brand-violet)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Project Defense Lab</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Cross-examine resume projects</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Student Testimonials (Placement: directly inside the right column blank space below Arena & Project Defense Lab) */}
          <StudentTestimonials />
        </div>
      </div>
    </div>
  );
}
