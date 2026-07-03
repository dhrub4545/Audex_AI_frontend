import React from 'react';
import logoImg from '../assets/audex-ai-logo.png';
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

const parseRecDetails = (rec) => {
  if (rec.originalAlloc) {
    return {
      seats: rec.originalAlloc.seats || 1,
      purpose: rec.originalAlloc.purpose || 'Mixed',
      toolName: rec.originalAlloc.toolName,
      plan: rec.originalAlloc.plan,
      type: rec.originalAlloc.type || 'subscription',
      currentCost: rec.originalAlloc.currentCost || 0,
      provider: rec.originalAlloc.provider || 'OpenAI',
      modelName: rec.originalAlloc.modelName || 'GPT-4o'
    };
  }

  // Fallback parsing from tool and issue strings
  let type = 'subscription';
  if (rec.tool && rec.tool.toLowerCase().includes('api')) {
    type = 'api';
  }

  // Parse seats
  let seats = 1;
  const seatMatch = rec.tool ? rec.tool.match(/(\d+)\s*seats?/i) : null;
  if (seatMatch) {
    seats = parseInt(seatMatch[1], 10);
  } else {
    const userMatch = rec.issue ? rec.issue.match(/(\d+)\s*active/i) : null;
    if (userMatch) {
      seats = parseInt(userMatch[1], 10);
    }
  }

  // Parse purpose
  let purpose = 'Mixed';
  if (rec.issue) {
    if (rec.issue.toLowerCase().includes('coding')) purpose = 'Coding';
    else if (rec.issue.toLowerCase().includes('writing')) purpose = 'Writing';
    else if (rec.issue.toLowerCase().includes('research')) purpose = 'Research';
    else if (rec.issue.toLowerCase().includes('math')) purpose = 'Math';
  }

  // Parse current cost
  let currentCost = 0;
  if (rec.issue) {
    const costMatch = rec.issue.match(/Paying\s*\$([\d,.]+)/i);
    if (costMatch) {
      currentCost = parseFloat(costMatch[1].replace(/,/g, ''));
    }
  }

  // Parse provider and tool name
  let toolName = 'ChatGPT';
  let provider = 'OpenAI';
  if (rec.tool) {
    const cleanTool = rec.tool.split('(')[0].trim();
    toolName = cleanTool;
    if (cleanTool.toLowerCase().includes('chatgpt') || cleanTool.toLowerCase().includes('openai')) {
      provider = 'OpenAI';
    } else if (cleanTool.toLowerCase().includes('claude') || cleanTool.toLowerCase().includes('anthropic')) {
      provider = 'Anthropic';
    } else if (cleanTool.toLowerCase().includes('gemini') || cleanTool.toLowerCase().includes('google')) {
      provider = 'Google';
    } else if (cleanTool.toLowerCase().includes('github') || cleanTool.toLowerCase().includes('copilot')) {
      provider = 'GitHub';
    } else if (cleanTool.toLowerCase().includes('cursor')) {
      provider = 'Cursor';
    } else if (cleanTool.toLowerCase().includes('windsurf')) {
      provider = 'Windsurf';
    }
  }

  // Parse current model name or plan
  let modelName = type === 'subscription' ? 'ChatGPT Plus' : 'GPT-4o';
  if (rec.tool) {
    const planMatch = rec.tool.match(/\(([^)]+)\)/);
    if (planMatch) {
      modelName = planMatch[1].split('Subscription')[0].trim();
    }
  }

  return {
    seats,
    purpose,
    toolName,
    type,
    currentCost,
    provider,
    modelName
  };
};

const getFullSubscriptionOrModelName = (details) => {
  if (details.type === 'subscription') {
    const tool = details.toolName || '';
    const plan = details.plan || '';
    if (!plan || plan.toLowerCase() === 'subscription') {
      return tool;
    }
    if (plan.toLowerCase().includes(tool.toLowerCase())) {
      return plan;
    }
    if (tool.toLowerCase().includes(plan.toLowerCase())) {
      return tool;
    }
    return `${tool} ${plan}`.trim();
  } else {
    const tool = details.toolName || '';
    const model = details.modelName || '';
    if (model.toLowerCase().includes(tool.toLowerCase())) {
      return model;
    }
    return `${tool} ${model}`.trim();
  }
};

