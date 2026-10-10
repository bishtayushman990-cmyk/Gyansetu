import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Code2,
  Cpu,
  Database,
  Users,
  Search,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function InterviewPrepPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Data Structures', 'Operating Systems', 'DBMS & SQL', 'Computer Networks', 'Behavioral & HR'];

  const interviewQuestions = [
    {
      id: "iq-1",
      title: "How do you detect and break a cycle in a Singly Linked List?",
      category: "Data Structures",
      difficulty: "Medium",
      questionType: "Coding / Dry Run",
      answer: "Use Floyd's Cycle Detection algorithm (Fast & Slow Pointers). Fast moves 2 steps, slow moves 1 step. If fast == slow, cycle exists. To find entry: reset slow to head, advance both by 1 step until they meet again.",
      relatedQuestionId: "q-reverse-linked-list"
    },
    {
      id: "iq-2",
      title: "What are ACID properties in Relational Databases and how does Isolation work?",
      category: "DBMS & SQL",
      difficulty: "Medium",
      questionType: "Theory & System Concepts",
      answer: "Atomicity (all or nothing), Consistency (preserves database invariants), Isolation (concurrent transactions execute independently without interference), Durability (committed data survives crashes). Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.",
      relatedQuestionId: "q-mcq-dbms-normalization"
    },
    {
      id: "iq-3",
      title: "Explain the TCP 3-Way Handshake and what happens during SYN Flood attacks?",
      category: "Computer Networks",
      difficulty: "Medium",
      questionType: "Theory",
      answer: "Client sends SYN, Server replies with SYN-ACK and allocates half-open connection memory, Client sends ACK. In SYN Flood attacks, attackers flood SYN packets without sending final ACK, exhausting server connection backlogs. Mitigated using SYN Cookies.",
      relatedQuestionId: "q-mcq-cn-tcp-udp"
    },
    {
      id: "iq-4",
      title: "Tell me about a time you faced a difficult technical bug or disagreement in a college team project.",
      category: "Behavioral & HR",
      difficulty: "Easy",
      questionType: "STAR Behavioral",
      answer: "Situation: Group project deadline approaching with unexpected race condition in shared state. Task: Diagnose root cause without finger pointing. Action: Added comprehensive logging, isolated concurrent writes, and scheduled a 15-minute sync with team. Result: Resolved bug 2 days before submission with 100% test pass rate.",
      relatedQuestionId: null
    },
    {
      id: "iq-5",
      title: "Explain the four Coffman Conditions for Deadlock and how to prevent Circular Wait.",
      category: "Operating Systems",
      difficulty: "Medium",
      questionType: "Theory",
      answer: "Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Circular wait is prevented by assigning a global hierarchical ordering to all system resources and forcing processes to acquire resources strictly in ascending order.",
      relatedQuestionId: "q-mcq-os-deadlock"
    }
  ];

  const filtered = activeCategory === 'All'
    ? interviewQuestions
    : interviewQuestions.filter(q => q.category === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
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
            color: 'var(--brand-violet)',
            fontWeight: 700,
            fontSize: '0.82rem',
            marginBottom: '6px'
          }}>
            <Briefcase size={16} /> INTERVIEW PREPARATION MASTER BANK
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            Technical & Behavioral Interview Prep
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '720px' }}>
            Comprehensive interview questions frequently asked by top product firms (MAANG/FAANG), high-growth tech startups, and campus tier-1 recruiters.
          </p>
        </div>

        <button onClick={() => navigate('/practice')} className="btn btn-primary">
          <Code2 size={16} /> Practice Coding Questions
        </button>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${activeCategory === c ? 'var(--brand-blue)' : 'var(--border-subtle)'}`,
              backgroundColor: activeCategory === c ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-secondary)',
              color: activeCategory === c ? 'var(--brand-blue)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Question Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(q => (
          <div key={q.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--brand-violet)' }}>
                  {q.category}
                </span>
                <span className={`badge badge-${q.difficulty.toLowerCase()}`}>
                  {q.difficulty}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {q.questionType}
                </span>
              </div>

              {q.relatedQuestionId && (
                <button
                  onClick={() => navigate(`/practice/${q.relatedQuestionId}`)}
                  className="btn btn-outline btn-sm"
                >
                  Solve Practice Question <ChevronRight size={13} />
                </button>
              )}
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              {q.title}
            </h3>

            <div style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)'
            }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Verified Interview Model Answer:
              </strong>
              {q.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
