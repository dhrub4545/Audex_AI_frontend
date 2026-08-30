import React, { useState, useEffect, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LoadingIndicator, PurchaseSuccessModal, CheckoutModal } from './components/CommonComponents';
import { ShieldCheck, Sparkles, Zap, Lock } from 'lucide-react';
import { API_BASE_URL } from './config';
import { getCachedSubscriptionTiers, preloadCoreData } from './utils/dataCache';
import { SAMPLE_AUDIT_DATA } from './utils/sampleReportData';

const LandingView = lazy(() => import('./components/LandingView'));
const WizardFlow = lazy(() => import('./components/WizardFlow'));
const ResultsView = lazy(() => import('./components/ResultsView'));
const HistoryView = lazy(() => import('./components/HistoryView'));
const ModelAuditorView = lazy(() => import('./components/ModelAuditorView'));
const MarketIntelView = lazy(() => import('./components/MarketIntelView'));
const ComparisonView = lazy(() => import('./components/ComparisonView'));
const ActionPlanView = lazy(() => import('./components/ActionPlanView'));
const ProfileView = lazy(() => import('./components/ProfileView'));
const SignInView = lazy(() => import('./components/AuthViews').then(m => ({ default: m.SignInView })));
const SignUpView = lazy(() => import('./components/AuthViews').then(m => ({ default: m.SignUpView })));

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

const BACKEND_URL = API_BASE_URL;

const getViewFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    if (!v) {
      if (window.location.hash === '#pricing') return 'pricing_scroll';
      return 'landing';
    }
    const normalized = v.toLowerCase().replace(/[-_]/g, '');
    if (normalized === 'modelauditor') return 'model_auditor';
    if (normalized === 'marketintel') return 'market_intel';
    if (normalized === 'step1' || normalized === 'wizard' || normalized === 'audit') return 'step1';
    if (normalized === 'step2') return 'step2';
    if (normalized === 'step3') return 'step3';
    if (normalized === 'step4' || normalized === 'plan' || normalized === 'actionplan') return 'step4';
    if (normalized === 'sample' || normalized === 'samplereport') return 'sample_report';
    if (normalized === 'history') return 'history';
    if (normalized === 'signin' || normalized === 'login') return 'signin';
    if (normalized === 'signup' || normalized === 'register') return 'signup';
    if (normalized === 'profile' || normalized === 'account') return 'profile';
    if (normalized === 'pricing') return 'pricing_scroll';
    return 'landing';
  } catch {
    return 'landing';
  }
};

const getViewUrlParam = (view) => {
  switch (view) {
    case 'model_auditor': return 'model-auditor';
    case 'market_intel': return 'market-intel';
    case 'step1': return 'step1';
    case 'step2': return 'step2';
    case 'step3': return 'step3';
    case 'step4': return 'step4';
    case 'sample_report': return 'sample';
    case 'history': return 'history';
    case 'profile': return 'profile';
    case 'signin': return 'signin';
    case 'signup': return 'signup';
    default: return '';
  }
};

const getViewTitle = (view) => {
  switch (view) {
    case 'model_auditor': return 'Audex AI — Live AI Model Auditor & Benchmark Comparison';
    case 'market_intel': return 'Audex AI — Enterprise AI Market Intelligence & Leaderboard';
    case 'profile': return 'Audex AI — Account & Subscription Management';
    case 'step1': return 'Audex AI — AI Subscription Audit Wizard & Spend Calculator';
    case 'step2': return 'Audex AI — Configure AI Tool Allocations';
    case 'step3': return 'Audex AI — Set AI Optimization Goals';
    case 'step4': return 'Audex AI — Optimisation Action Plan (Step 4)';
    case 'results': return 'Audex AI — Enterprise AI Spend Audit Results';
    case 'sample_report': return 'Audex AI — Sample Enterprise AI Audit Report';
    case 'history': return 'Audex AI — Audit Reports History';
    case 'signin': return 'Audex AI — Sign In';
    case 'signup': return 'Audex AI — Create Free Account';
    default: return 'Audex AI — Enterprise AI Subscription Audit & LLM Spend Optimizer';
  }
};

