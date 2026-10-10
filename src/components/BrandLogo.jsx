import React from 'react';

export default function BrandLogo({ size = 'default', showTagline = false, className = '', useImage = true }) {
  const iconSizes = {
    small: 34,
    default: 44,
    large: 64,
    hero: 96
  };

  const dim = iconSizes[size] || 44;

  return (
    <div className={`brand-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: size === 'small' ? '10px' : '14px' }}>
      {/* Exact Logo Image provided by User */}
      <div style={{
        position: 'relative',
        width: `${dim}px`,
        height: `${dim}px`,
        borderRadius: size === 'hero' ? '20px' : size === 'small' ? '8px' : '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(6, 182, 212, 0.35)',
        border: '1.5px solid rgba(56, 189, 248, 0.4)',
        flexShrink: 0,
        backgroundColor: '#070d1e'
      }}>
        <img
          src="/logo.jpg"
          alt="GyaanSetu Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: size === 'small' ? '1.2rem' : size === 'large' ? '2.1rem' : size === 'hero' ? '2.6rem' : '1.5rem',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          display: 'flex',
          alignItems: 'baseline'
        }}>
          <span style={{ color: 'var(--text-primary)' }}>Gyaan</span>
          <span style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginLeft: '1px'
          }}>
            Setu
          </span>
        </div>
        {showTagline && (
          <span style={{
            fontSize: size === 'hero' ? '0.95rem' : size === 'large' ? '0.85rem' : '0.72rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            letterSpacing: '0.02em',
            marginTop: '3px'
          }}>
            Bridge the Gap Between Learning and Success
          </span>
        )}
      </div>
    </div>
  );
}
