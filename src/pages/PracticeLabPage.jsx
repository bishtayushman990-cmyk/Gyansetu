import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Code2,
  ExternalLink,
  Layers,
  Database,
  Terminal,
  Cpu,
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Network,
  Boxes,
  Briefcase,
  Users,
  Timer,
  Play,
  Check,
  X,
  AlertTriangle,
  Award,
  Zap,
  BookOpen,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export default function PracticeLabPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [allRawQuestions, setAllRawQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'All');
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Recall Arena state
  const [recallStatus, setRecallStatus] = useState(null);
  const [loadingRecallStatus, setLoadingRecallStatus] = useState(true);
  const [selectedRecallMode, setSelectedRecallMode] = useState('mixed'); // 'mixed' | 'subject'
  const [selectedRecallSubject, setSelectedRecallSubject] = useState('');
  const [selectedRecallLength, setSelectedRecallLength] = useState(10);

  // Active Recall Test Session State
  const [activeRecallSession, setActiveRecallSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recallAnswers, setRecallAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [recallReport, setRecallReport] = useState(null);
  const [isSubmittingRecall, setIsSubmittingRecall] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);

  const categories = [
    'All',
    'Data Structures and Algorithms',
    'SQL & DBMS',
    'Operating Systems',
    'Placement Aptitude',
    'Logical Reasoning',
    'Computer Networks',
    'OOP and Programming',
    'Computer Architecture',
    'Cybersecurity',
    'Technical Interview Questions',
    'HR and Behavioral Interview Practice',
    'English and Verbal Ability'
  ];

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const statuses = ['All', 'Solved', 'Incorrect', 'Attempted', 'Bookmarked', 'Not Attempted'];
  const types = ['All', 'coding', 'mcq', 'sql'];

  // 1. Fetch filtered questions
  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.set('search', search);
        if (category !== 'All') query.set('category', category);
        if (difficulty !== 'All') query.set('difficulty', difficulty);
        if (type !== 'All') query.set('type', type);
        if (status !== 'All') query.set('status', status);
        if (sortBy !== 'default') query.set('sort', sortBy);

        const res = await fetch(`/api/questions?${query.toString()}`, {
          headers: { 'x-user-id': user?.id || 'demo-user' }
        });
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [search, category, difficulty, type, status, sortBy, user]);

  // 2. Fetch raw question bank for accurate actual database question counts
  useEffect(() => {
    async function fetchAllRaw() {
      try {
        const res = await fetch('/api/questions', {
          headers: { 'x-user-id': user?.id || 'demo-user' }
        });
        const data = await res.json();
        setAllRawQuestions(data.questions || []);
      } catch (e) {
        console.error(e);
      }
    }
    fetchAllRaw();
  }, [user]);

  // 3. Fetch Recall Arena status
  const fetchRecallStatus = async () => {
    setLoadingRecallStatus(true);
    try {
      const res = await fetch('/api/recall-arena/status', {
        headers: { 'x-user-id': user?.id || 'demo-user' }
      });
      const data = await res.json();
      setRecallStatus(data);

      if (data.subjectsAvailable && data.subjectsAvailable.length > 0) {
        setSelectedRecallSubject(data.subjectsAvailable[0]);
      }
      if (data.availableLengths && data.availableLengths.length > 0) {
        setSelectedRecallLength(data.availableLengths[0]);
      }

      // Check if active ongoing session exists
      if (data.activeSession && data.activeSession.id) {
        fetchActiveSession(data.activeSession.id);
      }
    } catch (err) {
      console.error("Failed to fetch Recall Arena status:", err);
    } finally {
      setLoadingRecallStatus(false);
    }
  };

  useEffect(() => {
    fetchRecallStatus();
  }, [user]);

  // Fetch full details of an active session
  const fetchActiveSession = async (sessionId) => {
    try {
      const res = await fetch(`/api/recall-arena/session/${sessionId}`, {
        headers: { 'x-user-id': user?.id || 'demo-user' }
      });
      const data = await res.json();
      if (data.session) {
        if (data.session.status === 'submitted' && data.session.scoreReport) {
          setRecallReport(data.session.scoreReport);
          setActiveRecallSession(null);
        } else {
          setActiveRecallSession(data.session);
          setRecallAnswers(data.session.answers || {});
          setRemainingSeconds(data.remainingSeconds || data.session.durationMinutes * 60);
        }
      }
    } catch (e) {
      console.error("Failed to fetch session:", e);
    }
  };

  // Timer countdown hook for active Recall Arena test
  useEffect(() => {
    if (!activeRecallSession || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitOnExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRecallSession, remainingSeconds]);

  // Auto-submit when time expires
  const handleAutoSubmitOnExpiry = async () => {
    addToast({
      title: "Time Expired",
      message: "Test duration elapsed! Automatically submitting your answers...",
      type: "warning"
    });
    await handleSubmitRecallTest(true);
  };

  // Start new Recall Arena test
  const handleStartRecallTest = async () => {
    try {
      const res = await fetch('/api/recall-arena/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          mode: selectedRecallMode,
          subject: selectedRecallMode === 'subject' ? selectedRecallSubject : null,
          length: selectedRecallLength
        })
      });
      const data = await res.json();
      if (data.error) {
        addToast({ title: "Cannot Start Recall Arena", message: data.error, type: "error" });
        return;
      }

      setActiveRecallSession(data.session);
      setRecallAnswers(data.session.answers || {});
      setRemainingSeconds(data.remainingSeconds || data.session.durationMinutes * 60);
      setCurrentQuestionIndex(0);
      setRecallReport(null);
      setShowConfirmSubmit(false);

      addToast({
        title: "Recall Arena Started",
        message: `Timed Mock Test loaded (${data.session.questions.length} Questions). Hints disabled. Good luck!`,
        type: "info"
      });
    } catch (err) {
      console.error(err);
      addToast({ title: "Error", message: "Failed to initialize test session.", type: "error" });
    }
  };

  // Save student answer during active test
  const handleSaveAnswer = async (qId, answerValue) => {
    const updated = { ...recallAnswers, [qId]: answerValue };
    setRecallAnswers(updated);
    setSavedIndicator(true);

    try {
      await fetch('/api/recall-arena/save-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          sessionId: activeRecallSession.id,
          questionId: qId,
          answer: answerValue
        })
      });
      setTimeout(() => setSavedIndicator(false), 1200);
    } catch (e) {
      console.error("Failed to save answer:", e);
    }
  };

  // Submit test
  const handleSubmitRecallTest = async (isAuto = false) => {
    if (!activeRecallSession) return;
    setIsSubmittingRecall(true);

    try {
      const res = await fetch('/api/recall-arena/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          sessionId: activeRecallSession.id,
          answers: recallAnswers
        })
      });
      const data = await res.json();

      if (data.report) {
        setRecallReport(data.report);
        setActiveRecallSession(null);
        setShowConfirmSubmit(false);

        if (data.report.accuracy >= 70) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        addToast({
          title: "Recall Arena Completed!",
          message: `Accuracy: ${data.report.accuracy}% • Earned +${data.report.earnedXP} XP!`,
          type: "success"
        });

        // Refresh recall status and question bank attempt states
        fetchRecallStatus();
      }
    } catch (err) {
      console.error(err);
      addToast({ title: "Submission Failed", message: "Could not submit answers. Please retry.", type: "error" });
    } finally {
      setIsSubmittingRecall(false);
    }
  };

  // Practice Weak Area Action
  const handlePracticeWeakArea = (weakSubject) => {
    setCategory(weakSubject);
    setRecallReport(null);
    addToast({
      title: "Practicing Weak Area",
      message: `Filtered Practice Lab to ${weakSubject} questions for targeted revision.`,
      type: "info"
    });
  };

  // Toggle bookmark
  const handleToggleBookmark = async (qId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({ questionId: qId })
      });
      const data = await res.json();
      setQuestions(prev => prev.map(q => q.id === qId ? { ...q, isBookmarked: data.bookmarked } : q));
      addToast({
        title: data.bookmarked ? 'Bookmarked' : 'Removed Bookmark',
        message: data.bookmarked ? 'Added to your revision bookmarks' : 'Removed from bookmarks',
        type: 'info'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setDifficulty('All');
    setType('All');
    setStatus('All');
    setSortBy('default');
  };

  // Helper to count questions per category from actual database records
  const getCategoryCount = (catName) => {
    if (!allRawQuestions.length) return 0;
    const lower = catName.toLowerCase();
    return allRawQuestions.filter(q => {
      const qCat = (q.category || '').toLowerCase();
      if (lower.includes('dsa') || lower.includes('data structures')) return qCat.includes('data structures');
      if (lower.includes('sql') || lower.includes('dbms')) return qCat.includes('sql') || qCat.includes('dbms');
      if (lower.includes('operating')) return qCat.includes('operating');
      if (lower.includes('aptitude') || lower.includes('quant')) return qCat.includes('aptitude') || qCat.includes('reasoning');
      if (lower.includes('network')) return qCat.includes('network');
      if (lower.includes('oop')) return qCat.includes('oop');
      if (lower.includes('architecture')) return qCat.includes('architecture');
      if (lower.includes('security')) return qCat.includes('security');
      if (lower.includes('technical interview')) return qCat.includes('technical');
      if (lower.includes('hr')) return qCat.includes('hr');
      return qCat === lower;
    }).length;
  };

  // Format MM:SS for countdown timer
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
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
            <Code2 size={16} /> PRACTICE LAB WORKSPACE • PLACEMENT QUESTION BANK
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            Practice. Understand. Improve.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '650px' }}>
            Sharpen algorithmic problem-solving, query logic, and CS fundamentals. Every failed attempt is automatically recorded and routed into Mistake Memory for timed recall.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => navigate('/weekly-test')}
            className="btn btn-gold btn-sm"
            title="Comprehensive proctored assessment simulating weekly campus coding and aptitude rounds"
          >
            <Clock size={15} /> Take Weekend Mastery Test
          </button>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Curriculum Proctored Exam • Weekly 45-min Test
          </span>
        </div>
      </div>

      {/* Primary Category Shortcuts Row (Preserved Visual Structure) */}
      <div className="grid-4">
        <div
          onClick={() => setCategory('Data Structures and Algorithms')}
          className={`card card-interactive ${category === 'Data Structures and Algorithms' ? 'active-filter' : ''}`}
          style={{
            cursor: 'pointer',
            border: category === 'Data Structures and Algorithms' ? '1.5px solid var(--brand-blue)' : undefined
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={22} color="var(--brand-blue)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>DSA Mastery</span>
                <span className="badge badge-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--brand-blue)' }}>
                  {getCategoryCount('dsa')}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Arrays, Linked Lists, DP, Trees</div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setCategory('SQL & DBMS')}
          className="card card-interactive"
          style={{
            cursor: 'pointer',
            border: (category === 'SQL & DBMS' || category === 'SQL' || category === 'DBMS') ? '1.5px solid var(--brand-cyan)' : undefined
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} color="var(--brand-cyan)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>SQL & Queries</span>
                <span className="badge badge-sm" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--brand-cyan)' }}>
                  {getCategoryCount('sql')}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Aggregates, Subqueries, Joins</div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setCategory('Operating Systems')}
          className="card card-interactive"
          style={{
            cursor: 'pointer',
            border: category === 'Operating Systems' ? '1.5px solid var(--brand-violet)' : undefined
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={22} color="var(--brand-violet)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Operating Systems</span>
                <span className="badge badge-sm" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--brand-violet)' }}>
                  {getCategoryCount('operating')}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Deadlocks, Threads, Memory</div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setCategory('Placement Aptitude')}
          className="card card-interactive"
          style={{
            cursor: 'pointer',
            border: category === 'Placement Aptitude' ? '1.5px solid var(--brand-gold)' : undefined
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} color="var(--brand-gold)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Placement Aptitude</span>
                <span className="badge badge-sm" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--brand-gold)' }}>
                  {getCategoryCount('aptitude')}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Quant, Speed Maths, Logic</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Placement Category Quick Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          CORE TOPICS:
        </span>
        {[
          { label: 'Computer Networks', count: getCategoryCount('network'), icon: <Network size={13} /> },
          { label: 'OOP and Programming', count: getCategoryCount('oop'), icon: <Boxes size={13} /> },
          { label: 'Computer Architecture', count: getCategoryCount('architecture'), icon: <Cpu size={13} /> },
          { label: 'Cybersecurity', count: getCategoryCount('security'), icon: <ShieldAlert size={13} /> },
          { label: 'Technical Interview Questions', count: getCategoryCount('technical interview'), icon: <Terminal size={13} /> },
          { label: 'HR and Behavioral Interview Practice', count: getCategoryCount('hr'), icon: <Users size={13} /> }
        ].map(cat => {
          const isSelected = category.toLowerCase() === cat.label.toLowerCase();
          return (
            <button
              key={cat.label}
              onClick={() => setCategory(cat.label)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: isSelected ? '1px solid var(--brand-cyan)' : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-secondary)',
                color: isSelected ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.icon}
              {cat.label}
              <span style={{
                fontSize: '0.7rem',
                opacity: 0.8,
                backgroundColor: 'rgba(255,255,255,0.06)',
                padding: '1px 5px',
                borderRadius: '8px'
              }}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          PROMINENT RECALL ARENA SECTION
          Subtitle: “Your past questions. One fresh challenge.”
         ======================================================== */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1.5px solid rgba(139, 92, 246, 0.4)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Accent */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                color: '#c084fc',
                fontWeight: 800,
                fontSize: '0.74rem',
                letterSpacing: '0.08em',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <Zap size={13} /> RECALL ARENA
              </span>

              {recallStatus?.detectedMode && (
                <span className="badge" style={{
                  backgroundColor: recallStatus.detectedMode === 'dsa_only' ? 'rgba(59, 130, 246, 0.2)'
                    : recallStatus.detectedMode === 'aptitude_only' ? 'rgba(245, 158, 11, 0.2)'
                    : recallStatus.detectedMode === 'multi_subject' ? 'rgba(6, 182, 212, 0.2)'
                    : 'rgba(255, 255, 255, 0.08)',
                  color: recallStatus.detectedMode === 'dsa_only' ? '#60a5fa'
                    : recallStatus.detectedMode === 'aptitude_only' ? '#fbbf24'
                    : recallStatus.detectedMode === 'multi_subject' ? '#22d3ee'
                    : 'var(--text-muted)'
                }}>
                  {recallStatus.detectedMode === 'dsa_only' ? '🎯 DSA Revision Pool'
                    : recallStatus.detectedMode === 'aptitude_only' ? '🎯 Aptitude Revision Pool'
                    : recallStatus.detectedMode === 'multi_subject' ? '⚡ Mixed Arena (Multi-Subject)'
                    : '🔒 History Empty'}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Your past questions. One fresh challenge.
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '6px', maxWidth: '720px', lineHeight: 1.5 }}>
              Retest questions you previously attempted in GyaanSetu in a timed mock-test format without hints. Prioritizes past mistakes and hint-assisted questions to solidify true placement-level mastery.
            </p>
          </div>

          {/* Active session banner button if currently running */}
          {recallStatus?.activeSession && (
            <div style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 700 }}>
                  ACTIVE TEST IN PROGRESS
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
                  {formatTimer(recallStatus.activeSession.remainingSeconds)} Remaining
                </div>
              </div>
              <button
                onClick={() => fetchActiveSession(recallStatus.activeSession.id)}
                className="btn btn-gold btn-sm"
              >
                Resume Challenge <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Status / Breakdown Row */}
        <div style={{
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Eligible question distribution */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
              Eligible Past Questions: <strong style={{ color: '#38bdf8' }}>{recallStatus?.eligibleCount || 0}</strong>
            </span>

            {recallStatus?.subjectDistribution && Object.keys(recallStatus.subjectDistribution).length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {Object.entries(recallStatus.subjectDistribution).map(([sub, count]) => (
                  <span
                    key={sub}
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      color: '#94a3b8',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {sub}: <strong style={{ color: '#f1f5f9' }}>{count}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Configuration & Controls */}
          {recallStatus?.canStart ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Mode Toggle */}
              {recallStatus.detectedMode === 'multi_subject' && (
                <div style={{
                  display: 'flex',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '3px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <button
                    onClick={() => setSelectedRecallMode('mixed')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: selectedRecallMode === 'mixed' ? 'var(--brand-cyan)' : 'transparent',
                      color: selectedRecallMode === 'mixed' ? '#0f172a' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    Mixed Arena
                  </button>
                  <button
                    onClick={() => setSelectedRecallMode('subject')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: selectedRecallMode === 'subject' ? 'var(--brand-cyan)' : 'transparent',
                      color: selectedRecallMode === 'subject' ? '#0f172a' : '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    Subject Arena
                  </button>
                </div>
              )}

              {/* Subject Selector (Only available if student has eligible attempts in that subject) */}
              {selectedRecallMode === 'subject' && recallStatus.subjectsAvailable?.length > 0 && (
                <select
                  value={selectedRecallSubject}
                  onChange={(e) => setSelectedRecallSubject(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    color: '#f8fafc',
                    fontSize: '0.8rem'
                  }}
                >
                  {recallStatus.subjectsAvailable.map(sub => (
                    <option key={sub} value={sub}>{sub} ({recallStatus.subjectDistribution[sub]} eligible)</option>
                  ))}
                </select>
              )}

              {/* Length Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Length:</span>
                {[10, 20, 30].map(len => {
                  const isAvailable = (recallStatus.eligibleCount || 0) >= len;
                  return (
                    <button
                      key={len}
                      disabled={!isAvailable}
                      onClick={() => setSelectedRecallLength(len)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        border: selectedRecallLength === len ? '1px solid var(--brand-violet)' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: selectedRecallLength === len ? 'rgba(139, 92, 246, 0.25)' : 'rgba(0,0,0,0.2)',
                        color: selectedRecallLength === len ? '#c084fc' : isAvailable ? '#94a3b8' : 'rgba(255,255,255,0.2)',
                        cursor: isAvailable ? 'pointer' : 'not-allowed'
                      }}
                      title={!isAvailable ? `Requires at least ${len} eligible past questions` : `${len} Question Test`}
                    >
                      {len}Q
                    </button>
                  );
                })}

                {/* Fallback length if less than 10 */}
                {(recallStatus.eligibleCount || 0) < 10 && (
                  <button
                    onClick={() => setSelectedRecallLength(recallStatus.eligibleCount)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      border: '1px solid var(--brand-violet)',
                      backgroundColor: 'rgba(139, 92, 246, 0.25)',
                      color: '#c084fc'
                    }}
                  >
                    All {recallStatus.eligibleCount}Q
                  </button>
                )}
              </div>

              {/* Launch Button */}
              <button
                onClick={handleStartRecallTest}
                className="btn btn-primary btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  fontWeight: 700
                }}
              >
                <Play size={13} /> Start Timed Test
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem' }}>
              <AlertTriangle size={15} color="#eab308" />
              <span>Complete questions below in Practice Lab to unlock your personalized Recall revision pool.</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            flex: '1 1 300px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 14px'
          }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by title, topic, or keyword (e.g. 'Binary Search', 'Deadlock', 'SQL')..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem'
            }}
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Subjects' : c}</option>)}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem'
            }}
          >
            {difficulties.map(d => <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>)}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem'
            }}
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>

          <button onClick={handleResetFilters} className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Questions List Table */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-tertiary)',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'var(--text-muted)'
        }}>
          <span>Showing {questions.length} Genuine Questions from Database</span>
          <span>Status / Action</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading curated practice repository...
          </div>
        ) : questions.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Search size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h3>No questions found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Try adjusting your search terms or filters.
            </p>
            <button onClick={handleResetFilters} className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {questions.map((q, idx) => {
              const isSolved = q.studentStatus === 'Solved';
              const isIncorrect = q.studentStatus === 'Incorrect';

              return (
                <div
                  key={q.id}
                  onClick={() => navigate(`/practice/${q.id}`)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: idx !== questions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                    {/* Status Icon */}
                    <div style={{ flexShrink: 0 }}>
                      {isSolved ? (
                        <CheckCircle2 size={20} color="var(--status-success)" />
                      ) : isIncorrect ? (
                        <AlertCircle size={20} color="var(--status-error)" />
                      ) : (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--border-strong)' }} />
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                          {q.title}
                        </span>
                        <span className={`badge badge-${q.difficulty.toLowerCase()}`}>
                          {q.difficulty}
                        </span>
                        <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                          {q.subtopic || q.category}
                        </span>
                        <span className="badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--brand-cyan)' }}>
                          {q.type.toUpperCase()}
                        </span>
                      </div>

                      {/* Official Links */}
                      {q.officialLinks && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.74rem' }}>
                          {q.officialLinks.leetcode && (
                            <a
                              href={q.officialLinks.leetcode}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px' }}
                            >
                              LeetCode <ExternalLink size={11} />
                            </a>
                          )}
                          {q.officialLinks.geeksforgeeks && (
                            <a
                              href={q.officialLinks.geeksforgeeks}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}
                            >
                              GeeksforGeeks <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <button
                      onClick={(e) => handleToggleBookmark(q.id, e)}
                      className="icon-btn"
                      style={{ width: '34px', height: '34px' }}
                      title={q.isBookmarked ? "Remove Bookmark" : "Bookmark for Revision"}
                    >
                      {q.isBookmarked ? (
                        <BookmarkCheck size={16} color="var(--brand-cyan)" fill="var(--brand-cyan)" />
                      ) : (
                        <Bookmark size={16} />
                      )}
                    </button>

                    <button
                      onClick={() => navigate(`/practice/${q.id}`)}
                      className={`btn btn-sm ${isSolved ? 'btn-secondary' : isIncorrect ? 'btn-gold' : 'btn-primary'}`}
                    >
                      {isSolved ? 'Review Solution' : isIncorrect ? 'Retry Mistake' : 'Solve'}
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          ACTIVE RECALL ARENA TIMED TEST RUNNER MODAL
         ======================================================== */}
      {activeRecallSession && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px'
        }}>
          {/* Top Test Navigation Bar */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.25)', color: '#c084fc', fontWeight: 800 }}>
                  RECALL ARENA • {activeRecallSession.mode.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Question {currentQuestionIndex + 1} of {activeRecallSession.questions.length}
                </span>
                {savedIndicator && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--brand-cyan)' }}>
                    Saved ✓
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>
                {activeRecallSession.questions[currentQuestionIndex]?.title}
              </div>
            </div>

            {/* Timer & Submit Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: remainingSeconds < 120 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.8)',
                border: remainingSeconds < 120 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-subtle)',
                color: remainingSeconds < 120 ? '#ef4444' : 'var(--brand-cyan)',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>
                <Timer size={18} />
                {formatTimer(remainingSeconds)}
              </div>

              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="btn btn-gold btn-sm"
                style={{ fontWeight: 700 }}
              >
                Submit Test
              </button>
            </div>
          </div>

          {/* Test Workspace Body */}
          <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
            {/* Left Drawer / Question Jump Grid */}
            <div style={{
              width: '260px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto'
            }}>
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  QUESTION PALETTE
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Answered: {Object.keys(recallAnswers).length} / {activeRecallSession.questions.length}
                </div>
              </div>

              {/* Grid of question numbers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
              }}>
                {activeRecallSession.questions.map((q, idx) => {
                  const isAnswered = recallAnswers[q.id] !== undefined && recallAnswers[q.id] !== '';
                  const isCurrent = currentQuestionIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      style={{
                        padding: '10px 0',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: isCurrent ? '2px solid var(--brand-cyan)' : '1px solid var(--border-subtle)',
                        backgroundColor: isCurrent ? 'rgba(6, 182, 212, 0.2)' : isAnswered ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-tertiary)',
                        color: isCurrent ? 'var(--brand-cyan)' : isAnswered ? '#34d399' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Strict Mock Test Invariants Notice */}
              <div style={{
                marginTop: 'auto',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                fontSize: '0.74rem',
                color: '#fbbf24',
                lineHeight: 1.4
              }}>
                🔒 <strong>Timed Mock Rule:</strong> Hints, AI explanations, and solutions are locked until you submit. Test answers are continuously autosaved.
              </div>
            </div>

            {/* Right Question Area */}
            {(() => {
              const currentQ = activeRecallSession.questions[currentQuestionIndex];
              if (!currentQ) return null;

              return (
                <div style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  gap: '20px'
                }}>
                  {/* Question Header & Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className={`badge badge-${currentQ.difficulty.toLowerCase()}`}>
                        {currentQ.difficulty}
                      </span>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        {currentQ.category}
                      </span>
                      <span className="badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--brand-cyan)' }}>
                        {currentQ.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div style={{
                    fontSize: '0.98rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {currentQ.description}
                  </div>

                  {/* Answer Input Area Based on Question Type */}
                  <div style={{ marginTop: '10px' }}>
                    {currentQ.type === 'mcq' && currentQ.options && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          SELECT THE BEST ANSWER:
                        </div>
                        {currentQ.options.map((opt, optIdx) => {
                          const isSelected = Number(recallAnswers[currentQ.id]) === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSaveAnswer(currentQ.id, optIdx)}
                              style={{
                                padding: '14px 18px',
                                borderRadius: 'var(--radius-md)',
                                border: isSelected ? '2px solid var(--brand-cyan)' : '1px solid var(--border-subtle)',
                                backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                                color: isSelected ? 'var(--brand-cyan)' : 'var(--text-primary)',
                                textAlign: 'left',
                                fontSize: '0.92rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                border: isSelected ? '2px solid var(--brand-cyan)' : '1px solid var(--border-strong)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.74rem',
                                fontWeight: 800
                              }}>
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span style={{ flex: 1 }}>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(currentQ.type === 'coding' || currentQ.type === 'sql') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            {currentQ.type === 'coding' ? 'WRITE CODE SOLUTION (JAVASCRIPT):' : 'ENTER SQL QUERY:'}
                          </span>
                        </div>
                        <textarea
                          rows={12}
                          value={recallAnswers[currentQ.id] !== undefined ? recallAnswers[currentQ.id] : (currentQ.starterCode?.javascript || '')}
                          onChange={(e) => handleSaveAnswer(currentQ.id, e.target.value)}
                          placeholder={currentQ.type === 'coding' ? '// Write your solution function here...' : 'SELECT ... FROM ...'}
                          style={{
                            width: '100%',
                            fontFamily: 'monospace',
                            fontSize: '0.88rem',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px',
                            lineHeight: 1.5,
                            outline: 'none',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Navigation footer */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <button
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      className="btn btn-secondary btn-sm"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {currentQuestionIndex < activeRecallSession.questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                          className="btn btn-primary btn-sm"
                        >
                          Next Question <ChevronRight size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowConfirmSubmit(true)}
                          className="btn btn-gold btn-sm"
                        >
                          Review & Submit <Check size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================
          SUBMIT CONFIRMATION MODAL
         ======================================================== */}
      {showConfirmSubmit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            maxWidth: '460px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Submit Recall Arena Challenge?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              You have answered <strong>{Object.keys(recallAnswers).length}</strong> out of <strong>{activeRecallSession?.questions.length}</strong> questions.
              {activeRecallSession?.questions.length - Object.keys(recallAnswers).length > 0 && (
                <span style={{ color: '#f59e0b', display: 'block', marginTop: '6px' }}>
                  ⚠️ You have {activeRecallSession.questions.length - Object.keys(recallAnswers).length} unanswered questions.
                </span>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="btn btn-secondary btn-sm"
              >
                Keep Testing
              </button>
              <button
                disabled={isSubmittingRecall}
                onClick={() => handleSubmitRecallTest(false)}
                className="btn btn-gold btn-sm"
              >
                {isSubmittingRecall ? 'Grading Answers...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          RECALL ARENA RESULTS MODAL
         ======================================================== */}
      {recallReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(2, 6, 23, 0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1.5px solid var(--brand-violet)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            maxWidth: '820px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Header Score Report */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.25)', color: '#c084fc', fontWeight: 800 }}>
                  RECALL ARENA REPORT • {recallReport.subject}
                </span>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '6px' }}>
                  Recall Challenge Completed
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Your attempt has been appended to your Mistake Memory and mastery trajectory.
                </p>
              </div>

              <div style={{
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--brand-cyan)', fontWeight: 700 }}>
                  XP AWARDED
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>
                  +{recallReport.earnedXP} XP
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid-4">
              <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>FINAL ACCURACY</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: recallReport.accuracy >= 70 ? 'var(--status-success)' : 'var(--status-warning)' }}>
                  {recallReport.accuracy}%
                </div>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>CORRECT</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--status-success)' }}>
                  {recallReport.correctCount} / {recallReport.totalQuestions}
                </div>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>TIME USED</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--brand-cyan)' }}>
                  {Math.floor(recallReport.timeUsedSeconds / 60)}m {recallReport.timeUsedSeconds % 60}s
                </div>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>INDEPENDENT SOLVES</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#c084fc' }}>
                  {recallReport.solvedIndependentlyCount}
                </div>
              </div>
            </div>

            {/* Subject-Wise Performance Breakdown */}
            {recallReport.subjectPerformance && (
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '10px' }}>
                  Subject-Wise Performance
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {Object.entries(recallReport.subjectPerformance).map(([sub, stats]) => (
                    <div
                      key={sub}
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{sub}</span>
                        <span style={{ fontWeight: 800, color: stats.accuracy >= 60 ? 'var(--status-success)' : 'var(--status-error)' }}>
                          {stats.accuracy}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {stats.correct} of {stats.total} correct • {stats.unanswered || 0} unanswered
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repeated Mistakes Alert */}
            {recallReport.repeatedMistakes && recallReport.repeatedMistakes.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '0.88rem' }}>
                  <AlertTriangle size={18} />
                  Repeated Mistakes Detected ({recallReport.repeatedMistakes.length} Questions)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  You previously made errors on these questions and missed them again in this timed recall test. Focus on these invariants in Mistake Memory:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {recallReport.repeatedMistakes.map(rm => (
                    <span
                      key={rm.questionId}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}
                    >
                      {rm.title} ({rm.subtopic || rm.category})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Practice Weak Areas Action Button */}
            {recallReport.weakAreas && recallReport.weakAreas.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fbbf24' }}>
                    Identified Weak Area: {recallReport.weakAreas.join(', ')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                    Accuracy fell below 60% in these topics during this mock test.
                  </div>
                </div>
                <button
                  onClick={() => handlePracticeWeakArea(recallReport.weakAreas[0])}
                  className="btn btn-gold btn-sm"
                >
                  Practice Weak Areas <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* Detailed Question Review */}
            <div>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '12px' }}>
                Question-by-Question Review
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recallReport.detailedResults?.map((res, i) => (
                  <div
                    key={res.questionId}
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {res.result === 'correct' ? (
                          <CheckCircle2 size={16} color="var(--status-success)" />
                        ) : (
                          <AlertCircle size={16} color="var(--status-error)" />
                        )}
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                          {i + 1}. {res.title}
                        </span>
                      </div>
                      <span className={`badge badge-${res.result === 'correct' ? 'easy' : 'hard'}`}>
                        {res.result.toUpperCase()}
                      </span>
                    </div>

                    {res.explanation && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '2px' }}>
                        💡 <strong>Explanation:</strong> {res.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setRecallReport(null)}
                className="btn btn-secondary btn-sm"
              >
                Back to Practice Lab
              </button>
              <button
                onClick={() => {
                  setRecallReport(null);
                  handleStartRecallTest();
                }}
                className="btn btn-primary btn-sm"
              >
                Retake Another Recall Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
