import React, { useState } from 'react';
import blockchainMeshImg from '../assets/blockchain_mesh.png';

export function SignInView({
  authError,
  setAuthError,
  authMessage,
  setAuthMessage,
  authLoading,
  onAuthSubmit,
  onNavigateToView
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuthSubmit({ email, password }, 'login');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left Column - Form */}
        <div className="auth-left">
          <button 
            type="button" 
            onClick={() => { onNavigateToView('landing'); setAuthError(null); setAuthMessage(null); }} 
            className="auth-brand" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0' }}
          >
            <div className="auth-brand-icon">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            Credex
          </button>

          <div className="auth-content-group">
            <h2 className="auth-title">Log in to your account</h2>
            <p className="auth-subtitle">Welcome back! Please enter your details to access your dashboard.</p>

            {authMessage && (
              <div className="auth-alert-message info">
                <span>💡</span> {authMessage}
              </div>
            )}
            {authError && (
              <div className="auth-alert-message error">
                <span>⚠️</span> {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-input-group">
                <div className="auth-label-row">
                  <label className="auth-label">Password</label>
                  <button type="button" onClick={() => alert('Password reset is not configured.')} className="auth-link">Forgot password?</button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="auth-btn-submit"
                disabled={authLoading}
              >
                {authLoading ? 'Signing In...' : 'Sign In'} <span style={{ marginLeft: '4px' }}>→</span>
              </button>
            </form>

            <div className="auth-divider">OR CONTINUE WITH</div>

            <div className="auth-social-row">
              <button type="button" onClick={() => alert('Google authentication is visual-only.')} className="auth-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" onClick={() => alert('GitHub authentication is visual-only.')} className="auth-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>

          <div className="auth-footer-text">
            Don't have an account? <button type="button" onClick={() => { onNavigateToView('signup'); setAuthError(null); setAuthMessage(null); }} className="auth-footer-link">Request access</button>
          </div>
        </div>

        {/* Right Column - Testimonial */}
        <div className="auth-right auth-dark-pane">
          <div className="auth-badge-operational">
            <span className="auth-badge-dot"></span>
            System Operational
          </div>

          <div className="auth-content-group">
            <div className="auth-stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <blockquote className="auth-testimonial">
              "Join 500+ startups optimizing their AI stack. The predictive models provided by Credex have completely transformed our operational efficiency."
            </blockquote>
          </div>

          <div>
            <div className="auth-author-name">Sarah Jenkins</div>
            <div className="auth-author-role">Chief Financial Officer, TechNova</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SignUpView({
  authError,
  setAuthError,
  authMessage,
  setAuthMessage,
  authLoading,
  onAuthSubmit,
  onNavigateToView
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuthSubmit({ name, email, password }, 'register');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left Column - Marketing */}
        <div className="auth-left auth-dark-pane">
          <button 
            type="button" 
            onClick={() => { onNavigateToView('landing'); setAuthError(null); setAuthMessage(null); }} 
            className="auth-brand" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0' }}
          >
            <div className="auth-brand-icon">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            Credex
          </button>

          <div className="auth-content-group" style={{ margin: '24px 0' }}>
            <h2 className="auth-title" style={{ marginTop: '0px' }}>Algorithmic Trust.<br />Tangible Savings.</h2>
            <p className="auth-subtitle">Join the premier platform for AI-driven fiscal intelligence. Optimize your corporate spending with military-grade precision.</p>

            <div className="auth-checklist">
              <div className="auth-checklist-item">
                <span className="auth-check-circle">✓</span>
                Stop overpaying for AI
              </div>
              <div className="auth-checklist-item">
                <span className="auth-check-circle">✓</span>
                Detailed savings reports
              </div>
              <div className="auth-checklist-item">
                <span className="auth-check-circle">✓</span>
                Credex Credit eligibility
              </div>
            </div>
          </div>

          <img src={blockchainMeshImg} alt="3D Blockchain Grid Mesh illustration" className="auth-mesh-image" />
        </div>

        {/* Right Column - Form */}
        <div className="auth-right">
          <div className="auth-content-group">
            <h2 className="auth-title" style={{ marginTop: '0px' }}>Create Account</h2>
            <p className="auth-subtitle">Start optimizing your fiscal intelligence today.</p>

            {authMessage && (
              <div className="auth-alert-message info">
                <span>💡</span> {authMessage}
              </div>
            )}
            {authError && (
              <div className="auth-alert-message error">
                <span>⚠️</span> {authError}
              </div>
            )}

            <button type="button" onClick={() => alert('Google sign up is visual-only.')} className="auth-social-btn" style={{ width: '100%' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>

            <div className="auth-divider">OR</div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <label className="auth-label">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="auth-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="jane@company.com"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="auth-btn-submit"
                disabled={authLoading}
              >
                {authLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>

          <div className="auth-footer-text">
            Already have an account? <button type="button" onClick={() => { onNavigateToView('signin'); setAuthError(null); setAuthMessage(null); }} className="auth-footer-link">Log in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
