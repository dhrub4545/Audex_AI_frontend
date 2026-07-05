import React from 'react';
import logoImg from '../assets/audex-ai-logo.png';
import { ShieldCheck, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { OpenAI, Claude, Gemini, Meta, DeepSeek, Mistral, GithubCopilot, Cursor, Perplexity, Google } from '@lobehub/icons';

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
    <footer className="footer" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
      <div className="container" style={{ padding: '64px 24px 32px' }}>
        
        {/* Pre-footer CTA */}
        <style>{`
          .premium-cta-container {
            background-color: rgba(255, 255, 255, 0.55);
            background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(34, 197, 94, 0.02) 100%);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(34, 197, 94, 0.2);
            border-radius: 72px;
            padding: 24px 64px;
            text-align: center;
            margin-bottom: 64px;
            position: relative;
            overflow: hidden;
            box-shadow: 
              0 24px 64px -12px rgba(34, 197, 94, 0.06),
              0 8px 24px -8px rgba(0, 0, 0, 0.03),
              inset 0 1px 2px rgba(255, 255, 255, 0.8),
              inset 0 -1px 1px rgba(34, 197, 94, 0.05);
            transition: all 350ms ease;
            max-width: 900px;
            margin-left: auto;
            margin-right: auto;
          }
          .premium-cta-container:hover {
            transform: translateY(-2px);
            box-shadow: 
              0 32px 72px -16px rgba(34, 197, 94, 0.1),
              0 12px 32px -8px rgba(0, 0, 0, 0.04),
              inset 0 1px 2px rgba(255, 255, 255, 1),
              inset 0 -1px 2px rgba(34, 197, 94, 0.08);
            border-color: rgba(34, 197, 94, 0.35);
            background-color: rgba(255, 255, 255, 0.65);
          }
          .premium-cta-container::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -10%;
            width: 120%;
            height: 200%;
            background: radial-gradient(ellipse at 50% 10%, rgba(34, 197, 94, 0.06) 0%, transparent 60%);
            pointer-events: none;
            z-index: 0;
          }
          .premium-cta-content {
            position: relative;
            z-index: 1;
          }
          .premium-btn-outline {
            background-color: rgba(255, 255, 255, 0.8);
            border: 1px solid var(--color-border);
            color: var(--color-text-primary);
            transition: all 300ms ease;
          }
          .premium-btn-outline:hover {
            background-color: #FFFFFF;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border-color: rgba(34, 197, 94, 0.3);
          }
          .premium-btn-green {
            transition: all 300ms ease;
          }
          .premium-btn-green:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(34,197,94,0.25);
            filter: brightness(1.05);
          }
          @media (max-width: 768px) {
            .premium-cta-container {
              border-radius: 48px;
              padding: 32px 24px;
            }
          }
        `}</style>
        <div className="premium-cta-container">
          <div className="premium-cta-content">
            <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '4px', fontFamily: 'var(--font-title)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>Ready to reduce unnecessary AI spending?</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15.5px', marginBottom: '20px' }}>Start your first audit in under 60 seconds.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={onNavigateToStep1} className="btn btn-green premium-btn-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', fontSize: '15px' }}>
                Start Free Audit <ArrowRight size={18} />
              </button>
              <button onClick={(e) => { e.preventDefault(); alert('Sample report page is not configured.'); }} className="btn btn-outline premium-btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', fontSize: '15px' }}>
                View Sample Report
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', color: 'var(--color-text-muted)', fontSize: '12.5px', flexWrap: 'wrap', opacity: 0.9 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} /> No credit card required</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={13} /> Secure processing</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={13} /> Results in under 60 seconds</span>
            </div>
          </div>
        </div>

        {/* Works with section */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>Works with leading AI providers</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', color: 'var(--color-text-secondary)', opacity: 0.7 }}>
            <OpenAI size={24} />
            <Claude size={24} />
            <Gemini size={24} />
            <Meta size={24} />
            <DeepSeek size={24} />
            <Mistral size={24} />
            <GithubCopilot size={24} />
            <Cursor size={24} />
            <Perplexity size={24} />
            <Google size={24} />
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--color-border)', marginBottom: '64px' }}></div>

        <div className="footer-grid">
          {/* Col 1: Brand */}
          <div className="footer-brand">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLanding(); }} className="brand" style={{ marginBottom: '16px', display: 'inline-flex' }}>
              <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
              <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
            </a>
            <p className="footer-description" style={{ marginBottom: '24px' }}>
              Enterprise AI Spend Intelligence for engineering and finance teams.
            </p>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-muted)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' }}><ShieldCheck size={14} /> Privacy First</div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600' }}><Lock size={14} /> Enterprise Ready</div>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="footer-links-col">
            <span className="footer-links-title">Platform</span>
            <ul className="footer-links">
              <li><button onClick={onNavigateToStep1} className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Model Auditor</button></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Market Intelligence route pending.'); }} className="footer-link">Market Intelligence</a></li>
              <li><a href="#pricing" onClick={(e) => handleScrollToSection(e, 'pricing')} className="footer-link">Pricing</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Sample report page is not configured.'); }} className="footer-link">Sample Report</a></li>
              <li><a href="#how-it-works" onClick={(e) => handleScrollToSection(e, 'how-it-works')} className="footer-link">How it Works</a></li>
              <li><button onClick={onNavigateToStep1} className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, color: 'var(--color-green-primary)', fontWeight: '600' }}>Start Free Audit</button></li>
            </ul>
          </div>

          {/* Col 3: Trust & Legal */}
          <div className="footer-links-col">
            <span className="footer-links-title">Trust & Legal</span>
            <ul className="footer-links">
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy Policy is placeholder only.'); }} className="footer-link">Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Terms of Service are placeholder only.'); }} className="footer-link">Terms of Service</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('AI Ethics details are placeholder only.'); }} className="footer-link">AI Ethics</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Security is placeholder only.'); }} className="footer-link">Security</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Compliance is placeholder only.'); }} className="footer-link">Compliance</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); alert('Support is placeholder only.'); }} className="footer-link">Contact Support</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '64px', borderTop: 'none', paddingTop: 0 }}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            &copy; {new Date().getFullYear()} Audex AI. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Version 1.0.0</span>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy Policy is placeholder only.'); }} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Privacy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Terms of Service are placeholder only.'); }} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
