import React from 'react';
import { Zap, Coins, ShoppingCart, ArrowRight, User, FileText, DollarSign, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import logoImg from '../assets/audex-ai-logo.png';

export default function Navbar({ user, onLogout, onNavigateToHistory, onNavigateToModelAuditor, onNavigateToMarketIntel, onNavigateToLanding, onNavigateToStep1, onNavigateToSignIn, onNavigateToProfile, activeView }) {
  const [activeSection, setActiveSection] = React.useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleClose = () => {
      setIsUserMenuOpen(false);
    };
    document.addEventListener('click', handleClose);
    return () => {
      document.removeEventListener('click', handleClose);
    };
  }, []);

  // Close mobile menu on resize to desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  React.useEffect(() => {
    if (activeView && activeView !== 'landing') {
      setActiveSection(activeView);
      return;
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        } else {
          setActiveSection((prev) => (prev === entry.target.id ? '' : prev));
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const howItWorksEl = document.getElementById('how-it-works');
    if (howItWorksEl) observer.observe(howItWorksEl);

    const pricingEl = document.getElementById('pricing');
    if (pricingEl) observer.observe(pricingEl);

    return () => {
      observer.disconnect();
    };
  }, [activeView]);

  const handlePricingScroll = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    onNavigateToLanding();
    setTimeout(() => {
      const el = document.getElementById('pricing');
      if (el) {
        if (window.lenis) {
          window.lenis.scrollTo(el);
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const handleHowItWorksScroll = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    onNavigateToLanding();
    setTimeout(() => {
      const el = document.getElementById('how-it-works');
      if (el) {
        if (window.lenis) {
          window.lenis.scrollTo(el);
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const userPlan = (user?.plan || '').toLowerCase();
  const planName = user ? (userPlan === 'enterprise' ? 'Enterprise Plan' : (userPlan === 'pro' ? 'Professional Plan' : 'Free Plan')) : '';
  const badgeColor = user ? (userPlan === 'enterprise' ? '#8B5CF6' : (userPlan === 'pro' ? '#10B981' : '#64748B')) : '';
  const bgColor = user ? (userPlan === 'enterprise' ? '#F5F3FF' : (userPlan === 'pro' ? '#ECFDF5' : '#F1F5F9')) : '';

  return (
    <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px', position: 'relative' }}>
        
        {/* Brand Logo */}
        <a href="/" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigateToLanding(); }} className="nav-brand" title="Audex AI Home">
          <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
          <span className="brand-name">
            Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span>
          </span>
        </a>

        <style>{`
          /* Desktop Links */
          .desktop-nav {
            display: flex;
            align-items: center;
            gap: 22px;
            margin-left: 36px;
            margin-right: auto;
          }
          @media (max-width: 1180px) {
            .desktop-nav {
              gap: 14px !important;
              margin-left: 18px !important;
            }
          }
          .nav-link {
            position: relative;
            padding-bottom: 6px;
            font-size: 13.5px;
            white-space: nowrap;
            text-decoration: none;
            color: var(--color-text-secondary);
            font-weight: 500;
            transition: color 180ms ease;
          }
          .nav-link:hover {
            color: var(--color-text-primary);
          }
          .nav-link.active {
            color: var(--color-green-primary) !important;
            font-weight: 600 !important;
          }
          .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2.5px;
            background-color: var(--color-green-primary);
            border-radius: 999px;
            transform: scaleX(0);
            transform-origin: center;
            transition: transform 220ms ease;
          }
          .nav-link.active::after {
            transform: scaleX(1);
          }

          /* User menu dropdown */
          .user-menu-container {
            position: relative;
            display: inline-block;
          }
          .user-menu-trigger {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: var(--color-text-secondary);
            font-weight: 600;
            background: none;
            border: 1px solid var(--color-border);
            cursor: pointer;
            padding: 6px 12px;
            border-radius: 9999px;
            transition: all 180ms ease;
          }
          .user-menu-trigger:hover {
            background-color: var(--color-bg-accent);
            color: var(--color-text-primary);
            border-color: #CBD5E1;
          }
          .user-menu-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            width: 210px;
            background-color: #FFFFFF;
            border: 1px solid var(--color-border);
            border-radius: 12px;
            box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
            padding: 8px;
            z-index: 1100;
            display: flex;
            flex-direction: column;
            gap: 2px;
            opacity: 0;
            transform: translateY(-8px);
            pointer-events: none;
            transition: opacity 200ms ease, transform 200ms ease;
          }
          .user-menu-dropdown.open {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
          }
          .user-menu-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 700;
            color: var(--color-text-primary);
          }
          .user-menu-divider {
            height: 1px;
            background-color: var(--color-border);
            margin: 4px 0;
          }
          .user-menu-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            font-size: 12.5px;
            color: var(--color-text-secondary);
            background: none;
            border: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            border-radius: 6px;
            font-weight: 500;
            transition: all 150ms ease;
            text-decoration: none;
          }
          .user-menu-item:hover {
            background-color: var(--color-bg-accent);
            color: var(--color-text-primary);
          }
          .user-menu-item.logout-item {
            color: #EF4444;
          }
          .user-menu-item.logout-item:hover {
            background-color: #FEF2F2;
            color: #DC2626;
          }

          /* Responsive Breakpoint Visibility */
          .mobile-menu-btn {
            display: none;
            background: none;
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 8px;
            cursor: pointer;
            color: var(--color-text-primary);
            align-items: center;
            justify-content: center;
            transition: background 150ms ease;
          }
          .mobile-menu-btn:hover {
            background-color: var(--color-bg-accent);
          }

          @media (max-width: 991px) {
            .desktop-nav {
              display: none !important;
            }
            .desktop-plan-badge {
              display: none !important;
            }
            .mobile-menu-btn {
              display: flex !important;
            }
          }

          @media (max-width: 520px) {
            .desktop-start-btn {
              display: none !important;
            }
          }

          /* Mobile Slide Down Menu */
          .mobile-nav-panel {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--color-border);
            box-shadow: 0 20px 30px rgba(0, 0, 0, 0.08);
            padding: 20px 24px 28px 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            z-index: 1000;
            max-height: calc(100vh - 65px);
            overflow-y: auto;
            animation: slideDownMobile 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes slideDownMobile {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .mobile-link-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 14px;
            font-size: 15px;
            font-weight: 600;
            color: var(--color-text-primary);
            text-decoration: none;
            border-radius: 10px;
            transition: background 150ms ease;
          }
          .mobile-link-item:hover, .mobile-link-item.active {
            background-color: var(--color-bg-accent);
            color: var(--color-green-primary);
          }
        `}</style>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Audex AI Main Navigation">
          <a href="#how-it-works" onClick={handleHowItWorksScroll} className={`nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`} title="How Audex AI Works">
            How it works
          </a>
          <a href="#pricing" onClick={handlePricingScroll} className={`nav-link ${activeSection === 'pricing' ? 'active' : ''}`} title="Audex AI Pricing & Plans">
            Pricing
          </a>
          <a href="/?view=market-intel" onClick={(e) => { e.preventDefault(); onNavigateToMarketIntel(); }} className={`nav-link ${activeSection === 'market_intel' ? 'active' : ''}`} title="Enterprise AI Market Intelligence Leaderboard">
            Market Intel
          </a>
          <a href="/?view=history" onClick={(e) => { e.preventDefault(); onNavigateToHistory(); }} className={`nav-link ${activeSection === 'history' ? 'active' : ''}`} title="Saved AI Audit Reports History">
            Reports History
          </a>
          <a href="/?view=model-auditor" onClick={(e) => { e.preventDefault(); onNavigateToModelAuditor(); }} className={`nav-link ${activeSection === 'model_auditor' ? 'active' : ''}`} style={{ color: 'var(--color-green-primary)', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }} title="Benchmark 570+ Models in Live AI Model Auditor">
            Model Auditor <span style={{ fontSize: '9px', fontWeight: '800', backgroundColor: '#F5F3FF', color: '#7C3AED', padding: '1px 5px', borderRadius: '4px', border: '1px solid #DDD6FE', letterSpacing: '0.04em' }}>ENT</span>
          </a>
        </nav>

        {/* Action Controls & User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Plan Badge (Desktop Only) */}
          {user && (
            <div className="desktop-plan-badge" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span 
                onClick={() => onNavigateToProfile ? onNavigateToProfile() : null}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: bgColor,
                  border: `1px solid ${badgeColor}`,
                  color: badgeColor,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontWeight: '700',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'opacity 0.15s ease'
                }}
                title="View Subscription & Account Details"
              >
                ✦ {planName}
              </span>
            </div>
          )}

          {/* Desktop/Tablet CTA Button */}
          <button 
            onClick={() => { setIsMobileMenuOpen(false); onNavigateToStep1(); }} 
            className="btn btn-black desktop-start-btn" 
            style={{ display: 'inline-flex', alignItems: 'center', fontSize: '13px', padding: '8px 16px', borderRadius: '8px' }}
          >
            Start Free Audit <ArrowRight size={14} style={{ marginLeft: '4px' }} />
          </button>

          {/* User Profile Dropdown (Desktop) */}
          {user ? (
            <div className="user-menu-container desktop-plan-badge">
              <button 
                onClick={toggleUserMenu} 
                className="user-menu-trigger"
              >
                <User size={15} />
                <span>Hi, {user.name}</span>
              </button>
              <div className={`user-menu-dropdown ${isUserMenuOpen ? 'open' : ''}`}>
                <div className="user-menu-header">
                  <User size={15} />
                  <span>Hi, {user.name}</span>
                </div>
                <div className="user-menu-divider"></div>
                <button onClick={() => { setIsUserMenuOpen(false); onNavigateToProfile ? onNavigateToProfile() : null; }} className="user-menu-item">
                  <ShieldCheck size={14} color="#10B981" />
                  <span style={{ fontWeight: '600', color: '#0F172A' }}>Account &amp; Plan</span>
                </button>
                <button onClick={() => { setIsUserMenuOpen(false); onNavigateToHistory(); }} className="user-menu-item">
                  <FileText size={14} />
                  <span>Reports History</span>
                </button>
                <button onClick={(e) => { setIsUserMenuOpen(false); handlePricingScroll(e); }} className="user-menu-item">
                  <DollarSign size={14} />
                  <span>Pricing &amp; UPI</span>
                </button>
                <div className="user-menu-divider"></div>
                <button onClick={() => { setIsUserMenuOpen(false); onLogout(); }} className="user-menu-item logout-item">
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => { setIsMobileMenuOpen(false); onNavigateToSignIn(); }} 
              className="btn btn-outline desktop-plan-badge" 
              style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px' }}
            >
              Sign in
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Slide-Down Navigation Panel */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-panel">
          
          {/* User Card if Logged In */}
          {user ? (
            <div style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>Hi, {user.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{user.email || 'Logged in'}</div>
                </div>
              </div>
              <span style={{
                backgroundColor: bgColor,
                border: `1px solid ${badgeColor}`,
                color: badgeColor,
                padding: '3px 8px',
                borderRadius: '9999px',
                fontWeight: '700',
                fontSize: '10px',
                textTransform: 'uppercase'
              }}>
                ✦ {planName}
              </span>
            </div>
          ) : null}

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {user && (
              <a 
                href="/?view=profile" 
                onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigateToProfile ? onNavigateToProfile() : null; }} 
                className={`mobile-link-item ${activeSection === 'profile' ? 'active' : ''}`}
                style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: '750' }}>
                  <ShieldCheck size={16} color="#10B981" /> My Account &amp; Plan
                </span>
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>›</span>
              </a>
            )}

            <a 
              href="#how-it-works" 
              onClick={handleHowItWorksScroll} 
              className={`mobile-link-item ${activeSection === 'how-it-works' ? 'active' : ''}`}
            >
              <span>How it works</span>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>›</span>
            </a>
            
            <a 
              href="#pricing" 
              onClick={handlePricingScroll} 
              className={`mobile-link-item ${activeSection === 'pricing' ? 'active' : ''}`}
            >
              <span>Pricing & Plans</span>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>›</span>
            </a>

            <a 
              href="/?view=market-intel" 
              onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigateToMarketIntel(); }} 
              className={`mobile-link-item ${activeSection === 'market_intel' ? 'active' : ''}`}
            >
              <span>Enterprise Market Intel</span>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>›</span>
            </a>

            <a 
              href="/?view=history" 
              onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigateToHistory(); }} 
              className={`mobile-link-item ${activeSection === 'history' ? 'active' : ''}`}
            >
              <span>Reports History</span>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>›</span>
            </a>

            <a 
              href="/?view=model-auditor" 
              onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigateToModelAuditor(); }} 
              className={`mobile-link-item ${activeSection === 'model_auditor' ? 'active' : ''}`}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-green-primary)' }}>
                Model Auditor <span style={{ fontSize: '9px', fontWeight: '800', backgroundColor: '#F5F3FF', color: '#7C3AED', padding: '1px 5px', borderRadius: '4px', border: '1px solid #DDD6FE' }}>ENT</span>
              </span>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>›</span>
            </a>
          </div>

          {/* Action Buttons in Mobile Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); onNavigateToStep1(); }} 
              className="btn btn-black" 
              style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '700' }}
            >
              Start Free Audit <ArrowRight size={15} style={{ marginLeft: '4px' }} />
            </button>

            {user ? (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onLogout(); }} 
                className="btn btn-outline" 
                style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '13px', color: '#EF4444', borderColor: '#FCA5A5' }}
              >
                <LogOut size={14} style={{ marginRight: '6px' }} /> Sign Out
              </button>
            ) : (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onNavigateToSignIn(); }} 
                className="btn btn-outline" 
                style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '13px' }}
              >
                Sign in to Account
              </button>
            )}
          </div>

        </div>
      )}

    </header>
  );
}

