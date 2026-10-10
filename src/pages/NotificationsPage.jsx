import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Bell, CheckCircle2, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifs() {
      try {
        const res = await fetch('/api/notifications', {
          headers: { 'x-user-id': user?.id || 'demo-user' }
        });
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifs();
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px'
      }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Notification Center</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Alerts for mistake revision tasks, streak milestones, and study schedule reminders.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map(n => (
          <div
            key={n.id}
            className="card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeft: n.type === 'revision' ? '4px solid var(--brand-gold)' : '4px solid var(--brand-blue)'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>{n.title}</div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {n.link && (
                <Link to={n.link} className="btn btn-outline btn-sm">
                  View <ArrowRight size={13} />
                </Link>
              )}
              {!n.read && (
                <button onClick={() => handleMarkRead(n.id)} className="btn btn-secondary btn-sm">
                  Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
