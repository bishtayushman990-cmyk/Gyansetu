import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Table,
  Terminal,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Code2,
  BookOpen,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export default function AIStudyBuddyPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `### 🎓 Welcome to GyaanSetu AI Study Buddy!\n\nI am your interactive AI tutor for technical interviews and campus placement prep. Here is how I can help you learn:\n\n1. **Pasted Solutions**: Paste any code snippet, and I'll analyze it using our 9-point placement rubric (what it does, line-by-line explanation, dry run table, what's right/wrong, and complexity).\n2. **Follow-Up Questions**: Ask me *"explain line 5"*, *"why is this condition required?"*, or *"give me another example"* and I'll answer directly in context.\n3. **Conceptual Dry Runs**: Request step-by-step state traces for DSA, OS, DBMS, or Computer Networks.\n\n*Choose a prompt below or paste your code!*`,
      provider: 'GyaanSetu AI Pedagogical Engine'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [skillLevel, setSkillLevel] = useState('intermediate'); // 'beginner' | 'intermediate' | 'advanced'
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [pastedCode, setPastedCode] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    "📋 Dry run Binary Search with a state table",
    "🔍 Explain line 5 of binary search pointer logic",
    "🛡️ Why is while (left <= right) required instead of < ?",
    "🧪 Give me another example with duplicate elements",
    "⏱️ Explain time and space complexity trade-offs",
    "🌐 Explain the TCP 3-way handshake with packet flags"
  ];

  const handleSend = async (textToSend, codeToSend) => {
    const query = textToSend || input;
    const attachedCode = codeToSend !== undefined ? codeToSend : (showCodeBox ? pastedCode : '');

    if ((!query.trim() && !attachedCode.trim()) || loading) return;

    const combinedText = attachedCode.trim()
      ? `${query.trim() ? query.trim() + '\n\n' : 'Please analyze my code solution:\n'}\`\`\`javascript\n${attachedCode}\n\`\`\``
      : query;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: combinedText
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    if (showCodeBox) {
      setPastedCode('');
      setShowCodeBox(false);
    }
    setLoading(true);

    // Format conversation history for multi-turn contextual tracking
    const historyPayload = newMessages.slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    try {
      const res = await fetch('/api/ai/study-buddy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify({
          message: query || "Please analyze this solution code step by step.",
          codeContext: attachedCode || null,
          conversationHistory: historyPayload,
          skillLevel
        })
      });

      const data = await res.json();
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        isLiveAI: data.isLiveAI,
        provider: data.provider
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `### ⚠️ Connection Notice\nCould not reach the GyaanSetu AI service. Ensure backend server is running.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `Conversation reset! What concept, pasted solution, or follow-up question would you like to explore?`,
        provider: 'GyaanSetu AI Tutor'
      }
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 'calc(100dvh - 120px)' }}>
      {/* Top Header */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(14px, 3vw, 18px) clamp(14px, 3.5vw, 24px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.4rem)', fontWeight: 800 }}>AI Study Buddy</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Interactive placement tutor • 9-point code breakdown & multi-turn memory
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Skill Level Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>Level:</span>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                color: 'var(--brand-cyan)',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <button
            onClick={handleResetChat}
            className="btn btn-secondary btn-sm"
            title="Reset conversation"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Messages Scroll Box */}
      <div style={{
        flex: 1,
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(14px, 3vw, 24px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: 'min(92%, 760px)'
            }}
          >
            {msg.sender === 'ai' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
                marginTop: '4px'
              }}>
                <Bot size={16} />
              </div>
            )}

            <div style={{
              backgroundColor: msg.sender === 'user' ? 'var(--brand-blue)' : 'var(--bg-primary)',
              color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px clamp(12px, 3vw, 20px)',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              boxShadow: 'var(--shadow-sm)',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere'
            }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>

              {msg.provider && (
                <div style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  marginTop: '10px',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '4px'
                }}>
                  <span>Source: {msg.provider}</span>
                  {msg.isLiveAI && <span style={{ color: 'var(--status-success)' }}>● Live Gemini AI</span>}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--brand-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
                marginTop: '4px'
              }}>
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <Bot size={18} color="var(--brand-cyan)" />
            <span>AI Study Buddy is analyzing code and preparing explanation...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="horizontal-scroll-row" style={{ display: 'flex', gap: '8px', paddingBottom: '2px' }}>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Code Paste Box (Toggled) */}
      {showCodeBox && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-cyan)' }}>
              Paste Your Code Solution (Javascript, Python, C++, Java):
            </span>
            <button
              onClick={() => setShowCodeBox(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.76rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
          <textarea
            value={pastedCode}
            onChange={(e) => setPastedCode(e.target.value)}
            placeholder="Paste your solution code here to get a 9-point rubric breakdown..."
            rows={5}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem'
            }}
          />
        </div>
      )}

      {/* Input Form Toolbar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{
          display: 'flex',
          gap: '8px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '8px 12px',
          boxShadow: 'var(--shadow-md)',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <button
          type="button"
          onClick={() => setShowCodeBox(!showCodeBox)}
          className={`btn btn-sm ${showCodeBox ? 'btn-primary' : 'btn-secondary'}`}
          title="Paste code solution"
          style={{ whiteSpace: 'nowrap' }}
        >
          <Code2 size={15} /> Paste Code
        </button>

        <input
          type="text"
          placeholder={showCodeBox ? "Add optional question/instructions for this code..." : "Ask a question, follow-up (e.g. 'explain line 5')..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: '1 1 180px',
            minWidth: '140px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.94rem',
            padding: '8px'
          }}
        />

        <button
          type="submit"
          disabled={loading || (!input.trim() && !pastedCode.trim())}
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
        >
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}