const normalizeUiChoiceLabel = (value) => String(value || '')
  .toLowerCase()
  .replace(/\([^)]*\)/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const compactUiChoiceLabel = (value) => normalizeUiChoiceLabel(value).replace(/[^a-z0-9]/g, '');

const stripLeadingUiContext = (value, contextNames = []) => {
  let label = normalizeUiChoiceLabel(value);
  const prefixes = contextNames
    .map(normalizeUiChoiceLabel)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  for (const prefix of prefixes) {
    if (label === prefix) return '';
    if (label.startsWith(`${prefix} `)) {
      return label.slice(prefix.length).trim();
    }
  }

  return label;
};

const hasSharedUiContext = (currentContext = [], suggestedContext = []) => (
  currentContext.some((currentItem) => {
    const currentLabel = compactUiChoiceLabel(currentItem);
    if (currentLabel.length < 3) return false;

    return suggestedContext.some((suggestedItem) => {
      const suggestedLabel = compactUiChoiceLabel(suggestedItem);
      if (suggestedLabel.length < 3) return false;
      return currentLabel === suggestedLabel ||
        currentLabel.includes(suggestedLabel) ||
        suggestedLabel.includes(currentLabel);
    });
  })
);

const uiChoiceLabelsMatch = (currentValue, suggestedValue, currentContext = [], suggestedContext = []) => {
  const currentRaw = compactUiChoiceLabel(currentValue);
  const suggestedRaw = compactUiChoiceLabel(suggestedValue);

  if (!currentRaw || !suggestedRaw) return false;
  if (currentRaw === suggestedRaw) return true;

  const currentStripped = compactUiChoiceLabel(stripLeadingUiContext(currentValue, currentContext));
  const suggestedStripped = compactUiChoiceLabel(stripLeadingUiContext(suggestedValue, suggestedContext));

  if (currentStripped && currentStripped === suggestedRaw) return true;
  if (suggestedStripped && currentRaw === suggestedStripped) return true;

  return Boolean(hasSharedUiContext(currentContext, suggestedContext) &&
    currentStripped &&
    currentStripped === suggestedStripped);
};

