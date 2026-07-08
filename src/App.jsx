import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingView from './components/LandingView';
import WizardFlow from './components/WizardFlow';
import ResultsView from './components/ResultsView';
import HistoryView from './components/HistoryView';
import { SignInView, SignUpView } from './components/AuthViews';
import { LoadingIndicator, PurchaseSuccessModal } from './components/CommonComponents';
import ModelAuditorView from './components/ModelAuditorView';
import MarketIntelView from './components/MarketIntelView';
import ComparisonView from './components/ComparisonView';
import ActionPlanView from './components/ActionPlanView';
import FreeResultsView from './components/FreeResultsView';

const INITIAL_TOOLS = [
  { id: 'GitHub Copilot', name: 'GitHub Copilot', desc: 'GitHub AI assistant', icon: '🤖', type: 'subscription', plans: ['Copilot Free', 'Copilot Pro', 'Copilot Pro+'], defaultPlan: 'Copilot Pro', defaultSeats: 5 },
  { id: 'Claude', name: 'Claude', desc: 'Anthropic assistant', icon: '🟧', type: 'subscription', plans: ['Free', 'Claude Pro', 'Claude Max 5x', 'Claude Max 20x', 'Team Standard', 'Team Premium', 'Enterprise'], defaultPlan: 'Claude Pro', defaultSeats: 4 },
  { id: 'ChatGPT', name: 'ChatGPT', desc: 'OpenAI ChatGPT', icon: '🟢', type: 'subscription', plans: ['Free', 'ChatGPT Go', 'ChatGPT Plus', 'ChatGPT Pro', 'Business'], defaultPlan: 'ChatGPT Plus', defaultSeats: 1 },
  { id: 'Gemini', name: 'Gemini', desc: 'Google\'s AI model', icon: '🔷', type: 'subscription', plans: ['Free', 'AI Plus', 'AI Pro', 'AI Ultra'], defaultPlan: 'Free', defaultSeats: 1 },
  { id: 'Windsurf', name: 'Windsurf', desc: 'AI-powered IDE', icon: '⛵', type: 'subscription', plans: ['Free', 'Pro'], defaultPlan: 'Pro', defaultSeats: 1 },
  { id: 'DeepSeek', name: 'DeepSeek', desc: 'DeepSeek assistant', icon: '🐳', type: 'subscription', plans: ['Consumer'], defaultPlan: 'Consumer', defaultSeats: 1 },
  { id: 'Mistral', name: 'Mistral', desc: 'Mistral Le Chat', icon: '🍊', type: 'subscription', plans: ['Free', 'Le Chat Pro'], defaultPlan: 'Le Chat Pro', defaultSeats: 1 },
  { id: 'Meta', name: 'Meta', desc: 'Meta AI assistant', icon: '♾️', type: 'subscription', plans: ['Free', 'Meta One Plus'], defaultPlan: 'Free', defaultSeats: 1 },
  { id: 'xAI', name: 'xAI', desc: 'xAI Grok search', icon: '🐦', type: 'subscription', plans: ['Grok Free', 'X Premium', 'SuperGrok Lite', 'SuperGrok', 'SuperGrok Heavy'], defaultPlan: 'SuperGrok', defaultSeats: 1 },
  { id: 'Perplexity', name: 'Perplexity', desc: 'AI search companion', icon: '🔍', type: 'subscription', plans: ['Free', 'Pro', 'Max'], defaultPlan: 'Pro', defaultSeats: 1 },
  { id: 'Verdent AI', name: 'Verdent AI', desc: 'Multi-agent engine', icon: '🌿', type: 'subscription', plans: ['Starter'], defaultPlan: 'Starter', defaultSeats: 1 },
  { id: 'v0', name: 'v0', desc: 'Vercel UI generator', icon: '▲', type: 'subscription', plans: ['Free', 'Premium'], defaultPlan: 'Free', defaultSeats: 1 },
  { id: 'Gamma AI', name: 'Gamma AI', desc: 'AI presentation generator', icon: '✨', type: 'subscription', plans: ['Free', 'Plus'], defaultPlan: 'Free', defaultSeats: 1 },
  { id: 'Midjourney', name: 'Midjourney', desc: 'AI image generator', icon: '🎨', type: 'subscription', plans: ['Basic', 'Standard', 'Pro'], defaultPlan: 'Basic', defaultSeats: 1 },
  { id: 'Runway', name: 'Runway', desc: 'AI video generator', icon: '🎬', type: 'subscription', plans: ['Free', 'Standard', 'Pro', 'Unlimited'], defaultPlan: 'Free', defaultSeats: 1 },
  { id: 'ElevenLabs', name: 'ElevenLabs', desc: 'AI voice generator', icon: '🗣️', type: 'subscription', plans: ['Free', 'Starter', 'Creator'], defaultPlan: 'Free', defaultSeats: 1 },
  { id: 'Suno', name: 'Suno', desc: 'AI music generator', icon: '🎵', type: 'subscription', plans: ['Free', 'Pro', 'Premier'], defaultPlan: 'Free', defaultSeats: 1 }
];

