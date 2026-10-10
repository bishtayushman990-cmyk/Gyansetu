import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BrandLogo from '../components/BrandLogo';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    educationLevel: 'B.Tech / B.E. (Pre-Final or Final Year)',
    target: 'Campus Placements 2026 (Product-Based SDE)',
    preferredLanguage: 'javascript',
    skillLevel: 'Intermediate',
    availableStudyTime: '2-3 hours / day',
    interests: ['Data Structures & Algorithms', 'SQL & DBMS', 'System Design']
  });

  const availableInterests = [
    'Data Structures & Algorithms',
    'Dynamic Programming',
    'SQL & DBMS',
    'Operating Systems',
    'Computer Networks',
    'Object-Oriented Design',
    'Full Stack Web',
    'Aptitude & Reasoning'
  ];

  const toggleInterest = (topic) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(topic)
        ? prev.interests.filter(t => t !== topic)
        : [...prev.interests, topic]
    }));
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    addToast({
      title: 'Profile Tailored!',
      message: 'Your study plan and dashboard have been configured for your target.',
      type: 'success'
    });
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <BrandLogo size="default" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '16px' }}>
            Personalize Your GyaanSetu Journey
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Help our adaptive engine tailor your practice recommendations, study plan, and mock tests.
          </p>
        </div>

        <form onSubmit={handleFinish} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Display Name
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Education Level
              </label>
              <select
                value={formData.educationLevel}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem'
                }}
              >
                <option>B.Tech / B.E. (1st or 2nd Year)</option>
                <option>B.Tech / B.E. (Pre-Final or Final Year)</option>
                <option>MCA / M.Tech / M.Sc</option>
                <option>Recent Graduate / Looking for Off-Campus</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Placement / Examination Target
              </label>
              <input
                type="text"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                placeholder="e.g. SDE-1 / Campus Placements 2026"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Preferred Coding Language
              </label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem'
                }}
              >
                <option value="javascript">JavaScript / TypeScript</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ (STL)</option>
                <option value="java">Java (Collections)</option>
                <option value="sql">SQL (PostgreSQL / MySQL)</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Current Skill Level
              </label>
              <select
                value={formData.skillLevel}
                onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem'
                }}
              >
                <option>Beginner (Learning Basics & Loops)</option>
                <option>Intermediate (Know Arrays, Strings, Searching)</option>
                <option>Advanced (Practising Trees, Graphs, DP)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Daily Study Time Available
              </label>
              <select
                value={formData.availableStudyTime}
                onChange={(e) => setFormData({ ...formData, availableStudyTime: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem'
                }}
              >
                <option>1 hour / day (Quick practice)</option>
                <option>2-3 hours / day (Balanced preparation)</option>
                <option>4+ hours / day (Intensive boot camp)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '8px' }}>
              Topics of Immediate Interest
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableInterests.map(topic => {
                const selected = formData.interests.includes(topic);
                return (
                  <button
                    type="button"
                    key={topic}
                    onClick={() => toggleInterest(topic)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1px solid ${selected ? 'var(--brand-cyan)' : 'var(--border-subtle)'}`,
                      backgroundColor: selected ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-primary)',
                      color: selected ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {selected && '✓ '} {topic}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '12px' }}>
            Save Preferences & Launch Dashboard <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
