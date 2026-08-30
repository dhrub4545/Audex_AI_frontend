import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../config';
import logoImg from '../assets/audex-ai-logo.png';
import { LoadingIndicator } from './CommonComponents';
import { Sliders, HelpCircle, ArrowRight, Lock, Key, CreditCard, Sparkles, TrendingDown, Coins, ShieldCheck, Check, BarChart2, Home } from 'lucide-react';

import openaiLogo from '../assets/openai.svg';
import claudeLogo from '../assets/claude.svg';
import geminiLogo from '../assets/gemini.svg';
import githubLogo from '../assets/github.svg';
import perplexityLogo from '../assets/perplexity.svg';
import xaiLogo from '../assets/xai.svg';
import cursorLogo from '../assets/cursor.svg';
import windsurfLogo from '../assets/windsurf.svg';

const getProviderLogo = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('openai') || n.includes('chatgpt')) return openaiLogo;
  if (n.includes('anthropic') || n.includes('claude')) return claudeLogo;
  if (n.includes('google') || n.includes('gemini')) return geminiLogo;
  if (n.includes('github') || n.includes('copilot')) return githubLogo;
  if (n.includes('perplexity')) return perplexityLogo;
  if (n.includes('xai') || n.includes('grok')) return xaiLogo;
  if (n.includes('cursor')) return cursorLogo;
  if (n.includes('windsurf') || n.includes('codeium')) return windsurfLogo;
  return null;
};

