import React from 'react';
import { Zap, Coins, ShoppingCart, ArrowRight, User, FileText, DollarSign, LogOut } from 'lucide-react';
import logoImg from '../assets/audex-ai-logo.png';

export default function Navbar({ user, onLogout, onNavigateToHistory, onNavigateToModelAuditor, onNavigateToMarketIntel, onNavigateToLanding, onNavigateToStep1, onNavigateToSignIn, activeView }) {
  const [activeSection, setActiveSection] = React.useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleClose = () => setIsUserMenuOpen(false);
    document.addEventListener('click', handleClose);
    return () => {
      document.removeEventListener('click', handleClose);
    };
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
  const credits = user?.credits || { starter: 0, pro: 0, proMax: 0 };
  const totalCredits = (credits.starter || 0) + (credits.pro || 0) + (credits.proMax || 0);

  const handlePricingScroll = (e) => {
    e.preventDefault();
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

  return (
    <header className="navbar">
      <div className="container">
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLanding(); }} className="brand">
          <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
          <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
        </a>
        <style>{`
          .nav-links .nav-link {
            position: relative;
            padding-bottom: 6px;
          }
          .nav-links .nav-link.active {
            color: var(--color-green-primary) !important;
            font-weight: 600 !important;
          }
          .nav-links .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: var(--color-green-primary);
            border-radius: 999px;
            transform: scaleX(0);
            transform-origin: center;
            transition: transform 220ms ease;
          }
          .nav-links .nav-link.active::after {
            transform: scaleX(1);
          }
          
          .user-menu-container {
            position: relative;
            display: inline-block;
            margin-left: 4px;
          }
          .user-menu-trigger {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: var(--color-text-secondary);
            font-weight: 500;
            background: none;
            border: none;
            cursor: pointer;
            padding: 6px 12px;
            border-radius: 9999px;
            transition: all 200ms ease;
          }
          .user-menu-trigger:hover {
            background-color: var(--color-bg-accent);
            color: var(--color-text-primary);
          }
          .user-menu-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 8px;
            width: 200px;
            background-color: #FFFFFF;
            border: 1px solid var(--color-border);
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
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
            padding: 10px 12px;
            font-size: 13px;
            font-weight: 600;
            color: var(--color-text-primary);
          }
          .user-menu-divider {
            height: 1px;
            background-color: var(--color-border);
            margin: 6px 0;
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
        `}</style>
        <nav className="nav-links">
          <a href="#how-it-works" onClick={(e) => {
            e.preventDefault();
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
          }} className={`nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`}>How it works</a>
          <a href="#pricing" onClick={handlePricingScroll} className={`nav-link ${activeSection === 'pricing' ? 'active' : ''}`}>Pricing</a>
          <button onClick={onNavigateToMarketIntel} className={`nav-link ${activeSection === 'market_intel' ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Market Intel
          </button>
          <button onClick={onNavigateToHistory} className={`nav-link ${activeSection === 'history' ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Reports History
          </button>
          <button onClick={onNavigateToModelAuditor} className={`nav-link ${activeSection === 'model_auditor' ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-green-primary)', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Model Auditor <Zap size={14} stroke="currentColor" strokeWidth={2} />
          </button>
        </nav>
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
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
                <Coins className="coin-icon" size={16} style={{ animation: 'pulse 2s infinite' }} />
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '12px',
                  padding: '8px',
                  borderRadius: '6px',
                  fontWeight: '600'
                }}>
                  <ShoppingCart size={14} /> Add Credits / Upgrade
                </a>
              </div>
            </div>
          )}
          {user ? (
            <>
              <button onClick={onLogout} className="btn btn-outline" style={{ marginRight: 0 }}>Sign out</button>
              <button onClick={onNavigateToStep1} className="btn btn-black" style={{ display: 'inline-flex', alignItems: 'center' }}>
                Start Free Audit <ArrowRight size={14} style={{ marginLeft: '4px' }} />
              </button>
              <div className="user-menu-container">
                <button 
                  onClick={toggleUserMenu} 
                  className="user-menu-trigger"
                >
                  <User size={16} />
                  <span>Hi, {user.name}</span>
                </button>
                <div className={`user-menu-dropdown ${isUserMenuOpen ? 'open' : ''}`}>
                  <div className="user-menu-header">
                    <User size={16} />
                    <span>Hi, {user.name}</span>
                  </div>
                  <div className="user-menu-divider"></div>
                  <button onClick={onNavigateToHistory} className="user-menu-item">
                    <FileText size={14} />
                    <span>Reports History</span>
                  </button>
                  <button onClick={handlePricingScroll} className="user-menu-item">
                    <Coins size={14} />
                    <span>Credits</span>
                  </button>
                  <button onClick={handlePricingScroll} className="user-menu-item">
                    <DollarSign size={14} />
                    <span>Pricing</span>
                  </button>
                  <div className="user-menu-divider"></div>
                  <button onClick={onLogout} className="user-menu-item logout-item">
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button onClick={onNavigateToSignIn} className="btn btn-outline" style={{ marginRight: 0 }}>Sign in</button>
              <button onClick={onNavigateToStep1} className="btn btn-black" style={{ display: 'inline-flex', alignItems: 'center' }}>
                Start Free Audit <ArrowRight size={14} style={{ marginLeft: '4px' }} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
