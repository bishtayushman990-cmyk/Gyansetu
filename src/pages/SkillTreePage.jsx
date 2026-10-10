import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GitFork,
  CheckCircle2,
  Lock,
  ArrowRight,
  Code2,
  Sparkles,
  Zap,
  ChevronRight
} from 'lucide-react';

export default function SkillTreePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skillTree, setSkillTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    async function loadTree() {
      try {
        const res = await fetch('/api/skill-tree', {
          headers: { 'x-user-id': user?.id || 'demo-user' }
        });
        const data = await res.json();
        setSkillTree(data.skillTree || []);
        if (data.skillTree && data.skillTree.length > 0) {
          setSelectedNode(data.skillTree[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTree();
  }, [user]);

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
            <GitFork size={16} /> COMPETENCY DEPENDENCY GRAPH
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 800 }}>
            Interactive Skill Tree
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '700px' }}>
            Master prerequisite nodes to unlock advanced placement domains. Progress percentages are automatically calculated from your validated problem submissions.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Node Map vs Selected Node Details */}
      <div className="grid-2">
        {/* Left: Interactive Tree Nodes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {skillTree.map(node => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="card card-interactive"
                style={{
                  padding: '16px clamp(14px, 3vw, 22px)',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--brand-cyan)' : undefined,
                  opacity: node.isUnlocked ? 1 : 0.6,
                  backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.06)' : undefined
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: node.isUnlocked ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: node.isUnlocked ? 'var(--brand-cyan)' : 'var(--text-muted)'
                    }}>
                      {node.isUnlocked ? <CheckCircle2 size={18} /> : <Lock size={18} />}
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>{node.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Level {node.level} • {node.category}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-cyan)' }}>
                      {node.progressPercent}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      +{node.xpReward} XP
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                  height: '6px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  marginTop: '12px'
                }}>
                  <div style={{
                    width: `${node.progressPercent}%`,
                    height: '100%',
                    background: 'var(--gradient-brand)',
                    borderRadius: 'var(--radius-full)'
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Node Details & Action Plan */}
        <div>
          {selectedNode ? (
            <div className="card" style={{ padding: 'clamp(18px, 4vw, 28px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-cyan)', fontSize: '0.82rem', fontWeight: 700 }}>
                <Sparkles size={16} /> NODE DETAILS & MILESTONES
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '8px' }}>
                {selectedNode.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginTop: '8px' }}>
                {selectedNode.description}
              </p>

              <div style={{
                margin: '20px 0',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Requirement Status</div>
                  <div style={{ fontWeight: 700, color: selectedNode.isUnlocked ? 'var(--status-success)' : 'var(--status-error)', marginTop: '2px' }}>
                    {selectedNode.isUnlocked ? 'Unlocked & Active' : 'Locked by Prerequisites'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Target Completion</div>
                  <div style={{ fontWeight: 700, color: 'var(--brand-cyan)', marginTop: '2px' }}>
                    {selectedNode.progressPercent}% Mastery
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Node Reward</div>
                  <div style={{ fontWeight: 700, color: 'var(--brand-violet)', marginTop: '2px' }}>
                    +{selectedNode.xpReward} XP
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>
                Connected Practice Questions ({selectedNode.requiredQuestions.length})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedNode.requiredQuestions.map(qid => (
                  <div
                    key={qid}
                    onClick={() => navigate(`/practice/${qid}`)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Problem: {qid}</span>
                    <button className="btn btn-outline btn-sm">Solve <ChevronRight size={13} /></button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/practice')}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '24px' }}
              >
                Go to Practice Lab <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              Select any competency node on the left to inspect requirements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