export default function FreeResultsView({ 
  selectedToolIds, 
  toolConfigs, 
  tools, 
  onNavigateToView, 
  user,
  onNavigateToSignIn
}) {
  const [intelData, setIntelData] = useState(null);
  const [rawTiers, setRawTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic token adjustments (millions of tokens per month)
  const [tokenAdjustments, setTokenAdjustments] = useState({});

  useEffect(() => {
    // Fetch raw analysis benchmark data & subscription tiers prices
    Promise.all([
      fetch(`${API_BASE_URL}/audits/analysis/raw-data`).then(res => res.json()),
      fetch(`${API_BASE_URL}/audits/subscription-tiers/raw`).then(res => res.json())
    ])
      .then(([intel, tiers]) => {
        setIntelData(intel);
        setRawTiers(tiers);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch data for FreeResultsView:', err);
        setLoading(false);
      });
  }, []);

  // Map all configured tools
  const selectedToolsObjects = useMemo(() => {
    return selectedToolIds.map(id => {
      const tool = tools.find(t => t.id === id);
      const configs = toolConfigs[id] || [];
      return { id, tool, configs };
    }).filter(t => t.tool);
  }, [selectedToolIds, toolConfigs, tools]);

  // Initialize sliders for ALL tools (both subscription and api)
  useEffect(() => {
    if (selectedToolsObjects.length > 0 && Object.keys(tokenAdjustments).length === 0) {
      const initial = {};
      selectedToolsObjects.forEach(obj => {
        const config = obj.configs[0] || {};
        initial[obj.id] = {
          inputMillions: (config.inputTokens || 5000000) / 1000000,
          outputMillions: (config.outputTokens || 1250000) / 1000000
        };
      });
      setTokenAdjustments(initial);
    }
  }, [selectedToolsObjects, tokenAdjustments]);

  if (loading) {
    return <LoadingIndicator />;
  }

  // Calculate results for all tools (both subscription and api options side-by-side)
  const toolResults = selectedToolsObjects.map(obj => {
    const config = obj.configs[0] || {};
    const provider = obj.tool.name;
    const type = obj.tool.type;

    // Current cost calculations
    let currentCost = 0;
    let currentDesc = '';
    const seats = parseInt(config.seats) || 1;

    const adjustments = tokenAdjustments[obj.id] || { inputMillions: 5, outputMillions: 1.25 };

    // Baseline details for API option calculations
    const modelId = config.modelId || obj.tool.defaultModelId || '';
    let modelSlug = modelId.includes('/') ? modelId.split('/')[1] : modelId;
    let dbModel = intelData?.llms?.find(m => 
      m.slug === modelSlug || 
      m.slug === modelId ||
      (m.name && m.name.toLowerCase() === modelId.toLowerCase())
    );

    const inputCostPerM = dbModel ? dbModel.inputCost : 10.0;
    const outputCostPerM = dbModel ? dbModel.outputCost : 30.0;

    if (type === 'subscription') {
      const planName = config.plan || 'Free';
      const tier = rawTiers.find(t => 
        t.provider.toLowerCase() === provider.toLowerCase() && 
        t.plan.toLowerCase() === planName.toLowerCase()
      );
      const monthlyPrice = tier ? tier.monthlyPrice : 20.0;
      currentCost = seats * monthlyPrice;
      currentDesc = `${planName} (${seats} Seat${seats > 1 ? 's' : ''})`;
    } else {
      currentCost = (adjustments.inputMillions * inputCostPerM) + (adjustments.outputMillions * outputCostPerM);
      currentDesc = `Direct API (${dbModel?.name || modelId})`;
    }

    // --- Option 1: Subscription-based optimization ---
    let subOptimizedCost = 0;
    if (type === 'subscription') {
      // Find cheaper plan under provider
      const providerTiers = rawTiers.filter(t => t.provider.toLowerCase() === provider.toLowerCase());
      const planName = config.plan || 'Free';
      const currentTier = providerTiers.find(t => t.plan.toLowerCase() === planName.toLowerCase());
      const currentPrice = currentTier ? currentTier.monthlyPrice : 20.0;
      const cheaperTiers = providerTiers.filter(t => t.monthlyPrice < currentPrice);

      if (cheaperTiers.length > 0) {
        cheaperTiers.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
        subOptimizedCost = seats * cheaperTiers[0].monthlyPrice;
      } else if (seats > 3) {
        const optimizedSeats = Math.max(1, Math.round(seats * 0.8));
        subOptimizedCost = optimizedSeats * currentPrice;
      } else {
        subOptimizedCost = currentCost * 0.85;
      }
    } else {
      // For API models switching to subscription, default to a standard $20/seat plan (1 seat)
      const providerTiers = rawTiers.filter(t => t.provider.toLowerCase() === provider.toLowerCase());
      const standardTier = providerTiers.find(t => t.plan.toLowerCase().includes('pro') || t.plan.toLowerCase().includes('plus')) || providerTiers[0];
      const tierPrice = standardTier ? standardTier.monthlyPrice : 20.0;
      subOptimizedCost = seats * tierPrice;
    }
    const subSavings = Math.max(0, currentCost - subOptimizedCost);

    // --- Option 2: API-based optimization ---
    // Find cheaper, comparable API model
    const alternatives = (intelData?.llms || []).filter(m => 
      m.blendedPrice < (dbModel?.blendedPrice || 20.0) &&
      m.slug !== (dbModel?.slug || '')
    );

    let recModel = null;
    if (alternatives.length > 0) {
      alternatives.sort((a, b) => (b.intelligence_index || 0) - (a.intelligence_index || 0));
      recModel = alternatives[0];
    } else {
      recModel = intelData?.llms?.find(m => m.slug.includes('gpt-4o-mini') || m.slug.includes('flash')) || dbModel;
    }

    const recInputCost = recModel ? recModel.inputCost : 0.15;
    const recOutputCost = recModel ? recModel.outputCost : 0.60;
    const apiOptimizedCost = (adjustments.inputMillions * recInputCost) + (adjustments.outputMillions * recOutputCost);
    const apiSavings = Math.max(0, currentCost - apiOptimizedCost);

    return {
      id: obj.id,
      toolName: obj.tool.name,
      type,
      currentCost,
      currentDesc,
      subOptimizedCost,
      subSavings,
      apiOptimizedCost,
      apiSavings,
      adjustments
    };
  });

  // Calculate highest potential savings by choosing the best option for each tool
  const totalCurrentCost = toolResults.reduce((acc, r) => acc + r.currentCost, 0);
  const bestMonthlySavings = toolResults.reduce((acc, r) => acc + Math.max(r.subSavings, r.apiSavings), 0);
  const bestYearlySavings = bestMonthlySavings * 12;

  const handleSliderChange = (toolId, field, val) => {
    setTokenAdjustments(prev => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        [field]: parseFloat(val) || 0
      }
    }));
  };

  const handlePricingScroll = () => {
    onNavigateToView('landing');
    setTimeout(() => {
      const el = document.getElementById('pricing');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="app-container" style={{ backgroundColor: '#FCFCFD', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <header className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px', gap: '8px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="nav-brand" title="Audex AI Home">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="nav-actions">
            <button onClick={() => onNavigateToView('landing')} className="btn btn-outline nav-action-btn nav-btn-home" title="Back to Home">
              <Home size={14} />
              <span className="nav-action-btn-text">Home</span>
            </button>
            <button onClick={() => onNavigateToView('step1')} className="btn btn-black nav-action-btn" title="Start New Audit">
              <Sparkles size={14} />
              <span>New Audit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content" style={{ padding: '40px 0', flex: 1 }}>
        <div className="container" style={{ maxWidth: '1040px' }}>
          
          {/* Top Conversion Banner Notice */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: '#EFF6FF', color: '#3B82F6', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Lock size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', margin: '0 0 4px 0' }}>
                  Free Audit Summary
                </h4>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                  You are viewing estimated calculations. Sign in or upgrade to premium to access step-by-step route checklists, download developer migration scripts, and save reports to your history.
                </p>
              </div>
            </div>
            
            <button 
              onClick={user ? handlePricingScroll : onNavigateToSignIn}
              className="btn btn-black"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: '750',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
              }}
            >
              <Sparkles size={14} color="#10B981" />
              <span>{user ? 'Upgrade to Unlock Plan' : 'Sign In to Unlock'}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Marketing Value Prop Badges */}
          <div className="grid-auto-fit-md" style={{
            gap: '16px',
            marginBottom: '32px'
          }}>
            {[
              { title: '38% Avg. Savings', desc: 'Typical cost cuts achieved by premium customers', icon: '💰', color: '#ECFDF5', text: '#065F46' },
              { title: 'Zero Quality Loss', desc: 'Preserve GPT-4/Claude Sonnet capability ratings', icon: '🧠', color: '#EFF6FF', text: '#1E40AF' },
              { title: 'Instant Migration Map', desc: 'Direct route configurations & fallback scripts', icon: '🚀', color: '#FDF2F8', text: '#9D174D' }
            ].map((badge, idx) => (
              <div key={idx} style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)'
              }}>
                <div style={{ fontSize: '24px', backgroundColor: badge.color, borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badge.icon}
                </div>
                <div>
                  <h5 style={{ fontSize: '13px', fontWeight: '800', color: badge.text, margin: 0 }}>{badge.title}</h5>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0', lineHeight: '1.3' }}>{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Savings Dashboard Card */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            borderRadius: '24px',
            padding: '40px',
            color: '#FFFFFF',
            marginBottom: '40px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.15)'
          }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }}></div>
            
            <div className="free-hero-grid">
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#10B981', fontWeight: '800', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <TrendingDown size={14} /> Total Audex Optimization Blueprint
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: '850', color: '#FFFFFF', margin: '0 0 8px 0', lineHeight: '1.2' }}>
                  Reduce your AI spend by up to <span style={{ color: '#10B981' }}>{((bestMonthlySavings / Math.max(1, totalCurrentCost)) * 100).toFixed(0)}%</span>
                </h2>
                <p style={{ fontSize: '14.5px', color: '#94A3B8', margin: 0 }}>
                  Compare subscription optimization vs direct API migration options side-by-side for each tool below.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Optimal Monthly Savings</div>
                  <div style={{ fontSize: '32px', fontWeight: '950', color: '#10B981', marginTop: '4px' }}>
                    ${bestMonthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Optimal Yearly Savings</div>
                  <div style={{ fontSize: '32px', fontWeight: '950', color: '#FFFFFF', marginTop: '4px' }}>
                    ${bestYearlySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Tools Section - Side-by-Side Comparison of Sub vs API Options */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '750', textTransform: 'uppercase' }}>
                Audits
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Tool-by-Tool Optimization Pathways
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {toolResults.map((res) => {
                const logo = getProviderLogo(res.toolName);
                return (
                  <div key={res.id} style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '20px',
                    padding: '28px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.015)'
                  }}>
                    {/* Tool Info Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '10px', flexShrink: 0 }}>
                          {logo ? (
                            <img src={logo} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                          ) : '⚙'}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: '0 0 2px 0' }}>{res.toolName}</h4>
                          <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '500' }}>
                            Current Setup: <strong style={{ color: '#475569' }}>{res.currentDesc}</strong> · Cost: <strong style={{ color: '#475569' }}>${res.currentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</strong>
                          </span>
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#F8FAFC', padding: '6px 14px', borderRadius: '999px', border: '1px solid #E2E8F0', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase' }}>
                        Locked Teaser View
                      </div>
                    </div>

                    {/* Comparison Grid */}
                    <div className="free-options-grid">
                      
                      {/* Column 1: Subscription Option */}
                      <div style={{
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: '#FFFFFF',
                        transition: 'border-color 150ms ease'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', backgroundColor: '#ECFDF5', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                              Option A: Subscription Route
                            </span>
                            <Lock size={14} style={{ color: '#D97706' }} />
                          </div>

                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '600' }}>Suggested Plan &amp; Strategy</div>
                            <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', marginTop: '4px', filter: 'blur(3.5px)', userSelect: 'none' }}>
                              ChatGPT Team Downgrade
                            </div>
                            <p style={{ fontSize: '12px', color: '#64748B', margin: '6px 0 0 0', lineHeight: '1.45' }}>
                              An alternative license package under this provider maintains workspace functionality while eliminating redundant seats.
                            </p>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div>
                            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600' }}>Option A Monthly Spend</div>
                            <div style={{ fontSize: '15px', fontWeight: '850', color: '#334155', marginTop: '2px', filter: 'blur(3px)', userSelect: 'none' }}>
                              $90.00/mo
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '750' }}>Projected Savings</div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#10B981', marginTop: '2px' }}>
                              +${res.subSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: API Option */}
                      <div style={{
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: '#FFFFFF'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                              Option B: Direct API Route
                            </span>
                            <Lock size={14} style={{ color: '#D97706' }} />
                          </div>

                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '600' }}>Suggested Model &amp; Endpoints</div>
                            <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', marginTop: '4px', filter: 'blur(3.5px)', userSelect: 'none' }}>
                              GPT-4o Mini Integration
                            </div>
                            <p style={{ fontSize: '12px', color: '#64748B', margin: '6px 0 0 0', lineHeight: '1.45' }}>
                              A direct API endpoint integration provides pay-as-you-go billing with equal intelligence benchmarks.
                            </p>
                          </div>

                          {/* Dynamic Sliders (adjust API savings in real-time!) */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', marginBottom: '8px' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                                <span>Input: {res.adjustments.inputMillions.toFixed(1)}M tokens</span>
                              </div>
                              <input 
                                type="range"
                                min="0.1"
                                max="100"
                                step="0.5"
                                value={res.adjustments.inputMillions}
                                onChange={(e) => handleSliderChange(res.id, 'inputMillions', e.target.value)}
                                style={{ width: '100%', accentColor: '#3B82F6', height: '4px' }}
                              />
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                                <span>Output: {res.adjustments.outputMillions.toFixed(1)}M tokens</span>
                              </div>
                              <input 
                                type="range"
                                min="0.1"
                                max="50"
                                step="0.25"
                                value={res.adjustments.outputMillions}
                                onChange={(e) => handleSliderChange(res.id, 'outputMillions', e.target.value)}
                                style={{ width: '100%', accentColor: '#10B981', height: '4px' }}
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div>
                            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600' }}>Option B Monthly Spend</div>
                            <div style={{ fontSize: '15px', fontWeight: '850', color: '#334155', marginTop: '2px', filter: 'blur(3px)', userSelect: 'none' }}>
                              $15.00/mo
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: '750' }}>Projected Savings</div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#10B981', marginTop: '2px' }}>
                              +${res.apiSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Marketing Senior High-Converting Value Lock Panel */}
          <div className="free-marketing-grid" style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)'
          }}>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '850', color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={24} style={{ color: '#10B981' }} />
                Unlock Your Enterprise Spend Blueprint
              </h3>
              <p style={{ fontSize: '14.5px', color: '#64748B', lineHeight: '1.6', marginBottom: '24px' }}>
                Don't leave massive cost savings on the table. Audex AI Premium provides the precise technical roadmap to implement these budget optimizations without compromising model performance.
              </p>
              <div className="free-features-grid">
                {[
                  { bold: 'Exact Plan & Model IDs:', detail: 'Know exactly which subscriptions and direct API routes to switch to.' },
                  { bold: 'Developer Migration Scripts:', detail: 'Get pre-built curl configs, proxy wrappers, and automated route fallbacks.' },
                  { bold: 'ELO Benchmark Comparison:', detail: 'Visualize GPQA, SWE-bench and Math ratings compared to your current setup.' },
                  { bold: 'Report Auditing History:', detail: 'Persist, analyze, and track your team\'s optimization trends over time.' }
                ].map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ECFDF5', flexShrink: 0, fontSize: '11px', fontWeight: 'bold' }}>✓</div>
                    <div style={{ fontSize: '13px', lineHeight: '1.45' }}>
                      <strong style={{ color: '#334155', display: 'block', marginBottom: '2px' }}>{item.bold}</strong>
                      <span style={{ color: '#64748B' }}>{item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: '#ECFDF5', color: '#10B981', borderRadius: '50%', marginBottom: '16px' }}>
                <Lock size={28} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                Audex AI Premium
              </h4>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px', maxWidth: '300px' }}>
                Get full access and start executing optimizations. Includes 10 credits (Starter) or 20 credits (Pro).
              </p>
              <button
                onClick={user ? handlePricingScroll : onNavigateToSignIn}
                className="btn btn-green"
                style={{
                  width: '100%',
                  padding: '14px 28px',
                  fontWeight: '750',
                  fontSize: '14px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px'
                }}
              >
                {user ? 'Upgrade to Pro / View Plans' : 'Sign In to Unlock Savings'}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
