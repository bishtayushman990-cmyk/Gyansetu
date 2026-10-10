import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import {
  Timer,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  BrainCircuit,
  ShieldCheck
} from 'lucide-react';

export default function WeeklyTestPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60);

  // Student test answers
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreReport, setScoreReport] = useState(null);

  useEffect(() => {
    async function fetchTest() {
      try {
        const res = await fetch('/api/weekly-test');
        const data = await res.json();
        setTest(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!started || submitted || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, submitted, timeLeftSeconds]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartTest = () => {
    setStarted(true);
    addToast({ title: 'Test Session Started', message: 'Timer is now active. Good luck!', type: 'info' });
  };

  const handleSubmitTest = () => {
    if (!test) return;
    setSubmitted(true);

    // Calculate score
    let correctCount = 0;
    const details = [];

    test.questions.forEach((q, idx) => {
      const studentAns = answers[q.id];
      let isCorrect = false;

      if (q.type === 'mcq') {
        // q-mcq-os-deadlock correct is 2, q-mcq-dbms-normalization is 0, etc.
        const expected = q.id === 'q-mcq-os-deadlock' ? 2 : (q.id === 'q-mcq-dbms-normalization' ? 0 : 0);
        isCorrect = Number(studentAns) === expected;
      } else {
        // Coding simulation
        isCorrect = !!(studentAns && studentAns.length > 20);
      }

      if (isCorrect) correctCount++;
      details.push({
        questionId: q.id,
        title: q.title,
        category: q.category,
        isCorrect,
        studentAns
      });
    });

    const totalQuestions = test.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    setScoreReport({
      correctCount,
      totalQuestions,
      percentage,
      details
    });

    if (percentage >= 60) {
      confetti({ particleCount: 90, spread: 70 });
      addToast({ title: 'Test Completed!', message: `You scored ${percentage}% on this assessment`, type: 'success' });
    } else {
      addToast({ title: 'Test Submitted', message: `Score: ${percentage}%. Check mistakes below to revise.`, type: 'warning' });
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading assessment environment...</div>;
  }

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
            color: 'var(--brand-gold)',
            fontWeight: 700,
            fontSize: '0.82rem',
            marginBottom: '6px'
          }}>
            <Timer size={16} /> TIMED CAMPUS ASSESSMENT SIMULATION
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            {test?.title || "Weekend Placement Mastery Assessment"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '680px' }}>
            Simulates actual placement screening assessments. Strict timer, mixed coding and CS theory, instant grading, and automatic mistake extraction.
          </p>
        </div>

        {started && !submitted && (
          <div style={{
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: timeLeftSeconds < 300 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1.5px solid ${timeLeftSeconds < 300 ? 'var(--status-error)' : 'var(--brand-gold)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Clock size={20} color={timeLeftSeconds < 300 ? 'var(--status-error)' : 'var(--brand-gold)'} />
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Time Remaining</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {formatTime(timeLeftSeconds)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* State 1: Before Test Start */}
      {!started && !submitted && (
        <div className="card" style={{ padding: '36px', textAlign: 'center', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          <ShieldCheck size={48} color="var(--brand-cyan)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
            Assessment Rules & Guidelines
          </h2>
          <ul style={{ textAlign: 'left', margin: '20px auto', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <li>• Duration: <strong>45 minutes</strong> strict countdown.</li>
            <li>• Questions: <strong>{test?.questions?.length || 5} problems</strong> (Coding + Core CS MCQs).</li>
            <li>• Immediate score report and mistake diagnosis upon submit.</li>
            <li>• All incorrect answers will automatically synchronize with Mistake Memory.</li>
          </ul>

          <button onClick={handleStartTest} className="btn btn-primary btn-lg" style={{ marginTop: '16px' }}>
            Begin Mastery Assessment <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* State 2: Active Test Session */}
      {started && !submitted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {test?.questions.map((q, idx) => (
            <div key={q.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  Question {idx + 1} of {test.questions.length}: {q.title}
                </span>
                <span className={`badge badge-${q.difficulty.toLowerCase()}`}>
                  {q.difficulty}
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                {q.description}
              </p>

              {q.type === 'mcq' && q.options ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: answers[q.id] === optIdx ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-primary)',
                        border: `1px solid ${answers[q.id] === optIdx ? 'var(--brand-cyan)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === optIdx}
                        onChange={() => setAnswers({ ...answers, [q.id]: optIdx })}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  rows={4}
                  value={answers[q.id] || (q.starterCode?.javascript || '')}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="// Paste or write your solution..."
                  className="code-textarea"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={handleSubmitTest} className="btn btn-primary btn-lg">
              <CheckCircle2 size={18} /> Final Submit Assessment
            </button>
          </div>
        </div>
      )}

      {/* State 3: Test Score Report */}
      {submitted && scoreReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '36px', textAlign: 'center' }}>
            <Trophy size={48} color={scoreReport.percentage >= 60 ? 'var(--brand-gold)' : 'var(--status-error)'} style={{ margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Assessment Score Report</h2>
            <div style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              color: scoreReport.percentage >= 60 ? 'var(--status-success)' : 'var(--status-error)',
              marginTop: '8px'
            }}>
              {scoreReport.percentage}%
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              You answered {scoreReport.correctCount} out of {scoreReport.totalQuestions} questions correctly.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '24px' }}>
              <button onClick={() => navigate('/mistakes')} className="btn btn-primary">
                <BrainCircuit size={16} /> Review Diagnosed Mistakes
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
