import React from 'react';
import logoImg from '../assets/audex-ai-logo.png';
import { ShieldCheck, Lock, ArrowRight, CheckCircle, Rocket } from 'lucide-react';
import { OpenAI, Claude, Gemini, Meta, DeepSeek, Mistral, GithubCopilot, Cursor, Perplexity, Google } from '@lobehub/icons';

export default function Footer({ onNavigateToStep1, onNavigateToLanding, onViewSample }) {
  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();
    onNavigateToLanding();
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        if (window.lenis) {
          window.lenis.scrollTo(el);
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };

  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
      <div className="container" style={{ padding: '64px 24px 32px' }}>
        
        <div className="premium-cta-container" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          maxWidth: '1000px',
          margin: '0 auto 64px auto',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
          textAlign: 'left'
        }}>
          {/* Left Side: Icon + Heading and Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1', minWidth: '300px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-green-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-green-primary)',
              flexShrink: 0
            }}>
              <Rocket size={22} />
            </div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '800',
                margin: '0 0 4px 0',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-title)',
                lineHeight: '1.2'
              }}>
                Ready to reduce unnecessary AI spending?
              </h3>
              <p style={{
                fontSize: '13.5px',
                color: 'var(--color-text-secondary)',
                margin: 0
              }}>
                Start your free audit in under 60 seconds.
              </p>
            </div>
          </div>

          {/* Right Side: Buttons + Caption */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '280px' }} className="cta-right-col">
            <style>{`
              @media (max-width: 768px) {
                .cta-right-col {
                  align-items: flex-start !important;
                  width: 100%;
                }
              }
            `}</style>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={onNavigateToStep1}
                className="btn btn-green"
                style={{ padding: '10px 20px', fontWeight: '700', borderRadius: '8px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Start Free Audit <ArrowRight size={14} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); onViewSample(); }}
                className="btn btn-outline"
                style={{ padding: '10px 20px', fontWeight: '700', borderRadius: '8px', fontSize: '13.5px', backgroundColor: '#FFFFFF' }}
              >
                View Sample Report
              </button>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              No credit card required • Results in under 60 seconds
            </span>
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
              <li><a href="#" onClick={(e) => { e.preventDefault(); onViewSample(); }} className="footer-link">Sample Report</a></li>
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
