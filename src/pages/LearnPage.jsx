import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Code2,
  Layers,
  Database,
  Cpu,
  GitBranch,
  Network,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function LearnPage() {
  const navigate = useNavigate();

  const learningPaths = [
    {
      id: "path-a2z-dsa",
      title: "Complete DSA Roadmap (Beginner to Placement Ready)",
      subtitle: "Structured roadmap inspired by the industry standard takeUforward approach",
      icon: Layers,
      color: "var(--brand-blue)",
      duration: "8-10 Weeks",
      level: "All Levels",
      topics: [
        { name: "Step 1: Basics of Programming & Complexity Analysis", count: "12 Problems", completed: 12 },
        { name: "Step 2: Arrays & Two Pointers (Easy to Hard)", count: "18 Problems", completed: 8 },
        { name: "Step 3: Binary Search on 1D Arrays & Search Space", count: "14 Problems", completed: 6 },
        { name: "Step 4: Linked Lists (Single, Doubly, Fast & Slow Pointers)", count: "10 Problems", completed: 3 },
        { name: "Step 5: Stacks & Monotonic Queues", count: "12 Problems", completed: 4 },
        { name: "Step 6: Binary Trees, BST & Traversals", count: "16 Problems", completed: 2 },
        { name: "Step 7: Dynamic Programming (1D, 2D, Grids, Subsequences)", count: "22 Problems", completed: 1 }
      ]
    },
    {
      id: "path-core-cs",
      title: "Core Computer Science Fundamentals for Interviews",
      subtitle: "Essential theory and MCQs asked in Google, Amazon, Microsoft, and TCS/Infosys placement rounds",
      icon: Cpu,
      color: "var(--brand-violet)",
      duration: "3-4 Weeks",
      level: "Intermediate",
      topics: [
        { name: "DBMS: ACID Properties, Indexing, BCNF & Normalization", count: "15 MCQs", completed: 9 },
        { name: "Operating Systems: Deadlocks, Process Scheduling, Virtual Memory", count: "18 MCQs", completed: 11 },
        { name: "Computer Networks: TCP/IP 3-Way Handshake, DNS, HTTP/HTTPS", count: "14 MCQs", completed: 7 },
        { name: "Object-Oriented Programming: Polymorphism, Inheritance, Design Patterns", count: "10 MCQs", completed: 6 }
      ]
    },
    {
      id: "path-sql",
      title: "SQL & Relational Query Mastery",
      subtitle: "Writing production SQL queries: Aggregations, Window Functions, Subqueries, and Complex Joins",
      icon: Database,
      color: "var(--brand-cyan)",
      duration: "2 Weeks",
      level: "Beginner to Advanced",
      topics: [
        { name: "Basic SELECT, WHERE, LIKE, and Filtering", count: "8 Queries", completed: 8 },
        { name: "Aggregations: GROUP BY, HAVING, and COUNT/MAX/AVG", count: "10 Queries", completed: 6 },
        { name: "Subqueries & Correlated Queries (e.g. Second Highest Salary)", count: "12 Queries", completed: 5 },
        { name: "Window Functions: ROW_NUMBER(), RANK(), DENSE_RANK()", count: "10 Queries", completed: 2 }
      ]
    }
  ];

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
            color: 'var(--brand-cyan)',
            fontWeight: 700,
            fontSize: '0.82rem',
            marginBottom: '6px'
          }}>
            <BookOpen size={16} /> STRUCTURED SYLLABUS & ROADMAPS
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            Structured Learning Sheets
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '720px' }}>
            Follow curated, step-by-step topic roadmaps designed for college students targeting software engineering placements. Progress from fundamentals to advanced interview patterns without getting lost.
          </p>
        </div>

        <Link to="/practice" className="btn btn-primary">
          <Code2 size={16} /> Explore All Questions
        </Link>
      </div>

      {/* Learning Paths */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {learningPaths.map(path => {
          const Icon = path.icon;
          return (
            <div key={path.id} className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: path.color
                  }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{path.title}</h2>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>{path.subtitle}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    <Clock size={12} /> {path.duration}
                  </span>
                  <span className="badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)', color: 'var(--brand-cyan)' }}>
                    {path.level}
                  </span>
                </div>
              </div>

              {/* Topics breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {path.topics.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('/practice')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-cyan)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CheckCircle2 size={16} color="var(--brand-cyan)" />
                      <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{t.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.count}</span>
                      <ArrowRight size={14} color="var(--brand-cyan)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
