import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BrandLogo from '../components/BrandLogo';
import { LogIn, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@gyansetu.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const { login, loadDemoUser } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast({ title: 'Welcome back!', message: 'Signed in successfully to GyaanSetu', type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      addToast({ title: 'Sign-in Failed', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    loadDemoUser();
    addToast({ title: 'Demo Mode Activated', message: 'Loaded verified demo learner profile', type: 'info' });
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(20px, 5vw, 36px)',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-block', marginBottom: '12px' }}>
            <BrandLogo size="default" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sign in to continue your placement preparation & coding journey
          </p>
        </div>

        {/* Demo Account Quick Access Alert */}
        <div style={{
          backgroundColor: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '20px',
          fontSize: '0.82rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <strong style={{ color: 'var(--brand-cyan)' }}>Demo Account Ready</strong>
            <div style={{ color: 'var(--text-secondary)' }}>demo@gyansetu.edu</div>
          </div>
          <button onClick={handleDemoSignIn} className="btn btn-gold btn-sm">
            Instant Demo Sign-In
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
              College / Student Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@college.edu"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.92rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.92rem'
              }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>
            Create Student Account
          </Link>
        </div>
      </div>
    </div>
  );
}
