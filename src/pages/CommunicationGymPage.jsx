import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Mic,
  MicOff,
  Sparkles,
  LifeBuoy,
  ShieldAlert,
  Flame,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Volume2,
  Trash2,
  TrendingUp,
  MessageSquare,
  Award,
  ChevronRight,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function CommunicationGymPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'coach' | 'ladder' | 'memory' | 'history'
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  // Freeze Rescue Ladder
  const [freezeLevel, setFreezeLevel] = useState(0); // 0 = none, 1..5

  // Prep timer state
  const [prepSeconds, setPrepSeconds] = useState(0);
  const [prepActive, setPrepActive] = useState(false);

  // Response inputs
  const [textAnswer, setTextAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  // Evaluation state
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Communication Memory & Pressure Ladder
  const [memoryRecords, setMemoryRecords] = useState([]);
  const [pressureLadder, setPressureLadder] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);

  const recognitionRef = useRef(null);
  const prepTimerRef = useRef(null);

  // Load challenges and data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [chRes, memRes, ladRes] = await Promise.all([
          fetch('/api/communication/challenges', { headers: { 'x-user-id': user?.id || 'demo-user' } }),
          fetch('/api/communication/memory', { headers: { 'x-user-id': user?.id || 'demo-user' } }),
          fetch('/api/communication/pressure-ladder', { headers: { 'x-user-id': user?.id || 'demo-user' } })
        ]);

        const chData = await chRes.json();
        const memData = await memRes.json();
        const ladData = await ladRes.json();

        setChallenges(chData.challenges || []);
        if (chData.challenges && chData.challenges.length > 0) {
          setSelectedChallenge(chData.challenges[0]);
        }
        setMemoryRecords(memData.memory || []);
        setPressureLadder(ladData.ladder || []);
      } catch (err) {
        console.error("Failed to load communication gym data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Check browser speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTextAnswer(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setSpeechError("Microphone permission denied. You can continue speaking or typing your answer directly.");
        } else {
          setSpeechError(`Speech recognition notice: ${event.error}. You can type your answer.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      if (recognitionRef.current && isRecording) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [user]);

  // Handle prep timer
  const startPrepTimer = (seconds = 30) => {
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    setPrepSeconds(seconds);
    setPrepActive(true);

    prepTimerRef.current = setInterval(() => {
      setPrepSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current);
          setPrepActive(false);
          addToast({ title: "Preparation Time Up", message: "Begin your answer confidently now!", type: "info" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Toggle voice recording
  const toggleRecording = () => {
    if (!speechSupported) {
      addToast({ title: "Speech-to-Text Unavailable", message: "Web Speech API is not supported in this browser. Please type your answer.", type: "warning" });
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
      addToast({ title: "Recording Paused", message: "Transcript captured. Review and submit for clarity evaluation.", type: "info" });
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        addToast({ title: "Microphone Active", message: "Speak clearly into your microphone...", type: "success" });
      } catch (err) {
        console.warn(err);
        setSpeechError("Could not access microphone. Ensure microphone permission is granted in browser settings.");
      }
    }
  };

  // Evaluate Answer
  const handleEvaluate = async () => {
    if (!textAnswer.trim() || textAnswer.trim().length < 15) {
      addToast({ title: "Answer Required", message: "Please provide a complete spoken or typed answer to evaluate.", type: "warning" });
      return;
    }

    if (isRecording && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsRecording(false);
    }

    setEvaluating(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/communication/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          challengeId: selectedChallenge?.id || 'comm-ch-1',
          mode: isRecording ? 'voice' : 'text',
          transcript: textAnswer,
          durationSeconds: selectedChallenge?.timeLimitSeconds || 60,
          freezeLevelUsed: freezeLevel
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");

      setFeedback(data.feedback);
      if (data.attempt) {
        setHistoryRecords(prev => [data.attempt, ...prev]);
      }

      // Refresh memory records
      const memRes = await fetch('/api/communication/memory', { headers: { 'x-user-id': user?.id || 'demo-user' } });
      const memData = await memRes.json();
      setMemoryRecords(memData.memory || []);

      addToast({ title: "Clarity Evaluation Complete", message: `Scored ${data.feedback.score} / 100 • Feedback generated!`, type: "success" });
    } catch (err) {
      addToast({ title: "Evaluation Error", message: err.message, type: "error" });
    } finally {
      setEvaluating(false);
    }
  };

  // Delete Memory Record (Privacy Control)
  const handleDeleteMemory = async (id) => {
    try {
      const res = await fetch(`/api/communication/memory/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || 'demo-user' }
      });
      if (res.ok) {
        setMemoryRecords(prev => prev.filter(m => m.id !== id));
        addToast({ title: "Record Deleted", message: "Communication weakness log permanently removed.", type: "info" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 26, 61, 0.95) 0%, rgba(10, 19, 44, 0.95) 100%)',
        border: '1.5px solid rgba(6, 182, 212, 0.35)',
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
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--brand-cyan)',
            fontSize: '0.82rem',
            fontWeight: 800,
            marginBottom: '8px'
          }}>
            <Mic size={16} /> GYAANSETU COMMUNICATION GYM
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            Think Clearly. Speak Confidently.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '720px' }}>
            Knowing the answer is only half the battle. Master technical speaking, eliminate awkward freezes, banish filler words, and structure STAR interview responses under pressure.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Communication Weaknesses</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: memoryRecords.length > 0 ? 'var(--brand-gold)' : 'var(--status-success)', marginTop: '2px' }}>
              {memoryRecords.length} Active Records
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '4px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'daily', label: 'Daily Speaking Challenge', icon: Flame },
          { id: 'coach', label: 'Answer Clarity Coach & Freeze Rescue', icon: LifeBuoy },
          { id: 'ladder', label: 'Pressure Ladder (5 Levels)', icon: Layers },
          { id: 'memory', label: `Communication Memory (${memoryRecords.length})`, icon: ShieldAlert },
          { id: 'history', label: 'Mock Interview History', icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                color: isActive ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                border: isActive ? '1px solid var(--brand-cyan)' : '1px solid transparent',
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DAILY SPEAKING CHALLENGE & CLARITY COACH */}
      {(activeTab === 'daily' || activeTab === 'coach') && selectedChallenge && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '24px' }}>
          {/* Left Column: Challenge Selector & Guidelines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-violet)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Select Speaking Scenario
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {challenges.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setSelectedChallenge(ch);
                      setFreezeLevel(0);
                      setTextAnswer('');
                      setFeedback(null);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: ch.id === selectedChallenge.id ? 'var(--bg-tertiary)' : 'transparent',
                      border: `1px solid ${ch.id === selectedChallenge.id ? 'var(--brand-cyan)' : 'var(--border-subtle)'}`,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--brand-cyan)' }}>
                        {ch.category}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ⏱ {ch.timeLimitSeconds}s
                      </span>
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>{ch.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Speaking Framework Cheat Sheet */}
            <div className="card" style={{ padding: '20px', backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--brand-gold)', marginBottom: '8px' }}>
                <BookOpen size={16} /> Recommended Framework
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedChallenge.frameworkHint}
              </p>
            </div>
          </div>

          {/* Right Column: Active Prompt, Freeze Rescue & Speaking Workspace */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Active Challenge Card */}
            <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--brand-cyan)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span className="badge badge-medium" style={{ marginBottom: '6px' }}>
                    {selectedChallenge.category} • Target: {selectedChallenge.targetAudience}
                  </span>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px' }}>
                    "{selectedChallenge.question}"
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => startPrepTimer(30)}
                    disabled={prepActive}
                    className="btn btn-secondary btn-sm"
                    title="Get 30 seconds of quiet thinking time before speaking"
                  >
                    <Clock size={14} />
                    {prepActive ? `Prep: ${prepSeconds}s` : "30s Prep Timer"}
                  </button>
                </div>
              </div>

              {/* Sample opening sentence inspiration */}
              {selectedChallenge.sampleOpening && (
                <div style={{
                  marginTop: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.84rem'
                }}>
                  <strong style={{ color: 'var(--brand-cyan)' }}>Confident Opening Sentence:</strong>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    "{selectedChallenge.sampleOpening}"
                  </p>
                </div>
              )}
            </div>

            {/* INTERVIEW FREEZE RESCUE LADDER */}
            <div className="card" style={{ padding: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LifeBuoy size={18} color="var(--brand-gold)" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Interview Freeze Rescue</h3>
                </div>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Feeling stuck or anxious? Unlock hints step-by-step without shame.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {[
                  { lvl: 1, title: "1. Gentle Starting Prompt" },
                  { lvl: 2, title: "2. Sample Opening Sentence" },
                  { lvl: 3, title: "3. Answer Structure" },
                  { lvl: 4, title: "4. Relevant Clue / Example" },
                  { lvl: 5, title: "5. Complete Model Answer" }
                ].map(item => (
                  <button
                    key={item.lvl}
                    onClick={() => setFreezeLevel(item.lvl)}
                    className={`btn btn-sm ${freezeLevel >= item.lvl ? 'btn-gold' : 'btn-secondary'}`}
                    style={{ fontSize: '0.76rem', padding: '6px 10px' }}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              {freezeLevel > 0 && selectedChallenge.freezeRescue && selectedChallenge.freezeRescue[freezeLevel - 1] && (
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  border: '1px solid var(--brand-gold)',
                  fontSize: '0.88rem',
                  lineHeight: 1.6
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--brand-gold)', marginBottom: '4px' }}>
                    {selectedChallenge.freezeRescue[freezeLevel - 1].title}:
                  </div>
                  <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {selectedChallenge.freezeRescue[freezeLevel - 1].content}
                  </div>
                </div>
              )}
            </div>

            {/* Speaking / Typing Response Workspace */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 size={18} color="var(--brand-cyan)" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Your Spoken or Written Answer</h3>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {speechSupported ? (
                    <button
                      onClick={toggleRecording}
                      className={`btn btn-sm ${isRecording ? 'btn-error' : 'btn-secondary'}`}
                      style={{ animation: isRecording ? 'pulse 1.5s infinite' : 'none' }}
                    >
                      {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                      {isRecording ? "Stop Recording" : "Speak with Microphone"}
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Microphone API not supported on this browser • Typing mode active
                    </span>
                  )}

                  <button
                    onClick={() => { setTextAnswer(''); setFeedback(null); }}
                    className="btn btn-secondary btn-sm"
                  >
                    <RotateCcw size={14} /> Clear
                  </button>
                </div>
              </div>

              {speechError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--status-error)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem'
                }}>
                  {speechError}
                </div>
              )}

              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer, or click 'Speak with Microphone' to record your spoken response live..."
                rows={6}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Word count: <strong>{textAnswer.trim() ? textAnswer.trim().split(/\s+/).length : 0}</strong> words
                  {isRecording && <span style={{ color: 'var(--status-error)', marginLeft: '10px' }}>● Recording active...</span>}
                </span>

                <button
                  onClick={handleEvaluate}
                  disabled={evaluating || !textAnswer.trim()}
                  className="btn btn-primary"
                >
                  <Sparkles size={16} />
                  {evaluating ? "Evaluating Answer Clarity..." : "Evaluate Answer Clarity"}
                </button>
              </div>
            </div>

            {/* Answer Clarity Coach Feedback Card */}
            {feedback && (
              <div className="card" style={{
                padding: '28px',
                border: '1.5px solid var(--brand-cyan)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span className="badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--brand-cyan)', marginBottom: '4px' }}>
                      Diagnostic Clarity Evaluation
                    </span>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Answer Clarity Coach Feedback</h3>
                  </div>

                  <div style={{
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Clarity Score</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: feedback.score >= 75 ? 'var(--status-success)' : 'var(--brand-gold)' }}>
                      {feedback.score} / 100
                    </div>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Filler Words Detected</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: feedback.fillerWordsCount > 2 ? 'var(--status-error)' : 'var(--status-success)' }}>
                      {feedback.fillerWordsCount} {feedback.fillerWordsCount === 1 ? 'word' : 'words'}
                    </div>
                    {feedback.fillerWordsList.length > 0 && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        ({feedback.fillerWordsList.join(', ')})
                      </div>
                    )}
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Speaking Pace</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--brand-cyan)' }}>
                      ~{feedback.wordsPerMinute} WPM
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Optimal: 130–150 WPM
                    </div>
                  </div>
                </div>

                {/* What Worked & What Needs Improvement */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--status-success)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> What Worked
                    </div>
                    <ul style={{ paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {feedback.whatWorked.map((w, idx) => <li key={idx}>{w}</li>)}
                    </ul>
                  </div>

                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--status-error)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={16} /> What Needs Improvement
                    </div>
                    <ul style={{ paddingLeft: '18px', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {feedback.whatNeedsImprovement.map((i, idx) => <li key={idx}>{i}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Why It Matters & Better Structure */}
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--brand-violet)', marginBottom: '4px', fontSize: '0.86rem' }}>
                    Why This Matters to Placement Interviewers:
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {feedback.whyItMatters}
                  </p>

                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--brand-cyan)', fontSize: '0.84rem', marginBottom: '4px' }}>
                      Targeted Revision Exercise:
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                      🎯 {feedback.targetedExercise}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PRESSURE LADDER */}
      {activeTab === 'ladder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>The 5-Level Pressure Ladder</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Progressive desensitization to interview stress: start with untimed guided answers and advance to full curveball simulations.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pressureLadder.map((lvl) => (
              <div
                key={lvl.level}
                className="card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderLeft: `4px solid ${lvl.completed ? 'var(--status-success)' : 'var(--border-subtle)'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge" style={{ backgroundColor: lvl.completed ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)', color: lvl.completed ? 'var(--status-success)' : 'var(--text-muted)' }}>
                      Level {lvl.level}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{lvl.title}</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
                    {lvl.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ⏱ {lvl.timeLimit === 0 ? "Untimed" : `${lvl.timeLimit}s Countdown`}
                  </span>

                  <button
                    onClick={() => {
                      setActiveTab('coach');
                      if (lvl.timeLimit > 0) startPrepTimer(lvl.timeLimit);
                    }}
                    className={`btn btn-sm ${lvl.completed ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {lvl.completed ? "Practice Again" : "Start Level"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMMUNICATION MEMORY */}
      {activeTab === 'memory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Communication Memory</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Persistent evidence-based weakness memory. We log repeated filler words, omitted examples, or incomplete STAR structures so you can track verified improvement across attempts.
            </p>
          </div>

          {memoryRecords.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No communication weaknesses logged yet! Complete speaking challenges to monitor your delivery.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {memoryRecords.map(rec => (
                <div
                  key={rec.id}
                  className="card"
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-error)' }}>
                        {rec.weaknessType}
                      </span>
                      <span className="badge badge-medium">
                        Status: {rec.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Diagnostic Evidence:
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
                      {rec.evidence}
                    </p>

                    <div style={{ fontSize: '0.84rem', color: 'var(--brand-cyan)' }}>
                      <strong>Targeted Action:</strong> {rec.recommendedExercise}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setActiveTab('coach')}
                      className="btn btn-secondary btn-sm"
                    >
                      <RotateCcw size={14} /> Practice Now
                    </button>
                    <button
                      onClick={() => handleDeleteMemory(rec.id)}
                      className="icon-btn"
                      title="Delete record (privacy control)"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MOCK INTERVIEW HISTORY */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Mock Interview Speaking History</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Chronological log of evaluated speaking and behavioral interview attempts.
            </p>
          </div>

          {historyRecords.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No mock interview history recorded in this session yet. Complete an answer clarity evaluation above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {historyRecords.map(item => (
                <div key={item.id} className="card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{item.challengeTitle}</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Mode: {item.mode} • Filler words: {item.fillerWordsCount} • {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Score</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: item.score >= 75 ? 'var(--status-success)' : 'var(--brand-gold)' }}>
                        {item.score} / 100
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
