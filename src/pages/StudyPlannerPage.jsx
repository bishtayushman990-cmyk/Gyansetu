import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  LifeBuoy,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CalendarDays,
  Trash2
} from 'lucide-react';

export default function StudyPlannerPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescuing, setRescuing] = useState(false);

  // New task form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    durationMinutes: 30,
    priority: 'Medium',
    type: 'practice',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const loadPlanner = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/study-planner', {
        headers: { 'x-user-id': user?.id || 'demo-user' }
      });
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanner();
  }, [user]);

  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      const res = await fetch(`/api/study-planner/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted })
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !currentCompleted } : t));
        addToast({
          title: !currentCompleted ? 'Task Completed! (+25 XP)' : 'Task Reopened',
          type: !currentCompleted ? 'success' : 'info'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`/api/study-planner/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        addToast({ title: 'Task removed', type: 'info' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const res = await fetch('/api/study-planner/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user'
        },
        body: JSON.stringify(newTask)
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => [...prev, data.task]);
        setShowAddModal(false);
        setNewTask({
          title: '',
          durationMinutes: 30,
          priority: 'Medium',
          type: 'practice',
          dueDate: new Date().toISOString().split('T')[0]
        });
        addToast({ title: 'Task Added to Study Schedule', type: 'success' });
      }
    } catch (err) {
      addToast({ title: 'Failed to add task', message: err.message, type: 'error' });
    }
  };

  // Signature Feature: Rescue My Study Plan
  const handleRescuePlan = async () => {
    setRescuing(true);
    try {
      const res = await fetch('/api/study-planner/rescue', {
        method: 'POST',
        headers: { 'x-user-id': user?.id || 'demo-user' }
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
        addToast({
          title: 'Plan Rescued Successfully!',
          message: data.message,
          type: 'success'
        });
      }
    } catch (err) {
      addToast({ title: 'Rescue Failed', message: err.message, type: 'error' });
    } finally {
      setRescuing(false);
    }
  };

  // Group tasks by date
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingOverdue = tasks.filter(t => !t.completed && t.dueDate < todayStr);
  const todaysTasks = tasks.filter(t => t.dueDate === todayStr);
  const upcomingTasks = tasks.filter(t => t.dueDate > todayStr);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div className="card" style={{
        padding: 'clamp(18px, 4vw, 28px) clamp(16px, 4vw, 32px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
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
            <Calendar size={16} /> ADAPTIVE SCHEDULE ENGINE
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            Adaptive Study Planner
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px', maxWidth: '680px' }}>
            Synchronizes daily problem solving with priority revisions from Mistake Memory. Dynamically budgets tasks according to your {user?.availableStudyTime || "2 hours / day"} availability.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Rescue My Study Plan CTA */}
          <button
            onClick={handleRescuePlan}
            disabled={rescuing}
            className="btn btn-gold"
            title="Redistribute missed or overdue tasks realistically without cramming"
          >
            <LifeBuoy size={16} />
            {rescuing ? 'Optimizing Schedule...' : 'Rescue My Study Plan'}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} /> Add Study Task
          </button>
        </div>
      </div>

      {/* Overdue Warning if any */}
      {pendingOverdue.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="var(--brand-gold)" />
            <div>
              <strong style={{ color: 'var(--brand-gold)' }}>
                {pendingOverdue.length} Missed or Overdue Study Sessions Detected
              </strong>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Don't cram! Use "Rescue My Study Plan" to automatically redistribute these tasks across upcoming days.
              </div>
            </div>
          </div>

          <button onClick={handleRescuePlan} className="btn btn-gold btn-sm">
            Auto-Reschedule Now
          </button>
        </div>
      )}

      {/* Task Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Today's Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={18} color="var(--brand-cyan)" />
              Today's Priorities ({new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {todaysTasks.filter(t => t.completed).length} / {todaysTasks.length} Completed
            </span>
          </div>

          {todaysTasks.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No tasks scheduled for today. Add one or pull from Mistake Memory!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todaysTasks.map(task => (
                <div
                  key={task.id}
                  className="card"
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    opacity: task.completed ? 0.65 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 240px', minWidth: 0 }}>
                    <button
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      style={{ color: task.completed ? 'var(--status-success)' : 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>

                    <div>
                      <div style={{
                        fontSize: '0.94rem',
                        fontWeight: 700,
                        textDecoration: task.completed ? 'line-through' : 'none'
                      }}>
                        {task.title}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={12} /> {task.durationMinutes} mins
                        </span>
                        <span>• {task.type}</span>
                        {task.rescheduledFrom && (
                          <span style={{ color: 'var(--brand-cyan)' }}>
                            • Rescheduled from {task.rescheduledFrom}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${task.priority === 'High' ? 'badge-hard' : 'badge-medium'}`}>
                      {task.priority} Priority
                    </span>

                    {task.relatedQuestionId && (
                      <button
                        onClick={() => navigate(`/practice/${task.relatedQuestionId}`)}
                        className="btn btn-outline btn-sm"
                      >
                        Solve
                      </button>
                    )}

                    <button onClick={() => handleDeleteTask(task.id)} className="icon-btn" style={{ width: '30px', height: '30px' }}>
                      <Trash2 size={14} color="var(--status-error)" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
              Upcoming Later This Week
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingTasks.map(task => (
                <div
                  key={task.id}
                  className="card"
                  style={{
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Circle size={18} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{task.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Due on {task.dueDate} • {task.durationMinutes} mins
                      </div>
                    </div>
                  </div>

                  <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--bg-overlay)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>
              Add Study Plan Task
            </h3>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Revise Binary Search Invariants"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="grid-responsive-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={newTask.durationMinutes}
                    onChange={(e) => setNewTask({ ...newTask, durationMinutes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px' }}>
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