const BACKEND_URL = 'http://localhost:5000/api';

export default function App() {
  // Navigation: 'landing', 'step1', 'step2', 'step3', 'loading', 'results', 'history', 'signin', 'signup'
  const [currentView, setCurrentView] = useState('landing');

  useEffect(() => {
    const fetchSubscriptionTiers = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/audits/subscription-tiers/list`);
        if (response.ok) {
          const dynamicTools = await response.json();
          if (Array.isArray(dynamicTools) && dynamicTools.length > 0) {
            setTools(dynamicTools);
            
            // Default select the first 3 tools
            const initialSelected = dynamicTools.slice(0, 3).map(t => t.id);
            setSelectedToolIds(initialSelected);
            
            // Set initial config for the loaded tools
            const initialConfigs = {};
            dynamicTools.forEach(t => {
              initialConfigs[t.id] = [{
                id: (Date.now() + Math.random()).toString(),
                plan: t.defaultPlan || 'Free',
                seats: t.defaultSeats || 1,
                purpose: (t.id === 'GitHub Copilot' || t.id === 'Cursor' || t.id === 'Windsurf') ? 'Coding' : 'Mixed'
              }];
            });
            setToolConfigs(initialConfigs);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic subscription tiers from backend:', err);
      }
    };
    fetchSubscriptionTiers();
  }, []);

  // Google & GitHub OAuth callback detection effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Google params
    const googleToken = params.get('google_token');
    const googleUserId = params.get('google_user_id');
    const googleUserName = params.get('google_user_name');
    const googleUserEmail = params.get('google_user_email');
    const googleError = params.get('google_error');

    // GitHub params
    const githubToken = params.get('github_token');
    const githubUserId = params.get('github_user_id');
    const githubUserName = params.get('github_user_name');
    const githubUserEmail = params.get('github_user_email');
    const githubError = params.get('github_error');

    if (googleToken && googleUserId) {
      const parsedUser = {
        id: googleUserId,
        name: decodeURIComponent(googleUserName || 'Google User'),
        email: decodeURIComponent(googleUserEmail || ''),
        credits: { starter: 1, pro: 0, proMax: 0 }
      };

      // Store in localStorage
      localStorage.setItem('audex_token', googleToken);
      localStorage.setItem('audex_user', JSON.stringify(parsedUser));

      // Update React state
      setToken(googleToken);
      setUser(parsedUser);
      setAuthError(null);
      setAuthMessage('Successfully logged in with Google!');
      setCurrentView('landing');

      // Clear query params from the URL address bar
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    } else if (googleError) {
      setAuthError(`Google Sign-In failed: ${decodeURIComponent(googleError)}`);
      setCurrentView('signin');

      // Clear query params from the URL address bar
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    } else if (githubToken && githubUserId) {
      const parsedUser = {
        id: githubUserId,
        name: decodeURIComponent(githubUserName || 'GitHub User'),
        email: decodeURIComponent(githubUserEmail || ''),
        credits: { starter: 1, pro: 0, proMax: 0 }
      };

      // Store in localStorage
      localStorage.setItem('audex_token', githubToken);
      localStorage.setItem('audex_user', JSON.stringify(parsedUser));

      // Update React state
      setToken(githubToken);
      setUser(parsedUser);
      setAuthError(null);
      setAuthMessage('Successfully logged in with GitHub!');
      setCurrentView('landing');

      // Clear query params from the URL address bar
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    } else if (githubError) {
      setAuthError(`GitHub Sign-In failed: ${decodeURIComponent(githubError)}`);
      setCurrentView('signin');

      // Clear query params from the URL address bar
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
  }, []);

  // State for search and custom tools
  const [tools, setTools] = useState(INITIAL_TOOLS);
  
  // Wizard choices
  const [selectedToolIds, setSelectedToolIds] = useState(['GitHub Copilot', 'Claude', 'Gemini']);
  const [toolConfigs, setToolConfigs] = useState({
    'GitHub Copilot': [{ id: 'g1', plan: 'Copilot Pro', seats: 5, purpose: 'Coding' }],
    'Claude': [{ id: 'cl1', plan: 'Claude Pro', seats: 4, purpose: 'Writing' }],
    'Gemini': [{ id: 'gem1', plan: 'Free', seats: 1, purpose: 'Research' }]
  });
  const [teamSize, setTeamSize] = useState(3);
  const [useCase, setUseCase] = useState('Coding');
  const [optimizationGoal, setOptimizationGoal] = useState('performance');
  const [costCutPercentage, setCostCutPercentage] = useState(50);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [tokenAdjustments, setTokenAdjustments] = useState({});



  // Credit / Pricing State
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [purchasedPlanName, setPurchasedPlanName] = useState('');
  const [purchasedCreditsCount, setPurchasedCreditsCount] = useState(0);

  // Authentication state
  const [token, setToken] = useState(() => localStorage.getItem('audex_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('audex_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [authError, setAuthError] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [auditResult, setAuditResult] = useState(null);
  const [pastAudits, setPastAudits] = useState([]);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (auditResult && auditResult.savings && auditResult.savings.recommendations) {
      const initial = {};
      auditResult.savings.recommendations.forEach((rec, idx) => {
        const defaultInput = rec.apiOption?.defaultInputTokens || 5000000;
        const defaultOutput = rec.apiOption?.defaultOutputTokens || 1250000;
        initial[idx] = {
          inputMillions: defaultInput / 1000000,
          outputMillions: defaultOutput / 1000000
        };
      });
      setTokenAdjustments(initial);
    } else {
      setTokenAdjustments({});
    }
  }, [auditResult]);

  // Global scroll indicator to show scrollbar thumb only during active scrolling
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      document.documentElement.classList.add('is-scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.documentElement.classList.remove('is-scrolling');
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    // Gracefully respect users who prefer reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenisInstance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false
    });

    let rafId;
    function raf(time) {
      lenisInstance.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Save instance to window for global access
    window.lenis = lenisInstance;

    return () => {
      cancelAnimationFrame(rafId);
      lenisInstance.destroy();
      window.lenis = undefined;
    };
  }, []);

  // Scroll to top on view changes
  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentView]);

  // Spend comparison states
  const [comparisonBaseline, setComparisonBaseline] = useState(null);
  const [comparisonRecommended, setComparisonRecommended] = useState(null);

  const handlePurchase = async (planName, creditType, amount) => {
    if (!user) {
      setAuthMessage(`Please sign in to purchase the ${planName} package.`);
      setCurrentView('signin');
      return;
    }
    setApiError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/auth/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ creditType, amount })
      });
      if (!response.ok) {
        throw new Error('Purchase request failed on the server.');
      }
      const data = await response.json();
      
      // Update local state and localStorage
      const updatedUser = { ...user, credits: data.credits };
      setUser(updatedUser);
      localStorage.setItem('audex_user', JSON.stringify(updatedUser));

      // Show success modal
      setPurchasedPlanName(planName);
      setPurchasedCreditsCount(amount);
      setShowPurchaseSuccess(true);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const renderCoinDropdown = () => {
    if (!user) return null;
    const credits = user.credits || { starter: 0, pro: 0, proMax: 0 };
    const totalCredits = (credits.starter || 0) + (credits.pro || 0) + (credits.proMax || 0);

    return (
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
          <a href="#pricing" onClick={(e) => {
            e.preventDefault();
            setCurrentView('landing');
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
          }} style={{
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
    );
  };

  // Run audit backend API post
  const triggerAudit = async () => {
    // If not logged in OR out of credits, run client-side free audit instead of hitting backend
    const credits = user?.credits || { starter: 0, pro: 0, proMax: 0 };
    const totalCredits = (credits.starter || 0) + (credits.pro || 0) + (credits.proMax || 0);

    if (!token || totalCredits <= 0) {
      setCurrentView('loading');
      setTimeout(() => {
        setCurrentView('free_results');
      }, 1000);
      return;
    }

    setCurrentView('loading');
    setApiError(null);

    const allocationsPayload = [];
    selectedToolIds.forEach(toolId => {
      const configs = toolConfigs[toolId] || [];
      const tool = tools.find(t => t.id === toolId);
      if (!tool) return;

      configs.forEach(config => {
        if (tool.type === 'subscription') {
          allocationsPayload.push({
            type: 'subscription',
            toolName: tool.name,
            plan: config.plan || 'Free',
            seats: parseInt(config.seats) || 1,
            purpose: config.purpose || 'Mixed'
          });
        } else if (tool.type === 'api') {
          allocationsPayload.push({
            type: 'api',
            toolName: tool.name,
            seats: 1,
            purpose: config.purpose || 'Mixed',
            modelId: config.modelId || tool.defaultModelId,
            inputTokens: parseFloat(config.inputTokens) || 10000000,
            outputTokens: parseFloat(config.outputTokens) || 2500000
          });
        }
      });
    });

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_URL}/audits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          optimizationGoal,
          costCutPercentage: parseFloat(costCutPercentage) || 50,
          allocations: allocationsPayload
        })
      });

      if (!response.ok) {
        if (response.status === 402) {
          const errData = await response.json();
          throw new Error(errData.error || 'You do not have enough credits to run this report.');
        }
        throw new Error('Failed to run audit analysis on the server.');
      }

      const data = await response.json();
      setAuditResult(data);

      if (data.updatedCredits && user) {
        const updatedUser = { ...user, credits: data.updatedCredits };
        setUser(updatedUser);
        localStorage.setItem('audex_user', JSON.stringify(updatedUser));
      }

      // Pre-select options for Step 4
      const initialChoices = {};
      (data.savings?.recommendations || []).forEach((rec, idx) => {
        const apiSav = rec.apiOption ? rec.apiOption.savings : -Infinity;
        const subSav = rec.subscriptionOption ? rec.subscriptionOption.savings : -Infinity;
        initialChoices[idx] = apiSav >= subSav ? 'api' : 'subscription';
      });
      setSelectedOptions(initialChoices);

      // Scanner animation delay
      setTimeout(() => {
        setCurrentView('step4');
      }, 1200);
    } catch (err) {
      console.error(err);
      setApiError(err.message);
      setCurrentView('step3');
    }
  };

  // Fetch past audits
  const fetchPastAudits = async (overrideToken = null) => {
    const activeToken = overrideToken || token;
    if (!activeToken) {
      setAuthError(null);
      setAuthMessage('Please sign in to view your reports history.');
      setCurrentView('signin');
      return;
    }
    setApiError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/audits`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (response.status === 401) {
        handleLogout();
        setAuthError('Your session has expired. Please sign in again.');
        setCurrentView('signin');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load past audit history.');
      }
      const data = await response.json();
      setPastAudits(data);
      setCurrentView('history');
    } catch (err) {
      console.error(err);
      setApiError(err.message);
    }
  };

  // Delete an audit
  const handleDeleteAudit = async (auditId) => {
    const activeToken = token;
    if (!activeToken) {
      setAuthError(null);
      setAuthMessage('Please sign in to delete reports.');
      setCurrentView('signin');
      return;
    }
    setApiError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/audits/${auditId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (response.status === 401) {
        handleLogout();
        setAuthError('Your session has expired. Please sign in again.');
        setCurrentView('signin');
        return;
      }
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete saved report.');
      }
      // Refresh list
      await fetchPastAudits();
    } catch (err) {
      console.error(err);
      setApiError(err.message);
    }
  };

  const loadPastAuditDetail = async (id, targetView = 'results') => {
    setCurrentView('loading');
    try {
      const response = await fetch(`${BACKEND_URL}/audits/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load audit details.');
      }
      const data = await response.json();
      setAuditResult(data);
      
      if (data.selectedOptions && Object.keys(data.selectedOptions).length > 0) {
        setSelectedOptions(data.selectedOptions);
      } else {
        const initialChoices = {};
        const recs = data.savings?.recommendations || [];
        recs.forEach((rec, idx) => {
          initialChoices[idx] = 'api';
        });
        setSelectedOptions(initialChoices);
      }
      
      setCurrentView(targetView);
    } catch (err) {
      console.error(err);
      setApiError(err.message);
      setCurrentView('landing');
    }
  };

  const handleAuthSubmit = async (payload, mode) => {
    setAuthLoading(true);
    setAuthError(null);

    const endpoint = mode === 'login' ? 'login' : 'register';

    try {
      const response = await fetch(`${BACKEND_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      localStorage.setItem('audex_token', data.token);
      localStorage.setItem('audex_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setAuthError(null);

      if (authMessage && authMessage.toLowerCase().includes('history')) {
        await fetchPastAudits(data.token);
      } else {
        setCurrentView('landing');
      }
      setAuthMessage(null);
    } catch (err) {
      console.error(err);
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('audex_token');
    localStorage.removeItem('audex_user');
    setToken(null);
    setUser(null);
    setCurrentView('landing');
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <div className="app-container">
            <Navbar 
              user={user} 
              onLogout={handleLogout} 
              onNavigateToHistory={() => fetchPastAudits()} 
              onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
              onNavigateToMarketIntel={() => setCurrentView('market_intel')}
              onNavigateToLanding={() => setCurrentView('landing')} 
              onNavigateToStep1={() => setCurrentView('step1')} 
              onNavigateToSignIn={() => setCurrentView('signin')}
              activeView={currentView}
            />
            <LandingView 
              onNavigateToStep1={() => setCurrentView('step1')} 
              onViewSample={() => {
                setAuditResult({
                  teamSize: 3,
                  useCase: 'Coding',
                  savings: {
                    totalMonthly: 4250,
                    totalAnnual: 51000,
                    recommendations: [
                      { tool: 'ChatGPT Enterprise', issue: 'Over-provisioned by 12 seats', action: 'Downgrade inactive Enterprise seats to Team tier', monthlySavings: 1200 },
                      { tool: 'GitHub Copilot', issue: '14 inactive users detected', action: 'Revoke seats without editor interactions in past 30 days', monthlySavings: 850 },
                      { tool: 'Midjourney', issue: 'Duplicate with Canva AI', action: 'Revoke team seats, consolidate with corporate Canva package', monthlySavings: 600 }
                    ]
                  }
                });
                setCurrentView('results');
              }}
              onPurchase={handlePurchase}
            />
            <Footer 
              onNavigateToStep1={() => setCurrentView('step1')}
              onNavigateToLanding={() => setCurrentView('landing')}
            />
          </div>
        );
      
      case 'step1':
      case 'step2':
      case 'step3':
        return (
          <WizardFlow 
            currentView={currentView}
            onNavigateToView={(view) => setCurrentView(view)}
            tools={tools}
            setTools={setTools}
            selectedToolIds={selectedToolIds}
            setSelectedToolIds={setSelectedToolIds}
            toolConfigs={toolConfigs}
            setToolConfigs={setToolConfigs}
            teamSize={teamSize}
            setTeamSize={setTeamSize}
            useCase={useCase}
            setUseCase={setUseCase}
            optimizationGoal={optimizationGoal}
            setOptimizationGoal={setOptimizationGoal}
            costCutPercentage={costCutPercentage}
            setCostCutPercentage={setCostCutPercentage}
            user={user}
            apiError={apiError}
            onTriggerAudit={triggerAudit}
          />
        );

      case 'loading':
        return <LoadingIndicator />;

      case 'free_results':
        return (
          <FreeResultsView 
            selectedToolIds={selectedToolIds}
            toolConfigs={toolConfigs}
            tools={tools}
            onNavigateToView={(view) => setCurrentView(view)}
            user={user}
            onNavigateToSignIn={() => setCurrentView('signin')}
          />
        );

      case 'results':
        return (
          <ResultsView 
            auditResult={auditResult}
            selectedOptions={selectedOptions}
            onNavigateToView={(view) => setCurrentView(view)}
            user={user}
            renderCoinDropdown={renderCoinDropdown}
            tokenAdjustments={tokenAdjustments}
            setTokenAdjustments={setTokenAdjustments}
          />
        );

      case 'step4':
        return (
          <ActionPlanView 
            auditResult={auditResult}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            tokenAdjustments={tokenAdjustments}
            setTokenAdjustments={setTokenAdjustments}
            onNavigateToView={(view) => {
              if (view === 'results' && auditResult?._id && token) {
                // Persist choices to MongoDB
                fetch(`${BACKEND_URL}/audits/${auditResult._id}/options`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ selectedOptions })
                }).catch(err => console.error('Failed to save selected options:', err));
              }
              setCurrentView(view);
            }}
          />
        );

      case 'saved_plan':
        return (
          <ResultsView 
            auditResult={auditResult}
            selectedOptions={selectedOptions}
            onNavigateToView={(view) => {
              if (view === 'history') {
                fetchPastAudits();
              }
              setCurrentView(view);
            }}
            user={user}
            renderCoinDropdown={renderCoinDropdown}
            initialView="plan"
            fromHistory={true}
            tokenAdjustments={tokenAdjustments}
            setTokenAdjustments={setTokenAdjustments}
          />
        );

      case 'saved_report':
        return (
          <ResultsView 
            auditResult={auditResult}
            selectedOptions={selectedOptions}
            onNavigateToView={(view) => {
              if (view === 'history') {
                fetchPastAudits();
              }
              setCurrentView(view);
            }}
            user={user}
            renderCoinDropdown={renderCoinDropdown}
            initialView="detailed"
            fromHistory={true}
            tokenAdjustments={tokenAdjustments}
            setTokenAdjustments={setTokenAdjustments}
          />
        );

      case 'history':
        return (
          <HistoryView 
            pastAudits={pastAudits}
            user={user}
            onLogout={handleLogout}
            onNavigateToView={(view) => setCurrentView(view)}
            onLoadPastAuditDetail={loadPastAuditDetail}
            onRefreshList={() => fetchPastAudits()}
            renderCoinDropdown={renderCoinDropdown}
            onDeleteAudit={handleDeleteAudit}
          />
        );

      case 'model_auditor':
        return (
          <ModelAuditorView 
            onNavigateToView={(view) => setCurrentView(view)}
            user={user}
            renderCoinDropdown={renderCoinDropdown}
            onCompareModels={(base, rec) => {
              setComparisonBaseline(base);
              setComparisonRecommended(rec);
              setCurrentView('comparison');
            }}
            optimizationGoal={optimizationGoal}
            setOptimizationGoal={setOptimizationGoal}
            costCutPercentage={costCutPercentage}
            setCostCutPercentage={setCostCutPercentage}
            targetUseCase={useCase}
            setTargetUseCase={setUseCase}
          />
        );

      case 'comparison':
        return (
          <ComparisonView
            baseline={comparisonBaseline}
            recommended={comparisonRecommended}
            onNavigateBack={() => setCurrentView('model_auditor')}
            token={token}
            onUpdateCredits={(updatedCredits) => {
              if (user) {
                const updatedUser = { ...user, credits: updatedCredits };
                setUser(updatedUser);
                localStorage.setItem('audex_user', JSON.stringify(updatedUser));
              }
            }}
          />
        );

      case 'market_intel':
        return (
          <MarketIntelView 
            onNavigateToView={(view) => setCurrentView(view)}
            user={user}
            renderCoinDropdown={renderCoinDropdown}
          />
        );

      case 'signin':
        return (
          <SignInView 
            authError={authError}
            setAuthError={setAuthError}
            authMessage={authMessage}
            setAuthMessage={setAuthMessage}
            authLoading={authLoading}
            onAuthSubmit={handleAuthSubmit}
            onNavigateToView={(view) => setCurrentView(view)}
          />
        );

      case 'signup':
        return (
          <SignUpView 
            authError={authError}
            setAuthError={setAuthError}
            authMessage={authMessage}
            setAuthMessage={setAuthMessage}
            authLoading={authLoading}
            onAuthSubmit={handleAuthSubmit}
            onNavigateToView={(view) => setCurrentView(view)}
          />
        );

      default:
        return (
          <div className="app-container">
            <Navbar 
              user={user} 
              onLogout={handleLogout} 
              onNavigateToHistory={() => fetchPastAudits()} 
              onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
              onNavigateToMarketIntel={() => setCurrentView('market_intel')}
              onNavigateToLanding={() => setCurrentView('landing')} 
              onNavigateToStep1={() => setCurrentView('step1')} 
              onNavigateToSignIn={() => setCurrentView('signin')}
              activeView={currentView}
            />
            <LandingView 
              onNavigateToStep1={() => setCurrentView('step1')} 
              onPurchase={handlePurchase}
            />
            <Footer 
              onNavigateToStep1={() => setCurrentView('step1')}
              onNavigateToLanding={() => setCurrentView('landing')}
            />
          </div>
        );
    }
  };

  return (
    <>
      {renderActiveView()}
      <PurchaseSuccessModal 
        show={showPurchaseSuccess} 
        planName={purchasedPlanName} 
        creditsCount={purchasedCreditsCount} 
        onClose={() => setShowPurchaseSuccess(false)} 
      />
    </>
  );
}
