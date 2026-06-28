import React from 'react';
import logoImg from '../assets/audex-ai-logo.png';

export default function Footer({ onNavigateToStep1, onNavigateToLanding }) {
  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();
    onNavigateToLanding();
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLanding(); }} className="brand">
              <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
              <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
            </a>
            <p className="footer-description">
              AI-powered spend auditing for engineering teams. Identify waste, cut redundancy, and save thousands — in 60 seconds.
            </p>
            <div className="footer-badges">
              <span className="badge badge-blue">🔒 SOC 2 compliant</span>
              <span className="badge badge-green">🇪🇺 GDPR ready</span>
            </div>
          </div>

          <div className="footer-links-col">
            <span className="footer-links-title">Product</span>
            <ul className="footer-links">
              <li><a href="#how-it-works" onClick={(e) => handleScrollToSection(e, 'how-it-works')} className="footer-link">How it works</a></li>
              <li><a href="#pricing" onClick={(e) => handleScrollToSection(e, 'pricing')} className="footer-link">Pricing</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Sample report page is not configured.'); }} className="footer-link">Sample report</a></li>
              <li><button onClick={onNavigateToStep1} className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Start audit</button></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <span className="footer-links-title">Legal</span>
            <ul className="footer-links">
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy Policy is placeholder only.'); }} className="footer-link">Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Terms of Service are placeholder only.'); }} className="footer-link">Terms of Service</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('AI Ethics details are placeholder only.'); }} className="footer-link">AI Ethics</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Support is placeholder only.'); }} className="footer-link">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            &copy; {new Date().getFullYear()} Audex AI. All rights reserved.
          </p>
          <button onClick={onNavigateToStep1} className="btn btn-green" style={{ fontSize: '12px', padding: '8px 16px' }}>
            🚀 Start free audit
          </button>
        </div>
      </div>
    </footer>
  );
}
