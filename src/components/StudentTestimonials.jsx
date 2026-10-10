import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
  Quote,
  X,
  User,
  Check,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function StudentTestimonials() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    role: 'B.Tech CSE, 4th Year',
    college: user?.college || 'Institute of Technology',
    topicTag: 'Recall Arena & DSA',
    photoUrl: '',
    feedback: '',
    consent: true
  });

  // Fetch verified student testimonials
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/testimonials');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Update name/college when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.displayName || '',
        college: prev.college || user.college || ''
      }));
    }
  }, [user]);

  // Carousel controls (navigate 2 at a time or by 1)
  const itemsPerPage = 2;
  const maxIndex = Math.max(0, testimonials.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.feedback.trim() || formData.feedback.trim().length < 10) {
      setErrorMsg('Please write at least 10 characters of genuine feedback.');
      return;
    }
    if (!formData.consent) {
      setErrorMsg('Consent is required to publish your review publicly on GyaanSetu.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit review');
      }

      const result = await res.json();
      setSubmitSuccess(true);
      await fetchTestimonials();
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowModal(false);
        setFormData({
          name: user?.displayName || '',
          role: 'B.Tech CSE, 4th Year',
          college: user?.college || 'Institute of Technology',
          topicTag: 'Recall Arena & DSA',
          photoUrl: '',
          feedback: '',
          consent: true
        });
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <MessageSquare size={18} color="var(--brand-cyan)" />
              Student Testimonials
            </h3>
            {testimonials.length > 0 && (
              <span style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--brand-cyan)',
                fontWeight: 600
              }}>
                Verified Reviews ({testimonials.length})
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
            Real experiences from students building skills and preparing for placements.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {testimonials.length > itemsPerPage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="btn btn-outline btn-sm"
                style={{ padding: '5px 8px', borderRadius: 'var(--radius-sm)', opacity: currentIndex === 0 ? 0.4 : 1 }}
                title="Previous testimonials"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="btn btn-outline btn-sm"
                style={{ padding: '5px 8px', borderRadius: 'var(--radius-sm)', opacity: currentIndex >= maxIndex ? 0.4 : 1 }}
                title="Next testimonials"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="btn btn-outline btn-sm"
            style={{
              borderColor: 'rgba(6, 182, 212, 0.4)',
              color: 'var(--brand-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <MessageSquarePlus size={14} />
            Share Your Experience
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Loading genuine student feedback...
        </div>
      ) : testimonials.length === 0 ? (
        /* Empty State */
        <div className="card" style={{
          padding: '28px 24px',
          textAlign: 'center',
          border: '1px dashed var(--border-subtle)',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            color: 'var(--brand-cyan)'
          }}>
            <Sparkles size={22} />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
            Be the first to share your GyaanSetu experience.
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px' }}>
            Help fellow scholars see how targeted practice and mistake revision improve placement readiness.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm"
            style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <MessageSquarePlus size={15} />
            Share Your Experience
          </button>
        </div>
      ) : (
        /* Testimonials Cards Grid (Up to 2 cards side by side on wider screens) */
        <div style={{
          display: 'grid',
          gridTemplateColumns: visibleTestimonials.length > 1 ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr',
          gap: '12px'
        }}>
          {visibleTestimonials.map(t => (
            <div
              key={t.id}
              className="card"
              style={{
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Top: Student Profile & Topic Tag */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {t.photoUrl ? (
                      <img
                        src={t.photoUrl}
                        alt={t.name}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid rgba(6, 182, 212, 0.5)',
                          flexShrink: 0
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(37, 99, 235, 0.2)',
                        border: '2px solid rgba(37, 99, 235, 0.4)',
                        display: t.photoUrl ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: 'var(--brand-cyan)',
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}
                    >
                      {t.name ? t.name.split(' ').map(n => n[0]).join('').slice(0, 2) : <User size={18} />}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {t.role || 'Student'}{t.college ? ` • ${t.college}` : ''}
                      </div>
                    </div>
                  </div>

                  {t.topicTag && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: 'var(--brand-cyan)',
                      backgroundColor: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      whiteSpace: 'nowrap',
                      alignSelf: 'flex-start'
                    }}>
                      {t.topicTag}
                    </span>
                  )}
                </div>

                {/* Feedback Quote */}
                <div style={{ position: 'relative', marginTop: '6px' }}>
                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    margin: 0
                  }}>
                    "{t.feedback}"
                  </p>
                </div>
              </div>

              {/* Bottom: Verified badge & Date */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-success)' }}>
                  <CheckCircle2 size={12} /> Verified Scholar
                </span>
                <span>
                  {t.createdAt ? new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Recent'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Dots if more than itemsPerPage */}
      {testimonials.length > itemsPerPage && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '2px' }}>
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: currentIndex === idx ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: currentIndex === idx ? 'var(--brand-cyan)' : 'var(--border-subtle)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title={`Page ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Modal: Share Your Experience */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '520px',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquarePlus size={18} color="var(--brand-cyan)" />
                  Share Your GyaanSetu Experience
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Your honest feedback helps peers understand real placement preparation.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            {submitSuccess ? (
              <div style={{ padding: '36px 24px', textAlign: 'center' }}>
                <CheckCircle2 size={48} color="var(--status-success)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Thank You for Sharing!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Your review has been successfully published to the GyaanSetu dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {errorMsg && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--status-error)',
                    color: 'var(--status-error)',
                    fontSize: '0.8rem'
                  }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Gaurav"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Degree & Year / Role *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. B.Tech CSE, 4th Year"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      College / Institution
                    </label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={e => setFormData({ ...formData, college: e.target.value })}
                      placeholder="e.g. Institute of Technology"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Topic / Feature Focus *
                    </label>
                    <select
                      value={formData.topicTag}
                      onChange={e => setFormData({ ...formData, topicTag: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="Recall Arena & DSA">Recall Arena & DSA</option>
                      <option value="Mistake Memory">Mistake Memory</option>
                      <option value="Project Defense & System Design">Project Defense & System Design</option>
                      <option value="Placement Aptitude">Placement Aptitude</option>
                      <option value="Communication Gym">Communication Gym</option>
                      <option value="Core CS (OS/DBMS/CN)">Core CS (OS/DBMS/CN)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Photo URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.photoUrl}
                    onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="/testimonials/your-photo.jpg or image URL"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Your Genuine Experience / Review *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.feedback}
                    onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                    placeholder="Share how GyaanSetu's mistake tracking, practice labs, or interview simulation helped your preparation..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '2px' }}>
                    {formData.feedback.length} characters (min 10)
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(6, 182, 212, 0.05)',
                  border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                  <input
                    type="checkbox"
                    id="consentCheckbox"
                    checked={formData.consent}
                    onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <label htmlFor="consentCheckbox" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
                    I give explicit consent for my genuine review, student details, and provided profile photo to be displayed publicly on the GyaanSetu platform.
                  </label>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-outline btn-sm"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submitting || !formData.consent}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Testimonial'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
