import React from 'react';
import logoImg from '../assets/audex-ai-logo.png';

export default function Navbar({ user, onLogout, onNavigateToHistory, onNavigateToModelAuditor, onNavigateToMarketIntel, onNavigateToLanding, onNavigateToStep1, onNavigateToSignIn }) {
  const credits = user?.credits || { starter: 0, pro: 0, proMax: 0 };
  const totalCredits = (credits.starter || 0) + (credits.pro || 0) + (credits.proMax || 0);

  const handlePricingScroll = (e) => {
    e.preventDefault();
    onNavigateToLanding();
    setTimeout(() => {
      const el = document.getElementById('pricing');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="navbar">
      <div className="container">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLanding(); }} className="brand">
          <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
          <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
        </a>
        <nav className="nav-links">
          <a href="#how-it-works" onClick={(e) => {
            e.preventDefault();
            onNavigateToLanding();
            setTimeout(() => {
              const el = document.getElementById('how-it-works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }} className="nav-link">How it works</a>
          <a href="#pricing" onClick={handlePricingScroll} className="nav-link">Pricing</a>
          <button onClick={onNavigateToMarketIntel} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Market Intel
          </button>
          <button onClick={onNavigateToHistory} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Reports History
          </button>
          <button onClick={onNavigateToModelAuditor} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-green-primary)', fontWeight: 'bold' }}>
            Model Auditor ⚡
          </button>
        </nav>
        <div className="nav-actions">
          {user && (
            <div className="coin-dropdown-container" style={{ position: 'relative', display: 'inline-block', marginRight: '16px' }}>
              <button className="coin-btn" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                color: '#B45309',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontWeight: '600',
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <span className="coin-icon" style={{ fontSize: '16px', animation: 'pulse 2s infinite' }}>🪙</span>
                <span>{totalCredits} Credits</span>
              </button>
              <div className="coin-dropdown-menu" style={{
                display: 'none',
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '260px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-xl)',
                padding: '16px',
                zIndex: 1000,
                textAlign: 'left'
              }}>
                <div style={{ fontWeight: '700', fontSize: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                  Credit Balance Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Starter Credits:</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{credits.starter}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '-6px' }}>
                    (Limits auditing to max 4 models)
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Pro Credits:</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{credits.pro}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '-6px' }}>
                    (Access to all models)
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Pro Max Credits:</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{credits.proMax}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '-6px' }}>
                    (Access to all models + Consultant)
                  </div>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '12px 0' }}></div>
                <a href="#pricing" onClick={handlePricingScroll} style={{
                  display: 'block',
                  textAlign: 'center',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '12px',
                  padding: '8px',
                  borderRadius: '6px',
                  fontWeight: '600'
                }}>
                  🛒 Add Credits / Upgrade
                </a>
              </div>
            </div>
          )}
          {user ? (
            <>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginRight: '8px' }}>Hi, {user.name}</span>
              <button onClick={onLogout} className="btn btn-outline" style={{ marginRight: '8px' }}>Sign out</button>
            </>
          ) : (
            <button onClick={onNavigateToSignIn} className="btn btn-outline" style={{ marginRight: '8px' }}>Sign in</button>
          )}
          <button onClick={onNavigateToStep1} className="btn btn-black">
            Start Free Audit <span style={{ marginLeft: '4px' }}>→</span>
          </button>
        </div>
      </div>
    </header>
  );
}
