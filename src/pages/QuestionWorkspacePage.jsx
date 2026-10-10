import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import HintLadderModal from '../components/HintLadderModal';
import confetti from 'canvas-confetti';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Copy,
  RotateCcw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Terminal,
  Code2,
  BrainCircuit,
  Clock,
  Layers
} from 'lucide-react';

export default function QuestionWorkspacePage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  // Execution states
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [activeTab, setActiveTab] = useState('testcases'); // 'testcases' | 'output' | 'mistake'
  const [detectedMistake, setDetectedMistake] = useState(null);
  const [isSolved, setIsSolved] = useState(false);

  // Progressive Hint Ladder state (Levels 1 to 5)
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [unlockedHintLevel, setUnlockedHintLevel] = useState(1);
  const [hintLevelsUsed, setHintLevelsUsed] = useState([1]);

  useEffect(() => {
    async function loadQuestion() {
      setLoading(true);
      try {
        const res = await fetch(`/api/questions/${questionId}`, {
          headers: { 'x-user-id': user?.id || 'demo-user' }
        });
        if (!res.ok) throw new Error("Question not found");
        const data = await res.json();
        setQuestion(data.question);

        // Set starter code
        if (data.question.starterCode) {
          const defaultLang = data.question.type === 'sql' ? 'sql' : 'javascript';
          setLanguage(defaultLang);
          setCode(data.question.starterCode[defaultLang] || Object.values(data.question.starterCode)[0] || '');
        }
      } catch (err) {
        addToast({ title: 'Error', message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    }

    loadQuestion();
  }, [questionId, user]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (question && question.starterCode && question.starterCode[newLang]) {
      setCode(question.starterCode[newLang]);
    }
  };

  const handleResetCode = () => {
    if (question && question.starterCode && question.starterCode[language]) {
      setCode(question.starterCode[language]);
      addToast({ title: 'Reset', message: 'Starter code restored', type: 'info' });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    addToast({ title: 'Copied', message: 'Code copied to clipboard', type: 'success' });
  };

  // Run Code against Sample Test Cases
  const handleRunCode = async () => {
    if (question.type === 'mcq') {
      handleSubmit();
      return;
    }

    setRunning(true);
    setActiveTab('output');
    try {
      const res = await fetch('/api/practice/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          questionId: question.id,
          language,
          code
        })
      });
      const data = await res.json();
      setRunResult(data.result);
      if (data.result.allPassed) {
        addToast({ title: 'Sample Tests Passed!', message: `${data.result.passedCount} / ${data.result.totalCount} tests succeeded`, type: 'success' });
      } else {
        addToast({ title: 'Test Failed', message: data.result.compilationError || 'One or more sample cases failed', type: 'warning' });
      }
    } catch (err) {
      addToast({ title: 'Execution Error', message: err.message, type: 'error' });
    } finally {
      setRunning(false);
    }
  };

  // Submit Code / Answer (Full Test Suite + Mistake Memory Hook)
  const handleSubmit = async () => {
    if (question.type === 'mcq' && selectedOption === null) {
      addToast({ title: 'Selection Needed', message: 'Please select an option before submitting', type: 'warning' });
      return;
    }

    setSubmitting(true);
    setActiveTab('output');
    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          questionId: question.id,
          language,
          code,
          selectedOption,
          hintLevelsUsed
        })
      });
      const data = await res.json();
      setRunResult(data.result);

      if (data.isPassed) {
        setIsSolved(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        if (data.mistake && (data.mistake.status === 'Mastered' || data.mistake.status === 'Improving' || data.mistake.status === 'Corrected on Retry')) {
          addToast({
            title: `🎉 ${data.mistake.status === 'Mastered' ? 'Mastered on Retry!' : 'Demonstrated Improvement!'}`,
            message: 'Recorded verified progress in Mistake Memory (+150 XP)',
            type: 'success'
          });
        } else {
          addToast({
            title: 'Accepted! All Test Cases Passed',
            message: 'Congratulations! Solution verified (+100 XP)',
            type: 'success'
          });
        }
      } else {
        // Mistake detected and memorized!
        setDetectedMistake(data.mistake);
        setActiveTab('mistake');
        addToast({
          title: 'Recorded in Mistake Memory',
          message: `Diagnosed: ${data.mistake?.category || 'Logic error'}. Added to revision queue.`,
          type: 'error'
        });
      }
    } catch (err) {
      addToast({ title: 'Submission Error', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading interactive coding workspace...
      </div>
    );
  }

  if (!question) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <h3>Question Not Found</h3>
        <Link to="/practice" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Practice Lab
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)' }}>
      {/* Top Workspace Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
          <button onClick={() => navigate('/practice')} className="icon-btn" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight: 800, fontSize: '1rem', wordBreak: 'break-word' }}>
            {question.title}
          </span>
          <span className={`badge badge-${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
          <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            {question.subtopic}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Hint Ladder Trigger */}
          <button
            onClick={() => setIsHintModalOpen(true)}
            className="btn btn-gold btn-sm"
          >
            <Lightbulb size={15} /> 5-Level Hint Ladder
          </button>

          {/* AI Tutor Assistant */}
          <Link
            to="/ai-study-buddy"
            className="btn btn-outline btn-sm"
            title="Open AI Study Buddy for this problem"
          >
            <Sparkles size={15} /> Ask AI Tutor
          </Link>
        </div>
      </div>

      {/* Split-Screen Workspace (Left Problem, Right Editor & Terminal) */}
      <div className="workspace-container" style={{ flex: 1, minHeight: 0 }}>
        {/* LEFT COLUMN: Problem Details */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>
              Problem Statement
            </h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.92rem' }}>
              {question.description}
            </div>
          </div>

          {/* Examples */}
          {question.examples && question.examples.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>
                Examples
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {question.examples.map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      fontSize: '0.86rem'
                    }}
                  >
                    <div><strong>Input:</strong> <code style={{ color: 'var(--brand-cyan)' }}>{ex.input}</code></div>
                    <div style={{ marginTop: '4px' }}><strong>Output:</strong> <code style={{ color: 'var(--status-success)' }}>{ex.output}</code></div>
                    {ex.explanation && (
                      <div style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
                        <strong>Explanation:</strong> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Constraints */}
          {question.constraints && question.constraints.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                Constraints
              </h3>
              <ul style={{ paddingLeft: '20px', fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {question.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* External Links */}
          {question.officialLinks && (
            <div style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              <span style={{ fontWeight: 600 }}>External Verified References:</span>
              <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                {question.officialLinks.leetcode && (
                  <a href={question.officialLinks.leetcode} target="_blank" rel="noreferrer" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    LeetCode Problem <ExternalLink size={12} />
                  </a>
                )}
                {question.officialLinks.geeksforgeeks && (
                  <a href={question.officialLinks.geeksforgeeks} target="_blank" rel="noreferrer" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    GeeksforGeeks Problem <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Code Editor or MCQ Selector + Terminal / Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
          {/* Editor Header / Language Selection */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Code2 size={16} color="var(--brand-cyan)" />
              {question.type !== 'mcq' ? (
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    fontWeight: 600
                  }}
                >
                  <option value="javascript">JavaScript (Node.js)</option>
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ (STL)</option>
                  <option value="java">Java 17</option>
                  {question.type === 'sql' && <option value="sql">SQL (PostgreSQL)</option>}
                </select>
              ) : (
                <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>Conceptual MCQ Options</span>
              )}
            </div>

            {question.type !== 'mcq' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleResetCode} className="icon-btn" style={{ width: '30px', height: '30px' }} title="Reset Starter Code">
                  <RotateCcw size={14} />
                </button>
                <button onClick={handleCopyCode} className="icon-btn" style={{ width: '30px', height: '30px' }} title="Copy Code">
                  <Copy size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Workspace Area */}
          <div style={{
            flex: '1 1 50%',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {question.type === 'mcq' ? (
              /* MCQ Choice Area */
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Choose the correct option:</h3>
                {question.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedOption(idx)}
                    style={{
                      textAlign: 'left',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${selectedOption === idx ? 'var(--brand-cyan)' : 'var(--border-subtle)'}`,
                      backgroundColor: selectedOption === idx ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem',
                      fontWeight: selectedOption === idx ? 600 : 400,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `1.5px solid ${selectedOption === idx ? 'var(--brand-cyan)' : 'var(--border-strong)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: selectedOption === idx ? 'var(--brand-cyan)' : 'transparent',
                      color: selectedOption === idx ? '#070d1e' : 'var(--text-secondary)'
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            ) : (
              /* Coding Textarea */
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
                className="code-textarea"
                placeholder="// Write your solution here..."
              />
            )}
          </div>

          {/* Output & Test Results Panel */}
          <div style={{
            flex: '1 1 40%',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Panel Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-tertiary)',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('testcases')}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: activeTab === 'testcases' ? 'var(--bg-secondary)' : 'transparent',
                    color: activeTab === 'testcases' ? 'var(--brand-blue)' : 'var(--text-muted)'
                  }}
                >
                  Sample Cases
                </button>
                <button
                  onClick={() => setActiveTab('output')}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: activeTab === 'output' ? 'var(--bg-secondary)' : 'transparent',
                    color: activeTab === 'output' ? 'var(--brand-blue)' : 'var(--text-muted)'
                  }}
                >
                  Execution Logs
                </button>
                {detectedMistake && (
                  <button
                    onClick={() => setActiveTab('mistake')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: 'var(--status-error)'
                    }}
                  >
                    🧠 Mistake Detective Alert
                  </button>
                )}
              </div>

              {/* Action Buttons: Run & Submit */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {question.type !== 'mcq' && (
                  <button
                    onClick={handleRunCode}
                    disabled={running || submitting}
                    className="btn btn-secondary btn-sm"
                  >
                    <Play size={13} /> {running ? 'Running...' : 'Run Code'}
                  </button>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={running || submitting}
                  className="btn btn-primary btn-sm"
                >
                  <CheckCircle2 size={13} /> {submitting ? 'Evaluating...' : 'Submit'}
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', fontSize: '0.86rem' }}>
              {activeTab === 'testcases' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {question.testCases?.map((tc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Case {idx + 1} {tc.isHidden && "(Hidden test case)"}
                      </div>
                      <div>Input: <code style={{ color: 'var(--brand-cyan)' }}>{JSON.stringify(tc.input)}</code></div>
                      <div>Expected: <code style={{ color: 'var(--status-success)' }}>{JSON.stringify(tc.expectedOutput)}</code></div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'output' && (
                <div>
                  {!runResult ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                      Click "Run Code" or "Submit" to see execution results and test case evaluations.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontWeight: 700,
                          color: runResult.allPassed ? 'var(--status-success)' : 'var(--status-error)'
                        }}>
                          {runResult.allPassed ? '✓ PASSED ALL TESTS' : '✗ TEST CASE FAILED'}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {runResult.passedCount} / {runResult.totalCount} tests passed • {runResult.executionTimeMs}ms • ~{runResult.memoryEstimateKb} KB
                        </span>
                      </div>

                      {runResult.compilationError && (
                        <div style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: 'var(--status-error)',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          <strong>Compilation Error:</strong> {runResult.compilationError}
                        </div>
                      )}

                      {runResult.failedTestCase && (
                        <div style={{
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px 14px'
                        }}>
                          <div style={{ color: 'var(--status-error)', fontWeight: 700, marginBottom: '6px' }}>
                            Failed on Case #{runResult.failedTestCase.index}:
                          </div>
                          <div>Input: <code>{JSON.stringify(runResult.failedTestCase.input)}</code></div>
                          <div>Expected: <code style={{ color: 'var(--status-success)' }}>{JSON.stringify(runResult.failedTestCase.expectedOutput)}</code></div>
                          <div>Actual: <code style={{ color: 'var(--status-error)' }}>{JSON.stringify(runResult.failedTestCase.actualOutput)}</code></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'mistake' && detectedMistake && (
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1.5px solid var(--status-error)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BrainCircuit size={18} color="var(--status-error)" />
                      <strong style={{ color: 'var(--status-error)', fontSize: '0.94rem' }}>
                        Mistake Memory Diagnosis: {detectedMistake.category}
                      </strong>
                    </div>
                    <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-error)' }}>
                      Needs Review
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {detectedMistake.explanation}
                  </p>

                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: 'var(--brand-cyan)'
                  }}>
                    <strong>Evidence:</strong> {detectedMistake.evidence}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Concept to Revise: <strong>{detectedMistake.conceptToRevise}</strong>
                    </span>

                    <Link to="/mistakes" className="btn btn-secondary btn-sm">
                      View in Mistake Memory <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5-Level Hint Ladder Modal */}
      <HintLadderModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        hintLadder={question.hintLadder || []}
        questionTitle={question.title}
        unlockedLevel={unlockedHintLevel}
        onUnlockLevel={(lvl) => {
          setUnlockedHintLevel(lvl);
          setHintLevelsUsed(prev => Array.from(new Set([...prev, lvl])));
        }}
      />
    </div>
  );
}
