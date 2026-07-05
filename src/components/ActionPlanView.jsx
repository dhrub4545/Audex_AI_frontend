import React from 'react';
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
  TrendingUp
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

const getRecommendedOption = (rec) => {
  const apiSav = rec.apiOption ? rec.apiOption.savings : -Infinity;
  const subSav = rec.subscriptionOption ? rec.subscriptionOption.savings : -Infinity;
  return apiSav >= subSav ? 'api' : 'subscription';
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
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    width: 'fit-content',
    minWidth: '120px',
    padding: '6px 16px',
    borderRadius: '9999px',
    lineHeight: 1,
    fontSize: '13px',
    fontWeight: '700',
    color: savings < 0 ? '#DC2626' : '#047857',
    backgroundColor: savings < 0 ? '#FEF2F2' : '#ECFDF5',
    border: `1px solid ${savings < 0 ? '#FCA5A5' : '#BBF7D0'}`,
    boxShadow: `0 2px 6px ${savings < 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)'}`
  });

  return (
    <div className="app-container" style={{ backgroundColor: '#FCFCFD', minHeight: '100vh' }}>
      <header className="wizard-header">
        <div className="container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="brand">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="wizard-steps-indicator" style={{ display: 'flex', alignItems: 'center' }}>
            <span className="wizard-step-dot completed">1</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot completed">2</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot completed">3</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot active">4</span>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="wizard-close" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </a>
        </div>
      </header>
 
      <main className="main-content wizard-body" style={{ paddingBottom: '60px', maxWidth: '1200px' }}>
        <div className="wizard-progress-meta" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} style={{ color: 'var(--color-green-primary)' }} />
          <span>Step 4 of 4 - 100% Complete</span>
        </div>
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
             <div 
               style={{
                 background: 'rgba(255, 255, 255, 0.72)',
                 backdropFilter: 'blur(18px)',
                 WebkitBackdropFilter: 'blur(18px)',
                 border: '1px solid rgba(255, 255, 255, 0.75)',
                 borderRadius: '18px',
                 padding: '24px',
                 marginBottom: '16px',
                 boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.18), 0 0 22px rgba(16, 185, 129, 0.08), 0 10px 30px rgba(15, 23, 42, 0.06)',
                 position: 'relative',
                 overflow: 'hidden',
                 transition: 'all 250ms ease'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.transform = 'translateY(-3px)';
                 e.currentTarget.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.3), 0 0 30px rgba(16, 185, 129, 0.15), 0 15px 35px rgba(15, 23, 42, 0.1)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.transform = 'translateY(0)';
                 e.currentTarget.style.boxShadow = '0 0 0 1px rgba(16, 185, 129, 0.18), 0 0 22px rgba(16, 185, 129, 0.08), 0 10px 30px rgba(15, 23, 42, 0.06)';
               }}
             >
               {/* Pulsing indicator */}
               <div style={{
                 position: 'absolute',
                 top: '20px',
                 right: '20px',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '6px',
                 backgroundColor: 'rgba(16, 185, 129, 0.08)',
                 border: '1px solid rgba(16, 185, 129, 0.15)',
                 padding: '4px 10px',
                 borderRadius: '12px',
                 backdropFilter: 'blur(4px)',
                 boxShadow: '0 2px 8px rgba(16, 185, 129, 0.04)'
               }}>
                 <span style={{
                   width: '6px',
                   height: '6px',
                   backgroundColor: '#10B981',
                   borderRadius: '50%',
                   display: 'inline-block',
                   boxShadow: '0 0 8px #10B981',
                   animation: 'pulse 1.8s infinite'
                 }} />
                 <span style={{ fontSize: '10.5px', color: '#047857', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Live Simulation</span>
               </div>

               <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B', margin: '0 0 20px 0', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <TrendingUp size={16} style={{ color: '#10B981' }} /> <span>Live Projection</span>
               </h4>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {/* Cost Metric Card */}
                 <div style={{
                   background: 'rgba(255, 255, 255, 0.9)',
                   border: '1px solid rgba(226, 232, 240, 0.8)',
                   borderRadius: '12px',
                   padding: '16px',
                   display: 'flex',
                   flexDirection: 'column',
                   position: 'relative',
                   boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                 }}>
                   <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Projected Cost</span>
                   <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '4px' }}>
                     <strong style={{ fontSize: '34px', color: '#1E293B', fontWeight: '700', lineHeight: '1' }}>
                       ${dynamicOptimizedCost.toLocaleString()}
                     </strong>
                     <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500', marginLeft: '2px' }}>/month</span>
                   </div>
                   
                   {/* Original Cost gray pill */}
                   <div style={{
                     position: 'absolute',
                     top: '16px',
                     right: '16px',
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'flex-end'
                   }}>
                     <span style={{ fontSize: '8px', fontWeight: '800', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em' }}>Original Cost</span>
                     <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through', fontWeight: '600' }}>
                       ${totalCurrentCost.toLocaleString()}/mo
                     </span>
                   </div>
                 </div>

                 {/* Savings Metric Card */}
                 <div style={{
                   background: 'rgba(236, 253, 245, 0.8)',
                   border: '1px solid rgba(187, 247, 208, 0.8)',
                   borderRadius: '12px',
                   padding: '16px',
                   display: 'flex',
                   flexDirection: 'column',
                   boxShadow: '0 2px 8px rgba(16, 185, 129, 0.02)'
                 }}>
                   <span style={{ fontSize: '11px', color: '#047857', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Projected Savings</span>
                   <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '4px', gap: '4px' }}>
                     <TrendingUp size={22} style={{ color: '#10B981', alignSelf: 'center' }} />
                     <strong style={{ fontSize: '34px', color: '#047857', fontWeight: '700', lineHeight: '1' }}>
                       +${dynamicSavings.toLocaleString()}
                     </strong>
                     <span style={{ fontSize: '14px', color: '#047857', fontWeight: '600' }}>/month</span>
                   </div>
                 </div>

                 {/* Annual Savings Card */}
                 <div style={{
                   background: 'rgba(255, 255, 255, 0.9)',
                   border: '1px solid rgba(226, 232, 240, 0.8)',
                   borderRadius: '12px',
                   padding: '16px',
                   display: 'flex',
                   flexDirection: 'column',
                   boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                 }}>
                   <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Annual Savings</span>
                   <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '4px' }}>
                     <strong style={{ fontSize: '34px', color: '#1E293B', fontWeight: '700', lineHeight: '1' }}>
                       ${dynamicSavingsAnnual.toLocaleString()}
                     </strong>
                     <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500', marginLeft: '2px' }}>/year</span>
                   </div>
                 </div>

                 {/* Budget Efficiency Card */}
                 <div style={{
                   background: 'rgba(239, 246, 255, 0.8)',
                   border: '1px solid rgba(191, 219, 254, 0.8)',
                   borderRadius: '12px',
                   padding: '16px',
                   display: 'flex',
                   flexDirection: 'column',
                   boxShadow: '0 2px 8px rgba(37, 99, 235, 0.02)'
                 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '11px', color: '#1D4ED8', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Budget Efficiency</span>
                     <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '800' }}>-{dynamicReductionPercent}% Cost Cut</span>
                   </div>
                   
                   {/* Premium Progress Bar */}
                   <div style={{ marginTop: '10px' }}>
                     <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(226, 232, 240, 0.8)', borderRadius: '999px', overflow: 'hidden' }}>
                       <div style={{ 
                         width: `${Math.min(100, dynamicReductionPercent)}%`, 
                         height: '100%', 
                         background: 'linear-gradient(90deg, #34D399 0%, #10B981 100%)', 
                         borderRadius: '999px',
                         boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)',
                         transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                       }} />
                     </div>
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
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: '#1E293B', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={15} style={{ color: '#1E293B' }} /> AUDIT SUMMARY
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Tools Analyzed</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>{recs.length}</span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Monthly Spend</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>
                    ${totalCurrentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Annual Spend</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>
                    ${(totalCurrentCost * 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Monthly Savings</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>
                    ${(auditResult.savings.totalMonthly || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>Annual Savings</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>
                    ${(auditResult.savings.totalAnnual || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                <Target size={18} style={{ color: '#1E293B' }} />
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
                    backgroundColor: '#EFF6FF', color: '#3B82F6'
                  }}>
                    <Server size={14} />
                  </span>
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
                    backgroundColor: '#ECFDF5', color: '#047857'
                  }}>
                    <CreditCard size={14} />
                  </span>
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
                  <Info size={15} style={{ color: '#92400E' }} />
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
                    <span className="rec-tool" style={{ fontWeight: '800', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#1E293B', letterSpacing: '-0.01em' }}>
                      <ProviderLogo provider={getNormalizedProvider(details.provider || details.toolName)} size={32} />
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
                      <Target size={14} style={{ color: '#64748B' }} /> <span style={{ color: '#64748B', fontWeight: 'normal' }}>Purpose:</span> <strong style={{ color: '#0F172A' }}>{details.purpose}</strong>
                    </span>
                    <span style={{ width: '4px', height: '4px', backgroundColor: '#CBD5E1', borderRadius: '50%' }} />
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} style={{ color: '#64748B' }} /> <span style={{ color: '#64748B', fontWeight: 'normal' }}>Seats:</span> <strong style={{ color: '#0F172A' }}>{details.seats} seat{details.seats > 1 ? 's' : ''}</strong>
                    </span>
                    <span style={{ width: '4px', height: '4px', backgroundColor: '#CBD5E1', borderRadius: '50%' }} />
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={14} style={{ color: '#64748B' }} /> <span style={{ color: '#64748B', fontWeight: 'normal' }}>Billing Model:</span> <strong style={{ color: '#0F172A', textTransform: 'capitalize' }}>{details.type === 'subscription' ? 'Subscription-based' : 'API-based (Tokens)'}</strong>
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
                        {getRecommendedOption(rec) === 'api' && (
                          <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '36px',
                            backgroundColor: '#3B82F6',
                            color: '#FFFFFF',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '9.5px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                            zIndex: 10
                          }}>
                            
                            <span>Recommended</span>
                          </div>
                        )}

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
                                  {isNegativeSavings ? `+$${Math.abs(dynamicSavingsVal).toFixed(2)}` : `-$${dynamicSavingsVal.toFixed(2)}`} save
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
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  padding: '16px 20px',
                                  background: 'rgba(255, 255, 255, 0.72)',
                                  backdropFilter: 'blur(18px)',
                                  borderRadius: '14px',
                                  border: '1px solid rgba(255, 255, 255, 0.75)',
                                  boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.15), 0 0 20px rgba(59, 130, 246, 0.08), 0 10px 30px rgba(15, 23, 42, 0.06)',
                                  marginTop: '10px',
                                  marginBottom: '12px',
                                  textAlign: 'center',
                                  transition: 'all 250ms ease'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <BadgeCheck size={18} style={{ color: '#047857' }} />
                                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Already Optimized</span>
                                  </div>
                                  <p style={{ fontSize: '11.5px', color: '#065F46', margin: 0, fontWeight: '500' }}>
                                    Your current plan already provides the best value. No migration required.
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <div 
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: 'rgba(255, 255, 255, 0.72)',
                                  backdropFilter: 'blur(18px)',
                                  borderRadius: '14px',
                                  padding: '16px 20px',
                                  marginTop: '10px',
                                  marginBottom: '12px',
                                  border: '1px solid rgba(255, 255, 255, 0.75)',
                                  boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.15), 0 0 20px rgba(59, 130, 246, 0.08), 0 10px 30px rgba(15, 23, 42, 0.06)',
                                  gap: '16px',
                                  transition: 'all 250ms ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-3px)';
                                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.15), 0 15px 35px rgba(15, 23, 42, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59, 130, 246, 0.15), 0 0 20px rgba(59, 130, 246, 0.08), 0 10px 30px rgba(15, 23, 42, 0.06)';
                                }}
                              >
                                {/* Left Column: Current */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, gap: '6px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.08em' }}>Current Configuration</span>
                                  <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <ProviderLogo provider={getNormalizedProvider(details.provider)} size={28} />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                                    <span style={{ fontWeight: '750', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px', textAlign: 'center', maxWidth: '120px' }} title={currentDisplayName}>
                                      {currentDisplayName}
                                    </span>
                                    <span style={{ fontSize: '9px', color: '#64748B', fontWeight: '500' }}>{details.provider}</span>
                                  </div>
                                </div>

                                {/* Arrow Badge */}
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  border: '1px solid #E5E7EB',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                  flexShrink: 0
                                }}>
                                  <ArrowRight size={16} style={{ color: '#475569' }} />
                                </div>

                                {/* Right Column: Suggested */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, gap: '6px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#2563EB', letterSpacing: '0.08em' }}>Recommended Configuration</span>
                                  <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <ProviderLogo provider={getNormalizedProvider(sugProvider || sugApiModel)} size={28} />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <span style={{ fontWeight: '750', color: '#2563EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px', textAlign: 'center', maxWidth: '120px' }} title={sugApiModel}>
                                      {sugApiModel}
                                    </span>
                                    <span style={{ fontSize: '9px', color: '#2563EB', fontWeight: '500' }}>{sugProvider}</span>
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
                              <Info size={14} style={{ color: '#3B82F6' }} /> <span>{rec.apiOption.statusText}</span>
                            </p>
                          )}
                          
                          {rec.apiOption.limits && (
                            <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '10px', backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px dashed #E2E8F0', fontStyle: 'normal' }}>
                              <Info size={13} style={{ color: '#475569', marginTop: '2px' }} /> <span>{rec.apiOption.limits}</span>
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

                        {/* Token Sliders for API Simulation */}
                        <div 
                          onClick={(e) => e.stopPropagation()} // prevent triggering card selection when sliding
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            backgroundColor: '#F8FAFC',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            marginTop: '12px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                                Monthly Input Tokens:
                              </span>
                              <span style={{ fontSize: '11.5px', fontWeight: '850', color: '#1D4ED8' }}>
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
                              style={{ width: '100%', cursor: 'pointer', accentColor: '#3B82F6' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                                Monthly Output Tokens:
                              </span>
                              <span style={{ fontSize: '11.5px', fontWeight: '850', color: '#1D4ED8' }}>
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
                              style={{ width: '100%', cursor: 'pointer', accentColor: '#3B82F6' }}
                            />
                          </div>
                        </div>

                        <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '14px' }}>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>Est. Monthly Cost:</span>
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
                        {getRecommendedOption(rec) === 'subscription' && (
                          <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '36px',
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '9.5px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                            zIndex: 10
                          }}>
                            
                            <span>Recommended</span>
                          </div>
                        )}

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
                                {rec.subscriptionOption.savings >= 0 && <CircleCheckBig size={11} />}
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
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  padding: '16px 20px',
                                  background: 'rgba(255, 255, 255, 0.72)',
                                  backdropFilter: 'blur(18px)',
                                  borderRadius: '14px',
                                  border: '1px solid rgba(255, 255, 255, 0.75)',
                                  boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.15), 0 0 20px rgba(16, 185, 129, 0.08), 0 10px 30px rgba(15, 23, 42, 0.06)',
                                  marginTop: '10px',
                                  marginBottom: '12px',
                                  textAlign: 'center',
                                  transition: 'all 250ms ease'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <BadgeCheck size={18} style={{ color: '#047857' }} />
                                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Already Optimized</span>
                                  </div>
                                  <p style={{ fontSize: '11.5px', color: '#065F46', margin: 0, fontWeight: '500' }}>
                                    Your current plan already provides the best value. No migration required.
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <div 
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: 'rgba(255, 255, 255, 0.72)',
                                  backdropFilter: 'blur(18px)',
                                  borderRadius: '14px',
                                  padding: '16px 20px',
                                  marginTop: '10px',
                                  marginBottom: '12px',
                                  border: '1px solid rgba(255, 255, 255, 0.75)',
                                  boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.15), 0 0 20px rgba(16, 185, 129, 0.08), 0 10px 30px rgba(15, 23, 42, 0.06)',
                                  gap: '16px',
                                  transition: 'all 250ms ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-3px)';
                                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.3), 0 0 30px rgba(16, 185, 129, 0.15), 0 15px 35px rgba(15, 23, 42, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(16, 185, 129, 0.15), 0 0 20px rgba(16, 185, 129, 0.08), 0 10px 30px rgba(15, 23, 42, 0.06)';
                                }}
                              >
                                {/* Left Column: Current */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, gap: '6px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.08em' }}>Current Configuration</span>
                                  <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <ProviderLogo provider={getNormalizedProvider(details.provider)} size={28} />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                                    <span style={{ fontWeight: '750', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px', textAlign: 'center', maxWidth: '120px' }} title={currentDisplayName}>
                                      {currentDisplayName}
                                    </span>
                                    <span style={{ fontSize: '9px', color: '#64748B', fontWeight: '500' }}>{details.provider}</span>
                                  </div>
                                </div>

                                {/* Arrow Badge */}
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  border: '1px solid #E5E7EB',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                  flexShrink: 0
                                }}>
                                  <ArrowRight size={16} style={{ color: '#475569' }} />
                                </div>

                                {/* Right Column: Suggested */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, gap: '6px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#059669', letterSpacing: '0.08em' }}>Recommended Configuration</span>
                                  <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <ProviderLogo provider={getNormalizedProvider(sugProvider || sugModel)} size={28} />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <span style={{ fontWeight: '750', color: '#059669', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px', textAlign: 'center', maxWidth: '120px' }} title={sugModel}>
                                      {sugModel}
                                    </span>
                                    <span style={{ fontSize: '9px', color: '#059669', fontWeight: '500' }}>{sugProvider}</span>
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
                              <Info size={14} style={{ color: '#10B981' }} /> <span>{rec.subscriptionOption.statusText}</span>
                            </p>
                          )}

                          {rec.subscriptionOption.limits && (
                            <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '10px', backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px dashed #A7F3D0', fontStyle: 'normal' }}>
                              <Info size={13} style={{ color: '#475569', marginTop: '2px' }} /> <span>{rec.subscriptionOption.limits}</span>
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
              <button onClick={() => onNavigateToView('step3')} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeft size={16} /> Back to Step 3
              </button>
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
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '14.5px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)',
                  transition: 'all 150ms ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.2)';
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