export default function App() {
  // Navigation: 'landing', 'step1', 'step2', 'step3', 'loading', 'results', 'history', 'signin', 'signup', 'model_auditor', 'market_intel', 'sample_report'
  const [currentView, setCurrentView] = useState(() => {
    const initial = getViewFromUrl();
    return initial === 'pricing_scroll' ? 'landing' : initial;
  });

  // Authentication state
  const [token, setToken] = useState(() => localStorage.getItem('audex_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('audex_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [authError, setAuthError] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // State for search and custom tools
  const [tools, setTools] = useState(INITIAL_TOOLS);
  
  // Wizard choices
  const [selectedToolIds, setSelectedToolIds] = useState(['GitHub Copilot', 'Claude']);
  const [toolConfigs, setToolConfigs] = useState({
    'GitHub Copilot': [{ id: 'g1', plan: 'Copilot Pro', seats: 5, purpose: 'Coding' }],
    'Claude': [{ id: 'cl1', plan: 'Claude Pro', seats: 4, purpose: 'Writing' }]
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

  // UPI Checkout Modal States
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPlanType, setCheckoutPlanType] = useState('pro');
  const [checkoutAuditId, setCheckoutAuditId] = useState(null);

  const [auditResult, setAuditResult] = useState(null);
  const [pastAudits, setPastAudits] = useState([]);
  const [apiError, setApiError] = useState(null);

  // Preload market dataset quietly in background during browser idle time
  useEffect(() => {
    preloadCoreData();
  }, []);

  useEffect(() => {
    const fetchSubscriptionTiers = async () => {
      try {
        const dynamicTools = await getCachedSubscriptionTiers();
        if (Array.isArray(dynamicTools) && dynamicTools.length > 0) {
          setTools(dynamicTools);
          
          // Determine allowed tools limit based on user subscription (2 for Free tier, 15 for Pro, Unlimited for Enterprise)
          const plan = (user?.plan || '').toLowerCase();
          const maxTools = plan === 'enterprise'
            ? Infinity
            : plan === 'pro'
              ? 15
              : 2;

          // Default select up to allowed tools (strictly 2 for Free subscription)
          const initialCount = Math.min(2, maxTools);
          const initialSelected = dynamicTools.slice(0, initialCount).map(t => t.id);
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
      } catch (err) {
        console.error('Failed to fetch dynamic subscription tiers from backend:', err);
      }
    };
    fetchSubscriptionTiers();
  }, [user]);

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
      const googleUserPlan = params.get('google_user_plan') || 'free';
      const googleUserUnlockedAuditsRaw = params.get('google_user_unlocked_audits') || '';
      const googleUserUnlockedAudits = googleUserUnlockedAuditsRaw ? googleUserUnlockedAuditsRaw.split(',') : [];

      const parsedUser = {
        id: googleUserId,
        name: decodeURIComponent(googleUserName || 'Google User'),
        email: decodeURIComponent(googleUserEmail || ''),
        credits: { starter: 0, pro: 0, proMax: 0 },
        plan: googleUserPlan,
        unlockedAudits: googleUserUnlockedAudits
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
      const githubUserPlan = params.get('github_user_plan') || 'free';
      const githubUserUnlockedAuditsRaw = params.get('github_user_unlocked_audits') || '';
      const githubUserUnlockedAudits = githubUserUnlockedAuditsRaw ? githubUserUnlockedAuditsRaw.split(',') : [];

      const parsedUser = {
        id: githubUserId,
        name: decodeURIComponent(githubUserName || 'GitHub User'),
        email: decodeURIComponent(githubUserEmail || ''),
        credits: { starter: 0, pro: 0, proMax: 0 },
        plan: githubUserPlan,
        unlockedAudits: githubUserUnlockedAudits
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

  // Synchronize authenticated user state & subscription entitlements with authoritative backend
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            handleLogout();
          }
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem('audex_user', JSON.stringify(data.user));
        }
      })
      .catch(err => {
        console.warn('Failed to sync user entitlements with backend:', err.message);
      });
  }, [token]);

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

  const handlePurchase = (planOrType, auditId = null) => {
    if (!user) {
      setAuthMessage(`Please sign in or create an account to upgrade via UPI.`);
      setCurrentView('signin');
      return;
    }
    setApiError(null);
    setCheckoutPlanType(planOrType || 'pro');
    setCheckoutAuditId(auditId);
    setShowCheckoutModal(true);
  };

  const handleCheckoutSuccess = async (updatedUser, planOrType) => {
    setShowCheckoutModal(false);
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('audex_user', JSON.stringify(updatedUser));
    }

    setPurchasedPlanName(planOrType);
    setPurchasedCreditsCount(planOrType === 'enterprise' ? 99 : (planOrType === 'pro' ? 29 : 19));
    setShowPurchaseSuccess(true);

    if (checkoutAuditId) {
      await loadPastAuditDetail(checkoutAuditId, 'results');
    } else if (currentView === 'free_results' && auditResult?._id) {
      await loadPastAuditDetail(auditResult._id, 'results');
    }
  };

  const renderCoinDropdown = () => {
    if (!user) return null;
    const plan = (user.plan || 'free').toLowerCase();
    const isEnterprise = plan === 'enterprise';
    const isPro = plan === 'pro';
    const planName = isEnterprise ? 'Enterprise Plan' : (isPro ? 'Professional Plan' : 'Free Plan');
    const shortPlanName = isEnterprise ? 'ENT' : (isPro ? 'PRO' : 'FREE');
    const badgeColor = isEnterprise ? '#8B5CF6' : (isPro ? '#10B981' : '#64748B');
    const bgColor = isEnterprise ? '#F5F3FF' : (isPro ? '#ECFDF5' : '#F1F5F9');

    return (
      <div className="coin-dropdown-container">
        <button 
          className="coin-btn" 
          onClick={() => setCurrentView('profile')}
          style={{
            backgroundColor: bgColor,
            border: `1px solid ${badgeColor}`,
            color: badgeColor,
            cursor: 'pointer'
          }}
          title={`Active Subscription: ${planName} (Click to manage)`}
        >
          <span className="coin-btn-full">✦ {planName}</span>
          <span className="coin-btn-short">✦ {shortPlanName}</span>
        </button>
      </div>
    );
  };

  // Run audit backend API post
  const triggerAudit = async () => {
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
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to run audit analysis on the server.');
      }

      const data = await response.json();
      setAuditResult(data);

      if (data.updatedCredits && user) {
        const updatedUser = { ...user, credits: data.updatedCredits };
        setUser(updatedUser);
        localStorage.setItem('audex_user', JSON.stringify(updatedUser));
      }

      // Pre-select options and token adjustments for Step 4
      const initialChoices = {};
      const initialTokenAdjustments = {};
      (data.savings?.recommendations || []).forEach((rec, idx) => {
        const apiSav = rec.apiOption ? rec.apiOption.savings : -Infinity;
        const subSav = rec.subscriptionOption ? rec.subscriptionOption.savings : -Infinity;
        initialChoices[idx] = apiSav >= subSav ? 'api' : 'subscription';

        const defaultInput = rec.apiOption?.defaultInputTokens || 5000000;
        const defaultOutput = rec.apiOption?.defaultOutputTokens || 1250000;
        initialTokenAdjustments[idx] = {
          inputMillions: defaultInput / 1000000,
          outputMillions: defaultOutput / 1000000
        };
      });
      setSelectedOptions(initialChoices);
      setTokenAdjustments(initialTokenAdjustments);

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
      
      const recs = data.savings?.recommendations || [];
      const initialTokens = {};
      recs.forEach((rec, idx) => {
        const defaultInput = rec.apiOption?.defaultInputTokens || 5000000;
        const defaultOutput = rec.apiOption?.defaultOutputTokens || 1250000;
        initialTokens[idx] = {
          inputMillions: defaultInput / 1000000,
          outputMillions: defaultOutput / 1000000
        };
      });
      setTokenAdjustments(initialTokens);

      if (data.selectedOptions && Object.keys(data.selectedOptions).length > 0) {
        setSelectedOptions(data.selectedOptions);
      } else {
        const initialChoices = {};
        recs.forEach((rec, idx) => {
          const apiSav = rec.apiOption ? rec.apiOption.savings : -Infinity;
          const subSav = rec.subscriptionOption ? rec.subscriptionOption.savings : -Infinity;
          initialChoices[idx] = apiSav >= subSav ? 'api' : 'subscription';
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

  const handleViewSample = (target = 'sample_report') => {
    try {
      setAuditResult(SAMPLE_AUDIT_DATA);
      setSelectedOptions(SAMPLE_AUDIT_DATA.selectedOptions || {});
      
      const initial = {};
      (SAMPLE_AUDIT_DATA.savings?.recommendations || []).forEach((rec, idx) => {
        const defaultInput = rec.apiOption?.defaultInputTokens || 10000000;
        const defaultOutput = rec.apiOption?.defaultOutputTokens || 2500000;
        initial[idx] = {
          inputMillions: defaultInput / 1000000,
          outputMillions: defaultOutput / 1000000
        };
      });
      setTokenAdjustments(initial);

      if (target === 'plan' || target === 'sample_plan') {
        setCurrentView('step4');
      } else {
        setCurrentView('sample_report');
      }
    } catch (err) {
      console.error('Failed to load sample audit report:', err);
      setCurrentView('landing');
    }
  };

  // URL routing synchronization & document title
  useEffect(() => {
    const viewParam = getViewUrlParam(currentView);
    const url = new URL(window.location.href);
    
    // Don't overwrite OAuth callback tokens during auth redirect handling
    const hasAuthParams = url.searchParams.has('google_token') || url.searchParams.has('github_token');
    if (!hasAuthParams) {
      if (viewParam) {
        url.searchParams.set('view', viewParam);
      } else {
        url.searchParams.delete('view');
      }
      
      const newQuery = url.searchParams.toString();
      const newUrl = url.pathname + (newQuery ? `?${newQuery}` : '') + url.hash;
      const currentQuery = window.location.search.replace(/^\?/, '');
      if (currentQuery !== newQuery) {
        window.history.pushState({ view: currentView }, '', newUrl);
      }
    }
    
    // Set dynamic document title for Google Search & tabs
    document.title = getViewTitle(currentView);
  }, [currentView]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const targetView = getViewFromUrl();
      if (targetView === 'pricing_scroll') {
        setCurrentView('landing');
        setTimeout(() => {
          const el = document.getElementById('pricing');
          if (el) {
            if (window.lenis) window.lenis.scrollTo(el);
            else el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      } else {
        setCurrentView(targetView);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial load auto-actions (e.g. loading sample report if direct link was opened)
  useEffect(() => {
    const initialView = getViewFromUrl();
    if (initialView === 'sample_report' && !auditResult) {
      handleViewSample();
    } else if (initialView === 'pricing_scroll') {
      setTimeout(() => {
        const el = document.getElementById('pricing');
        if (el) {
          if (window.lenis) window.lenis.scrollTo(el);
          else el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


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
              onNavigateToProfile={() => setCurrentView('profile')}
              activeView={currentView}
            />
            <LandingView 
              onNavigateToStep1={() => setCurrentView('step1')} 
              onViewSample={handleViewSample}
              onPurchase={handlePurchase}
            />
            <Footer 
              onNavigateToStep1={() => setCurrentView('step1')}
              onNavigateToLanding={() => setCurrentView('landing')}
              onViewSample={handleViewSample}
              onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
              onNavigateToMarketIntel={() => setCurrentView('market_intel')}
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

      case 'results':
        return (
          <ResultsView 
            auditResult={auditResult}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            onNavigateToView={(view) => setCurrentView(view)}
            user={user}
            renderCoinDropdown={renderCoinDropdown}
            tokenAdjustments={tokenAdjustments}
            setTokenAdjustments={setTokenAdjustments}
            onPurchase={handlePurchase}
          />
        );

      case 'sample_report':
        return (
          <ResultsView 
            auditResult={auditResult}
            selectedOptions={selectedOptions}
            onNavigateToView={(view) => setCurrentView(view)}
            user={user}
            renderCoinDropdown={renderCoinDropdown}
            tokenAdjustments={tokenAdjustments}
            setTokenAdjustments={setTokenAdjustments}
            isSample={true}
          />
        );

      case 'step4': {
        const activeAudit = auditResult || SAMPLE_AUDIT_DATA;
        const activeSelectedOptions = Object.keys(selectedOptions).length > 0 
          ? selectedOptions 
          : (activeAudit.selectedOptions || (() => {
              const initial = {};
              (activeAudit.savings?.recommendations || []).forEach((rec, idx) => {
                const apiSav = rec.apiOption ? rec.apiOption.savings : -Infinity;
                const subSav = rec.subscriptionOption ? rec.subscriptionOption.savings : -Infinity;
                initial[idx] = apiSav >= subSav ? 'api' : 'subscription';
              });
              return initial;
            })());

        return (
          <ActionPlanView 
            auditResult={activeAudit}
            selectedOptions={activeSelectedOptions}
            setSelectedOptions={setSelectedOptions}
            tokenAdjustments={tokenAdjustments}
            setTokenAdjustments={setTokenAdjustments}
            onNavigateToView={(view) => {
              if (view === 'results' && activeAudit?._id && token) {
                // Persist choices to MongoDB
                fetch(`${BACKEND_URL}/audits/${activeAudit._id}/options`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ selectedOptions: activeSelectedOptions })
                }).catch(err => console.error('Failed to save selected options:', err));
              }
              if (view === 'results' && (activeAudit?._id === 'sample_audit_2026' || activeAudit?._id === '6a4fb719471a97ae89e88f49')) {
                setCurrentView('sample_report');
              } else {
                setCurrentView(view);
              }
            }}
          />
        );
      }

      case 'saved_plan':
      case 'saved_report':
        return (
          <ResultsView 
            auditResult={auditResult}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
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
            onPurchase={handlePurchase}
          />
        );

      case 'history':
        return (
          <HistoryView 
            pastAudits={pastAudits}
            user={user}
            token={token}
            backendUrl={BACKEND_URL}
            onLogout={handleLogout}
            onNavigateToView={(view) => setCurrentView(view)}
            onLoadPastAuditDetail={loadPastAuditDetail}
            onRefreshList={() => fetchPastAudits()}
            renderCoinDropdown={renderCoinDropdown}
            onDeleteAudit={handleDeleteAudit}
          />
        );

      case 'model_auditor': {
        const plan = (user?.plan || '').toLowerCase();
        let isSubscriptionExpired = false;
        if (user?.subscription?.expiresAt) {
          isSubscriptionExpired = new Date(user.subscription.expiresAt) < new Date();
        }
        const isEnterprise = plan === 'enterprise' && !isSubscriptionExpired;

        if (!isEnterprise) {
          return (
            <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
              <Navbar 
                user={user}
                onLogout={handleLogout}
                onNavigateToLanding={() => setCurrentView('landing')}
                onNavigateToStep1={() => setCurrentView('step1')}
                onNavigateToHistory={() => setCurrentView('history')}
                onNavigateToMarketIntel={() => setCurrentView('market_intel')}
                onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
                onNavigateToSignIn={() => setCurrentView('signin')}
                onNavigateToSignUp={() => setCurrentView('signup')}
                onNavigateToProfile={() => setCurrentView('profile')}
                renderCoinDropdown={renderCoinDropdown}
                activeSection="model_auditor"
              />
              <main className="main-content" style={{ flex: 1, padding: '70px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ maxWidth: '640px', width: '100%', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1.5px solid #E2E8F0', padding: '44px 36px', textAlign: 'center', boxShadow: '0 20px 45px -10px rgba(15,23,42,0.08), 0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', backgroundColor: '#F5F3FF', border: '1.5px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#7C3AED' }}>
                    <ShieldCheck size={32} strokeWidth={2.2} />
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
                    ⚡ Enterprise Exclusive Feature
                  </span>
                  <h2 style={{ fontSize: '28px', fontWeight: '850', color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                    Live AI Model Auditor
                  </h2>
                  <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.6, marginBottom: '28px', maxWidth: '520px', margin: '0 auto 28px auto' }}>
                    The Live Model Auditor is available exclusively for <strong>Enterprise</strong> subscribers. Upgrade to benchmark 620+ Frontier LLMs, simulate live token cost optimizations, and inspect real-time Pareto frontiers.
                  </p>
                  
                  <div style={{ backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px 24px', marginBottom: '28px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1E293B', fontWeight: '650' }}>
                      <span style={{ color: '#10B981', fontWeight: '900' }}>✓</span> 624+ Frontier &amp; Open Source LLMs benchmarked daily
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1E293B', fontWeight: '650' }}>
                      <span style={{ color: '#10B981', fontWeight: '900' }}>✓</span> Dynamic token burn &amp; prompt caching ROI calculator
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#1E293B', fontWeight: '650' }}>
                      <span style={{ color: '#10B981', fontWeight: '900' }}>✓</span> Interactive Head-to-Head &amp; Pareto frontier deep dives
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      onClick={() => handlePurchase('enterprise')}
                      className="btn btn-black"
                      style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '14.5px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', backgroundColor: '#0F172A', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)' }}
                    >
                      <Sparkles size={16} /> Upgrade to Enterprise (₹8,499 / $99 via UPI)
                    </button>
                    <button
                      onClick={() => setCurrentView('market_intel')}
                      className="btn btn-outline"
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155' }}
                    >
                      Explore Market Intelligence (Free)
                    </button>
                  </div>
                </div>
              </main>
              <Footer onNavigateToView={(view) => setCurrentView(view)} />
            </div>
          );
        }

        return (
          <ModelAuditorView 
            onNavigateToView={(view) => setCurrentView(view)}
            user={user}
            token={token}
            onPurchase={handlePurchase}
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
      }

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

      case 'profile':
        return (
          <ProfileView 
            user={user}
            token={token}
            onNavigateToView={(view) => setCurrentView(view)}
            onNavigateToLanding={() => setCurrentView('landing')}
            onNavigateToStep1={() => setCurrentView('step1')}
            onNavigateToHistory={() => fetchPastAudits()}
            onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
            onNavigateToMarketIntel={() => setCurrentView('market_intel')}
            onNavigateToSignIn={() => setCurrentView('signin')}
            onLogout={handleLogout}
            onPurchase={handlePurchase}
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
              onNavigateToProfile={() => setCurrentView('profile')}
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
      <Suspense fallback={<LoadingIndicator />}>
        {renderActiveView()}
      </Suspense>
      <CheckoutModal
        show={showCheckoutModal}
        type={checkoutPlanType}
        auditId={checkoutAuditId}
        token={token}
        onConfirm={handleCheckoutSuccess}
        onClose={() => setShowCheckoutModal(false)}
      />
      <PurchaseSuccessModal 
        show={showPurchaseSuccess} 
        planName={purchasedPlanName} 
        creditsCount={purchasedCreditsCount} 
        onClose={() => setShowPurchaseSuccess(false)} 
      />
    </>
  );
}
