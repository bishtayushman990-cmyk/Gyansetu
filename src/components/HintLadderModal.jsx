import React from 'react';
import { Lightbulb, ChevronRight, CheckCircle2, Lock, Sparkles, X, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

export default function HintLadderModal({
  isOpen,
  onClose,
  hintLadder = [],
  questionTitle = '',
  unlockedLevel = 1,
  onUnlockLevel
}) {
  if (!isOpen) return null;

  const ladderLevels = [
    {
      level: 1,
      title: "Level 1 — Gentle Nudge",
      desc: "Points toward the relevant concept without revealing the solution.",
      badge: "Full XP Retained"
    },
    {
      level: 2,
      title: "Level 2 — Approach Hint",
      desc: "Suggests a suitable strategy or data structure.",
      badge: "Full XP Retained"
    },
    {
      level: 3,
      title: "Level 3 — Step-by-Step Direction",
      desc: "Explains the next logical steps without giving the complete answer.",
      badge: "Standard XP"
    },
    {
      level: 4,
      title: "Level 4 — Targeted Debugging",
      desc: "Identifies a likely faulty condition, edge case, or incorrect assumption.",
      badge: "Slight XP Adjustment"
    },
    {
      level: 5,
      title: "Level 5 — Detailed Explanation",
      desc: "Shows the complete solution or worked example and explains its complexity.",
      badge: "Full Solution Revealed"
    }
  ];

  const handleUnlockNext = () => {
    if (unlockedLevel < 5 && onUnlockLevel) {
      onUnlockLevel(unlockedLevel + 1);
    }
  };

  return (
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
        border: '1.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '740px',
        width: '100%',
        maxHeight: '88vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-primary)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={20} color="var(--brand-gold)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>5-Level Progressive Hint Ladder</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Problem: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{questionTitle}</span>
            </p>
          </div>
          <button onClick={onClose} className="icon-btn" title="Close hints">
            <X size={18} />
          </button>
        </div>

        {/* Informational Banner */}
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(6, 182, 212, 0.1))',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}>
            🎯 <strong>Pedagogical Practice Rule:</strong> You receive one hint at a time. After unlocking each hint, return to the workspace and try solving before requesting the next level.
          </div>
        </div>

        {/* 5-Level Ladder */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {ladderLevels.map((lvl) => {
            const isUnlocked = unlockedLevel >= lvl.level;
            const hintItem = hintLadder.find(h => h.level === lvl.level) || {
              content: "Analyze loop invariants, boundary intervals, and verify base cases before running."
            };

            return (
              <div
                key={lvl.level}
                style={{
                  backgroundColor: isUnlocked ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                  border: `1.5px solid ${isUnlocked ? 'var(--brand-cyan)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  transition: 'all 0.2s ease',
                  opacity: isUnlocked ? 1 : 0.6
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isUnlocked ? (
                      <CheckCircle2 size={16} color="var(--brand-cyan)" />
                    ) : (
                      <Lock size={16} color="var(--text-muted)" />
                    )}
                    <span style={{ fontWeight: 800, fontSize: '0.92rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {lvl.title}
                    </span>
                  </div>

                  <span className="badge" style={{
                    fontSize: '0.7rem',
                    backgroundColor: isUnlocked ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-primary)',
                    color: isUnlocked ? 'var(--brand-cyan)' : 'var(--text-muted)'
                  }}>
                    {lvl.badge}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {lvl.desc}
                </div>

                {isUnlocked ? (
                  <div style={{
                    marginTop: '10px',
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    background: 'var(--bg-card)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: lvl.level >= 4 ? 'var(--font-mono)' : 'inherit'
                  }}>
                    {hintItem.content}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                    Locked. Click "Get Next Hint" below to reveal this level.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: 'var(--bg-primary)'
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Unlocked <strong>Level {unlockedLevel}</strong> of 5
          </span>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {unlockedLevel < 5 && (
              <button onClick={handleUnlockNext} className="btn btn-gold btn-sm">
                <Sparkles size={14} /> Get Next Hint (Level {unlockedLevel + 1})
              </button>
            )}

            <button onClick={onClose} className="btn btn-primary btn-sm">
              <RotateCcw size={14} /> Return & Try Attempt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
