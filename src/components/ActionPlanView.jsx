import React, { useState } from 'react';
import {
  Circle,
  CircleCheckBig,
  Sparkles,
  X,
  ArrowLeft,
  ArrowRight,
  Server,
  CreditCard,
  Activity,
  Target,
  Users,
  Info,
  BadgeCheck,
  BarChart3,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Check,
  Zap
} from 'lucide-react';
import logoImg from '../assets/audex-ai-logo.png';
import { ProviderLogo } from './MarketIntelView';

const getNormalizedProvider = (prov) => {
  const p = (prov || '').toLowerCase().trim();
  if (p.includes('gpt') || p.includes('openai') || p.includes('chatgpt')) {
    return 'OpenAI';
  }
  if (p.includes('claude') || p.includes('anthropic')) {
    return 'Anthropic';
  }
  if (p.includes('gemini') || p.includes('google')) {
    return 'Google';
  }
  return prov;
};

function ProviderBadge({ provider, model, plan, size = 18 }) {
  const getBadgeStyles = (prov) => {
    const p = (prov || '').toLowerCase().trim();
    if (p.includes('openai') || p.includes('chatgpt')) return { color: '#10B981', backgroundColor: '#ECFDF5', borderColor: 'rgba(16, 185, 129, 0.15)' };
    if (p.includes('anthropic') || p.includes('claude')) return { color: '#D97754', backgroundColor: '#FFF7ED', borderColor: 'rgba(217, 119, 84, 0.15)' };
    if (p.includes('google') || p.includes('gemini')) return { color: '#2563EB', backgroundColor: '#EFF6FF', borderColor: 'rgba(37, 99, 235, 0.15)' };
    if (p.includes('meta') || p.includes('llama')) return { color: '#044E95', backgroundColor: '#F0F9FF', borderColor: 'rgba(4, 78, 149, 0.15)' };
    if (p.includes('deepseek')) return { color: '#4D6BFE', backgroundColor: '#EEF2FF', borderColor: 'rgba(77, 107, 254, 0.15)' };
    if (p.includes('xai') || p.includes('grok')) return { color: '#0F172A', backgroundColor: '#F8FAFC', borderColor: 'rgba(15, 23, 42, 0.15)' };
    if (p.includes('perplexity')) return { color: '#13B5B1', backgroundColor: '#F0FDFA', borderColor: 'rgba(19, 181, 177, 0.15)' };
    return { color: '#475569', backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' };
  };

  const badgeStyle = getBadgeStyles(provider);

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 10px',
      borderRadius: '8px',
      border: `1px solid ${badgeStyle.borderColor}`,
      backgroundColor: badgeStyle.backgroundColor,
      boxSizing: 'border-box'
    }}>
      <ProviderLogo provider={getNormalizedProvider(provider)} size={size} />
      <span style={{
        fontSize: '12px',
        fontWeight: '700',
        color: badgeStyle.color,
        letterSpacing: '-0.01em',
        lineHeight: 1
      }}>
        {model || plan || provider}
      </span>
    </div>
  );
}

