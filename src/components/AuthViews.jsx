import React, { useState } from 'react';
import audexLogoImg from '../assets/Audex-outline.jpg';
import audexLogoIcon from '../assets/audex-ai-logo.png'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  BarChart3,
  ShieldCheck,
  Info,
  CircleAlert
} from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

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
            <img src={audexLogoIcon} alt="Audex AI Logo" style={{ width: "50px", height: "auto" }} />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>

          </button>

          <div className="auth-content-group">
            <h2 className="auth-title">Welcome back 👋</h2>
            <p className="auth-subtitle">Continue to your AI audit dashboard.</p>

            {authMessage && (
              <div className="auth-alert-message info">
                <Info size={18} /> {authMessage}
              </div>
            )}
            {authError && (
              <div className="auth-alert-message error">
                <CircleAlert size={18} /> {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail className="auth-input-icon" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <div className="auth-label-row">
                  <label className="auth-label">Password</label>
                  <button type="button" onClick={() => alert('Password reset is not configured.')} className="auth-link">Forgot password?</button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock className="auth-input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-input-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-btn-submit"
                disabled={authLoading}
              >
                {authLoading ? 'Signing In...' : 'Log In'} 
              </button>
            </form>

            <div className="auth-divider">OR CONTINUE WITH</div>

            <div className="auth-social-row">
              <button type="button" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'} className="auth-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button type="button" onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'} className="auth-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>

          <div className="auth-footer-text">
            Don't have an account? <button type="button" onClick={() => { onNavigateToView('signup'); setAuthError(null); setAuthMessage(null); }} className="auth-footer-link">Request access</button>
          </div>
        </div>

        {/* Right Column - Premium Marketing Showcase */}
        <div className="auth-right">
          <div className="auth-badge-operational">
            <span className="auth-badge-dot"></span>
            System Operational
          </div>

          <div className="auth-content-group">
            <h3 className="auth-marketing-title">
              AI audit insights that{" "}
              <span style={{ color: "var(--color-green-primary)" }}>
                drive real savings
              </span>
            </h3>
            <p className="auth-marketing-subtitle">
              Join 500+ companies optimizing their AI spending with next-gen models, detailed reports, and actionable cost limits.
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon-container">
                  <Zap size={20} />
                </div>
                <div className="auth-feature-content">
                  <div className="auth-feature-title">Cut unnecessary spend</div>
                  <div className="auth-feature-desc">Identify unused subscriptions and optimize models in seconds.</div>
                </div>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon-container">
                  <BarChart3 size={20} />
                </div>
                <div className="auth-feature-content">
                  <div className="auth-feature-title">Actionable recommendations</div>
                  <div className="auth-feature-desc">Predictive modeling suggestions customized for your application workflows.</div>
                </div>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon-container">
                  <ShieldCheck size={20} />
                </div>
                <div className="auth-feature-content">
                  <div className="auth-feature-title">100% secure & private</div>
                  <div className="auth-feature-desc">Your raw workspace usage data is never stored on our servers.</div>
                </div>
              </div>
            </div>


          </div>

          <img src={audexLogoImg} alt="Audex AI Background Graphic" className="auth-mesh-image" />
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
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuthSubmit({ name, email, password }, 'register');
  };

  return (
    <div className="auth-page-2">
      <div className="auth-card-2">
        {/* Left Column - Form */}
        <div className="auth-left-2">
          <button
            type="button"
            onClick={() => { onNavigateToView('landing'); setAuthError(null); setAuthMessage(null); }}
            className="auth-brand-2"
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0' }}
          >
            <img src={audexLogoIcon} alt="Audex AI Logo" style={{ width: "50px", height: "auto" }} />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>

          </button>

          <div className="auth-content-group-2">
            <h2 className="auth-title-2">Create Account</h2>
            <p className="auth-subtitle-2">Start optimizing your fiscal intelligence today.</p>

            {authMessage && (
              <div className="auth-alert-message info">
                <Info size={18} /> {authMessage}
              </div>
            )}
            {authError && (
              <div className="auth-alert-message error">
                <CircleAlert size={18} /> {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-2">
              <div className="auth-input-group">
                <label className="auth-label">Name</label>
                <div style={{ position: 'relative' }}>
                  <User className="auth-input-icon" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className="auth-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Work Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail className="auth-input-icon" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="jane@company.com"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock className="auth-input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-input-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-btn-submit"
                disabled={authLoading}
              >
                {authLoading ? 'Creating Account...' : 'Create Account'} 
              </button>
            </form>

            <div className="auth-divider">OR CONTINUE WITH</div>

            <div className="auth-social-row">
              <button type="button" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'} className="auth-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button type="button" onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'} className="auth-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>

          <div className="auth-footer-text">
            Already have an account? <button type="button" onClick={() => { onNavigateToView('signin'); setAuthError(null); setAuthMessage(null); }} className="auth-footer-link">Log in</button>
          </div>
        </div>

        {/* Right Column - Premium Marketing Showcase */}
        <div className="auth-right">
          <div className="auth-badge-operational">
            <span className="auth-badge-dot"></span>
            System Operational
          </div>

          <div className="auth-content-group">
            <h3 className="auth-marketing-title">
              Start optimizing your{" "}
              <span style={{ color: "var(--color-green-primary)" }}>
                AI stack intelligently
              </span>
            </h3>
            <p className="auth-marketing-subtitle">
              Create your Audex AI workspace and discover cost-saving opportunities across your AI subscriptions, APIs, and models in just a few minutes.
            </p>

            <div className="auth-features-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon-container">
                  <Zap size={20} />
                </div>
                <div className="auth-feature-content">
                  <div className="auth-feature-title">Optimize every AI subscription</div>
                  <div className="auth-feature-desc">Analyze your AI tools, eliminate unnecessary spending, and maximize value across your entire stack.</div>
                </div>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon-container">
                  <BarChart3 size={20} />
                </div>
                <div className="auth-feature-content">
                  <div className="auth-feature-title">Receive intelligent recommendations</div>
                  <div className="auth-feature-desc">Compare providers, pricing, and model capabilities to choose the best AI solution for every workload.</div>
                </div>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon-container">
                  <ShieldCheck size={20} />
                </div>
                <div className="auth-feature-content">
                  <div className="auth-feature-title">Enterprise-ready security</div>
                  <div className="auth-feature-desc">Your workspace data remains encrypted, private, and securely processed throughout every audit.</div>
                </div>
              </div>
            </div>
          </div>

          <img src={audexLogoImg} alt="Audex AI Background Graphic" className="auth-mesh-image-2" />
        </div>
      </div>
    </div>
  );
}
