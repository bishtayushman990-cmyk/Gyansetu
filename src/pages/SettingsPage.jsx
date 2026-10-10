import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { Settings, User, Moon, Sun, Shield, Save, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile, loadDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useNotification();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    college: user?.college || '',
    target: user?.target || '',
    preferredLanguage: user?.preferredLanguage || 'javascript',
    availableStudyTime: user?.availableStudyTime || '2-3 hours / day',
    dailyGoal: user?.dailyGoal || 3
  });

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    addToast({ title: 'Preferences Saved', message: 'Settings successfully updated', type: 'success' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px'
      }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Account & Preferences</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Manage your placement target, daily study goal, theme mode, and profile.
        </p>
      </div>

      <div className="card" style={{ padding: '28px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                College / Institute
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Target Role & Year
              </label>
              <input
                type="text"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Preferred Language
              </label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value="javascript">JavaScript / TypeScript</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ (STL)</option>
                <option value="java">Java (Collections)</option>
                <option value="sql">SQL</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Daily Question Target
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.dailyGoal}
                onChange={(e) => setFormData({ ...formData, dailyGoal: Number(e.target.value) })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                Interface Appearance
              </label>
              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>Current Theme: <strong>{theme === 'dark' ? 'Dark Navy' : 'Clean Light'}</strong></span>
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => {
                loadDemoUser();
                addToast({ title: 'Reset to Demo Account', type: 'info' });
              }}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={14} /> Reset Demo Profile
            </button>

            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