const parseRecDetails = (rec) => {
  if (rec.originalAlloc) {
    return {
      seats: rec.originalAlloc.seats || 1,
      purpose: rec.originalAlloc.purpose || 'Mixed',
      toolName: rec.originalAlloc.toolName,
      plan: rec.originalAlloc.plan,
      type: rec.originalAlloc.type || 'subscription',
      currentCost: rec.originalAlloc.currentCost || 0,
      provider: getNormalizedProvider(rec.originalAlloc.provider || 'OpenAI'),
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
    if (cleanTool.toLowerCase().includes('chatgpt') || cleanTool.toLowerCase().includes('openai') || cleanTool.toLowerCase().includes('gpt')) {
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
    provider: getNormalizedProvider(provider),
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
  onNavigateToView,
  tokenAdjustments,
  setTokenAdjustments
}) {
  const [guideExpanded, setGuideExpanded] = useState(true);

  if (!auditResult || !auditResult.savings) return null;
  const recs = auditResult.savings.recommendations || [];

  // Calculate dynamic spend simulation values
  const totalCurrentCost = recs.reduce((sum, rec) => {
    const details = parseRecDetails(rec);
    return sum + (details.currentCost || 0);
  }, 0);

  const dynamicSavings = recs.reduce((sum, rec, idx) => {
    const choice = selectedOptions[idx] || 'api';
    if (choice === 'api') {
      if (!rec.apiOption) return sum;
      const limits = rec.apiOption.limits || '';
      const inputCostPerM = rec.apiOption.inputCostPerM !== undefined 
        ? rec.apiOption.inputCostPerM 
        : (() => {
            const match = limits.match(/\$(\d+\.?\d*)\/1M\s*input/i);
            return match ? parseFloat(match[1]) : 5.00;
          })();
      const outputCostPerM = rec.apiOption.outputCostPerM !== undefined 
        ? rec.apiOption.outputCostPerM 
        : (() => {
            const match = limits.match(/\$(\d+\.?\d*)\/1M\s*output/i);
            return match ? parseFloat(match[1]) : 15.00;
          })();

      const adj = tokenAdjustments[idx] || { inputMillions: 5, outputMillions: 1.25 };
      const inputCost = adj.inputMillions * inputCostPerM;
      const outputCost = adj.outputMillions * outputCostPerM;
      const dynamicApiCost = inputCost + outputCost;
      const details = parseRecDetails(rec);
      const itemCurrentCost = details.currentCost || 0;
      return sum + (itemCurrentCost - dynamicApiCost);
    } else {
      return sum + (rec.subscriptionOption ? rec.subscriptionOption.savings : 0);
    }
  }, 0);

  const dynamicOptimizedCost = Math.max(0, totalCurrentCost - dynamicSavings);
  const dynamicSavingsAnnual = dynamicSavings * 12;
  const isSavingsPositive = dynamicSavings >= 0;
  const absReductionPercent = totalCurrentCost > 0 
    ? Math.abs((dynamicSavings / totalCurrentCost) * 100).toFixed(1) 
    : '0.0';

  const handleSelectOption = (idx, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [idx]: option
    }));
  };

  const getSavingsPillStyle = (savings) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    whiteSpace: 'nowrap',
    width: 'fit-content',
    padding: '5px 12px',
    borderRadius: '9999px',
    lineHeight: 1,
    fontSize: '12px',
    fontWeight: '700',
    color: savings < 0 ? '#DC2626' : '#047857',
    backgroundColor: savings < 0 ? '#FEF2F2' : '#ECFDF5',
    border: `1px solid ${savings < 0 ? '#FCA5A5' : '#BBF7D0'}`,
    boxShadow: `0 2px 6px ${savings < 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)'}`
  });

  return (
    <div className="app-container" style={{ backgroundColor: '#FCFCFD', minHeight: '100vh' }}>
      {/* Dynamic Keyframes for pulsing status indicator */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.65; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.65; }
        }
      `}</style>

      {/* Header with Step Progress */}
      <header className="wizard-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px', gap: '12px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="nav-brand">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">
              Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span>
            </span>
          </a>

          <div className="wizard-steps-indicator" style={{ display: 'flex', alignItems: 'center' }}>
            <span className="wizard-step-dot completed" title="Step 1: AI Tools Selection">1</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot completed" title="Step 2: Team Allocations">2</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot completed" title="Step 3: Optimization Goals">3</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot active" title="Step 4: Action Plan & Pathways">4</span>
          </div>

          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} 
            className="wizard-close" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', color: '#64748B', transition: 'all 150ms' }}
            title="Exit to Dashboard"
          >
            <X size={18} />
          </a>
        </div>
      </header>
 
      {/* Main Container */}
      <main className="main-content wizard-body action-plan-container" style={{ paddingBottom: '80px' }}>
        
        {/* Step Progress Meta */}
        <div className="wizard-progress-meta" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} style={{ color: 'var(--color-green-primary)' }} />
          <span>Step 4 of 4 - 100% Complete</span>
        </div>

        {/* Title & Goal Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <h2 className="wizard-title" style={{ margin: 0 }}>Optimisation Action Plan</h2>
          {(() => {
            const goal = auditResult.optimizationGoal || 'performance';
            let label = 'Performance Preservation Mode';
            let bgColor = '#E0F2FE';
            let textColor = '#0369A1';
            let borderColor = '#BAE6FD';
            
            if (goal === 'quality') {
              label = 'Quality Focus';
              bgColor = '#EEF2FF';
              textColor = '#4338CA';
              borderColor = '#C7D2FE';
            } else if (goal === 'cost') {
              label = 'Cost Cutting';
              bgColor = '#FEE2E2';
              textColor = '#B91C1C';
              borderColor = '#FCA5A5';
            }
            
            return (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '800',
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                {label}
              </span>
            );
          })()}
        </div>

        <p className="wizard-desc" style={{ marginBottom: '20px' }}>
          We analyzed your stack and detected {recs.length} key waste indicators. Select your preferred pathway for each recommendation.
        </p>

        {/* Responsive Two-Column Layout: Left Sticky Info/Live Simulation + Right Recommendations List */}
        <div className="action-plan-layout">

          {/* LEFT COLUMN — Live Simulation & Guidance */}
          <div className="action-plan-sidebar">
            
            {/* Live Simulation Card */}
            <div className="action-plan-sim-card">
              <div className="action-plan-sim-header">
                <h4 className="action-plan-sim-title">
                  <TrendingUp size={16} style={{ color: '#10B981' }} />
                  <span>Live Projection</span>
                </h4>
                
                <div className="action-plan-live-badge">
                  <span style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#10B981',
                    borderRadius: '50%',
                    display: 'inline-block',
                    boxShadow: '0 0 8px #10B981',
                    animation: 'pulse 1.8s infinite'
                  }} />
                  <span>Live Simulation</span>
                </div>
              </div>

              {/* Simulation Metrics Grid */}
              <div className="action-plan-metrics-grid">
                
                {/* 1. Projected Cost Card */}
                <div className="action-plan-metric-box">
                  <span className="action-plan-metric-label">Projected Cost</span>
                  <div className="action-plan-metric-value">
                    <span>${dynamicOptimizedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="action-plan-metric-unit">/mo</span>
                  </div>
                  <div className="action-plan-orig-cost">
                    <span>Original:</span>
                    <strike>${totalCurrentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</strike>
                  </div>
                </div>

                {/* 2. Projected Savings Card */}
                <div 
                  className="action-plan-metric-box"
                  style={{
                    backgroundColor: isSavingsPositive ? 'rgba(236, 253, 245, 0.85)' : 'rgba(254, 242, 242, 0.85)',
                    borderColor: isSavingsPositive ? 'rgba(187, 247, 208, 0.9)' : 'rgba(254, 202, 202, 0.9)'
                  }}
                >
                  <span 
                    className="action-plan-metric-label" 
                    style={{ color: isSavingsPositive ? '#047857' : '#B91C1C' }}
                  >
                    {isSavingsPositive ? 'Projected Savings' : 'Projected Change'}
                  </span>
                  <div 
                    className="action-plan-metric-value" 
                    style={{ color: isSavingsPositive ? '#047857' : '#B91C1C' }}
                  >
                    <TrendingUp 
                      size={20} 
                      style={{ 
                        color: isSavingsPositive ? '#10B981' : '#EF4444', 
                        transform: isSavingsPositive ? 'none' : 'rotate(180deg)',
                        flexShrink: 0
                      }} 
                    />
                    <span>{isSavingsPositive ? '+' : '-'}${Math.abs(dynamicSavings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="action-plan-metric-unit" style={{ color: isSavingsPositive ? '#047857' : '#B91C1C' }}>/mo</span>
                  </div>
                </div>

                {/* 3. Annual Savings Card */}
                <div className="action-plan-metric-box">
                  <span className="action-plan-metric-label">Annual Savings</span>
                  <div className="action-plan-metric-value">
                    <span style={{ color: isSavingsPositive ? '#1E293B' : '#B91C1C' }}>
                      {isSavingsPositive ? '' : '-'}${Math.abs(dynamicSavingsAnnual).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="action-plan-metric-unit">/yr</span>
                  </div>
                </div>

                {/* 4. Budget Impact Card */}
                <div 
                  className="action-plan-metric-box"
                  style={{
                    backgroundColor: isSavingsPositive ? 'rgba(239, 246, 255, 0.85)' : 'rgba(254, 242, 242, 0.85)',
                    borderColor: isSavingsPositive ? 'rgba(191, 219, 254, 0.9)' : 'rgba(254, 202, 202, 0.9)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span 
                      className="action-plan-metric-label" 
                      style={{ color: isSavingsPositive ? '#1D4ED8' : '#B91C1C' }}
                    >
                      Budget Impact
                    </span>
                    <span style={{ fontSize: '12px', color: isSavingsPositive ? '#10B981' : '#EF4444', fontWeight: '800' }}>
                      {isSavingsPositive ? `-${absReductionPercent}% Cut` : `+${absReductionPercent}% Cost`}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ marginTop: '8px', width: '100%', height: '7px', backgroundColor: 'rgba(226, 232, 240, 0.9)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${isSavingsPositive ? Math.min(100, parseFloat(absReductionPercent)) : 0}%`, 
                      height: '100%', 
                      background: isSavingsPositive ? 'linear-gradient(90deg, #34D399 0%, #10B981 100%)' : '#EF4444', 
                      borderRadius: '999px',
                      boxShadow: isSavingsPositive ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'none',
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
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
              padding: '16px 20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
            }}>
              <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#1E293B', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={15} style={{ color: '#1E293B' }} /> AUDIT SUMMARY
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Tools Analyzed</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{recs.length}</span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Monthly Spend</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>
                    ${totalCurrentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Annual Spend</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>
                    ${(totalCurrentCost * 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* How This Works Card (Collapsible for small screens) */}
            <div className="action-plan-guide-card">
              <div 
                className="action-plan-guide-header"
                onClick={() => setGuideExpanded(!guideExpanded)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={17} style={{ color: '#1E293B' }} />
                  <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                    How This Works
                  </h3>
                </div>
                <div style={{ color: '#64748B' }}>
                  {guideExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {guideExpanded && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.6', margin: '0 0 14px 0' }}>
                    Choose your preferred <strong>optimisation pathway</strong> for each tool:
                  </p>

                  {/* Option A info */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '24px', height: '24px', borderRadius: '6px',
                        backgroundColor: '#EFF6FF', color: '#3B82F6'
                      }}>
                        <Server size={13} />
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '750', color: '#1E293B' }}>Direct API Integration</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                      Pay per token with custom usage sliders. Best for variable or lower usage workloads.
                    </p>
                  </div>

                  {/* Option B info */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #A7F3D0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '24px', height: '24px', borderRadius: '6px',
                        backgroundColor: '#ECFDF5', color: '#047857'
                      }}>
                        <CreditCard size={13} />
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '750', color: '#1E293B' }}>Subscription Migration</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                      Switch to a better-fit subscription tier. Ideal for predictable billing and bundled features.
                    </p>
                  </div>

                  {/* Pro Tip info */}
                  <div style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '10px',
                    padding: '10px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Info size={14} style={{ color: '#92400E' }} />
                      <span style={{ fontSize: '11.5px', fontWeight: '750', color: '#92400E' }}>Pro Tip</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#78350F', lineHeight: '1.5', margin: 0 }}>
                      Both pathways are fully modeled. Select the one matching your team's architecture.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN — Recommendation Cards */}
          <div style={{ minWidth: 0 }}>
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
                  <div key={idx} className="action-plan-rec-card">
                    <div className="rec-info" style={{ width: '100%' }}>
                      
                      {/* Header Row: Tool + Cost */}
                      <div className="action-plan-card-header">
                        <span className="action-plan-tool-title">
                          <ProviderLogo provider={getNormalizedProvider(details.provider || details.toolName)} size={30} />
                          <span>{getFullSubscriptionOrModelName(details).toUpperCase()}</span>
                        </span>
                        <span className="action-plan-cost-pill">
                          Current Cost: ${itemCurrentCost.toLocaleString()}/mo
                        </span>
                      </div>

                      {/* Metadata Chips: Purpose, Seats, Billing Model */}
                      <div className="action-plan-meta-strip">
                        <span className="action-plan-meta-chip">
                          <Target size={13} style={{ color: '#64748B' }} />
                          <span>Purpose: <strong style={{ color: '#0F172A' }}>{details.purpose}</strong></span>
                        </span>
                        <span className="action-plan-meta-chip">
                          <Users size={13} style={{ color: '#64748B' }} />
                          <span>Seats: <strong style={{ color: '#0F172A' }}>{details.seats} seat{details.seats > 1 ? 's' : ''}</strong></span>
                        </span>
                        <span className="action-plan-meta-chip">
                          <CreditCard size={13} style={{ color: '#64748B' }} />
                          <span>Billing: <strong style={{ color: '#0F172A' }}>{details.type === 'subscription' ? 'Subscription' : 'API Tokens'}</strong></span>
                        </span>
                      </div>
                      
                      {/* Waste / Issue description */}
                      <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#475569', lineHeight: '1.55' }}>
                        {rec.issue}
                      </p>

                      {/* Responsive Side-by-Side Options Grid */}
                      <div className="action-plan-options-grid">
                        
                        {/* =========================================
                            Option A: Direct API Integration
                            ========================================= */}
                        {rec.apiOption && (
                          <div 
                            onClick={() => handleSelectOption(idx, 'api')}
                            className="action-plan-option-card"
                            style={{
                              border: currentChoice === 'api' ? '2.5px solid #3B82F6' : '1.5px solid #E2E8F0',
                              backgroundColor: currentChoice === 'api' ? '#F0F7FF' : '#FFFFFF',
                              opacity: currentChoice === 'api' ? 1 : 0.82,
                              boxShadow: currentChoice === 'api' ? '0 10px 25px -5px rgba(59, 130, 246, 0.14), 0 8px 10px -6px rgba(59, 130, 246, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.02)'
                            }}
                          >
                            {/* Radio Check Circle */}
                            <div 
                              className="action-plan-radio-circle"
                              style={{
                                border: currentChoice === 'api' ? '5px solid #3B82F6' : '2px solid #94A3B8'
                              }} 
                            />

                            <div style={{ paddingRight: '22px' }}>
                              
                              {/* Option Title + Savings Pill */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#1D4ED8', letterSpacing: '0.05em' }}>
                                  Option A: Direct API Integration
                                </span>
                                {!rec.apiOption.statusText && (() => {
                                  const limits = rec.apiOption.limits || '';
                                  const inputCostPerM = rec.apiOption.inputCostPerM !== undefined 
                                    ? rec.apiOption.inputCostPerM 
                                    : (() => {
                                        const match = limits.match(/\$(\d+\.?\d*)\/1M\s*input/i);
                                        return match ? parseFloat(match[1]) : 5.00;
                                      })();
                                  const outputCostPerM = rec.apiOption.outputCostPerM !== undefined 
                                    ? rec.apiOption.outputCostPerM 
                                    : (() => {
                                        const match = limits.match(/\$(\d+\.?\d*)\/1M\s*output/i);
                                        return match ? parseFloat(match[1]) : 15.00;
                                      })();

                                  const adj = tokenAdjustments[idx] || { inputMillions: 5, outputMillions: 1.25 };
                                  const inputCost = adj.inputMillions * inputCostPerM;
                                  const outputCost = adj.outputMillions * outputCostPerM;
                                  const dynamicApiCost = inputCost + outputCost;
                                  const dynamicSavingsVal = itemCurrentCost - dynamicApiCost;
                                  const isNegativeSavings = dynamicSavingsVal < 0;

                                  return (
                                    <span style={getSavingsPillStyle(dynamicSavingsVal)}>
                                      {dynamicSavingsVal >= 0 && <CircleCheckBig size={11} />}
                                      {isNegativeSavings ? `+$${Math.abs(dynamicSavingsVal).toFixed(2)} cost` : `$${dynamicSavingsVal.toFixed(2)} saved`}
                                    </span>
                                  );
                                })()}
                              </div>

                              {/* Transition Visual Block */}
                              {(() => {
                                const sugApiModel = rec.apiOption.recommendedModel || rec.apiOption.name || '';
                                const sugProvider = rec.apiOption.recommendedProvider || 'OpenAI';
                                const cleanBaseModelName = (details.modelName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                                const cleanSugModelName = sugApiModel.toLowerCase().replace(/[^a-z0-9]/g, '');
                                const isSameApi = rec.apiOption?.isAlreadyOptimized ||
                                                  (rec.apiOption?.savings !== undefined && rec.apiOption.savings <= 0) ||
                                                  (details.type === 'api' && 
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
                                                    )
                                                  );

                                if (isSameApi) {
                                  return (
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      padding: '14px 16px',
                                      background: 'rgba(255, 255, 255, 0.72)',
                                      backdropFilter: 'blur(14px)',
                                      borderRadius: '12px',
                                      border: '1px solid rgba(255, 255, 255, 0.75)',
                                      boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(15, 23, 42, 0.04)',
                                      marginTop: '8px',
                                      marginBottom: '10px',
                                      textAlign: 'center'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <BadgeCheck size={17} style={{ color: '#047857' }} />
                                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Already Optimized</span>
                                      </div>
                                      <p style={{ fontSize: '11px', color: '#065F46', margin: 0, fontWeight: '500' }}>
                                        Your current setup provides optimal value. No migration needed.
                                      </p>
                                    </div>
                                  );
                                }

                                return (
                                  <div 
                                    className="action-plan-transition-block"
                                    style={{
                                      boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.15), 0 0 16px rgba(59, 130, 246, 0.06)'
                                    }}
                                  >
                                    {/* Left Column: Current */}
                                    <div className="action-plan-trans-col">
                                      <span className="action-plan-trans-label" style={{ color: '#64748B' }}>Current</span>
                                      <div className="action-plan-trans-logo">
                                        <ProviderLogo provider={getNormalizedProvider(details.provider)} size={24} />
                                      </div>
                                      <span className="action-plan-trans-name" style={{ color: '#1E293B' }} title={currentDisplayName}>
                                        {currentDisplayName}
                                      </span>
                                      <span className="action-plan-trans-sub" style={{ color: '#64748B' }}>{details.provider}</span>
                                    </div>

                                    {/* Arrow Badge */}
                                    <div className="action-plan-arrow-badge">
                                      <ArrowRight size={14} style={{ color: '#475569' }} />
                                    </div>

                                    {/* Right Column: Suggested */}
                                    <div className="action-plan-trans-col">
                                      <span className="action-plan-trans-label" style={{ color: '#2563EB' }}>Recommended</span>
                                      <div className="action-plan-trans-logo" style={{ borderColor: 'rgba(37, 99, 235, 0.2)' }}>
                                        <ProviderLogo provider={getNormalizedProvider(sugProvider || sugApiModel)} size={24} />
                                      </div>
                                      <span className="action-plan-trans-name" style={{ color: '#2563EB' }} title={sugApiModel}>
                                        {sugApiModel}
                                      </span>
                                      <span className="action-plan-trans-sub" style={{ color: '#2563EB' }}>{sugProvider}</span>
                                    </div>
                                  </div>
                                );
                              })()}
                              
                              <p style={{ fontSize: '12.5px', color: '#1E293B', fontWeight: '600', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                                {rec.apiOption.action}
                              </p>

                              {rec.apiOption.statusText && (
                                <p style={{ fontSize: '11.5px', color: '#3B82F6', margin: '4px 0 0 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Info size={13} style={{ color: '#3B82F6' }} /> <span>{rec.apiOption.statusText}</span>
                                </p>
                              )}
                              
                              {rec.apiOption.limits && (
                                <div style={{ fontSize: '11.5px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '8px', backgroundColor: '#FFFFFF', padding: '7px 10px', borderRadius: '6px', border: '1px dashed #E2E8F0' }}>
                                  <Info size={13} style={{ color: '#475569', marginTop: '2px', flexShrink: 0 }} /> <span>{rec.apiOption.limits}</span>
                                </div>
                              )}

                              {rec.apiOption.includedModels && rec.apiOption.includedModels.length > 0 && (
                                <div style={{ marginTop: '10px' }}>
                                  <div style={{ fontSize: '9.5px', fontWeight: '700', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '5px' }}>
                                    Models Included:
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {rec.apiOption.includedModels.map((model, mi) => (
                                      <span key={mi} style={{
                                        fontSize: '10.5px', fontWeight: '650',
                                        color: '#334155', backgroundColor: '#F1F5F9',
                                        border: '1px solid #E2E8F0',
                                        padding: '2px 7px', borderRadius: '5px'
                                      }}>
                                        {model}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Token Sliders for API Simulation */}
                            <div 
                              onClick={(e) => e.stopPropagation()} // prevent triggering card selection when dragging slider
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                backgroundColor: '#F8FAFC',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                border: '1px solid #E2E8F0',
                                marginTop: '8px'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                                    Monthly Input Tokens:
                                  </span>
                                  <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#1D4ED8', backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                                    {(tokenAdjustments[idx]?.inputMillions || 0).toFixed(1)}M
                                  </span>
                                </div>
                                <input 
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  value={tokenAdjustments[idx]?.inputMillions || 0}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setTokenAdjustments(prev => ({
                                      ...prev,
                                      [idx]: {
                                        ...prev[idx],
                                        inputMillions: val
                                      }
                                    }));
                                  }}
                                  style={{ width: '100%', cursor: 'pointer', accentColor: '#3B82F6', height: '6px' }}
                                />
                              </div>

                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                                    Monthly Output Tokens:
                                  </span>
                                  <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#1D4ED8', backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                                    {(tokenAdjustments[idx]?.outputMillions || 0).toFixed(1)}M
                                  </span>
                                </div>
                                <input 
                                  type="range"
                                  min="0"
                                  max="50"
                                  step="0.5"
                                  value={tokenAdjustments[idx]?.outputMillions || 0}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setTokenAdjustments(prev => ({
                                      ...prev,
                                      [idx]: {
                                        ...prev[idx],
                                        outputMillions: val
                                      }
                                    }));
                                  }}
                                  style={{ width: '100%', cursor: 'pointer', accentColor: '#3B82F6', height: '6px' }}
                                />
                              </div>
                            </div>

                            {/* Est. Monthly Cost Footer */}
                            <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '10px' }}>
                              <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: '500' }}>Est. Monthly Cost:</span>
                              <strong style={{ fontSize: '16px', color: '#0F172A' }}>
                                ${(() => {
                                  const limits = rec.apiOption.limits || '';
                                  const inputCostPerM = rec.apiOption.inputCostPerM !== undefined 
                                    ? rec.apiOption.inputCostPerM 
                                    : (() => {
                                        const match = limits.match(/\$(\d+\.?\d*)\/1M\s*input/i);
                                        return match ? parseFloat(match[1]) : 5.00;
                                      })();
                                  const outputCostPerM = rec.apiOption.outputCostPerM !== undefined 
                                    ? rec.apiOption.outputCostPerM 
                                    : (() => {
                                        const match = limits.match(/\$(\d+\.?\d*)\/1M\s*output/i);
                                        return match ? parseFloat(match[1]) : 15.00;
                                      })();

                                  const adj = tokenAdjustments[idx] || { inputMillions: 5, outputMillions: 1.25 };
                                  const inputCost = adj.inputMillions * inputCostPerM;
                                  const outputCost = adj.outputMillions * outputCostPerM;
                                  return (inputCost + outputCost).toFixed(2);
                                })()}/mo
                              </strong>
                            </div>

                          </div>
                        )}

                        {/* =========================================
                            Option B: Subscription Migration
                            ========================================= */}
                        {rec.subscriptionOption && (
                          <div 
                            onClick={() => handleSelectOption(idx, 'subscription')}
                            className="action-plan-option-card"
                            style={{
                              border: currentChoice === 'subscription' ? '2.5px solid #10B981' : '1.5px solid #E2E8F0',
                              backgroundColor: currentChoice === 'subscription' ? '#ECFDF5' : '#FFFFFF',
                              opacity: currentChoice === 'subscription' ? 1 : 0.82,
                              boxShadow: currentChoice === 'subscription' ? '0 10px 25px -5px rgba(16, 185, 129, 0.14), 0 8px 10px -6px rgba(16, 185, 129, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.02)'
                            }}
                          >
                            {/* Radio Check Circle */}
                            <div 
                              className="action-plan-radio-circle"
                              style={{
                                border: currentChoice === 'subscription' ? '5px solid #10B981' : '2px solid #94A3B8'
                              }} 
                            />

                            <div style={{ paddingRight: '22px' }}>
                              
                              {/* Option Title + Savings Pill */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#047857', letterSpacing: '0.05em' }}>
                                  Option B: Subscription Migration
                                </span>
                                {!rec.subscriptionOption.statusText && (
                                  <span style={getSavingsPillStyle(rec.subscriptionOption.savings)}>
                                    {rec.subscriptionOption.savings >= 0 && <CircleCheckBig size={11} />}
                                    {rec.subscriptionOption.savings < 0 ? `+$${Math.abs(rec.subscriptionOption.savings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} cost` : `$${rec.subscriptionOption.savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} saved`}
                                  </span>
                                )}
                              </div>

                              {/* Transition Visual Block */}
                              {(() => {
                                const sugProvider = rec.subscriptionOption.recommendedProvider || details.provider || 'OpenAI';
                                const sugModel = rec.subscriptionOption.recommendedModel || rec.subscriptionOption.planName || 'Claude Pro';
                                const currentContext = [details.provider, details.toolName];
                                const suggestedContext = [sugProvider];
                                const isSameSub = rec.subscriptionOption?.isAlreadyOptimized ||
                                  (rec.subscriptionOption?.savings !== undefined && rec.subscriptionOption.savings <= 0) ||
                                  (details.type === 'subscription' &&
                                    (
                                      uiChoiceLabelsMatch(currentDisplayName, sugModel, currentContext, suggestedContext) ||
                                      uiChoiceLabelsMatch(
                                        `${details.toolName || ''} ${details.plan || ''}`,
                                        rec.subscriptionOption.planName || sugModel,
                                        currentContext,
                                        suggestedContext
                                      )
                                    )
                                  );

                                if (isSameSub) {
                                  return (
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      padding: '14px 16px',
                                      background: 'rgba(255, 255, 255, 0.72)',
                                      backdropFilter: 'blur(14px)',
                                      borderRadius: '12px',
                                      border: '1px solid rgba(255, 255, 255, 0.75)',
                                      boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.15), 0 4px 12px rgba(15, 23, 42, 0.04)',
                                      marginTop: '8px',
                                      marginBottom: '10px',
                                      textAlign: 'center'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <BadgeCheck size={17} style={{ color: '#047857' }} />
                                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Already Optimized</span>
                                      </div>
                                      <p style={{ fontSize: '11px', color: '#065F46', margin: 0, fontWeight: '500' }}>
                                        Your current plan provides maximum efficiency. No tier switch needed.
                                      </p>
                                    </div>
                                  );
                                }

                                return (
                                  <div 
                                    className="action-plan-transition-block"
                                    style={{
                                      boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.15), 0 0 16px rgba(16, 185, 129, 0.06)'
                                    }}
                                  >
                                    {/* Left Column: Current */}
                                    <div className="action-plan-trans-col">
                                      <span className="action-plan-trans-label" style={{ color: '#64748B' }}>Current</span>
                                      <div className="action-plan-trans-logo">
                                        <ProviderLogo provider={getNormalizedProvider(details.provider)} size={24} />
                                      </div>
                                      <span className="action-plan-trans-name" style={{ color: '#1E293B' }} title={currentDisplayName}>
                                        {currentDisplayName}
                                      </span>
                                      <span className="action-plan-trans-sub" style={{ color: '#64748B' }}>{details.provider}</span>
                                    </div>

                                    {/* Arrow Badge */}
                                    <div className="action-plan-arrow-badge">
                                      <ArrowRight size={14} style={{ color: '#475569' }} />
                                    </div>

                                    {/* Right Column: Suggested */}
                                    <div className="action-plan-trans-col">
                                      <span className="action-plan-trans-label" style={{ color: '#059669' }}>Recommended</span>
                                      <div className="action-plan-trans-logo" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                                        <ProviderLogo provider={getNormalizedProvider(sugProvider || sugModel)} size={24} />
                                      </div>
                                      <span className="action-plan-trans-name" style={{ color: '#059669' }} title={sugModel}>
                                        {sugModel}
                                      </span>
                                      <span className="action-plan-trans-sub" style={{ color: '#059669' }}>{sugProvider}</span>
                                    </div>
                                  </div>
                                );
                              })()}

                              <p style={{ fontSize: '12.5px', color: '#1E293B', fontWeight: '600', margin: '0 0 6px 0', lineHeight: '1.5' }}>
                                {rec.subscriptionOption.action}
                              </p>

                              {rec.subscriptionOption.statusText && (
                                <p style={{ fontSize: '11.5px', color: '#10B981', margin: '4px 0 0 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Info size={13} style={{ color: '#10B981' }} /> <span>{rec.subscriptionOption.statusText}</span>
                                </p>
                              )}

                              {rec.subscriptionOption.limits && (
                                <div style={{ fontSize: '11.5px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '8px', backgroundColor: '#FFFFFF', padding: '7px 10px', borderRadius: '6px', border: '1px dashed #A7F3D0' }}>
                                  <Info size={13} style={{ color: '#475569', marginTop: '2px', flexShrink: 0 }} /> <span>{rec.subscriptionOption.limits}</span>
                                </div>
                              )}

                              {rec.subscriptionOption.includedModels && rec.subscriptionOption.includedModels.length > 0 && (
                                <div style={{ marginTop: '10px' }}>
                                  <div style={{ fontSize: '9.5px', fontWeight: '700', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '5px' }}>
                                    Models Included:
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {rec.subscriptionOption.includedModels.map((model, mi) => (
                                      <span key={mi} style={{
                                        fontSize: '10.5px', fontWeight: '650',
                                        color: '#047857', backgroundColor: '#ECFDF5',
                                        border: '1px solid #A7F3D0',
                                        padding: '2px 7px', borderRadius: '5px'
                                      }}>
                                        {model}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Est. Monthly Cost Footer */}
                            <div style={{ borderTop: '1px dashed #A7F3D0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '10px' }}>
                              <span style={{ fontSize: '11.5px', color: '#047857', fontWeight: '500' }}>Est. Monthly Cost:</span>
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

            {/* Wizard Actions / Generate Report CTA */}
            <div className="wizard-actions" style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => onNavigateToView('results')} 
                className="btn btn-green"
                style={{ 
                  padding: '0 32px',
                  height: '48px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '12px',
                  fontWeight: '750',
                  fontSize: '14.5px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                  transition: 'all 180ms ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.32)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.25)';
                }}
              >
                <BarChart3 size={18} />
                <span>Generate Final Audit Report</span>
              </button>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
