import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import {
  Code2,
  BrainCircuit,
  Sparkles,
  Calendar,
  Layers,
  Award,
  ArrowRight,
  CheckCircle2,
  Flame,
  Zap,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Terminal,
  BookOpen
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation Header */}
      <header className="landing-header">
        <BrandLogo size="default" showTagline={false} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <nav className="landing-nav" style={{ display: 'flex', gap: '20px', fontSize: '0.92rem', fontWeight: 600 }}>
            <Link to="/practice" style={{ color: 'var(--text-secondary)' }}>Practice Lab</Link>
            <Link to="/mistakes" style={{ color: 'var(--text-secondary)' }}>Mistake Memory</Link>
            <Link to="/learn" style={{ color: 'var(--text-secondary)' }}>Learn Roadmaps</Link>
            <Link to="/ai-study-buddy" style={{ color: 'var(--text-secondary)' }}>AI Study Buddy</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '90px 24px 70px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(6, 182, 212, 0.12))',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--brand-cyan)',
          fontSize: '0.86rem',
          fontWeight: 700,
          marginBottom: '24px'
        }}>
          <Sparkles size={16} /> Continuous Learning Loop for Campus Placements & SDE Roles
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: '900px',
          marginBottom: '20px'
        }}>
          Learn Smarter. Practice Better.{' '}
          <span style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Achieve More.
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '750px',
          lineHeight: 1.6,
          marginBottom: '36px'
        }}>
          Your personal AI learning companion for coding practice, technical interviews, and placements. Learn concepts, understand your mistakes, and build the skills to succeed.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Start Learning <ArrowRight size={18} />
          </Link>
          <Link to="/practice" className="btn btn-secondary btn-lg">
            Explore Practice Lab
          </Link>
        </div>

        {/* The Signature Continuous Learning Loop */}
        <div style={{
          width: '100%',
          maxWidth: '1040px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative'
        }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--brand-cyan)',
            marginBottom: '16px'
          }}>
            The GyaanSetu Learning Loop
          </div>

          <div className="learning-loop-grid">
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Code2 size={18} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>1. Practise</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>Curated DSA, SQL, CS MCQs</div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <BrainCircuit size={18} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--status-error)' }}>2. Detect Mistake</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>Evidence-based diagnosis</div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Sparkles size={18} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--brand-gold)' }}>3. Understand Why</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>5-level hint ladder & tutor</div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--brand-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Calendar size={18} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>4. Revise</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>Adaptive study task sync</div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <RotateCcw size={18} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--status-success)' }}>5. Retry & Master</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>Verify improvement metrics</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
            Built for Real Student Outcomes
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Everything required to bridge the gap from classroom theory to top-tier software engineering placements.
          </p>
        </div>

        <div className="grid-3">
          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))', color: 'var(--status-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <BrainCircuit size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Mistake Memory System</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Don't just see a red X. Understand exactly whether your bug was an off-by-one boundary flaw, unhandled empty edge case, or time complexity bottleneck.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(37, 99, 235, 0.15))', color: 'var(--brand-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>5-Level Progressive Hint Ladder</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Never get spoiled by instant solutions. Unlock Concept Hint → Approach → Algorithm → Pseudocode → Full Explanation sequentially to protect your critical thinking.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15))', color: 'var(--brand-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>AI Study Buddy</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Interactive step-by-step table dry runs, line-by-line code breakdowns, compiler error interpretation, and targeted concept revision.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Calendar size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Adaptive Study Planner & Rescue</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Automatically incorporates unresolved mistakes into your calendar. Missed study sessions? One-click "Rescue My Plan" redistributes your workload realistically.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.15))', color: 'var(--brand-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Award size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Project Interview Defense Lab</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Paste your resume project tech stack, architecture, and contributions. Generates real technical cross-examination questions and rates your answers.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(139, 92, 246, 0.15))', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Code2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Practice Lab with Sandboxed Runner</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Split-screen coding workspace with sample and hidden test cases, multi-language support (JS, Python, C++, Java, SQL), and LeetCode/GfG cross-references.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section style={{
        padding: '70px 24px',
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        marginTop: 'auto',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>
            Ready to Bridge the Gap Between Learning & Success?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Join thousands of ambitious students preparing for campus placements, technical interviews, and engineering internships.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Launch GyaanSetu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
