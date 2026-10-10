import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Flame,
  Zap,
  Layers,
  BrainCircuit,
  Clock,
  PieChart
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/analytics', {
          headers: { 'x-user-id': user?.id || 'demo-user' }
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [user]);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Aggregating learner progress & performance data...</div>;
  }

  const summary = data?.summary || {};
  const categoryStats = data?.categoryStats || {};
  const difficultyStats = data?.difficultyStats || {};
  const mistakeCategories = data?.mistakeCategories || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(18px, 3.5vw, 28px) clamp(16px, 4vw, 32px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--brand-cyan)',
            fontWeight: 700,
            fontSize: '0.82rem',
            marginBottom: '6px'
          }}>
            <BarChart3 size={16} /> EVIDENCE-BASED LEARNER METRICS
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 800 }}>
            Progress & Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '700px' }}>
            Data aggregated from verified question attempts, runtime test executions, mistake retry resolutions, and streak consistency.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-4">
        <div className="card">
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Solved</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-blue)', marginTop: '4px' }}>
            {summary.solvedCount} / {summary.totalQuestions}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across all categories
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Accuracy Rate</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '4px' }}>
            {summary.accuracyRate}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            From {summary.totalAttempts || 6} attempts
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Mistake Corrections</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-gold)', marginTop: '4px' }}>
            {summary.correctedMistakes}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary.unresolvedMistakes} awaiting revision
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Practice Habit Streak</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {summary.currentStreak} Days
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary.xp} Total XP earned
          </div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid-2">
        {/* Difficulty Breakdown */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
            Difficulty Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(difficultyStats).map(([diff, val]) => {
              const pct = val.total > 0 ? Math.round((val.solved / val.total) * 100) : 0;
              return (
                <div key={diff}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                    <span className={`badge badge-${diff.toLowerCase()}`}>{diff}</span>
                    <span>{val.solved} / {val.total} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: diff === 'Easy' ? '#10b981' : diff === 'Medium' ? '#f59e0b' : '#ef4444'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mistake Categories Distribution */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
            Mistake Detective Distribution
          </h3>
          {Object.keys(mistakeCategories).length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No mistakes recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(mistakeCategories).map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{cat}</span>
                  <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-error)' }}>
                    {count} Recorded
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
