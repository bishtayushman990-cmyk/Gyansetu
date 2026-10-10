import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import MistakeCard from '../components/MistakeCard';
import {
  BrainCircuit,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Filter,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Search
} from 'lucide-react';

export default function MistakeMemoryPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [mistakes, setMistakes] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [stats, setStats] = useState({ total: 0, needsReview: 0, improving: 0, corrected: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadMistakes() {
      setLoading(true);
      try {
        const res = await fetch('/api/mistakes', {
          headers: { 'x-user-id': user?.id || 'demo-user' }
        });
        const data = await res.json();
        setMistakes(data.mistakes || []);
        setPatterns(data.patterns || []);
        setStats(data.stats || { total: 0, needsReview: 0, improving: 0, corrected: 0 });
      } catch (err) {
        console.error("Error loading mistakes:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMistakes();
  }, [user]);

  // Dynamic filter options
  const subjects = ['All', ...new Set(mistakes.map(m => m.subject || m.categoryTopic).filter(Boolean))];
  const topics = ['All', ...new Set(mistakes.map(m => m.topic || m.subtopic).filter(Boolean))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const categories = ['All', ...new Set(mistakes.map(m => m.mistakeCategory || m.category).filter(Boolean))];
  const statuses = ['All', 'Needs Practice', 'Improving', 'Mastered'];

  // Filtered mistakes
  const filteredMistakes = mistakes.filter(m => {
    if (filterStatus !== 'All') {
      if (filterStatus === 'Needs Practice' && m.status !== 'Needs Practice' && m.status !== 'Needs Review' && m.status !== 'Needs More Practice') return false;
      if (filterStatus === 'Improving' && m.status !== 'Improving') return false;
      if (filterStatus === 'Mastered' && m.status !== 'Mastered' && m.status !== 'Corrected on Retry') return false;
    }
    if (filterSubject !== 'All' && (m.subject || m.categoryTopic) !== filterSubject) return false;
    if (filterTopic !== 'All' && (m.topic || m.subtopic) !== filterTopic) return false;
    if (filterDifficulty !== 'All' && m.difficulty !== filterDifficulty) return false;
    if (filterCategory !== 'All' && (m.mistakeCategory || m.category) !== filterCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        m.questionTitle?.toLowerCase().includes(s) ||
        m.explanation?.toLowerCase().includes(s) ||
        (m.mistakeCategory || m.category)?.toLowerCase().includes(s) ||
        m.evidence?.toLowerCase().includes(s) ||
        m.studentAnswer?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero / System Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 26, 61, 0.95) 0%, rgba(10, 19, 44, 0.95) 100%)',
        border: '1.5px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--status-error)',
            fontSize: '0.82rem',
            fontWeight: 800,
            marginBottom: '8px'
          }}>
            <BrainCircuit size={16} /> GYAANSETU SIGNATURE DIFFERENTIATOR
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            Mistake Memory & Detective
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '700px' }}>
            We don't merely count wrong answers. GyaanSetu analyzes the exact code line, failed test case inputs, detects recurring conceptual habits, and tracks verifiable improvement on subsequent attempts.
          </p>
        </div>

        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Learning Loop Status</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '2px' }}>
            {stats.corrected} / {stats.total} Mastered on Retry
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4">
        <div className="card">
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Memorized Errors</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Persistent lifetime attempt history
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--status-error)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Awaiting Revision</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-error)', marginTop: '4px' }}>
            {stats.needsReview}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Queued in today's study planner
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--brand-gold)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Improving in Progress</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand-gold)', marginTop: '4px' }}>
            {stats.improving}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Partial test pass on retry
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--status-success)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Corrected on Retry</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '4px' }}>
            {stats.corrected}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Verified concept mastery
          </div>
        </div>
      </div>

      {/* Recurring Error Patterns Alert Banner (Section 9.5) */}
      {patterns.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1.5px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={22} color="var(--status-error)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--status-error)' }}>
              Detected Recurring Error Habits ({patterns.length})
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {patterns.map((p, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  {p.warning}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <strong>Supporting Problems:</strong> {p.supportingQuestionTitles?.join(', ')}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--brand-cyan)', marginTop: '4px' }}>
                  🎯 <strong>Recommended Action:</strong> {p.actionPlan}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 20px',
        display: 'flex',
        gap: '14px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{
          flex: '1 1 280px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 12px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search mistakes by problem, explanation, or evidence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.88rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem'
            }}
          >
            {subjects.map(s => <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>)}
          </select>

          {/* Topic Filter */}
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem'
            }}
          >
            {topics.map(t => <option key={t} value={t}>{t === 'All' ? 'All Topics' : t}</option>)}
          </select>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem'
            }}
          >
            {difficulties.map(d => <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>)}
          </select>

          {/* Mistake Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem'
            }}
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem'
            }}
          >
            {statuses.map(st => <option key={st} value={st}>{st === 'All' ? 'All Statuses' : st}</option>)}
          </select>
        </div>
      </div>

      {/* Mistake Cards List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading Mistake Memory history...
        </div>
      ) : filteredMistakes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <BrainCircuit size={40} color="var(--brand-cyan)" style={{ margin: '0 auto 16px' }} />
          <h3>No mistakes match your filter</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
            Whenever you submit an incorrect answer in the Practice Lab, Mistake Detective automatically categorizes and stores it here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMistakes.map(m => (
            <MistakeCard key={m.id} mistake={m} />
          ))}
        </div>
      )}
    </div>
  );
}
