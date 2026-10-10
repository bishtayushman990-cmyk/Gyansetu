import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import {
  Swords,
  Trophy,
  Flame,
  Zap,
  Target,
  Award,
  Clock,
  ArrowRight,
  Shield,
  Medal,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function ArenaPage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [arenaData, setArenaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimedDaily, setClaimedDaily] = useState(false);

  useEffect(() => {
    async function loadArena() {
      try {
        const res = await fetch('/api/arena');
        const data = await res.json();
        setArenaData(data.arena);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadArena();
  }, []);

  const handleClaimReward = async (xpBonus) => {
    if (claimedDaily) return;
    setClaimedDaily(true);
    confetti({ particleCount: 70, spread: 60 });
    await updateProfile({ xp: (user?.xp || 1450) + xpBonus });
    addToast({
      title: 'XP Awarded!',
      message: `You earned +${xpBonus} Knowledge XP for completing the daily challenge mission!`,
      type: 'success'
    });
  };

  const badges = [
    { title: "Streak Master", desc: "Maintained a 7-day continuous practice habit", icon: Flame, unlocked: true },
    { title: "Bug Hunter", desc: "Successfully corrected 5 mistakes in Mistake Memory", icon: Shield, unlocked: true },
    { title: "Binary Search Ace", desc: "Mastered boundary invariants without TLE", icon: Target, unlocked: true },
    { title: "SQL Architect", desc: "Solved multi-table aggregations and subqueries", icon: Award, unlocked: false },
    { title: "Defense Specialist", desc: "Scored 90%+ in Project Defense Interview Lab", icon: Medal, unlocked: false }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 26, 61, 0.95) 0%, rgba(10, 19, 44, 0.95) 100%)',
        border: '1px solid var(--brand-violet)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(18px, 3.5vw, 28px) clamp(16px, 4vw, 32px)',
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
            gap: '6px',
            color: 'var(--brand-gold)',
            fontWeight: 700,
            fontSize: '0.82rem',
            marginBottom: '6px'
          }}>
            <Swords size={16} /> COMPETITIVE ARENA & MISSIONS
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 800 }}>
            GyaanSetu Arena
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '680px' }}>
            Test your speed, unlock achievements, solve daily placement problems, and view your ranking among college peers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-violet)' }}>
              {user?.xp || 1450} XP
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Level {user?.level || 4} Scholar</div>
          </div>
        </div>
      </div>

      {/* Daily Challenge Card */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1.5px solid var(--brand-gold)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(16px, 3.5vw, 24px) clamp(16px, 4vw, 28px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-gold)', fontWeight: 800, fontSize: '0.84rem', marginBottom: '6px' }}>
            <Flame size={16} fill="#f59e0b" />
            TODAY'S PLACEMENT CHALLENGE (Daily Reward: +150 XP)
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            Two Sum — Optimal Hash Map Lookup
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Solve this problem using single-pass O(N) auxiliary space. High likelihood in product company screening assessments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/practice/q-two-sum')}
            className="btn btn-primary"
          >
            Solve Challenge <ArrowRight size={16} />
          </button>
          <button
            onClick={() => handleClaimReward(150)}
            disabled={claimedDaily}
            className="btn btn-gold btn-sm"
          >
            {claimedDaily ? 'Claimed ✓' : 'Claim XP Bonus'}
          </button>
        </div>
      </div>

      {/* Grid: Badges & Leaderboard */}
      <div className="grid-2">
        {/* Badges & Achievements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--brand-violet)" />
            Earned Badges & Milestones
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {badges.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    opacity: b.unlocked ? 1 : 0.5
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: b.unlocked ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: b.unlocked ? 'var(--brand-violet)' : 'var(--text-muted)'
                  }}>
                    <Icon size={20} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{b.title}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>{b.desc}</div>
                  </div>

                  <span className="badge" style={{
                    backgroundColor: b.unlocked ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-tertiary)',
                    color: b.unlocked ? 'var(--status-success)' : 'var(--text-muted)'
                  }}>
                    {b.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campus Placement Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} color="var(--brand-gold)" />
              Campus Peer Leaderboard
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Simulated Campus Rankings</span>
          </div>

          <div className="card" style={{ padding: '8px 0', overflow: 'hidden' }}>
            {arenaData?.leaderboard?.map(entry => (
              <div
                key={entry.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: entry.isCurrentUser ? 'rgba(6, 182, 212, 0.08)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: entry.rank === 1 ? '#f59e0b' : entry.rank === 2 ? '#94a3b8' : entry.rank === 3 ? '#b45309' : 'var(--bg-tertiary)',
                    color: entry.rank <= 3 ? '#070d1e' : 'var(--text-muted)',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {entry.rank}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {entry.name} {entry.isCurrentUser && <span style={{ color: 'var(--brand-cyan)', fontSize: '0.76rem' }}>(You)</span>}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{entry.college}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--brand-violet)' }}>
                    {entry.xp} XP
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {entry.solved} Solved • {entry.streak}d streak
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