export default function ActionPlanView({
  auditResult,
  selectedOptions,
  setSelectedOptions,
  onNavigateToView
}) {
  if (!auditResult || !auditResult.savings) return null;
  const recs = auditResult.savings.recommendations || [];

  // Calculate dynamic spend simulation values
  const totalCurrentCost = recs.reduce((sum, rec) => {
    const details = parseRecDetails(rec);
    return sum + (details.currentCost || 0);
  }, 0);

  const dynamicSavings = recs.reduce((sum, rec, idx) => {
    const choice = selectedOptions[idx] || 'api';
    const savings = choice === 'api' 
      ? (rec.apiOption ? rec.apiOption.savings : 0) 
      : (rec.subscriptionOption ? rec.subscriptionOption.savings : 0);
    return sum + savings;
  }, 0);

  const dynamicOptimizedCost = Math.max(0, totalCurrentCost - dynamicSavings);
  const dynamicSavingsAnnual = dynamicSavings * 12;
  const dynamicReductionPercent = totalCurrentCost > 0 
    ? ((dynamicSavings / totalCurrentCost) * 100).toFixed(1) 
    : 0;


  const handleSelectOption = (idx, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [idx]: option
    }));
  };

  const getSavingsPillStyle = (savings) => ({
    fontSize: '11.5px',
    fontWeight: '750',
    color: savings < 0 ? '#DC2626' : '#10B981',
    backgroundColor: savings < 0 ? '#FEF2F2' : '#F0FDF4',
    padding: '3px 8px',
    borderRadius: '9999px'
  });

  return (
    <div className="app-container" style={{ backgroundColor: '#FCFCFD', minHeight: '100vh' }}>
      <header className="wizard-header">
        <div className="container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="brand">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="wizard-steps-indicator">
            <span className="wizard-step-dot completed">✓</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot completed">✓</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot completed">✓</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot active">4</span>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="wizard-close">✕</a>
        </div>
      </header>

      <main className="main-content wizard-body" style={{ paddingBottom: '60px', maxWidth: '1200px' }}>
        <div className="wizard-progress-meta">✦ Step 4 of 4 - 100% Complete</div>
        <h2 className="wizard-title">Optimisation Action Plan</h2>
        <p className="wizard-desc">
          We analyzed your stack and detected {recs.length} key waste indicators. Select your preferred pathway for each recommendation.
        </p>

        {/* Two-Column Layout: Info Sidebar (left) + Recommendations (right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: '28px',
          marginTop: '24px',
          alignItems: 'start'
        }}>

          {/* LEFT COLUMN — Sticky Info Panel */}
          <div style={{ position: 'sticky', top: '100px' }}>
            {/* Real-time Dynamic Simulation Card */}
            <style>{`
              @keyframes pulse {
                0% { transform: scale(0.95); opacity: 0.65; }
                50% { transform: scale(1.15); opacity: 1; }
                100% { transform: scale(0.95); opacity: 0.65; }
              }
            `}</style>
            <div style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '16px',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Pulsing indicator */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10B981',
                  borderRadius: '50%',
                  display: 'inline-block',
                  boxShadow: '0 0 8px #10B981',
                  animation: 'pulse 1.8s infinite'
                }} />
                <span style={{ fontSize: '10px', color: '#10B981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simulating</span>
              </div>

              <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#94A3B8', margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ⚡ Live Projection
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Cost Metric */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10.5px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>Projected Cost</span>
                    <strong style={{ fontSize: '24px', color: '#F8FAFC', fontWeight: '850', marginTop: '2px' }}>
                      ${dynamicOptimizedCost.toLocaleString()}<span style={{ fontSize: '13px', color: '#64748B', fontWeight: 'normal' }}>/mo</span>
                    </strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '11px', color: '#64748B', textDecoration: 'line-through', marginTop: '16px' }}>
                    Orig: ${totalCurrentCost.toLocaleString()}/mo
                  </div>
                </div>

                {/* Savings Metric */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10.5px', color: '#10B981', textTransform: 'uppercase', fontWeight: '750' }}>Projected Savings</span>
                    <strong style={{ fontSize: '20px', color: '#10B981', fontWeight: '850', marginTop: '2px' }}>
                      +${dynamicSavings.toLocaleString()}<span style={{ fontSize: '12px', fontWeight: 'normal' }}>/mo</span>
                    </strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '9px', color: '#64748B', textTransform: 'uppercase' }}>Annualized</span>
                    <span style={{ fontSize: '13.5px', color: '#E2E8F0', fontWeight: '700' }}>
                      ${dynamicSavingsAnnual.toLocaleString()}/yr
                    </span>
                  </div>
                </div>

                {/* Progress Bar showing reduction */}
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                    <span style={{ color: '#94A3B8' }}>Budget Efficiency</span>
                    <span style={{ color: '#10B981', fontWeight: '800' }}>-{dynamicReductionPercent}% Cost Cut</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#334155', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${Math.min(100, dynamicReductionPercent)}%`, 
                      height: '100%', 
                      backgroundColor: '#10B981', 
                      borderRadius: '999px',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📊 Audit Summary
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Tools Analyzed</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{recs.length}</span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Est. Monthly Savings</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#10B981' }}>
                    ${(auditResult.savings.totalMonthly || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Est. Annual Savings</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#10B981' }}>
                    ${(auditResult.savings.totalAnnual || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #F0F9FF 0%, #EFF6FF 40%, #F0FDF4 100%)',
              border: '1px solid #BFDBFE',
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Top accent */}
              <div style={{
                position: 'absolute', top: 0, left: 0, height: '4px', width: '100%',
                background: 'linear-gradient(90deg, #3B82F6 0%, #10B981 100%)',
                borderRadius: '16px 16px 0 0'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '20px' }}>🧭</span>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                  How This Works
                </h3>
              </div>

              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.7', margin: '0 0 18px 0' }}>
                Our AI engine analyzed your subscriptions and usage patterns to identify cost-saving opportunities. For each tool, choose your preferred <strong>optimisation pathway</strong>.
              </p>

              {/* Option A */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '26px', height: '26px', borderRadius: '7px',
                    backgroundColor: '#EFF6FF', color: '#3B82F6',
                    fontSize: '12px', fontWeight: '800'
                  }}>A</span>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1E293B' }}>Direct API Integration</span>
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                  Pay only for what you use with per-token pricing. Best for variable or lower usage volumes.
                </p>
              </div>

              {/* Option B */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '26px', height: '26px', borderRadius: '7px',
                    backgroundColor: '#ECFDF5', color: '#047857',
                    fontSize: '12px', fontWeight: '800'
                  }}>B</span>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1E293B' }}>Subscription Migration</span>
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                  Switch to a better-fit subscription tier. Ideal for predictable billing and bundled model access.
                </p>
              </div>

              {/* Pro Tip */}
              <div style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px' }}>💡</span>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#92400E' }}>Pro Tip</span>
                </div>
                <p style={{ fontSize: '11.5px', color: '#78350F', lineHeight: '1.6', margin: 0 }}>
                  The green-highlighted option is our AI-recommended highest-value pathway for your usage profile.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Recommendation Cards */}
          <div>
            <div className="results-recommendations-list">
          {recs.map((rec, idx) => {
            const currentChoice = selectedOptions[idx] || 'api';
            const details = parseRecDetails(rec);
            const itemCurrentCost = details.currentCost || 0;
            const currentDisplayName = details.type === 'subscription' 
              ? (() => {
                  const plan = details.plan || '';
                  const provider = details.provider || '';
                  const tool = details.toolName || '';
                  
                  if (!plan || plan.toLowerCase() === 'subscription' || plan.toLowerCase() === 'free') {
                    return tool || provider;
                  }
                  
                  let cleanPlan = plan;
                  const cleanProviderLower = provider.toLowerCase();
                  if (cleanPlan.toLowerCase().startsWith(cleanProviderLower)) {
                    cleanPlan = cleanPlan.substring(provider.length).trim();
                  }
                  
                  const cleanToolLower = tool.toLowerCase();
                  if (cleanPlan.toLowerCase().startsWith(cleanToolLower)) {
                    cleanPlan = cleanPlan.substring(tool.length).trim();
                  }
                  
                  return cleanPlan || plan;
                })()
              : details.modelName;

            return (
              <div key={idx} className="rec-card" style={{ display: 'block', padding: '24px', marginBottom: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div className="rec-info" style={{ width: '100%' }}>
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="rec-tool" style={{ fontWeight: '850', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#1E293B' }}>
                      {(() => {
                        const logo = getProviderLogo(details.provider || details.toolName);
                        return logo ? (
                          <img src={logo} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ color: '#94A3B8' }}>●</span>
                        );
                      })()}
                      <span>{getFullSubscriptionOrModelName(details).toUpperCase()}</span>
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569', backgroundColor: '#F1F5F9', padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      Current Cost: ${itemCurrentCost.toLocaleString()}/mo
                    </span>
                  </div>

                  {/* Metadata strip containing Purpose and Seats */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '16px',
                    padding: '10px 14px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      🎯 <span style={{ color: '#64748B', fontWeight: 'normal' }}>Purpose:</span> <strong style={{ color: '#0F172A' }}>{details.purpose}</strong>
                    </span>
                    <span style={{ width: '4px', height: '4px', backgroundColor: '#CBD5E1', borderRadius: '50%' }} />
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      👥 <span style={{ color: '#64748B', fontWeight: 'normal' }}>Seats:</span> <strong style={{ color: '#0F172A' }}>{details.seats} seat{details.seats > 1 ? 's' : ''}</strong>
                    </span>
                    <span style={{ width: '4px', height: '4px', backgroundColor: '#CBD5E1', borderRadius: '50%' }} />
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      💳 <span style={{ color: '#64748B', fontWeight: 'normal' }}>Billing Model:</span> <strong style={{ color: '#0F172A', textTransform: 'capitalize' }}>{details.type === 'subscription' ? 'Subscription-based' : 'API-based (Tokens)'}</strong>
                    </span>
                  </div>
                  
                  <span className="rec-issue" style={{ marginBottom: '20px', display: 'block', fontSize: '13.5px', color: '#475569', lineHeight: '1.5' }}>
                    {rec.issue}
                  </span>

                  {/* Side-by-Side Options Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', width: '100%' }}>
                    
                    {/* Option A: Direct API Integration */}
                    {rec.apiOption && (
                      <div 
                        onClick={() => handleSelectOption(idx, 'api')}
                        style={{
                          padding: '20px',
                          border: currentChoice === 'api' ? '2.5px solid #3B82F6' : '1.5px solid #E2E8F0',
                          borderRadius: '12px',
                          backgroundColor: currentChoice === 'api' ? '#F0F7FF' : '#FFFFFF',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '14px',
                          cursor: 'pointer',
                          opacity: currentChoice === 'api' ? 1 : 0.8,
                          boxShadow: currentChoice === 'api' ? '0 10px 25px -5px rgba(59, 130, 246, 0.12), 0 8px 10px -6px rgba(59, 130, 246, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.25s ease',
                          position: 'relative'
                        }}
                      >
                        {/* Radio Check Indicator */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: currentChoice === 'api' ? '5px solid #3B82F6' : '2px solid #94A3B8',
                          backgroundColor: '#FFFFFF',
                          transition: 'all 0.2s'
                        }} />

                        <div style={{ paddingRight: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#1D4ED8', letterSpacing: '0.05em' }}>
                              Option A: Direct API Integration
                            </span>
                            {!rec.apiOption.statusText && (
                              <span style={getSavingsPillStyle(rec.apiOption.savings)}>
                                {rec.apiOption.savings < 0 ? `+$${Math.abs(rec.apiOption.savings).toLocaleString()}` : `-$${rec.apiOption.savings.toLocaleString()}`} save
                              </span>
                            )}
                          </div>

                          {/* Transition Visual Block */}
                          {(() => {
                            const sugApiModel = rec.apiOption.recommendedModel || rec.apiOption.name || '';
                            const sugProvider = rec.apiOption.recommendedProvider || 'OpenAI';
                            const cleanBaseModelName = (details.modelName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                            const cleanSugModelName = sugApiModel.toLowerCase().replace(/[^a-z0-9]/g, '');
                            const isSameApi = details.type === 'api' && 
                                              (
                                                uiChoiceLabelsMatch(
                                                  currentDisplayName,
                                                  sugApiModel,
                                                  [details.provider, details.toolName],
                                                  [rec.apiOption.recommendedProvider]
                                                ) ||
                                                (cleanBaseModelName && cleanSugModelName && (
                                                  cleanBaseModelName === cleanSugModelName ||
                                                  cleanSugModelName.includes(cleanBaseModelName) ||
                                                  cleanBaseModelName.includes(cleanSugModelName)
                                                ))
                                              );

                            if (isSameApi) {
                              return (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  backgroundColor: '#0F172A',
                                  borderRadius: '10px',
                                  padding: '12px 14px',
                                  color: '#F8FAFC',
                                  fontSize: '12px',
                                  marginTop: '10px',
                                  marginBottom: '12px',
                                  border: '1px solid #1E293B',
                                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0,0,0,0.1)',
                                  gap: '12px'
                                }}>
                                  {/* Left Side: Current */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                    {(() => {
                                      const logo = getProviderLogo(details.provider);
                                      return logo ? (
                                        <div style={{ width: '26px', height: '26px', backgroundColor: '#FFFFFF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px' }}>
                                          <img src={logo} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                        </div>
                                      ) : (
                                        <div style={{ width: '26px', height: '26px', backgroundColor: '#334155', color: '#94A3B8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '11px' }}>
                                          {details.provider?.charAt(0) || 'C'}
                                        </div>
                                      );
                                    })()}
                                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                      <span style={{ fontSize: '8px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: '800', letterSpacing: '0.04em' }}>Current ({details.type})</span>
                                      <span style={{ fontWeight: '750', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }} title={currentDisplayName}>
                                        {currentDisplayName}
                                      </span>
                                      <span style={{ fontSize: '9px', color: '#64748B' }}>{details.provider}</span>
                                    </div>
                                  </div>

                                  {/* Right Side: Optimized Box */}
                                  <div style={{
                                    flex: 1.2,
                                    backgroundColor: '#1E293B',
                                    borderRadius: '6px',
                                    padding: '8px 10px',
                                    border: '1px solid #334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#38BDF8',
                                    fontSize: '10.5px',
                                    fontWeight: '750',
                                    lineHeight: '1.3'
                                  }}>
                                    <span style={{ fontSize: '13px' }}>✨</span>
                                    <span>The current API is the best and optimized.</span>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#0F172A',
                                borderRadius: '10px',
                                padding: '12px 14px',
                                color: '#F8FAFC',
                                fontSize: '12px',
                                marginTop: '10px',
                                marginBottom: '12px',
                                border: '1px solid #1E293B',
                                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0,0,0,0.1)'
                              }}>
                                {/* Left Side: Current */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                  {(() => {
                                    const logo = getProviderLogo(details.provider);
                                    return logo ? (
                                      <div style={{ width: '26px', height: '26px', backgroundColor: '#FFFFFF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px' }}>
                                        <img src={logo} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                      </div>
                                    ) : (
                                      <div style={{ width: '26px', height: '26px', backgroundColor: '#334155', color: '#94A3B8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '11px' }}>
                                        {details.provider?.charAt(0) || 'C'}
                                      </div>
                                    );
                                  })()}
                                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <span style={{ fontSize: '8px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: '800', letterSpacing: '0.04em' }}>Current ({details.type})</span>
                                    <span style={{ fontWeight: '750', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }} title={currentDisplayName}>
                                      {currentDisplayName}
                                    </span>
                                    <span style={{ fontSize: '9px', color: '#64748B' }}>{details.provider}</span>
                                  </div>
                                </div>

                                {/* Arrow */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', color: '#475569', fontSize: '14px', fontWeight: '800' }}>
                                  ➔
                                </div>

                                {/* Right Side: Suggested */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                  {(() => {
                                    const logo = getProviderLogo(sugProvider || sugApiModel);
                                    return logo ? (
                                      <div style={{ width: '26px', height: '26px', backgroundColor: '#FFFFFF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px' }}>
                                        <img src={logo} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                      </div>
                                    ) : (
                                      <div style={{ width: '26px', height: '26px', backgroundColor: '#059669', color: '#A7F3D0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '11px' }}>
                                        {sugProvider?.charAt(0) || 'S'}
                                      </div>
                                    );
                                  })()}
                                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <span style={{ fontSize: '8px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: '800', letterSpacing: '0.04em' }}>Suggested (api)</span>
                                    <span style={{ fontWeight: '750', color: '#10B981', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }} title={sugApiModel}>
                                      {sugApiModel}
                                    </span>
                                    <span style={{ fontSize: '9px', color: '#64748B' }}>{sugProvider}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          
                          <p style={{ fontSize: '13px', color: '#1E293B', fontWeight: '600', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                            {rec.apiOption.action}
                          </p>
                          {rec.apiOption.statusText && (
                            <p style={{ fontSize: '12px', color: '#3B82F6', margin: '4px 0 0 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              💡 <span>{rec.apiOption.statusText}</span>
                            </p>
                          )}
                          
                          {rec.apiOption.limits && (
                            <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '10px', backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px dashed #E2E8F0', fontStyle: 'normal' }}>
                              <span style={{ fontSize: '13px' }}>ℹ️</span> <span>{rec.apiOption.limits}</span>
                            </div>
                          )}

                          {rec.apiOption.includedModels && rec.apiOption.includedModels.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                Models Included:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {rec.apiOption.includedModels.map((model, mi) => (
                                  <span key={mi} style={{
                                    fontSize: '11px', fontWeight: '650',
                                    color: '#334155', backgroundColor: '#F1F5F9',
                                    border: '1px solid #E2E8F0',
                                    padding: '3px 8px', borderRadius: '6px',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word'
                                  }}>
                                    {model}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '14px' }}>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>Est. Monthly Cost:</span>
                          <strong style={{ fontSize: '16px', color: '#0F172A' }}>
                            ${rec.apiOption.cost.toLocaleString()}/mo
                          </strong>
                        </div>
                      </div>
                    )}

                    {/* Option B: Subscription Migration */}
                    {rec.subscriptionOption && (
                      <div 
                        onClick={() => handleSelectOption(idx, 'subscription')}
                        style={{
                          padding: '20px',
                          border: currentChoice === 'subscription' ? '2.5px solid #10B981' : '1.5px solid #E2E8F0',
                          borderRadius: '12px',
                          backgroundColor: currentChoice === 'subscription' ? '#ECFDF5' : '#FFFFFF',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '14px',
                          cursor: 'pointer',
                          opacity: currentChoice === 'subscription' ? 1 : 0.8,
                          boxShadow: currentChoice === 'subscription' ? '0 10px 25px -5px rgba(16, 185, 129, 0.12), 0 8px 10px -6px rgba(16, 185, 129, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.25s ease',
                          position: 'relative'
                        }}
                      >
                        {/* Radio Check Indicator */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: currentChoice === 'subscription' ? '5px solid #10B981' : '2px solid #94A3B8',
                          backgroundColor: '#FFFFFF',
                          transition: 'all 0.2s'
                        }} />

                        <div style={{ paddingRight: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#047857', letterSpacing: '0.05em' }}>
                              Option B: Subscription Migration
                            </span>
                            {!rec.subscriptionOption.statusText && (
                              <span style={getSavingsPillStyle(rec.subscriptionOption.savings)}>
                                {rec.subscriptionOption.savings < 0 ? `+$${Math.abs(rec.subscriptionOption.savings).toLocaleString()}` : `-$${rec.subscriptionOption.savings.toLocaleString()}`} save
                              </span>
                            )}
                          </div>

                          {/* Transition Visual Block */}
                          {(() => {
                            const sugProvider = rec.subscriptionOption.recommendedProvider || details.provider || 'OpenAI';
                            const sugModel = rec.subscriptionOption.recommendedModel || rec.subscriptionOption.planName || 'Claude Pro';
                            const currentContext = [details.provider, details.toolName];
                            const suggestedContext = [sugProvider];
                            const isSameSub = details.type === 'subscription' &&
                              (
                                uiChoiceLabelsMatch(currentDisplayName, sugModel, currentContext, suggestedContext) ||
                                uiChoiceLabelsMatch(
                                  `${details.toolName || ''} ${details.plan || ''}`,
                                  rec.subscriptionOption.planName || sugModel,
                                  currentContext,
                                  suggestedContext
                                )
                              );

                            if (isSameSub) {
                              return (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  backgroundColor: '#0F172A',
                                  borderRadius: '10px',
                                  padding: '12px 14px',
                                  color: '#F8FAFC',
                                  fontSize: '12px',
                                  marginTop: '10px',
                                  marginBottom: '12px',
                                  border: '1px solid #1E293B',
                                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0,0,0,0.1)',
                                  gap: '12px'
                                }}>
                                  {/* Left Side: Current */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                    {(() => {
                                      const logo = getProviderLogo(details.provider);
                                      return logo ? (
                                        <div style={{ width: '26px', height: '26px', backgroundColor: '#FFFFFF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px' }}>
                                          <img src={logo} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                        </div>
                                      ) : (
                                        <div style={{ width: '26px', height: '26px', backgroundColor: '#334155', color: '#94A3B8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '11px' }}>
                                          {details.provider?.charAt(0) || 'C'}
                                        </div>
                                      );
                                    })()}
                                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                      <span style={{ fontSize: '8px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: '800', letterSpacing: '0.04em' }}>Current ({details.type})</span>
                                      <span style={{ fontWeight: '750', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }} title={currentDisplayName}>
                                        {currentDisplayName}
                                      </span>
                                      <span style={{ fontSize: '9px', color: '#64748B' }}>{details.provider}</span>
                                    </div>
                                  </div>

                                  {/* Right Side: Optimized Box */}
                                  <div style={{
                                    flex: 1.2,
                                    backgroundColor: '#1E293B',
                                    borderRadius: '6px',
                                    padding: '8px 10px',
                                    border: '1px solid #334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#38BDF8',
                                    fontSize: '10.5px',
                                    fontWeight: '750',
                                    lineHeight: '1.3'
                                  }}>
                                    <span style={{ fontSize: '13px' }}>✨</span>
                                    <span>The current subscription is the best and optimized.</span>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContext: 'space-between',
                                justifyContent: 'space-between',
                                backgroundColor: '#0F172A',
                                borderRadius: '10px',
                                padding: '12px 14px',
                                color: '#F8FAFC',
                                fontSize: '12px',
                                marginTop: '10px',
                                marginBottom: '12px',
                                border: '1px solid #1E293B',
                                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0,0,0,0.1)'
                              }}>
                                {/* Left Side: Current */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                  {(() => {
                                    const logo = getProviderLogo(details.provider);
                                    return logo ? (
                                      <div style={{ width: '26px', height: '26px', backgroundColor: '#FFFFFF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px' }}>
                                        <img src={logo} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                      </div>
                                    ) : (
                                      <div style={{ width: '26px', height: '26px', backgroundColor: '#334155', color: '#94A3B8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '11px' }}>
                                        {details.provider?.charAt(0) || 'C'}
                                      </div>
                                    );
                                  })()}
                                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <span style={{ fontSize: '8px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: '800', letterSpacing: '0.04em' }}>Current ({details.type})</span>
                                    <span style={{ fontWeight: '750', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }} title={currentDisplayName}>
                                      {currentDisplayName}
                                    </span>
                                    <span style={{ fontSize: '9px', color: '#64748B' }}>{details.provider}</span>
                                  </div>
                                </div>

                                {/* Arrow */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', color: '#475569', fontSize: '14px', fontWeight: '800' }}>
                                  ➔
                                </div>

                                {/* Right Side: Suggested */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                  {(() => {
                                    const logo = getProviderLogo(sugProvider || sugModel);
                                    return logo ? (
                                      <div style={{ width: '26px', height: '26px', backgroundColor: '#FFFFFF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px' }}>
                                        <img src={logo} alt="" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                      </div>
                                    ) : (
                                      <div style={{ width: '26px', height: '26px', backgroundColor: '#059669', color: '#A7F3D0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '11px' }}>
                                        {sugProvider?.charAt(0) || 'S'}
                                      </div>
                                    );
                                  })()}
                                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <span style={{ fontSize: '8px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: '800', letterSpacing: '0.04em' }}>Suggested (subscription)</span>
                                    <span style={{ fontWeight: '750', color: '#10B981', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }} title={sugModel}>
                                      {sugModel}
                                    </span>
                                    <span style={{ fontSize: '9px', color: '#64748B' }}>{rec.subscriptionOption.recommendedProvider || details.provider}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          <p style={{ fontSize: '13px', color: '#1E293B', fontWeight: '600', margin: '0 0 6px 0', lineHeight: '1.5' }}>
                            {rec.subscriptionOption.action}
                          </p>
                          {rec.subscriptionOption.statusText && (
                            <p style={{ fontSize: '12px', color: '#10B981', margin: '4px 0 0 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              💡 <span>{rec.subscriptionOption.statusText}</span>
                            </p>
                          )}

                          {rec.subscriptionOption.limits && (
                            <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '10px', backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px dashed #A7F3D0', fontStyle: 'normal' }}>
                              <span style={{ fontSize: '13px' }}>ℹ️</span> <span>{rec.subscriptionOption.limits}</span>
                            </div>
                          )}

                          {rec.subscriptionOption.includedModels && rec.subscriptionOption.includedModels.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                Models Included:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {rec.subscriptionOption.includedModels.map((model, mi) => (
                                  <span key={mi} style={{
                                    fontSize: '11px', fontWeight: '650',
                                    color: '#047857', backgroundColor: '#ECFDF5',
                                    border: '1px solid #A7F3D0',
                                    padding: '3px 8px', borderRadius: '6px',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word'
                                  }}>
                                    {model}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ borderTop: '1px dashed #A7F3D0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '14px' }}>
                          <span style={{ fontSize: '12px', color: '#047857' }}>Est. Monthly Cost:</span>
                          <strong style={{ fontSize: '16px', color: '#047857' }}>
                            ${rec.subscriptionOption.cost.toLocaleString()}/mo
                          </strong>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
            </div>

            {/* Wizard Footer Navigation Actions */}
            <div className="wizard-actions" style={{ marginTop: '32px' }}>
              <button onClick={() => onNavigateToView('step3')} className="btn btn-outline">
                ← Back to Step 3
              </button>
              <button 
                onClick={() => onNavigateToView('results')} 
                className="btn btn-green"
                style={{ padding: '12px 32px' }}
              >
                Generate Final Audit Report 📊
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
