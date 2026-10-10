import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Sparkles,
  Clock,
  Code2,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function MistakeCard({ mistake }) {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);

  const statusThemes = {
    'Needs Practice': {
      icon: AlertCircle,
      color: 'var(--status-error)',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)'
    },
    'Needs Review': {
      icon: AlertCircle,
      color: 'var(--status-error)',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)'
    },
    'Needs More Practice': {
      icon: AlertCircle,
      color: 'var(--status-error)',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)'
    },
    'Improving': {
      icon: TrendingUp,
      color: 'var(--brand-gold)',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)'
    },
    'Mastered': {
      icon: CheckCircle2,
      color: 'var(--status-success)',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)'
    },
    'Corrected on Retry': {
      icon: CheckCircle2,
      color: 'var(--status-success)',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)'
    }
  };

  const theme = statusThemes[mistake.status] || statusThemes['Needs Practice'];
  const StatusIcon = theme.icon;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: `1.5px solid ${theme.border}`,
        backgroundColor: 'var(--bg-secondary)',
        padding: '24px',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      {/* 1. Header: Question Title, Topic, Difficulty & Main Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span
              className="badge"
              style={{
                backgroundColor: theme.bg,
                color: theme.color,
                border: `1px solid ${theme.color}`,
                fontWeight: 700
              }}
            >
              <StatusIcon size={12} />
              {mistake.status}
            </span>

            <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              {mistake.subject || mistake.categoryTopic || "DSA"} • {mistake.topic || mistake.subtopic || "Core Topic"}
            </span>

            <span className="badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--brand-violet)' }}>
              {mistake.mistakeCategory || mistake.category || "Logic Error"}
            </span>

            {mistake.difficulty && (
              <span className={`badge badge-${mistake.difficulty.toLowerCase()}`}>
                {mistake.difficulty}
              </span>
            )}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {mistake.questionTitle || "Practice Question"}
          </h3>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Logged: {new Date(mistake.timestamp).toLocaleDateString()} • {mistake.retryCount || 0} Retries Logged
            {mistake.hintLevelsUsed && mistake.hintLevelsUsed.length > 0 && (
              <span style={{ marginLeft: '8px', color: 'var(--brand-gold)' }}>
                • Hints used: Level {mistake.hintLevelsUsed.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* 7 & 8: Try Again & Practice Similar Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/practice/${mistake.questionId}`)}
            className="btn btn-primary btn-sm"
          >
            <RotateCcw size={14} /> Try Again
          </button>

          <button
            onClick={() => navigate(`/practice?subject=${encodeURIComponent(mistake.subject || '')}`)}
            className="btn btn-secondary btn-sm"
          >
            <Layers size={14} /> Practice Similar Question
          </button>
        </div>
      </div>

      {/* 2 & 4: "Your Answer" & Highlighted Incorrect Code Line */}
      {mistake.studentAnswer && (
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.86rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code2 size={15} color="var(--status-error)" /> Your Submitted Answer:
            </span>
            {mistake.lineHighlight && (
              <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-error)', fontSize: '0.72rem' }}>
                Failing Line #{mistake.lineHighlight}
              </span>
            )}
          </div>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            backgroundColor: 'var(--bg-card)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            maxHeight: '140px',
            overflowY: 'auto',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {mistake.studentAnswer}
          </div>

          {mistake.relevantIncorrectSnippet && (
            <div style={{
              marginTop: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              color: 'var(--status-error)',
              overflowX: 'auto',
              wordBreak: 'break-word'
            }}>
              <strong>Faulty Line/Snippet:</strong> {mistake.relevantIncorrectSnippet}
            </div>
          )}
        </div>
      )}

      {/* 3: "What Went Wrong" Section */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.86rem'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--status-error)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={15} /> What Went Wrong:
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: mistake.evidence ? '8px' : 0 }}>
          {mistake.explanation}
        </p>

        {mistake.evidence && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--brand-cyan)',
            overflowX: 'auto',
            wordBreak: 'break-word'
          }}>
            <strong>Diagnostic Evidence:</strong> {mistake.evidence}
          </div>
        )}

        {mistake.failedTestCase && (
          <div style={{
            marginTop: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            backgroundColor: 'var(--bg-secondary)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            overflowX: 'auto',
            wordBreak: 'break-word'
          }}>
            Failed Test Case: Input: {JSON.stringify(mistake.failedTestCase.input || mistake.failedTestCase.selectedOption)} • Expected: {JSON.stringify(mistake.failedTestCase.expectedOutput || mistake.failedTestCase.expectedOption)}
          </div>
        )}
      </div>

      {/* 5: Correct Approach & Explanation */}
      <div style={{
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        fontSize: '0.86rem'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--status-success)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={15} /> Correct Approach & Fix:
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: mistake.correctedSnippet ? '8px' : 0 }}>
          {mistake.recommendedCorrection || mistake.correctAnswer || "Apply inclusive interval bounds and dry-run extreme cases."}
        </p>

        {mistake.correctedSnippet && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            backgroundColor: 'var(--bg-primary)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--status-success)'
          }}>
            <strong>Corrected Snippet:</strong> {mistake.correctedSnippet}
          </div>
        )}
      </div>

      {/* 6. Concept to Revise & "Learn This Concept" Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ fontSize: '0.74rem', color: 'var(--brand-violet)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={13} /> Concept to Revise
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
            {mistake.conceptToRevise || `${mistake.topic || "Core"} Invariant Verification`}
          </div>
        </div>

        <button
          onClick={() => navigate(`/learn?concept=${encodeURIComponent(mistake.conceptToRevise || mistake.topic || '')}`)}
          className="btn btn-secondary btn-sm"
        >
          <BookOpen size={13} /> Learn This Concept
        </button>
      </div>

      {/* 9: Previous Attempts and Improvement History Accordion */}
      {mistake.history && mistake.history.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <Clock size={13} />
            {showHistory ? "Hide Attempt History" : `View Improvement History (${mistake.history.length} logged attempts)`}
            {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showHistory && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '10px',
              paddingLeft: '12px',
              borderLeft: '2px solid var(--border-subtle)'
            }}>
              {mistake.history.map((h, idx) => (
                <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    Attempt #{idx + 1} ({new Date(h.attemptDate).toLocaleDateString()}):
                  </span>{' '}
                  <span className={`badge ${h.status === 'Mastered' ? 'badge-easy' : h.status === 'Improving' ? 'badge-medium' : 'badge-hard'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                    {h.status}
                  </span>{' '}
                  {h.outcome}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
