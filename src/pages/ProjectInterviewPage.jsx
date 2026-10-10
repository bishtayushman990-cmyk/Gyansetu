import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  FolderGit2,
  Sparkles,
  Shield,
  HelpCircle,
  Send,
  CheckCircle2,
  ArrowRight,
  Plus,
  Terminal,
  Cpu,
  Database,
  Layers,
  Upload,
  Globe,
  FileCode,
  AlertTriangle,
  Lock,
  GitBranch,
  Mic,
  MicOff,
  RotateCcw,
  Check
} from 'lucide-react';

export default function ProjectInterviewPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState('git'); // 'git' | 'zip' | 'manual'
  const [repoUrl, setRepoUrl] = useState('https://github.com/bishtayushman990-cmyk/Gyansetu');
  const [zipFileName, setZipFileName] = useState('');
  const [manualData, setManualData] = useState({
    title: '',
    description: '',
    techStack: '',
    architecture: '',
    challenges: '',
    contributions: ''
  });

  // Question Defense Workspace State
  const [userAnswers, setUserAnswers] = useState({});
  const [evaluatingQid, setEvaluatingQid] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [activeVoiceQid, setActiveVoiceQid] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects', {
          headers: { 'x-user-id': user?.id || 'demo-user' }
        });
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.projects && data.projects.length > 0) {
          setSelectedProject(data.projects[0]);
        }
      } catch (err) {
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();

    // Check SpeechRecognition for voice defense
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        if (activeVoiceQid) {
          setUserAnswers(prev => ({
            ...prev,
            [activeVoiceQid]: (prev[activeVoiceQid] ? prev[activeVoiceQid] + ' ' : '') + currentTranscript
          }));
        }
      };

      recognition.onend = () => {
        setActiveVoiceQid(null);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current && activeVoiceQid) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [user, activeVoiceQid]);

  // Handle Voice Toggle for specific question
  const toggleVoiceForQuestion = (qid) => {
    if (!recognitionRef.current) {
      addToast({ title: "Speech Unavailable", message: "Speech recognition is not supported in this browser. Please type your defense.", type: "warning" });
      return;
    }

    if (activeVoiceQid === qid) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setActiveVoiceQid(null);
      addToast({ title: "Voice Paused", message: "Defense recorded. Review and click Evaluate Answer.", type: "info" });
    } else {
      setActiveVoiceQid(qid);
      try {
        recognitionRef.current.start();
        addToast({ title: "Microphone Active", message: "Speak your technical defense clearly...", type: "success" });
      } catch (err) {
        setActiveVoiceQid(null);
      }
    }
  };

  // Import Git Repository or ZIP
  const handleImportRepo = async (e) => {
    e.preventDefault();
    setImporting(true);

    try {
      if (importType === 'manual') {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || 'demo-user'
          },
          body: JSON.stringify(manualData)
        });
        const data = await res.json();
        if (data.success) {
          setProjects(prev => [data.project, ...prev]);
          setSelectedProject(data.project);
          setShowImportModal(false);
          addToast({ title: "Project Created", message: "Project ready for technical cross-examination", type: "success" });
        }
      } else {
        const res = await fetch('/api/projects/import-repo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || 'demo-user'
          },
          body: JSON.stringify({
            repoUrl: importType === 'git' ? repoUrl : null,
            zipFileName: importType === 'zip' ? (zipFileName || 'project_archive.zip') : null
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Repository inspection failed");

        setProjects(prev => [data.project, ...prev]);
        setSelectedProject(data.project);
        setShowImportModal(false);
        addToast({
          title: "Repository Profile Verified!",
          message: `Inspected ${data.project.title}. Generated 10 technical defense questions & architecture flowchart.`,
          type: "success"
        });
      }
    } catch (err) {
      addToast({ title: "Import Error", message: err.message, type: "error" });
    } finally {
      setImporting(false);
    }
  };

  // Evaluate Defense Answer
  const handleEvaluateAnswer = async (qid) => {
    const answer = userAnswers[qid];
    if (!answer || answer.trim().length < 20) {
      addToast({ title: "Answer Too Brief", message: "Provide a complete technical explanation explaining decisions and trade-offs.", type: "warning" });
      return;
    }

    if (activeVoiceQid === qid && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setActiveVoiceQid(null);
    }

    setEvaluatingQid(qid);
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/evaluate-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          questionId: qid,
          answerText: answer,
          mode: 'text'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");

      setFeedback(prev => ({
        ...prev,
        [qid]: data.feedback
      }));

      addToast({ title: "Defense Evaluated", message: `Scored ${data.feedback.score} • Follow-up challenge generated! (+35 XP)`, type: "success" });
    } catch (err) {
      addToast({ title: "Evaluation Error", message: err.message, type: "error" });
    } finally {
      setEvaluatingQid(null);
    }
  };

  const currentQuestions = selectedProject?.defenseQuestions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 26, 61, 0.95) 0%, rgba(10, 19, 44, 0.95) 100%)',
        border: '1.5px solid rgba(139, 92, 246, 0.35)',
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
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            color: 'var(--brand-violet)',
            fontSize: '0.82rem',
            fontWeight: 800,
            marginBottom: '8px'
          }}>
            <Shield size={16} /> PROJECT INTERVIEW LAB & REPOSITORY DEFENSE
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            Defend Your Actual Projects
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '720px' }}>
            Campus placement interviewers rigorously cross-examine resume projects. Import a GitHub repository or project ZIP to generate verified architecture profiles and practice defending your personal contributions, bottlenecks, and failure modes.
          </p>
        </div>

        <button onClick={() => setShowImportModal(true)} className="btn btn-primary">
          <Upload size={16} /> Import Git Repository / ZIP
        </button>
      </div>

      {/* Main Content */}
      {selectedProject ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Project Meta & Switcher */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--brand-violet)' }}>
                    {selectedProject.repoUrl ? "Inspected Repository" : "Resume Project"}
                  </span>
                  {selectedProject.repoUrl && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Source: {selectedProject.repoUrl}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedProject.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                  {selectedProject.description}
                </p>
              </div>

              {/* Projects Switcher */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedProject(p); setFeedback({}); }}
                    className={`btn btn-sm ${p.id === selectedProject.id ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {p.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Tech Stack and Evidence Attributes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.84rem'
            }}>
              <div>
                <strong style={{ color: 'var(--text-muted)' }}>Tech Stack:</strong>
                <div style={{ color: 'var(--brand-cyan)', fontWeight: 600, marginTop: '2px' }}>
                  {selectedProject.techStack}
                </div>
              </div>

              {selectedProject.databaseSchema && (
                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>Database Engine:</strong>
                  <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                    {selectedProject.databaseSchema.engine}
                  </div>
                </div>
              )}

              {selectedProject.detectedLanguages && (
                <div>
                  <strong style={{ color: 'var(--text-muted)' }}>Detected Languages:</strong>
                  <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                    {selectedProject.detectedLanguages.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* VISUAL ARCHITECTURE FLOWCHART */}
          {selectedProject.architectureDiagram && (
            <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Layers size={18} color="var(--brand-cyan)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                  Visual Architecture & Request Flow
                </h3>
                <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-success)' }}>
                  Verified Flow
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '20px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                {selectedProject.architectureDiagram.nodes.map((node, idx) => (
                  <React.Fragment key={node.id}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1.5px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)',
                      minWidth: '150px'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--brand-cyan)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {node.type}
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '4px' }}>
                        {node.label}
                      </div>
                    </div>

                    {idx < selectedProject.architectureDiagram.nodes.length - 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--brand-violet)' }}>
                        <ArrowRight size={20} />
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          REST / In-process
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* VERIFIED FINDINGS & OBSERVATIONS */}
          {selectedProject.securityObservations && (
            <div className="grid-responsive-2">
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--status-success)', fontSize: '0.9rem', marginBottom: '8px' }}>
                  <Shield size={16} /> Verified Security Controls
                </div>
                <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {selectedProject.securityObservations.map((obs, idx) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--brand-gold)', fontSize: '0.9rem', marginBottom: '8px' }}>
                  <AlertTriangle size={16} /> Scalability Inferences
                </div>
                <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {selectedProject.scalabilityObservations.map((obs, idx) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TECHNICAL DEFENSE QUESTIONS & CROSS-EXAMINATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--brand-gold)" />
                Interviewer Cross-Examination Defense Questions ({currentQuestions.length})
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Targeting Senior SDE & Campus Placement Technical Rounds
              </span>
            </div>

            {currentQuestions.map((q, idx) => {
              const ans = userAnswers[q.id] || '';
              const fb = feedback[q.id];
              const isVoiceRecordingThis = activeVoiceQid === q.id;

              return (
                <div
                  key={q.id}
                  className="card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    borderLeft: '4px solid var(--brand-violet)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--brand-violet)', fontWeight: 700 }}>
                      Question #{idx + 1}: {q.category}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Interviewer Expectation: Depth & Trade-offs
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.5 }}>
                    "{q.question}"
                  </h4>

                  <div style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    💡 <strong>What Interviewers Look For:</strong> {q.expectation || q.hint}
                  </div>

                  {/* Defense Response Area */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Your Technical Defense:
                      </span>

                      <button
                        onClick={() => toggleVoiceForQuestion(q.id)}
                        className={`btn btn-sm ${isVoiceRecordingThis ? 'btn-error' : 'btn-secondary'}`}
                      >
                        {isVoiceRecordingThis ? <MicOff size={13} /> : <Mic size={13} />}
                        {isVoiceRecordingThis ? "Stop Voice" : "Answer with Voice"}
                      </button>
                    </div>

                    <textarea
                      value={ans}
                      onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                      placeholder="Explain your approach, components involved, decision trade-offs, and metrics..."
                      rows={4}
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        fontFamily: 'inherit'
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        onClick={() => handleEvaluateAnswer(q.id)}
                        disabled={evaluatingQid === q.id || !ans.trim()}
                        className="btn btn-primary btn-sm"
                      >
                        <Send size={14} />
                        {evaluatingQid === q.id ? "Evaluating Defense..." : "Evaluate Defense"}
                      </button>
                    </div>
                  </div>

                  {/* Feedback Card */}
                  {fb && (
                    <div style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      border: '1px solid var(--brand-cyan)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: 'var(--brand-cyan)', fontSize: '0.9rem' }}>
                          Diagnostic Defense Score: {fb.score}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.84rem', color: 'var(--status-success)' }}>
                        <strong>Strengths:</strong> {fb.strengths}
                      </div>

                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        <strong>Improvement:</strong> {fb.improvements}
                      </div>

                      {fb.followUpQuestion && (
                        <div style={{
                          backgroundColor: 'var(--bg-secondary)',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.82rem',
                          color: 'var(--brand-violet)'
                        }}>
                          ⚡ <strong>Interviewer Follow-Up Challenge:</strong> {fb.followUpQuestion}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FolderGit2 size={44} color="var(--brand-cyan)" style={{ margin: '0 auto 16px' }} />
          <h3>No Projects Imported Yet</h3>
          <p style={{ marginTop: '6px' }}>Click "Import Git Repository / ZIP" above to inspect your codebase and begin project defense.</p>
        </div>
      )}

      {/* IMPORT REPOSITORY / ZIP MODAL */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--bg-overlay)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '600px',
            width: '100%',
            padding: '28px',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Import Project Repository</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Secure backend inspection: extracts folder structure, dependencies, and API routes without executing unverified code.
              </p>
            </div>

            {/* Import Type Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setImportType('git')}
                className={`btn btn-sm ${importType === 'git' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Globe size={14} /> GitHub URL
              </button>
              <button
                type="button"
                onClick={() => setImportType('zip')}
                className={`btn btn-sm ${importType === 'zip' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Upload size={14} /> ZIP Archive
              </button>
              <button
                type="button"
                onClick={() => setImportType('manual')}
                className={`btn btn-sm ${importType === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <FileCode size={14} /> Manual Spec
              </button>
            </div>

            <form onSubmit={handleImportRepo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {importType === 'git' && (
                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Public GitHub Repository URL:
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    required
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem'
                    }}
                  />
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Tip: Enter your public GitHub repo URL. Private repositories require personal access tokens or ZIP upload.
                  </div>
                </div>
              )}

              {importType === 'zip' && (
                <div>
                  <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Project ZIP File:
                  </label>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setZipFileName(e.target.files[0]?.name || '')}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.84rem'
                    }}
                  />
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Dependency directories (node_modules, .git) are automatically excluded from analysis.
                  </div>
                </div>
              )}

              {importType === 'manual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Project Title (e.g. Distributed Task Queue)"
                    value={manualData.title}
                    onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                    required
                    style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px', color: 'var(--text-primary)' }}
                  />
                  <textarea
                    placeholder="Tech Stack (e.g. Node.js, Express, Redis, PostgreSQL)"
                    value={manualData.techStack}
                    onChange={(e) => setManualData({ ...manualData, techStack: e.target.value })}
                    rows={2}
                    style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px', color: 'var(--text-primary)' }}
                  />
                  <textarea
                    placeholder="Description & Architecture Flow"
                    value={manualData.description}
                    onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
                    rows={3}
                    style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px', color: 'var(--text-primary)' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn btn-secondary"
                  disabled={importing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="btn btn-primary"
                >
                  {importing ? "Inspecting Codebase..." : "Import & Analyze Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
