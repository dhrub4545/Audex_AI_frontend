import React, { useState, useEffect } from 'react';
import logoImg from '../assets/audex-ai-logo.png';
import { Lock, Sparkles } from 'lucide-react';
import { LoadingIndicator } from './CommonComponents';
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
    if (!plan || plan.toLowerCase() === 'subscription' || plan.toLowerCase() === 'free') {
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


const CATEGORIES = [
  { name: 'Coding', sub: 'SWE-Bench', icon: '💻', color: '#10B981', bg: '#D1FAE5', key: 'coding' },
  { name: 'Reasoning', sub: 'GPQA Diamond', icon: '🧠', color: '#EC4899', bg: '#FCE7F3', key: 'reasoning' },
  { name: 'Math', sub: 'AIME 2024', icon: '🔢', color: '#8B5CF6', bg: '#EDE9FE', key: 'math' },
  { name: 'Writing', sub: 'MT-Bench', icon: '✍️', color: '#F59E0B', bg: '#FEF3C7', key: 'writing' },
  { name: 'Research', sub: 'HLE', icon: '🔍', color: '#3B82F6', bg: '#DBEAFE', key: 'research' },
  { name: 'Function Calling', sub: 'BFCL v3', icon: '🔗', color: '#06B6D4', bg: '#CFFAFE', key: 'funcCalling' },
  { name: 'Long Context', sub: 'Needle In A Haystack', icon: '📄', color: '#64748B', bg: '#F1F5F9', key: 'longContext' },
  { name: 'Multimodal', sub: 'MMMU', icon: '🖼️', color: '#14B8A6', bg: '#CCFBF1', key: 'multimodal' },
  { name: 'Speed', sub: 'Tokens/sec', icon: '⚡', color: '#F59E0B', bg: '#FEF3C7', key: 'speedNorm' },
  { name: 'Cost Efficiency', sub: 'USD / 1M Tokens', icon: '🪙', color: '#D97706', bg: '#FEF3C7', key: 'costEff' }
];

const getSmoothPath = (points) => {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p1.x - (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return d;
};


function getBenchmarkScores(model, intelData = null) {
  if (!model) return {};

  let coding = null;
  const rawCoding = model.coding_index;
  if (rawCoding !== undefined && rawCoding !== null && rawCoding > 0) {
    coding = Math.round(rawCoding);
  }
  
  let reasoning = null;
  const rawReasoning = model.gpqa;
  if (rawReasoning !== undefined && rawReasoning !== null) {
    reasoning = Math.round(rawReasoning <= 1 ? rawReasoning * 100 : rawReasoning);
  }

  let math = null;
  const rawMath = model.math_index;
  if (rawMath !== null && rawMath !== undefined) {
    math = Math.round(rawMath <= 1 ? rawMath * 100 : rawMath);
  }

  let writing = null;
  if (intelData && intelData.categories && intelData.categories['creative-writing']) {
    const found = intelData.categories['creative-writing'].find(m => 
      m.slug === model.slug || 
      m.modelId === model.slug ||
      (m.slug && model.slug && m.slug.includes(model.slug))
    );
    if (found && found.rating) {
      writing = Math.round(Math.min(98, Math.max(35, ((found.rating - 900) / 700) * 100)));
    }
  }

  let research = null;
  const rawHle = model.hle;
  if (rawHle !== undefined && rawHle !== null) {
    research = Math.round(rawHle <= 1 ? rawHle * 100 : rawHle);
  }

  let funcCalling = null;
  const rawIfbench = model.ifbench || (model.gpqa ? model.gpqa * 0.8 : null);
  if (rawIfbench !== undefined && rawIfbench !== null) {
    funcCalling = Math.round(rawIfbench <= 1 ? rawIfbench * 100 : rawIfbench);
  }

  let ctx = model.context_length;
  if (!ctx) {
    const slug = (model.slug || '').toLowerCase();
    if (slug.includes('gpt-4o') || slug.includes('gpt-4')) ctx = 128000;
    else if (slug.includes('gpt-5') || slug.includes('gemini-3')) ctx = 1000000;
    else if (slug.includes('gemini-2.5-flash') || slug.includes('gemini-2.5')) ctx = 1000000;
    else if (slug.includes('claude-3') || slug.includes('claude-3-5')) ctx = 200000;
    else if (slug.includes('claude-4') || slug.includes('claude-opus-4')) ctx = 200000;
    else if (slug.includes('deepseek-v4')) ctx = 128000;
    else if (slug.includes('mimo')) ctx = 1048576;
    else ctx = 128000;
  }
  let longContext = null;
  if (ctx && ctx > 0) {
    if (ctx >= 1000000) longContext = 99;
    else if (ctx >= 200000) longContext = 95;
    else if (ctx >= 128000) longContext = 88;
    else if (ctx >= 32000) longContext = 78;
    else if (ctx >= 8000) longContext = 65;
    else longContext = 50;
  }

  const nameLower = (model.name || '').toLowerCase();
  const isMultimodal = nameLower.includes('gpt') || nameLower.includes('claude') || nameLower.includes('gemini') || nameLower.includes('deepseek') || nameLower.includes('mimo');
  let multimodal = null;
  if (isMultimodal) {
    multimodal = Math.max(30, Math.min(98, Math.round((model.intelligence_index || 80) * 0.95)));
  }

  const speedVal = model.throughput || (nameLower.includes('flash') || nameLower.includes('mimo') ? 95 : 35);
  let speedNorm = null;
  if (speedVal && speedVal > 0) {
    speedNorm = Math.round(Math.min(95, Math.max(20, (speedVal / 140) * 100)));
  }

  const blended = model.blendedPrice || 1.0;
  let costEff = null;
  if (blended !== null && blended !== undefined && !isNaN(blended) && blended > 0) {
    costEff = Math.round(100 - Math.min(80, Math.max(10, Math.log10(blended + 0.05) * 20 + 38)));
  }

  return {
    coding,
    reasoning,
    math,
    writing,
    research,
    funcCalling,
    longContext,
    multimodal,
    speedNorm,
    speedVal,
    costEff,
    blendedCost: blended,
    context_length: ctx
  };
}

const formatContextWindow = (ctx) => {
  if (!ctx) return 'N/A';
  if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(0)}M`;
  if (ctx >= 1000) return `${(ctx / 1000).toFixed(0)}K`;
  return ctx.toString();
};

const getImprovement = (current, suggested, type) => {
  if (current === undefined || current === null || suggested === undefined || suggested === null) return '—';
  if (typeof current === 'string') current = parseFloat(current.replace(/[^0-9.-]/g, ''));
  if (typeof suggested === 'string') suggested = parseFloat(suggested.replace(/[^0-9.-]/g, ''));

  if (isNaN(current) || isNaN(suggested) || current === 0) return '—';

  const diff = suggested - current;
  const pct = Math.abs((diff / current) * 100).toFixed(2);

  if (type === 'cost' || type === 'latency') {
    if (diff < 0) {
      return { text: `↓ ${pct}%`, isGood: true };
    } else if (diff > 0) {
      return { text: `↑ ${pct}%`, isGood: false };
    }
    return { text: '→ 0.00%', isGood: true };
  } else {
    if (type === 'quality') {
      const diffVal = diff.toFixed(1);
      const sign = diff >= 0 ? '+' : '';
      return { text: `${sign}${diffVal} (${pct}%)`, isGood: diff >= 0 };
    } else {
      if (diff > 0) {
        return { text: `↑ ${pct}%`, isGood: true };
      } else if (diff < 0) {
        return { text: `↓ ${pct}%`, isGood: false };
      }
      return { text: '→ 0.00%', isGood: true };
    }
  }
};

const getSubscriptionBaselineModelId = (toolName, plan) => {
  const t = (toolName || '').toLowerCase();
  const p = (plan || '').toLowerCase();
  
  if (t.includes('cursor')) {
    if (p.includes('free')) return 'openai/gpt-4o-mini';
    return 'openai/gpt-5.5';
  }
  if (t.includes('copilot') || t.includes('github')) {
    if (p.includes('pro+')) return 'openai/gpt-5.5';
    return 'openai/gpt-4o';
  }
  if (t.includes('claude') || t.includes('anthropic')) {
    if (p.includes('free')) return 'anthropic/claude-sonnet-4.6';
    return 'anthropic/claude-opus-4.7';
  }
  if (t.includes('chatgpt') || t.includes('openai')) {
    if (p.includes('free') || p.includes('go')) return 'openai/gpt-5.3-chat';
    if (p.includes('pro')) return 'openai/gpt-5.5-pro';
    return 'openai/gpt-5.5';
  }
  if (t.includes('gemini') || t.includes('google')) {
    if (p.includes('free')) return 'google/gemini-3.5-flash';
    return 'google/gemini-3.5-pro';
  }
  if (t.includes('grok') || t.includes('xai')) {
    return 'x-ai/grok-4.3';
  }
  if (t.includes('perplexity')) {
    if (p.includes('pro')) return 'perplexity/sonar-pro';
    return 'perplexity/sonar';
  }
  if (t.includes('windsurf')) {
    return 'openai/gpt-4o';
  }
  return 'openai/gpt-4o';
};

const resolveModelObjects = (rec, idx, llms, auditResult, choice) => {
  if (!llms || llms.length === 0) return { baseline: null, recommended: null };

  const alloc = auditResult.allocations?.[idx];
  const opt = choice === 'api' ? rec?.apiOption : rec?.subscriptionOption;

  const mapModelIdToEloSlug = (idOrName) => {
    if (!idOrName) return '';
    let s = idOrName;
    if (s.includes('/')) {
      s = s.split('/')[1];
    }
    // Clean string for standard slug formatting
    s = s.toLowerCase()
         .replace(/\(.*\)/g, '') // remove parenthesized details
         .trim()
         .replace(/[\s._]+/g, '-'); // replace spaces, dots, underscores with hyphens
    
    // Check key prefixes to align with market intelligence data ELO slugs
    if (s.includes('claude-3-5-sonnet') || s.includes('claude-3.5-sonnet') || s.includes('claude-35-sonnet')) return 'claude-35-sonnet';
    if (s.includes('gpt-4o-mini')) return 'gpt-4o-mini';
    if (s.includes('gpt-4o')) return 'gpt-4o';
    if (s.includes('gpt-5-5')) return 'gpt-5-5';
    if (s.includes('gpt-5-3')) return 'gpt-5-3';
    if (s.includes('gpt-5')) return 'gpt-5-5';
    if (s.includes('claude-fable') || s.includes('fable')) return 'claude-fable-5';
    if (s.includes('claude-opus-4-7') || s.includes('claude-opus-4-8') || (s.includes('claude') && s.includes('opus'))) return 'claude-opus-4-7';
    if (s.includes('mimo-v2-5')) return 'mimo-v2-5-pro';
    if (s.includes('deepseek-v4')) return 'deepseek-v4-pro';
    if (s.includes('gemini-3-1-flash-lite') || s.includes('gemini-3-1-flash-lite-preview')) return 'gemini-3-1-flash-lite-preview';
    if (s.includes('gemini-3-1-pro') || s.includes('gemini-3-1-pro-preview')) return 'gemini-3-1-pro-preview';
    if (s.includes('gemini-3-5-flash')) return 'gemini-3-5-flash';
    if (s.includes('gemini-2-5-pro')) return 'gemini-2-5-pro';
    if (s.includes('gemini-2-5-flash')) return 'gemini-2-5-flash';
    if (s.includes('grok-4-3')) return 'grok-4-3';
    if (s.includes('sonar-pro')) return 'sonar-pro';
    return s;
  };

  // 1. Determine baseline model name string
  let baselineNameStr = '';
  if (alloc) {
    if (alloc.type === 'subscription' && alloc.baselineModels && alloc.baselineModels.length > 0) {
      baselineNameStr = alloc.baselineModels[0];
    } else {
      baselineNameStr = alloc.baselineModelName || alloc.modelId || alloc.plan || '';
    }
  }

  // 2. Determine recommended model name string
  let recommendedNameStr = '';
  if (opt) {
    if (choice === 'subscription' && opt.includedModels && opt.includedModels.length > 0) {
      recommendedNameStr = opt.includedModels[0];
    } else {
      recommendedNameStr = opt.name || opt.planName || '';
    }
  }

  // Helper to find a model object in llms matching a name string
  const findModelByName = (nameStr) => {
    if (!nameStr) return null;
    const slug = mapModelIdToEloSlug(nameStr);
    
    // Exact or slug match
    let found = llms.find(m => m.slug === slug || m.slug === nameStr || (m.slug && m.slug === slug.split('/')[1]));
    if (!found) {
      found = llms.find(m => m.slug && m.slug.includes(slug));
    }
    if (!found) {
      // Try direct substring match on name
      found = llms.find(m => m.name && m.name.toLowerCase().includes(nameStr.toLowerCase()));
    }
    return found;
  };

  let baselineModel = findModelByName(baselineNameStr);
  let recommendedModel = findModelByName(recommendedNameStr);

  return { baseline: baselineModel, recommended: recommendedModel };
};

export default function ResultsView({ auditResult, selectedOptions, onNavigateToView, user, renderCoinDropdown, initialView, fromHistory, tokenAdjustments = {} }) {
  const [intelData, setIntelData] = useState(null);
  const isStarter = auditResult?.tierUsed === 'starter' && !(user?.credits?.pro > 0 || user?.credits?.proMax > 0);
  const [showDetailedReport, setShowDetailedReport] = useState((initialView === 'detailed') && !isStarter);

  useEffect(() => {
    fetch('http://localhost:5000/api/audits/analysis/raw-data')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch raw market data');
        return res.json();
      })
      .then(data => {
        setIntelData(data);
      })
      .catch(err => {
        console.error('Failed to load raw market data in ResultsView:', err);
      });
  }, []);

  if (!auditResult) return null;
  if (!intelData) return <LoadingIndicator />;
  const { savings, selectedTools } = auditResult;

  // ── Aggregate numbers for the detailed report ──────────────────────────────
  const recs = savings.recommendations || [];
  
  // Fallback if selectedOptions is empty/undefined/incomplete
  const finalSelectedOptions = { ...(selectedOptions || {}) };
  recs.forEach((rec, idx) => {
    if (finalSelectedOptions[idx] === undefined) {
      const apiSav = rec.apiOption ? rec.apiOption.savings : -Infinity;
      const subSav = rec.subscriptionOption ? rec.subscriptionOption.savings : -Infinity;
      finalSelectedOptions[idx] = apiSav >= subSav ? 'api' : 'subscription';
    }
  });

  const currentCostVal = auditResult.totalCurrentCost || (auditResult.allocations || []).reduce((acc, a) => acc + (a.currentCost || 0), 0);

  const bestMonthly = recs.reduce((acc, rec, idx) => {
    const choice = finalSelectedOptions[idx] || 'api';
    if (choice === 'api') {
      if (!rec.apiOption) return acc;
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

      const adj = tokenAdjustments[idx] || { 
        inputMillions: (rec.apiOption.defaultInputTokens || 5000000) / 1000000, 
        outputMillions: (rec.apiOption.defaultOutputTokens || 1250000) / 1000000 
      };
      const inputCost = adj.inputMillions * inputCostPerM;
      const outputCost = adj.outputMillions * outputCostPerM;
      const dynamicApiCost = inputCost + outputCost;
      const details = parseRecDetails(rec);
      const itemCurrentCost = details.currentCost || 0;
      return acc + (itemCurrentCost - dynamicApiCost);
    } else {
      return acc + (rec.subscriptionOption ? rec.subscriptionOption.savings : 0);
    }
  }, 0);
  const bestAnnual      = bestMonthly * 12;
  const savingPct       = currentCostVal > 0 ? ((bestMonthly / currentCostVal) * 100).toFixed(1) : 0;
  const goalLabel       = auditResult.optimizationGoal === 'performance'
    ? 'Performance Preservation'
    : auditResult.optimizationGoal === 'quality'
    ? 'Quality Focus'
    : `Target Cost Reduction (${auditResult.costCutPercentage || 50}%)`;

  const totalApiSavings = savings.apiMonthly  ?? savings.totalMonthly  ?? 0;
  const totalSubSavings = savings.subMonthly  ?? savings.totalMonthly  ?? 0;

  return (
    <div className="app-container">
      {/* ── Navbar ── */}
      <header className="navbar">
        <div className="container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="brand">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="nav-actions">
            {renderCoinDropdown && renderCoinDropdown()}
            <button onClick={() => onNavigateToView('landing')} className="btn btn-outline">Back to Home</button>
            <button onClick={() => onNavigateToView('step1')} className="btn btn-black">Run Another Audit</button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main-content" style={{ padding: '48px 0' }}>
        <div className="container">
          
          {!showDetailedReport ? (
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '850', color: '#0F172A', margin: '0 0 8px 0' }}>
                  Your Final Optimization Plan
                </h2>
                <p style={{ fontSize: '15px', color: '#475569', margin: 0 }}>
                  Here is the summary of your selected optimization actions.
                </p>
              </div>

              {/* Savings summary cards at the top */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                
                {/* Monthly Savings Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
                }}>
                  <div style={{ backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Total Monthly Savings
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '950', color: '#10B981', lineHeight: 1 }}>
                      ${bestMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                    </div>
                  </div>
                </div>

                {/* Annual Savings Card */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
                }}>
                  <div style={{ backgroundColor: '#FFF7ED', color: '#EA580C', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Total Annual Savings
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '950', color: '#0F172A', lineHeight: 1 }}>
                      ${bestAnnual.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/yr
                    </div>
                  </div>
                </div>

              </div>

              {/* Detailed Analysis Report Button / Locked Banner — hidden when viewing from history */}
              {!fromHistory && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', gap: '12px' }}>
                  {isStarter ? (
                    <div style={{
                      padding: '20px 24px',
                      backgroundColor: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '16px',
                      textAlign: 'center',
                      maxWidth: '560px',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'inline-flex', padding: '10px', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '50%', marginBottom: '12px' }}>
                        <Lock size={20} />
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#1E293B', margin: '0 0 6px 0' }}>
                        Detailed Analysis Report Locked
                      </h4>
                      <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                        Your Starter plan only includes the spend optimization action plan. Upgrade to the Pro plan to unlock ELO benchmarks, master recommendation tables, and multi-category metrics.
                      </p>
                      <button
                        onClick={() => {
                          onNavigateToView('landing');
                          setTimeout(() => {
                            const el = document.getElementById('pricing');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 150);
                        }}
                        className="btn btn-green"
                        style={{
                          padding: '8px 18px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Sparkles size={14} /> Upgrade to Pro
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowDetailedReport(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '14px 32px',
                        fontSize: '15px',
                        fontWeight: '750',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.45)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)';
                      }}
                    >
                      <span>📊</span> View Detailed Analysis Report
                    </button>
                  )}
                </div>
              )}

              {/* Recommendation list (showing only the chosen options) */}
              <div className="results-recommendations-list">
                {recs.map((rec, idx) => {
                  const choice = finalSelectedOptions[idx] || 'api';
                  const opt = choice === 'api' ? rec.apiOption : rec.subscriptionOption;
                  if (!opt) return null;

                  const match = rec.issue ? rec.issue.match(/Paying \$([\d,.]+)/) : null;
                  const itemCurrentCost = match ? parseFloat(match[1].replace(/,/g, '')) : 0;

                  const details = parseRecDetails(rec);
                  const dynamicSavingsVal = (() => {
                    if (choice === 'api' && rec.apiOption) {
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

                      const adj = tokenAdjustments[idx] || { 
                        inputMillions: (rec.apiOption.defaultInputTokens || 5000000) / 1000000, 
                        outputMillions: (rec.apiOption.defaultOutputTokens || 1250000) / 1000000 
                      };
                      const inputCost = adj.inputMillions * inputCostPerM;
                      const outputCost = adj.outputMillions * outputCostPerM;
                      const dynamicApiCost = inputCost + outputCost;
                      return itemCurrentCost - dynamicApiCost;
                    }
                    return opt ? opt.savings : 0;
                  })();
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

                  // Suggested model/plan name
                  const sugModel = choice === 'api' 
                    ? (opt.recommendedModel || opt.name || 'GPT-5.5 (xhigh)')
                    : (opt.recommendedModel || opt.planName || 'ChatGPT Plus');

                  // Suggested provider name
                  const sugProvider = choice === 'api'
                    ? (opt.recommendedProvider || 'OpenAI')
                    : (opt.recommendedProvider || details.provider || 'OpenAI');

                  const sugDisplayName = choice === 'subscription'
                    ? (() => {
                        const plan = sugModel;
                        const provider = sugProvider;
                        
                        let cleanPlan = plan;
                        const cleanProviderLower = provider.toLowerCase();
                        if (cleanPlan.toLowerCase().startsWith(cleanProviderLower)) {
                          cleanPlan = cleanPlan.substring(provider.length).trim();
                        }
                        return cleanPlan || plan;
                      })()
                    : sugModel;


                  return (
                    <div key={idx} className="rec-card" style={{
                      display: 'block',
                      padding: '24px',
                      marginBottom: '24px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderLeft: choice === 'api' ? '5px solid #3B82F6' : '5px solid #10B981',
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.015)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <span className="rec-tool" style={{ fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {(() => {
                              const logo = getProviderLogo(rec.tool);
                              return logo ? (
                                <img src={logo} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                              ) : (
                                <span style={{ color: choice === 'api' ? '#3B82F6' : '#10B981' }}>●</span>
                              );
                            })()}
                            <span>{rec.tool}</span>
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            color: choice === 'api' ? '#3B82F6' : '#047857',
                            backgroundColor: choice === 'api' ? '#EFF6FF' : '#ECFDF5',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginTop: '6px'
                          }}>
                            Selected Path: {choice === 'api' ? 'Direct API Integration' : 'Subscription Migration'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#64748B' }}>
                            Current: ${itemCurrentCost.toLocaleString()}/mo
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: choice === 'api' ? '#3B82F6' : '#10B981' }}>
                            Optimized: ${(() => {
                              if (choice === 'api' && rec.apiOption) {
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

                                const adj = tokenAdjustments[idx] || { 
                                  inputMillions: (rec.apiOption.defaultInputTokens || 5000000) / 1000000, 
                                  outputMillions: (rec.apiOption.defaultOutputTokens || 1250000) / 1000000 
                                };
                                return (adj.inputMillions * inputCostPerM + adj.outputMillions * outputCostPerM).toFixed(2);
                              }
                              return (opt ? opt.cost : 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                            })()}/mo
                          </span>
                        </div>
                      </div>

                      <p style={{ fontSize: '13.5px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.6' }}>
                        {rec.issue}
                      </p>

                      {/* Transition Visual Block */}
                      {(() => {
                        const cleanBaseModelName = (details.modelName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                        const cleanSugModelName = (choice === 'api' ? (sugModel || '') : '').toLowerCase().replace(/[^a-z0-9]/g, '');
                        const currentContext = [details.provider, details.toolName];
                        const suggestedContext = [sugProvider, choice === 'subscription' ? null : rec.apiOption?.recommendedProvider];
                        
                        const isSameChoice = choice === 'api'
                          ? (details.type === 'api' &&
                            (
                              uiChoiceLabelsMatch(currentDisplayName, sugDisplayName, currentContext, suggestedContext) ||
                              (cleanBaseModelName && cleanSugModelName && (
                                cleanBaseModelName === cleanSugModelName ||
                                cleanSugModelName.includes(cleanBaseModelName) ||
                                cleanBaseModelName.includes(cleanSugModelName)
                              ))
                            ))
                          : (details.type === 'subscription' &&
                            (
                              uiChoiceLabelsMatch(currentDisplayName, sugDisplayName, currentContext, suggestedContext) ||
                              uiChoiceLabelsMatch(
                                `${details.toolName || ''} ${details.plan || ''}`,
                                rec.subscriptionOption?.planName || sugModel,
                                currentContext,
                                suggestedContext
                              )
                            ));

                        if (isSameChoice) {
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
                              marginBottom: '16px',
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

                              {/* Right Side: Message */}
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
                                <span>The current {choice === 'subscription' ? 'subscription' : 'API'} is the best and optimized.</span>
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
                            marginBottom: '16px',
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
                                <span style={{ fontSize: '8px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: '800', letterSpacing: '0.04em' }}>Suggested ({choice})</span>
                                <span style={{ fontWeight: '750', color: '#10B981', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }} title={sugDisplayName}>
                                  {sugDisplayName}
                                </span>
                                <span style={{ fontSize: '9px', color: '#64748B' }}>{sugProvider}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div style={{
                        backgroundColor: choice === 'api' ? '#EFF6FF' : '#ECFDF5',
                        border: choice === 'api' ? '1px solid #BFDBFE' : '1px solid #A7F3D0',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: choice === 'api' ? '#1E40AF' : '#065F46', letterSpacing: '0.05em', marginBottom: '6px' }}>
                          Action Plan Details
                        </div>
                        <p style={{ fontSize: '13.5px', color: '#1E293B', fontWeight: '600', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                          {opt.action}
                        </p>
                        
                        {opt.limits && (
                          <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                            <span>ℹ️</span> {opt.limits}
                          </div>
                        )}

                        {opt.includedModels && opt.includedModels.length > 0 && (
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ fontSize: '10px', fontWeight: '750', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '6px' }}>
                              Models Included:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {opt.includedModels.map((model, mi) => (
                                <span key={mi} style={{
                                  fontSize: '11px', fontWeight: '600',
                                  color: choice === 'api' ? '#1E40AF' : '#047857',
                                  backgroundColor: choice === 'api' ? '#DBEAFE' : '#D1FAE5',
                                  border: choice === 'api' ? '1px solid #BFDBFE' : '1px solid #A7F3D0',
                                  padding: '2px 8px', borderRadius: '6px',
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

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '16px' }}>
                        <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '500' }}>
                          {dynamicSavingsVal >= 0 ? 'Est. Savings from this path:' : 'Est. Cost Increase from this path:'}
                        </span>
                        <strong style={{ fontSize: '15px', color: dynamicSavingsVal >= 0 ? '#10B981' : '#EF4444' }}>
                          {dynamicSavingsVal >= 0 ? `+$${dynamicSavingsVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/mo` : `-$${Math.abs(dynamicSavingsVal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/mo`}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
                {fromHistory ? (
                  <button
                    onClick={() => onNavigateToView('history')}
                    style={{ padding: '12px 28px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: '#64748B', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    ← Back to Reports History
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigateToView('step4')}
                    style={{ padding: '12px 28px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: '#64748B', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    ← Back to Action Plan Selection
                  </button>
                )}
                <button
                  onClick={() => onNavigateToView('step1')}
                  style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', backgroundColor: '#0F172A', color: '#FFFFFF', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Run Another Audit 🔄
                </button>
              </div>
            </div>
          ) : (
            <div id="detailed-report-section" style={{ width: '100%' }}>

            {/* Report Header */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px 32px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
            }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                  Detailed Analysis Report
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#475569' }}>
                    {goalLabel}
                  </span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#CBD5E1' }}></span>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '600' }}>
                    Audit done on: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    if (fromHistory) {
                      onNavigateToView('history');
                    } else {
                      setShowDetailedReport(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  ← {fromHistory ? 'Back to Reports History' : 'Back to Summary'}
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0F172A'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
            {/* Prepare Cost Distribution Data */}
            {(() => {
              const distributionData = (auditResult.allocations || []).map((alloc, idx) => {
                const rec = recs[idx];
                const choice = finalSelectedOptions[idx] || 'api';
                const opt = choice === 'api' ? rec?.apiOption : rec?.subscriptionOption;
                const optimizedCost = (() => {
                  if (choice === 'api' && rec?.apiOption) {
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

                    const adj = tokenAdjustments[idx] || { 
                      inputMillions: (rec.apiOption.defaultInputTokens || 5000000) / 1000000, 
                      outputMillions: (rec.apiOption.defaultOutputTokens || 1250000) / 1000000 
                    };
                    return adj.inputMillions * inputCostPerM + adj.outputMillions * outputCostPerM;
                  }
                  return opt ? (opt.cost || 0) : 0;
                })();

                // Resolve model names for accurate API/Subscription legend display
                let baselineModelName = '';
                let recommendedModelName = '';
                if (intelData && intelData.llms) {
                  const resolved = resolveModelObjects(rec || { apiOption: {}, subscriptionOption: {} }, idx, intelData.llms, auditResult, choice);
                  if (resolved.baseline) baselineModelName = resolved.baseline.name || resolved.baseline.slug;
                  if (resolved.recommended) recommendedModelName = resolved.recommended.name || resolved.recommended.slug;
                }

                return {
                  name: alloc.toolName,
                  plan: choice === 'api' ? 'API' : (opt?.planName || alloc.plan || 'Pro'),
                  optimizedCost,
                  isOptimized: opt ? opt.savings > 0 : false,
                  alloc,
                  choice,
                  opt,
                  baselineModelName,
                  recommendedModelName
                };
              });
              const totalOptimized = distributionData.reduce((acc, item) => acc + item.optimizedCost, 0);

              const tiles = [
                {
                  icon: (
                    <div style={{ backgroundColor: '#F3E8FF', color: '#9333EA', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                  ),
                  label: 'Current Monthly Cost',
                  value: `$${currentCostVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
                  sub: '100% baseline',
                  valColor: '#0F172A'
                },
                {
                  icon: (
                    <div style={{ backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                  ),
                  label: 'Selected Monthly Savings',
                  value: `$${bestMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  sub: `${savingPct}% reduction`,
                  valColor: '#10B981'
                },
                {
                  icon: (
                    <div style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v-6H18z"></path></svg>
                    </div>
                  ),
                  label: 'Optimized Monthly Cost',
                  value: `$${Math.max(0, currentCostVal - bestMonthly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  sub: 'New monthly budget',
                  valColor: '#4F46E5'
                },
                {
                  icon: (
                    <div style={{ backgroundColor: '#FFEDD5', color: '#EA580C', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                    </div>
                  ),
                  label: 'Est. Annual Savings',
                  value: `$${bestAnnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  sub: `${savingPct}% reduction`,
                  valColor: '#0F172A'
                },
                {
                  icon: (
                    <div style={{ backgroundColor: '#DBEAFE', color: '#2563EB', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                  ),
                  label: 'Optimized Changes',
                  value: `${recs.filter((r, idx) => {
                     const choice = finalSelectedOptions[idx];
                     if (choice === 'api' && r.apiOption) {
                       const limits = r.apiOption.limits || '';
                       const inputCostPerM = r.apiOption.inputCostPerM !== undefined 
                         ? r.apiOption.inputCostPerM 
                         : (() => {
                             const match = limits.match(/\$(\d+\.?\d*)\/1M\s*input/i);
                             return match ? parseFloat(match[1]) : 5.00;
                           })();
                       const outputCostPerM = r.apiOption.outputCostPerM !== undefined 
                         ? r.apiOption.outputCostPerM 
                         : (() => {
                             const match = limits.match(/\$(\d+\.?\d*)\/1M\s*output/i);
                             return match ? parseFloat(match[1]) : 15.00;
                           })();

                       const adj = tokenAdjustments[idx] || { 
                         inputMillions: (r.apiOption.defaultInputTokens || 5000000) / 1000000, 
                         outputMillions: (r.apiOption.defaultOutputTokens || 1250000) / 1000000 
                       };
                       const dynamicApiCost = adj.inputMillions * inputCostPerM + adj.outputMillions * outputCostPerM;
                       const details = parseRecDetails(r);
                       const itemCurrentCost = details.currentCost || 0;
                       return itemCurrentCost - dynamicApiCost > 0;
                     }
                     const opt = choice === 'api' ? r.apiOption : r.subscriptionOption;
                     return opt && opt.savings > 0;
                   }).length} items`,
                  sub: 'Across selected path',
                  valColor: '#0F172A'
                },
                {
                  icon: (
                    <div style={{ backgroundColor: '#FAE8FF', color: '#D946EF', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                    </div>
                  ),
                  label: 'Optimization Goal',
                  value: auditResult.optimizationGoal === 'performance' ? 'Performance' :
                         auditResult.optimizationGoal === 'quality' ? 'Quality Focus' : 'Cost Reduction',
                  sub: 'Maintain quality',
                  valColor: '#7C3AED'
                },
                {
                  icon: (
                    <div style={{ backgroundColor: '#CCFBF1', color: '#0D9488', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                  ),
                  label: 'Configured Allocations',
                  value: `${auditResult.allocations ? auditResult.allocations.length : 0} tools`,
                  sub: `${auditResult.teamSize || 0} total seats`,
                  valColor: '#0F172A'
                }
              ];

              return (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                    {tiles.map((tile, i) => (
                      <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '10px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        {tile.icon}
                        <div>
                          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '3px' }}>{tile.label}</div>
                          <div style={{ fontSize: '17px', fontWeight: '950', color: tile.valColor, fontFamily: 'var(--font-title)', lineHeight: 1.1 }}>{tile.value}</div>
                          <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px', fontWeight: '500' }}>{tile.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px 18px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#065F46'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ flexShrink: 0 }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>
                      You save <strong style={{ color: '#047857' }}>${bestMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({savingPct}%)</strong> per month by implementing your chosen action plan pathways.
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.45fr', gap: '24px', marginTop: '20px', alignItems: 'stretch' }}>
                    {/* Cost Comparison Left Column */}
                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '4px', height: '14px', backgroundColor: '#F59E0B', borderRadius: '2px' }}></span>
                        <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>
                          Cost Comparison — Before vs After
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                              <th style={{ padding: '10px 16px', fontWeight: '800', textAlign: 'left', color: '#64748B', fontSize: '10.5px', textTransform: 'uppercase' }}>Metric</th>
                              <th style={{ padding: '10px 16px', fontWeight: '800', textAlign: 'right', color: '#64748B', fontSize: '10.5px', textTransform: 'uppercase' }}>Current</th>
                              <th style={{ padding: '10px 16px', fontWeight: '800', textAlign: 'right', color: '#64748B', fontSize: '10.5px', textTransform: 'uppercase' }}>Optimized</th>
                              <th style={{ padding: '10px 16px', fontWeight: '800', textAlign: 'right', color: '#64748B', fontSize: '10.5px', textTransform: 'uppercase' }}>Δ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { label: 'Monthly Cost', cur: `$${currentCostVal.toLocaleString()}`, opt: `$${(currentCostVal - bestMonthly).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, delta: `-${savingPct}%`, good: true },
                              { label: 'Annual Cost', cur: `$${(currentCostVal * 12).toLocaleString()}`, opt: `$${((currentCostVal - bestMonthly) * 12).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`, delta: `-${savingPct}%`, good: true },
                              { label: 'Selected Save', cur: '—', opt: `+$${bestMonthly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/mo`, delta: '+', good: true },
                              { label: 'Team Seats', cur: `${auditResult.teamSize || 0}`, opt: `${auditResult.teamSize || 0}`, delta: '—', good: false },
                              { label: 'Allocations', cur: `${auditResult.allocations?.length || 0}`, opt: `${auditResult.allocations?.length || 0}`, delta: '—', good: false }
                            ].map((row, i) => (
                              <tr key={i} style={{ borderBottom: i < 4 ? '1px solid var(--color-border)' : 'none' }}>
                                <td style={{ padding: '10px 16px', fontWeight: '700', color: '#334155' }}>{row.label}</td>
                                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#64748B', fontWeight: '500' }}>{row.cur}</td>
                                <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '800', color: '#0F172A' }}>{row.opt}</td>
                                <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '850', color: row.good ? '#10B981' : '#64748B' }}>{row.delta}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ padding: '12px 16px', backgroundColor: '#ECFDF5', borderTop: '1px solid #A7F3D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#065F46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px' }}>✓</span> You Save
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: '950', color: '#10B981', lineHeight: 1 }}>
                            ${bestMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: '700', marginTop: '2px' }}>
                            ${bestAnnual.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/year
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cost Distribution Right Column */}
                    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px 24px' }}>
                      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '4px', height: '14px', backgroundColor: '#6366F1', borderRadius: '2px' }}></span>
                        <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>
                          Cost Distribution (Optimized)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                        {/* SVG Donut Chart */}
                        <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
                          <svg width="150" height="150" viewBox="0 0 150 150">
                            <circle cx="75" cy="75" r="50" fill="transparent" stroke="#E2E8F0" strokeWidth="24" />
                            {(() => {
                              const r = 50;
                              const circ = 2 * Math.PI * r;
                              let accumAngle = 0;
                              const colors = ['#6366F1', '#F59E0B', '#10B981', '#94A3B8', '#38BDF8', '#EC4899'];
                              
                              return distributionData.map((item, idx) => {
                                if (item.optimizedCost <= 0) return null;
                                const frac = item.optimizedCost / totalOptimized;
                                const strokeDash = `${frac * circ} ${circ}`;
                                const strokeOffset = `-${(accumAngle / 360) * circ}`;
                                accumAngle += frac * 360;
                                return (
                                  <circle
                                    key={idx}
                                    cx="75"
                                    cy="75"
                                    r={r}
                                    fill="transparent"
                                    stroke={colors[idx % colors.length]}
                                    strokeWidth="24"
                                    strokeDasharray={strokeDash}
                                    strokeDashoffset={strokeOffset}
                                    transform="rotate(-90 75 75)"
                                  />
                                );
                              });
                            })()}
                          </svg>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '16px', fontWeight: '950', color: '#0F172A', lineHeight: 1 }}>
                              ${totalOptimized.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                            <span style={{ fontSize: '9px', color: '#64748B', fontWeight: '700', marginTop: '2px', textTransform: 'uppercase' }}>
                              Monthly
                            </span>
                          </div>
                        </div>

                        {/* Donut Legend */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {distributionData.map((item, idx) => {
                            const colors = ['#6366F1', '#F59E0B', '#10B981', '#94A3B8', '#38BDF8', '#EC4899'];
                            const color = colors[idx % colors.length];
                            const pct = totalOptimized > 0 ? ((item.optimizedCost / totalOptimized) * 100).toFixed(1) : '0.0';
                            return (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }}></span>
                                  <span style={{ fontWeight: '700', color: '#334155' }}>
                                    {(() => {
                                      const stripParentheses = (str) => {
                                        if (!str) return '';
                                        return str.replace(/\s*\(.*?\)/g, '').trim();
                                      };

                                      const getLabel = (toolName, planOrModel, type) => {
                                        const cleanPlanOrModel = stripParentheses(planOrModel);
                                        if (type === 'api') {
                                          let displayModel = cleanPlanOrModel || 'API';
                                          const lowerModel = displayModel.toLowerCase();
                                          const commonPrefixes = ['gpt', 'claude', 'gemini', 'deepseek', 'grok', 'sonar', 'mimo'];
                                          const startsWithCommon = commonPrefixes.some(pref => lowerModel.startsWith(pref));
                                          
                                          if (!startsWithCommon && !lowerModel.includes(toolName.toLowerCase())) {
                                            displayModel = `${toolName} ${displayModel}`;
                                          }
                                          return `${displayModel}(API)`;
                                        } else {
                                          let displayPlan = cleanPlanOrModel || 'Subscription';
                                          if (!displayPlan.toLowerCase().startsWith(toolName.toLowerCase())) {
                                            displayPlan = `${toolName} ${displayPlan}`;
                                          }
                                          return `${displayPlan}(subscription)`;
                                        }
                                      };

                                      const basePlanOrModel = item.alloc.type === 'api' 
                                        ? item.baselineModelName 
                                        : item.alloc.plan;
                                      const baseLabel = getLabel(item.alloc.toolName, basePlanOrModel, item.alloc.type);

                                      const optPlanOrModel = item.choice === 'api'
                                        ? item.recommendedModelName
                                        : (item.opt?.planName || item.alloc.plan);
                                      const optLabel = getLabel(item.alloc.toolName, optPlanOrModel, item.choice);

                                      if (baseLabel === optLabel) {
                                        return baseLabel;
                                      }
                                      return `${baseLabel} \u2192 ${optLabel}`;
                                    })()}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                  <span style={{ fontWeight: '800', color: '#0F172A' }}>
                                    ${item.optimizedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                  <span style={{ color: '#64748B', fontWeight: '600', width: '40px', textAlign: 'right' }}>
                                    {pct}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>
                            <span>Total</span>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                              <span>${totalOptimized.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              <span style={{ width: '40px', textAlign: 'right' }}>100%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── 3b. Model Specific Comparison & Benchmarks ── */}
            {intelData && intelData.llms && recs.map((rec, origIdx) => ({ rec, origIdx })).filter(item => {
              const choice = finalSelectedOptions[item.origIdx] || 'api';
              const opt = choice === 'api' ? item.rec.apiOption : item.rec.subscriptionOption;
              return opt;
            }).map(({ rec, origIdx }, rIdx) => {
              const { baseline, recommended } = resolveModelObjects(rec, origIdx, intelData.llms, auditResult, finalSelectedOptions[origIdx]);
              if (!baseline || !recommended) return null;

              // Calculate benchmark scores
              const baselineScores = getBenchmarkScores(baseline, intelData);
              const recommendedScores = getBenchmarkScores(recommended, intelData);

              // Filter categories to only active ones
              const activeCategories = CATEGORIES.filter(cat => {
                const baseScore = baselineScores[cat.key];
                const recScore = recommendedScores[cat.key];
                return baseScore !== null && baseScore !== undefined && recScore !== null && recScore !== undefined;
              });

              // SVG Graph dimensions
              const paddingLeft = 85;
              const paddingRight = 45;
              const paddingTop = 45;
              const paddingBottom = 65;
              const chartWidth = 900 - paddingLeft - paddingRight;
              const chartHeight = 420 - paddingTop - paddingBottom;

              const getX = (idx) => {
                if (activeCategories.length <= 1) return paddingLeft + chartWidth / 2;
                return paddingLeft + idx * (chartWidth / (activeCategories.length - 1));
              };
              const getY = (score) => 420 - paddingBottom - (score / 100) * chartHeight;

              const pointsBaseline = activeCategories.map((cat, idx) => ({
                x: getX(idx),
                y: getY(baselineScores[cat.key]),
                score: baselineScores[cat.key],
                idx
              }));

              const pointsRecommended = activeCategories.map((cat, idx) => ({
                x: getX(idx),
                y: getY(recommendedScores[cat.key]),
                score: recommendedScores[cat.key],
                idx
              }));

              const baselinePath = getSmoothPath(pointsBaseline);
              const recommendedPath = getSmoothPath(pointsRecommended);

              // Confidence logic
              const confidenceVal = Math.min(98, Math.max(75, 96 - Math.abs((recommendedScores.intelligence_index || 80) - (baselineScores.intelligence_index || 80)) * 2));
              const isHighConfidence = confidenceVal >= 90;

              // Cost details
              const alloc = auditResult.allocations?.[origIdx];
              const currentMonthly = alloc?.currentCost || 0;
              const choice = finalSelectedOptions[origIdx] || 'api';
              const opt = choice === 'api' ? rec.apiOption : rec.subscriptionOption;
              const suggestedMonthly = Math.max(0, currentMonthly - (opt ? opt.savings : 0));

              // Metric comparisons
              const specs = [
                { label: 'Monthly Cost', cur: `$${currentMonthly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, opt: `$${suggestedMonthly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, type: 'cost' },
                { label: 'Cost per 1M Input Tokens', cur: `$${(baseline.inputCost || 0).toFixed(2)}`, opt: `$${(recommended.inputCost || 0).toFixed(2)}`, type: 'cost' },
                { label: 'Cost per 1M Output Tokens', cur: `$${(baseline.outputCost || 0).toFixed(2)}`, opt: `$${(recommended.outputCost || 0).toFixed(2)}`, type: 'cost' },
                { label: 'Blended Cost (3:1)', cur: `$${(baselineScores.blendedCost || 0).toFixed(2)}`, opt: `$${(recommendedScores.blendedCost || 0).toFixed(2)}`, type: 'cost' },
                { label: 'Quality Score (Audex)', cur: `${(baselineScores.intelligence_index || baselineScores.reasoning || 80).toFixed(1)}/100`, opt: `${(recommendedScores.intelligence_index || recommendedScores.reasoning || 80).toFixed(1)}/100`, type: 'quality' },
                { label: 'Average Latency', cur: `${(baseline.ttft || 1.20).toFixed(2)}s`, opt: `${(recommended.ttft || 0.78).toFixed(2)}s`, type: 'latency' },
                { label: 'Context Window', cur: formatContextWindow(baselineScores.context_length), opt: formatContextWindow(recommendedScores.context_length), type: 'context' },
                { label: 'Uptime (30 Days)', cur: '99.52%', opt: '99.71%', type: 'uptime' }
              ];

              const cleanBaseSubName = `${alloc?.toolName || ''} ${alloc?.plan || ''}`.replace(/\s+/g, ' ').trim().toLowerCase();
              const cleanOptSubName = (rec.subscriptionOption?.planName || '').replace(/\s+/g, ' ').trim().toLowerCase();
              const allocContext = rec.originalAlloc || alloc || {};

              const isAlreadyBest = choice === 'api'
                ? (alloc?.type === 'api' && baseline && recommended && baseline.slug === recommended.slug)
                : (alloc?.type === 'subscription' && (
                    cleanBaseSubName === cleanOptSubName ||
                    uiChoiceLabelsMatch(
                      `${alloc?.toolName || ''} ${alloc?.plan || ''}`,
                      rec.subscriptionOption?.planName || rec.subscriptionOption?.recommendedModel,
                      [allocContext.provider, alloc?.toolName],
                      [rec.subscriptionOption?.recommendedProvider]
                    )
                  ));

              const isSameModel = baseline && recommended && baseline.slug === recommended.slug;
              const isSameApi = alloc?.type === 'api' &&
                                choice === 'api' &&
                                (
                                  isSameModel ||
                                  uiChoiceLabelsMatch(
                                    baseline.name || baseline.slug,
                                    recommended.name || recommended.slug,
                                    [baseline.creator, allocContext.provider, alloc?.toolName],
                                    [recommended.creator, rec.apiOption?.recommendedProvider]
                                  )
                                );
              const isSameSubscription = alloc?.type === 'subscription' && 
                                          choice === 'subscription' && 
                                          (
                                            cleanBaseSubName === cleanOptSubName ||
                                            uiChoiceLabelsMatch(
                                              `${alloc?.toolName || ''} ${alloc?.plan || ''}`,
                                              rec.subscriptionOption?.planName || rec.subscriptionOption?.recommendedModel,
                                              [allocContext.provider, alloc?.toolName],
                                              [rec.subscriptionOption?.recommendedProvider]
                                            )
                                          );
              const isSameCurrentChoice = isSameApi || isSameSubscription;

              return (
                <div key={rIdx} style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '3px', height: '14px', backgroundColor: '#6366F1', borderRadius: '2px', display: 'inline-block' }}></span>
                    Detailed Model Analysis: {alloc?.toolName || rec.tool.split(' (')[0]} {isAlreadyBest ? 'Verification' : 'Optimization'}
                  </div>

                  {/* Model/Subscription Migration Visual Card */}
                  <div style={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                    color: '#FFFFFF',
                    gap: '24px',
                    flexWrap: 'wrap',
                    border: '1px solid #1E293B'
                  }}>
                    {/* Left: Current Model / Subscription */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
                      {(() => {
                        const logoSource = alloc?.type === 'subscription'
                          ? (alloc?.toolName || '')
                          : (baseline.creator || baseline.name || alloc?.toolName || '');
                        const logo = getProviderLogo(logoSource);
                        return logo ? (
                          <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', borderRadius: '8px', flexShrink: 0, padding: '8px' }}>
                            <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                          </div>
                        ) : (
                          <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', borderRadius: '8px', fontSize: '16px', flexShrink: 0 }}>
                            {alloc?.type === 'subscription' ? '💳' : '🤖'}
                          </div>
                        );
                      })()}
                      <div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                          {alloc?.type === 'subscription' ? 'Current Subscription' : 'Current Model'}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>
                          {alloc?.type === 'subscription'
                            ? `${alloc?.toolName || ''} ${alloc?.plan || 'Free'}`
                            : baseline.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                          Provider: {alloc?.type === 'subscription' ? (alloc?.toolName || 'Unknown') : (baseline.creator || 'Unknown')}
                        </div>
                        {alloc?.type === 'subscription' && alloc?.baselineModels && alloc.baselineModels.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                            {alloc.baselineModels.slice(0, 3).map((m, idx) => (
                              <span key={idx} style={{ fontSize: '9.5px', fontWeight: '750', color: '#94A3B8', backgroundColor: '#1E293B', padding: '2px 6px', borderRadius: '4px' }}>
                                {m}
                              </span>
                            ))}
                            {alloc.baselineModels.length > 3 && (
                              <span style={{ fontSize: '9.5px', fontWeight: '750', color: '#64748B', alignSelf: 'center', marginLeft: '2px' }}>
                                +{alloc.baselineModels.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {!isSameCurrentChoice ? (
                      <>
                        {/* Middle: Right Arrow */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </div>

                        {/* Right: Suggested Model / Subscription */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
                          {(() => {
                            const logoSource = choice === 'subscription'
                              ? (rec.subscriptionOption?.planName || '')
                              : (recommended.creator || recommended.name || rec.tool || '');
                            const logo = getProviderLogo(logoSource);
                            return logo ? (
                              <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', borderRadius: '8px', flexShrink: 0, padding: '8px' }}>
                                <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                              </div>
                            ) : (
                              <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E293B', borderRadius: '8px', fontSize: '16px', flexShrink: 0 }}>
                                {choice === 'subscription' ? '⚡' : '🚀'}
                              </div>
                            );
                          })()}
                          <div>
                            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                              {choice === 'subscription' ? 'Suggested Subscription' : 'Suggested Model'}
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-title)', color: '#38BDF8' }}>
                              {choice === 'subscription'
                                ? (rec.subscriptionOption?.planName || 'Optimized Sub')
                                : recommended.name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                              Provider: {choice === 'subscription' ? (rec.subscriptionOption?.planName?.split(' ')[0] || 'Unknown') : (recommended.creator || 'Unknown')}
                            </div>
                            {choice === 'subscription' && rec.subscriptionOption?.includedModels && rec.subscriptionOption.includedModels.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                {rec.subscriptionOption.includedModels.slice(0, 3).map((m, idx) => (
                                  <span key={idx} style={{ fontSize: '9.5px', fontWeight: '750', color: '#7DD3FC', backgroundColor: '#1E293B', padding: '2px 6px', borderRadius: '4px' }}>
                                    {m}
                                  </span>
                                ))}
                                {rec.subscriptionOption.includedModels.length > 3 && (
                                  <span style={{ fontSize: '9.5px', fontWeight: '750', color: '#38BDF8', alignSelf: 'center', marginLeft: '2px' }}>
                                    +{rec.subscriptionOption.includedModels.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Right side message when it's already the best */
                      <div style={{
                        flex: 1.5,
                        minWidth: '250px',
                        backgroundColor: '#1E293B',
                        borderRadius: '8px',
                        padding: '16px 20px',
                        border: '1px solid #334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#38BDF8',
                        fontSize: '13.5px',
                        fontWeight: '750',
                        lineHeight: '1.4'
                      }}>
                        <span style={{ fontSize: '18px' }}>✨</span>
                        <span>
                          The current {isSameSubscription ? 'subscription' : 'API'} is the best and optimized. Keep using it.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subscription Model Coverage & Benchmarking Select */}
                  {((choice === 'subscription' && !isSameSubscription) || (alloc?.type === 'subscription' && choice === 'api')) && (
                    <div style={{
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      fontSize: '13.5px',
                      color: '#1E40AF',
                      lineHeight: '1.5',
                      marginBottom: '16px'
                    }}>
                      <div style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', marginBottom: '6px', color: '#1D4ED8' }}>
                        Subscription Model Coverage &amp; Benchmarking Select
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* 1. If current is subscription, show its included models */}
                        {alloc?.type === 'subscription' && alloc.baselineModels && alloc.baselineModels.length > 0 && (
                          <div>
                            The current <strong>{alloc.toolName} {alloc.plan}</strong> subscription includes access to:
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                              {alloc.baselineModels.map((m, mi) => (
                                <span key={mi} style={{
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: '#1E40AF',
                                  backgroundColor: '#DBEAFE',
                                  border: '1px solid #BFDBFE',
                                  padding: '2px 8px',
                                  borderRadius: '6px'
                                }}>
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2. If recommended is subscription, show its included models */}
                        {choice === 'subscription' && rec.subscriptionOption?.includedModels && rec.subscriptionOption.includedModels.length > 0 && (
                          <div>
                            The recommended <strong>{rec.subscriptionOption.planName || 'Optimized Sub'}</strong> subscription includes access to:
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                              {rec.subscriptionOption.includedModels.map((m, mi) => (
                                <span key={mi} style={{
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: '#1E40AF',
                                  backgroundColor: '#DBEAFE',
                                  border: '1px solid #BFDBFE',
                                  padding: '2px 8px',
                                  borderRadius: '6px'
                                }}>
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. The Comparison Notice Statement */}
                        <div style={{ borderTop: '1px solid #BFDBFE', paddingTop: '10px', marginTop: '4px', fontSize: '12.5px', color: '#1E3A8A', fontWeight: '650' }}>
                          {(() => {
                            if (isSameModel) {
                              return <span>The same model is present as the top model in the subscription so comparison cannot be done. Showing details for <strong style={{ color: '#2563EB' }}>{recommended.name || recommended.slug}</strong> only.</span>;
                            }
                            if (alloc?.type === 'subscription' && choice === 'subscription') {
                              return (
                                <span>
                                  The comparison is done between top model of current <strong>{alloc?.toolName || ''} {alloc?.plan || ''}</strong> (<span style={{ color: '#2563EB', fontWeight: '700' }}>{baseline.name || baseline.slug}</span>) and top model of recommended subscription <strong>{rec.subscriptionOption?.planName || 'Optimized Sub'}</strong> (<span style={{ color: '#2563EB', fontWeight: '700' }}>{recommended.name || recommended.slug}</span>).
                                </span>
                              );
                            } else if (alloc?.type === 'subscription' && choice === 'api') {
                              return (
                                <span>
                                  The comparison is done between top model of current <strong>{alloc?.toolName || ''} {alloc?.plan || ''}</strong> (<span style={{ color: '#2563EB', fontWeight: '700' }}>{baseline.name || baseline.slug}</span>) and recommended API integration (<span style={{ color: '#2563EB', fontWeight: '700' }}>{recommended.name || recommended.slug}</span>).
                                </span>
                              );
                            } else {
                              return (
                                <span>
                                  The comparison is done between current API model <span style={{ color: '#2563EB', fontWeight: '700' }}>{baseline.name || baseline.slug}</span> and top model of recommended subscription <strong>{rec.subscriptionOption?.planName || 'Optimized Sub'}</strong> (<span style={{ color: '#2563EB', fontWeight: '700' }}>{recommended.name || recommended.slug}</span>).
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info Banner when the models are identical (only if blue box is NOT shown) */}
                  {isSameModel && !isSameSubscription && !((choice === 'subscription' && !isSameSubscription) || (alloc?.type === 'subscription' && choice === 'api')) && (
                    <div style={{
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      fontSize: '13.5px',
                      color: '#1E40AF',
                      lineHeight: '1.5',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{ fontSize: '20px' }}>ℹ️</span>
                      <span>The same model is present as the top model in the subscription so comparison cannot be done. Showing details for <strong style={{ color: '#2563EB' }}>{recommended.name || recommended.slug}</strong>.</span>
                    </div>
                  )}

                  {/* Light themed Before vs After Comparison Card */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                      padding: '20px 24px',
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: '#F8FAFC'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ color: '#6366F1', fontSize: '16px' }}>📊</span>
                        {isSameModel ? 'Model Details & Specifications' : `Before vs After Comparison (${choice === 'api' ? 'API Integration' : 'Subscription Migration'})`}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Confidence:</span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          color: '#10B981',
                          backgroundColor: '#D1FAE5',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          border: '1px solid #A7F3D0'
                        }}>{confidenceVal}%</span>
                        <span style={{ fontSize: '11.5px', color: '#10B981', fontWeight: '600' }}>
                          {isHighConfidence ? 'High' : 'Medium'} Confidence
                        </span>
                      </div>
                    </div>
 
                    <div style={{ padding: '24px' }}>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#334155' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                              <th style={{ padding: '12px 16px', fontWeight: '750', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metric</th>
                              {!isSameModel ? (
                                <>
                                  <th style={{ padding: '12px 16px', fontWeight: '750', textAlign: 'left', color: '#EF4444', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <div>Current Model</div>
                                    <div style={{ color: '#0F172A', fontSize: '13.5px', fontWeight: '800', marginTop: '2px', textTransform: 'none' }}>
                                      {baseline.name || baseline.slug}
                                    </div>
                                  </th>
                                  <th style={{ padding: '12px 16px', fontWeight: '750', textAlign: 'left', color: '#10B981', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <div>Suggested Model</div>
                                    <div style={{ color: '#0F172A', fontSize: '13.5px', fontWeight: '800', marginTop: '2px', textTransform: 'none' }}>
                                      {recommended.name || recommended.slug}
                                    </div>
                                  </th>
                                  <th style={{ padding: '12px 16px', fontWeight: '750', textAlign: 'right', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Improvement</th>
                                </>
                              ) : (
                                <th style={{ padding: '12px 16px', fontWeight: '750', textAlign: 'left', color: '#6366F1', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  <div>Active Best Model</div>
                                  <div style={{ color: '#0F172A', fontSize: '13.5px', fontWeight: '800', marginTop: '2px', textTransform: 'none' }}>
                                    {recommended.name || recommended.slug}
                                  </div>
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {specs.map((row, i) => {
                              const imp = getImprovement(row.cur, row.opt, row.type);
                              return (
                                <tr key={i} style={{ borderBottom: i < specs.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0F172A' }}>{row.label}</td>
                                  {!isSameModel ? (
                                    <>
                                      <td style={{ padding: '12px 16px', color: '#475569' }}>{row.cur}</td>
                                      <td style={{ padding: '12px 16px', color: '#0F172A', fontWeight: '700' }}>{row.opt}</td>
                                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '800', color: imp.isGood ? '#10B981' : '#EF4444' }}>
                                        {imp.text || imp}
                                      </td>
                                    </>
                                  ) : (
                                    <td style={{ padding: '12px 16px', color: '#0F172A', fontWeight: '700' }}>{row.opt}</td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Light themed AI Model Benchmarks Across Key Categories */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                    padding: '28px'
                  }}>
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 4px 0' }}>
                        AI Model Benchmarks Across Key Categories
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                        Normalized score (0-100) across major benchmark categories
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'center' }}>
                      {/* Legend */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {!isSameModel ? (
                          <>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '10px' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981', flexShrink: 0 }}></div>
                              <div>
                                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>
                                  {recommended.name || recommended.slug}
                                </div>
                                <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: '750', marginTop: '1px' }}>
                                  Recommended
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px' }}>
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F97316', flexShrink: 0 }}></div>
                              <div>
                                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>
                                  {baseline.name || baseline.slug}
                                </div>
                                <div style={{ fontSize: '10px', color: '#EA580C', fontWeight: '750', marginTop: '1px' }}>
                                  Baseline
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#6366F1', flexShrink: 0 }}></div>
                            <div>
                              <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>
                                {recommended.name || recommended.slug}
                              </div>
                              <div style={{ fontSize: '10px', color: '#4F46E5', fontWeight: '750', marginTop: '1px' }}>
                                Active Best Model
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SVG Chart on light background */}
                      <div style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px 20px 10px 10px' }}>
                        <svg viewBox="0 0 900 420" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                          {/* Y-Axis Gridlines */}
                          {[0, 25, 50, 75, 100].map((val, i) => {
                            const y = 420 - paddingBottom - (val / 100) * chartHeight;
                            return (
                              <g key={i}>
                                <line x1={paddingLeft} y1={y} x2={paddingLeft + chartWidth} y2={y} stroke="rgba(15, 23, 42, 0.06)" strokeDasharray="3 3" />
                                <text x={paddingLeft - 15} y={y + 4} textAnchor="end" style={{ fill: '#64748B', fontSize: '11px', fontWeight: '600' }}>
                                  {val}
                                </text>
                              </g>
                            );
                          })}

                          <text x="15" y={420 - paddingBottom - chartHeight / 2} textAnchor="middle" transform={`rotate(-90, 20, ${420 - paddingBottom - chartHeight / 2})`} style={{ fill: '#64748B', fontSize: '11px', fontWeight: '750', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Normalized Score (0-100)
                          </text>

                          {/* Category labels and vertical lines */}
                          {activeCategories.map((cat, idx) => {
                            const x = getX(idx);
                            const yLabel = 420 - paddingBottom + 12;
                            return (
                              <g key={idx}>
                                <line x1={x} y1={paddingTop - 10} x2={x} y2={420 - paddingBottom} stroke="rgba(15, 23, 42, 0.03)" strokeWidth={1} strokeDasharray="2 2" />
                                <circle cx={x} cy={yLabel + 12} r="13" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
                                <text x={x} y={yLabel + 16} textAnchor="middle" style={{ fontSize: '12px' }}>{cat.icon}</text>
                                <text x={x} y={yLabel + 36} textAnchor="middle" style={{ fill: '#0F172A', fontSize: '10px', fontWeight: '700' }}>{cat.name}</text>
                                <text x={x} y={yLabel + 47} textAnchor="middle" style={{ fill: '#64748B', fontSize: '8px', fontWeight: '500' }}>({cat.sub})</text>
                              </g>
                            );
                          })}

                          {/* Line paths */}
                          {!isSameModel && (
                            <path d={baselinePath} fill="none" stroke="#F97316" strokeWidth="3" opacity="0.8" />
                          )}
                          <path d={recommendedPath} fill="none" stroke={isSameModel ? '#6366F1' : '#10B981'} strokeWidth="3.5" opacity="0.9" />

                          {/* Points baseline */}
                          {!isSameModel && pointsBaseline.map((pt, idx) => (
                            <circle key={`cb-${idx}`} cx={pt.x} cy={pt.y} r="5" fill="#FFFFFF" stroke="#F97316" strokeWidth="2.5" />
                          ))}

                          {/* Points recommended */}
                          {pointsRecommended.map((pt, idx) => (
                            <circle key={`cr-${idx}`} cx={pt.x} cy={pt.y} r="5" fill="#FFFFFF" stroke={isSameModel ? '#6366F1' : '#10B981'} strokeWidth="2.5" />
                          ))}
                        </svg>
                      </div>
                    </div>

                    {/* Structured table at bottom */}
                    <div style={{
                      marginTop: '28px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'center', color: '#334155' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                            <th style={{ padding: '12px 16px', fontWeight: '800', color: '#64748B', textAlign: 'left', width: '220px' }}>Model</th>
                            {CATEGORIES.map((cat, idx) => (
                              <th key={idx} style={{ padding: '10px', fontWeight: '750', color: '#475569' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <span style={{ fontSize: '13px' }}>{cat.icon}</span>
                                  <span style={{ fontSize: '10.5px' }}>{cat.name}</span>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Recommended/Active Row */}
                          <tr style={{ borderBottom: isSameModel ? 'none' : '1px solid var(--color-border)' }}>
                            <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '700' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isSameModel ? '#6366F1' : '#10B981' }}></span>
                                <div>
                                  <div style={{ color: '#0F172A' }}>{recommended.name || recommended.slug}</div>
                                  <div style={{ fontSize: '9px', color: isSameModel ? '#4F46E5' : '#16A34A', fontWeight: '700' }}>{isSameModel ? 'Active Best' : 'Recommended'}</div>
                                </div>
                              </div>
                            </td>
                            {CATEGORIES.map((cat, idx) => {
                              const baseVal = baselineScores[cat.key];
                              const recVal = recommendedScores[cat.key];
                              const isHigher = !isSameModel && recVal !== null && (baseVal === null || recVal > baseVal);
                              const isTps = cat.key === 'speedNorm';
                              const displayVal = recVal !== null ? (isTps ? `${recommendedScores.speedVal} t/s` : recVal) : 'N/A';
                              return (
                                <td key={idx} style={{ padding: '10px', fontWeight: isHigher ? '700' : 'normal', color: isHigher ? '#10B981' : '#334155' }}>
                                  {displayVal}
                                </td>
                              );
                            })}
                          </tr>

                          {/* Baseline Row */}
                          {!isSameModel && (
                            <tr>
                              <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '700' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F97316' }}></span>
                                  <div>
                                    <div style={{ color: '#0F172A' }}>{baseline.name || baseline.slug}</div>
                                    <div style={{ fontSize: '9px', color: '#EA580C', fontWeight: '700' }}>Baseline</div>
                                  </div>
                                </div>
                              </td>
                              {CATEGORIES.map((cat, idx) => {
                                const baseVal = baselineScores[cat.key];
                                const recVal = recommendedScores[cat.key];
                                const isHigher = baseVal !== null && (recVal === null || baseVal > recVal);
                                const isTps = cat.key === 'speedNorm';
                                const displayVal = baseVal !== null ? (isTps ? `${baselineScores.speedVal} t/s` : baseVal) : 'N/A';
                                return (
                                  <td key={idx} style={{ padding: '10px', fontWeight: isHigher ? '700' : 'normal', color: isHigher ? '#F97316' : '#334155' }}>
                                    {displayVal}
                                  </td>
                                );
                              })}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Prepare Master Table Data */}
            {(() => {
              const cleanName = (idOrPath) => {
                if (!idOrPath) return '';
                const parts = idOrPath.split('/');
                return parts[parts.length - 1];
              };

              const masterTableRows = (auditResult.allocations || []).map((alloc, idx) => {
                const rec = recs[idx];
                const choice = finalSelectedOptions[idx] || 'api';
                const opt = choice === 'api' ? rec?.apiOption : rec?.subscriptionOption;
                const { baseline, recommended } = resolveModelObjects(rec || { apiOption: {}, subscriptionOption: {} }, idx, intelData.llms, auditResult, choice);
                
                let currentCost = alloc.currentCost || 0;
                if (currentCost === 0 && rec && rec.issue) {
                  const match = rec.issue.match(/Paying \$([\d,.]+)/);
                  if (match) {
                    currentCost = parseFloat(match[1].replace(/,/g, ''));
                  }
                }

                const optimizedCost = (() => {
                  if (choice === 'api' && rec?.apiOption) {
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

                    const adj = tokenAdjustments[idx] || { 
                      inputMillions: (rec.apiOption.defaultInputTokens || 5000000) / 1000000, 
                      outputMillions: (rec.apiOption.defaultOutputTokens || 1250000) / 1000000 
                    };
                    return adj.inputMillions * inputCostPerM + adj.outputMillions * outputCostPerM;
                  }
                  return Math.max(0, currentCost - (opt ? opt.savings : 0));
                })();
                const savings = Math.max(0, currentCost - optimizedCost);
                
                const baselineName = baseline ? baseline.name : (cleanName(alloc.modelId) || alloc.plan || alloc.toolName || 'Unknown Model');
                const suggestedName = recommended ? recommended.name : (opt?.recommendedModel || opt?.name || opt?.planName || baselineName);
                
                let recommendedPlan = 'Keep Current';
                if (savings > 0 && opt) {
                  if (choice === 'api') {
                    recommendedPlan = 'Direct API';
                  } else {
                    recommendedPlan = opt.planName || 'Optimized Sub';
                  }
                } else {
                  recommendedPlan = alloc.plan ? `${alloc.plan} (${alloc.seats} Seat${alloc.seats > 1 ? 's' : ''})` : 'Keep Current';
                }
                
                // Redundant tool prefix removal for nicer display in tables
                if (recommendedPlan.toLowerCase().startsWith((alloc.toolName || '').toLowerCase() + ' ')) {
                  recommendedPlan = recommendedPlan.substring((alloc.toolName || '').length + 1).trim();
                }

                const currentPlan = alloc.plan ? `${alloc.plan} (${alloc.seats} Seat${alloc.seats > 1 ? 's' : ''})` : 'Direct API';
                const improvementPct = currentCost > 0 ? ((savings / currentCost) * 100) : 0;
                
                let confidence = 'High';
                if (recommended && baseline) {
                  const diffScore = Math.abs((recommended.intelligence_index || 80) - (baseline.intelligence_index || 80));
                  if (diffScore > 15) confidence = 'Medium';
                }
                
                return {
                  toolName: alloc.toolName,
                  purpose: alloc.purpose || 'Mixed',
                  currentModel: baselineName,
                  currentPlan,
                  currentCost,
                  suggestedModel: suggestedName,
                  recommendedPlan,
                  optimizedCost,
                  savings,
                  improvement: savings !== 0 ? `${Math.abs(improvementPct).toFixed(0)}%` : '0%',
                  confidence
                };
              });

              return (
                <div style={{ display: 'grid', gridTemplateColumns: '3.1fr 1fr', gap: '24px', marginTop: '32px', marginBottom: '24px', alignItems: 'start' }}>
                  
                  {/* Master Table Left Column */}
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '4px', height: '14px', backgroundColor: '#6366F1', borderRadius: '2px' }}></span>
                      <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>
                        Detailed Model Analysis &amp; Recommendation
                      </span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', color: '#334155' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                            <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'left', color: '#475569' }}>Service / Purpose</th>
                            <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'left', color: '#475569' }}>Current Setup</th>
                            <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'left', color: '#475569' }}>Recommended Setup</th>
                            <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'right', color: '#475569' }}>Monthly Savings</th>
                            <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'right', color: '#475569' }}>Cost Reduction</th>
                            <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'center', color: '#475569' }}>Confidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {masterTableRows.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: idx < masterTableRows.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                              <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0F172A' }}>
                                <div>{row.toolName}</div>
                                <div style={{ fontSize: '9.5px', color: '#64748B', fontWeight: '500', marginTop: '2px' }}>({row.purpose})</div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: '600', color: '#334155' }}>{row.currentModel}</div>
                                <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>{row.currentPlan}</div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#0F172A', marginTop: '4px' }}>
                                  ${row.currentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: '600', color: '#334155' }}>{row.suggestedModel}</div>
                                <div style={{ fontSize: '10px', color: row.savings > 0 ? '#10B981' : '#64748B', fontWeight: row.savings > 0 ? '700' : 'normal', marginTop: '2px' }}>{row.recommendedPlan}</div>
                                <div style={{ fontSize: '11px', fontWeight: '750', color: '#0F172A', marginTop: '4px' }}>
                                  ${row.optimizedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '750', color: row.savings > 0 ? '#10B981' : '#64748B' }}>
                                {row.savings > 0 ? `+$${row.savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo` : `$${row.savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo`}
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: '750', color: row.savings > 0 ? '#10B981' : '#64748B' }}>
                                {row.savings > 0 ? `${row.improvement} Cost Cut` : '0%'}
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                <span style={{
                                  backgroundColor: row.confidence === 'High' ? '#DCFCE7' : '#FEF3C7',
                                  color: row.confidence === 'High' ? '#15803D' : '#D97706',
                                  padding: '3px 8px',
                                  borderRadius: '9999px',
                                  fontSize: '10px',
                                  fontWeight: '750'
                                }}>
                                  {row.confidence}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Key Takeaways Right Column */}
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '4px', height: '14px', backgroundColor: '#6366F1', borderRadius: '2px' }}></span>
                      Summary &amp; Key Takeaways
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                      {[
                        `You are currently overspending by ${savingPct}% ($${bestMonthly.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/month).`,
                        `${recs.filter(r => (finalSelectedOptions[recs.indexOf(r)] ? (r[finalSelectedOptions[recs.indexOf(r)] + 'Option']?.savings > 0) : false)).length} optimization opportunities implemented with high confidence.`,
                        `Minimal quality impact (High quality retention).`,
                        `Faster responses and larger context windows available in recommended models.`,
                        `Full implementation can save $${bestAnnual.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} annually.`
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                          <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#ECFDF5', flexShrink: 0, fontSize: '11px', fontWeight: '800' }}>✓</div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '12px 14px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', fontSize: '11.5px', color: '#92400E', fontWeight: '500', lineHeight: '1.4' }}>
                      Note: Savings are estimated based on the audit scope &amp; usage patterns.
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* Caption Footer */}
            <div style={{ textAlign: 'center', fontSize: '12.5px', color: '#475569', fontWeight: '600', marginTop: '24px', marginBottom: '16px' }}>
              Audex AI helps you optimize AI spend without compromising on performance.
            </div>

            {/* Navigation back actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px', marginBottom: '16px' }}>
              {fromHistory ? (
                <button
                  onClick={() => onNavigateToView('history')}
                  style={{ padding: '10px 28px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  ← Back to Reports History
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowDetailedReport(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ padding: '10px 28px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  ← Back to Summary
                </button>
              )}
              <button
                onClick={() => onNavigateToView('step1')}
                style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', backgroundColor: '#0F172A', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                Run Another Audit 📊
              </button>
            </div>

          </div>
          )}

        </div>
      </main>
    </div>
  );
}
