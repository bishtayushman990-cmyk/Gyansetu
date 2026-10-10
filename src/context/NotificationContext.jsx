import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Overlay */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: 'var(--bg-secondary)',
              border: `1px solid ${
                toast.type === 'success' ? 'var(--status-success)' :
                toast.type === 'error' ? 'var(--status-error)' :
                toast.type === 'warning' ? 'var(--brand-gold)' : 'var(--border-subtle)'
              }`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              animation: 'slideIn 0.25s ease-out',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontWeight: 700,
                fontSize: '0.88rem',
                color: toast.type === 'success' ? 'var(--status-success)' :
                       toast.type === 'error' ? 'var(--status-error)' :
                       toast.type === 'warning' ? 'var(--brand-gold)' : 'var(--brand-blue)'
              }}>
                {toast.title}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            {toast.message && (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {toast.message}
              </span>
            )}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}
