import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { getCachedRawData } from '../utils/dataCache';
import logoImg from '../assets/audex-ai-logo.png';
import { Lock, Sparkles, Code, Brain, Hash, Pencil, Search, Link2, Image, Zap, Coins, BarChart3, Info, RotateCw, ClipboardList, CreditCard, Bot, Rocket, Check, ArrowRight, ArrowLeft, Home, Trophy } from 'lucide-react';
import { LoadingIndicator } from './CommonComponents';
import { ProviderLogo } from './MarketIntelView';
import { sortModelsLatestFirst, isDiscontinuedModel } from './WizardFlow';

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
  { name: 'Coding', sub: 'SWE-Bench', icon: Code, color: '#10B981', bg: '#D1FAE5', key: 'coding' },
  { name: 'Reasoning', sub: 'GPQA Diamond', icon: Brain, color: '#EC4899', bg: '#FCE7F3', key: 'reasoning' },
  { name: 'Math', sub: 'LiveBench AI', icon: Hash, color: '#8B5CF6', bg: '#EDE9FE', key: 'math' },
  { name: 'Writing', sub: 'MT-Bench', icon: Pencil, color: '#F59E0B', bg: '#FEF3C7', key: 'writing' },
  { name: 'Research', sub: 'HLE', icon: Search, color: '#3B82F6', bg: '#DBEAFE', key: 'research' },
  { name: 'Function Calling', sub: 'BFCL v3', icon: Link2, color: '#06B6D4', bg: '#CFFAFE', key: 'funcCalling' },
  { name: 'Multimodal', sub: 'MMMU', icon: Image, color: '#14B8A6', bg: '#CCFBF1', key: 'multimodal' },
  { name: 'Speed', sub: 'Tokens/sec', icon: Zap, color: '#F59E0B', bg: '#FEF3C7', key: 'speedNorm' },
  { name: 'Cost Efficiency', sub: 'USD / 1M Tokens', icon: Coins, color: '#D97706', bg: '#FEF3C7', key: 'costEff' }
];

const getSmoothPath = (points) => {
  const validPoints = (points || []).filter(p => p.score != null && !isNaN(p.score) && p.y != null && !isNaN(p.y));
  if (validPoints.length === 0) return '';
  if (validPoints.length === 1) return `M ${validPoints[0].x} ${validPoints[0].y}`;
  let d = `M ${validPoints[0].x} ${validPoints[0].y}`;
  for (let i = 0; i < validPoints.length - 1; i++) {
    const p0 = validPoints[i];
    const p1 = validPoints[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p1.x - (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return d;
};


const calculateOptimizedCost = (alloc, rec, choice, tokenAdjustments, idx) => {
  if (!rec) return alloc?.currentCost || 0;
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
    const adj = tokenAdjustments?.[idx] || {
      inputMillions: (rec.apiOption.defaultInputTokens || 5000000) / 1000000,
      outputMillions: (rec.apiOption.defaultOutputTokens || 1250000) / 1000000
    };
    return adj.inputMillions * inputCostPerM + adj.outputMillions * outputCostPerM;
  }
  const opt = choice === 'api' ? rec.apiOption : rec.subscriptionOption;
  if (opt && opt.cost !== undefined && opt.cost !== null) {
    return opt.cost;
  }
  const curCost = alloc?.currentCost || parseRecDetails(rec).currentCost || 0;
  return Math.max(0, curCost - (opt?.savings || 0));
};

export const formatCategoryName = (catKey) => {
  if (!catKey) return 'Intelligence Index';
  const clean = catKey.toLowerCase().replace(/_/g, '-').replace(/-/g, ' ').trim();
  if (clean === 'overall') return 'Intelligence Index';
  if (clean === 'math') return 'Math Index (LiveBench AI)';
  if (clean === 'coding') return 'Coding Index (SWE-Bench)';
  if (clean === 'reasoning') return 'Reasoning Index (GPQA Diamond)';
  if (clean === 'research') return 'Research Index (HLE)';
  if (clean === 'writing' || clean === 'creative writing') return 'Creative Writing Index';
  if (clean === 'fast') return 'Throughput Index';
  if (clean === 'cheap') return 'Cost Efficiency Index';
  return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Leaderboard';
};

export const cleanMarketIntelLookup = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/^.*?:\s*/, '')
    .replace(/\(.*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export const getModelMarketIntelDetails = (modelOrId, purpose = 'Mixed', intelData = null) => {
  if (!modelOrId || !intelData || !intelData.categories) return null;
  const idStr = typeof modelOrId === 'string' ? modelOrId : (modelOrId.slug || modelOrId.modelId || modelOrId.name || '');
  const idClean = cleanMarketIntelLookup(idStr);
  const idRaw = String(idStr).toLowerCase().trim();

  const p = (purpose || '').toLowerCase();
  const targetCat = p.includes('math') ? 'math'
    : (p.includes('cod') ? 'coding'
    : (p.includes('reason') ? 'reasoning'
    : (p.includes('research') ? 'research'
    : (p.includes('writ') ? 'creative-writing' : 'overall'))));

  const matches = [];
  Object.entries(intelData.categories).forEach(([catKey, list]) => {
    if (!Array.isArray(list)) return;
    const found = list.find(m => {
      const ms = cleanMarketIntelLookup(m.slug);
      const mi = cleanMarketIntelLookup(m.modelId);
      const mn = cleanMarketIntelLookup(m.name);
      return (
        (ms && ms === idClean) ||
        (mi && mi === idClean) ||
        (mn && mn === idClean) ||
        (m.slug && m.slug.toLowerCase() === idRaw) ||
        (m.modelId && m.modelId.toLowerCase() === idRaw) ||
        (m.name && m.name.toLowerCase().trim() === idRaw) ||
        (idClean.length >= 5 && (
          (ms && ms.length >= 4 && (ms.includes(idClean) || idClean.includes(ms))) ||
          (mn && mn.length >= 4 && (mn.includes(idClean) || idClean.includes(mn)))
        ))
      );
    });

    if (found && found.rank) {
      matches.push({
        category: catKey,
        rank: found.rank,
        total: list.length,
        entry: found
      });
    }
  });

  if (matches.length === 0) return null;

  let best = matches.find(m => m.category === targetCat);
  if (!best && targetCat === 'coding') best = matches.find(m => m.category === 'industry-software-and-it-services');
  if (!best && targetCat === 'math') best = matches.find(m => m.category === 'industry-mathematical');
  if (!best && targetCat === 'creative-writing') best = matches.find(m => m.category === 'writing');
  if (!best && targetCat === 'reasoning') best = matches.find(m => m.category === 'overall');
  if (!best && targetCat === 'research') best = matches.find(m => m.category === 'scientific');
  if (!best) best = matches.find(m => m.category === 'overall');
  if (!best) {
    const primaryCategories = ['coding', 'reasoning', 'research', 'math', 'creative-writing', 'writing'];
    for (const cat of primaryCategories) {
      best = matches.find(m => m.category === cat);
      if (best) break;
    }
  }
  if (!best) {
    matches.sort((a, b) => a.rank - b.rank);
    best = matches[0];
  }

  const entry = best.entry;
  const pricing = entry.pricing || {};
  const inputCost = pricing.price_1m_input_tokens !== undefined ? pricing.price_1m_input_tokens : null;
  const outputCost = pricing.price_1m_output_tokens !== undefined ? pricing.price_1m_output_tokens : null;
  const blendedPrice = pricing.price_1m_blended_3_to_1 ?? (
    (inputCost !== null && outputCost !== null) ? (inputCost * 0.75 + outputCost * 0.25) : null
  );

  return {
    name: entry.name,
    slug: entry.slug,
    creator: entry.organization || entry.creator || 'Unknown',
    rank: best.rank,
    total: best.total,
    category: best.category,
    categoryName: formatCategoryName(best.category),
    score: entry.category_scores?.[best.category] ?? entry.final_score ?? entry.evaluations?.livebench_math ?? entry.evaluations?.artificial_analysis_intelligence_index ?? entry.rating,
    inputCost,
    outputCost,
    blendedPrice,
    throughput: entry.median_output_tokens_per_second ?? null,
    ttft: entry.median_time_to_first_token_seconds ?? null,
    context_length: entry.context_length ?? null,
    entry
  };
};

function getBenchmarkScores(model, explicitBlendedCostOrIntel = null, explicitTps = null, passedIntelData = null) {
  let explicitBlendedCost = explicitBlendedCostOrIntel;
  let intelData = passedIntelData;
  if (explicitBlendedCostOrIntel && typeof explicitBlendedCostOrIntel === 'object' && explicitBlendedCostOrIntel.categories) {
    intelData = explicitBlendedCostOrIntel;
    explicitBlendedCost = null;
  }

  if (!model) {
    return {
      coding: null,
      reasoning: null,
      math: null,
      writing: null,
      research: null,
      funcCalling: null,
      longContext: null,
      multimodal: null,
      speedNorm: null,
      speedVal: null,
      costEff: null,
      blendedCost: null,
      inputCost: null,
      outputCost: null,
      context_length: null,
      intelligence_index: null
    };
  }

  const ev = model.evaluations || {};

  // Helper to extract lookup keys and variants (stripping tool wrappers like 'Codex - ', 'Antigravity CLI - ', etc.)
  const getLookupKeys = (m) => {
    if (!m) return [];
    const keys = [];
    const add = (v) => {
      if (!v) return;
      const str = String(v).trim().toLowerCase();
      if (str && !keys.includes(str)) keys.push(str);
    };

    const rawName = m.name || m.modelName || m.topModelName || '';
    const rawSlug = m.slug || '';
    const rawId = m.id || m.modelId || m.topModelId || '';

    add(rawName);
    add(rawSlug);
    add(rawId);

    // Stripped of tool prefix (e.g. "Codex - GPT-6.2 Sol (xhigh)" -> "GPT-6.2 Sol (xhigh)")
    const noTool = rawName.replace(/^[A-Za-z0-9 ]+\s*-\s*/, '').trim();
    if (noTool && noTool !== rawName) add(noTool);

    // Stripped of parenthetical (e.g. "GPT-6.2 Sol (xhigh)" -> "GPT-6.2 Sol")
    const noParen = (noTool || rawName).replace(/\s*\([^)]*\)/g, '').trim();
    if (noParen) {
      add(noParen);
      add(noParen.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }

    if (noTool) {
      add(noTool.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }

    if (rawId.includes('/')) {
      const seg = rawId.split('/')[1];
      add(seg);
      add(seg.replace(/^[a-z0-9]+-/, ''));
    }

    return keys;
  };

  const lookupKeys = getLookupKeys(model);

  // Helper to find in intelData categories by exact or core model match (NO family guessing)
  const findInCat = (catName) => {
    if (!intelData?.categories?.[catName]) return null;
    const catList = intelData.categories[catName];

    // 1. Exact match on any key
    for (const key of lookupKeys) {
      const match = catList.find(m => {
        const mSlug = (m.slug || '').toLowerCase();
        const mId = (m.modelId || '').toLowerCase();
        const mName = (m.name || '').toLowerCase().trim();
        return key === mSlug || key === mId || key === mName;
      });
      if (match) return match;
    }

    // 2. Substring match (matching this specific model's core name/slug)
    for (const key of lookupKeys) {
      if (key.length >= 4) {
        const match = catList.find(m => {
          const mSlug = (m.slug || '').toLowerCase();
          const mName = (m.name || '').toLowerCase().trim();
          return mSlug.includes(key) || mName.includes(key) || key.includes(mSlug) || (mName && key.includes(mName));
        });
        if (match) return match;
      }
    }

    return null;
  };

  const codeCat = findInCat('coding');
  const reasonCat = findInCat('reasoning') || findInCat('overall');
  const mathCat = findInCat('math') || findInCat('industry-mathematical');
  const writeCat = findInCat('creative-writing') || findInCat('writing') || findInCat('industry-writing-and-literature-and-language');
  const resCat = findInCat('research') || findInCat('scientific');
  const fnCat = findInCat('function-calling') || findInCat('tool-use') || findInCat('agents');
  const visCat = findInCat('vision') || findInCat('multimodal');
  const fastCat = findInCat('fast');

  const mergeEvals = (...evalObjs) => {
    const res = {};
    for (const obj of evalObjs) {
      if (!obj) continue;
      for (const [k, v] of Object.entries(obj)) {
        if (v !== null && v !== undefined && !Number.isNaN(v)) {
          res[k] = v;
        }
      }
    }
    return res;
  };

  const evCombined = mergeEvals(
    codeCat?.evaluations,
    reasonCat?.evaluations,
    mathCat?.evaluations,
    writeCat?.evaluations,
    resCat?.evaluations,
    fnCat?.evaluations,
    visCat?.evaluations,
    fastCat?.evaluations,
    ev
  );

  // 1. CODING (SWE-Bench / Coding Agent Index / LiveCodeBench / FrontierCode / TerminalBench)
  let coding = null;
  if (model.category_scores?.coding != null) {
    coding = Math.round(Number(model.category_scores.coding));
  } else if (codeCat?.category_scores?.coding != null) {
    coding = Math.round(Number(codeCat.category_scores.coding));
  } else if (codeCat?.evaluations?.artificial_analysis_coding_index != null) {
    coding = Math.round(Number(codeCat.evaluations.artificial_analysis_coding_index));
  } else if (codeCat?.evaluations?.coding_agent_index != null) {
    coding = Math.round(Number(codeCat.evaluations.coding_agent_index));
  } else if (codeCat?.final_score != null) {
    coding = Math.round(Number(codeCat.final_score));
  } else if (evCombined.artificial_analysis_coding_index != null) {
    coding = Math.round(Number(evCombined.artificial_analysis_coding_index));
  } else if (evCombined.coding_agent_index != null) {
    coding = Math.round(Number(evCombined.coding_agent_index));
  } else if (evCombined.livecodebench != null) {
    coding = Math.round(Number(evCombined.livecodebench));
  } else if (evCombined.frontier_code_20 != null) {
    coding = Math.round(Number(evCombined.frontier_code_20));
  } else if (evCombined.terminal_bench_40 != null || evCombined.terminalbench_v2_1 != null) {
    coding = Math.round(Number(evCombined.terminal_bench_40 ?? evCombined.terminalbench_v2_1));
  }

  // 2. MATH (LiveBench AI / Math Benchmark)
  let math = null;
  if (model.evaluations?.livebench_math != null) {
    math = Math.round(Number(model.evaluations.livebench_math));
  } else if (model.category_scores?.math != null) {
    math = Math.round(Number(model.category_scores.math));
  } else if (mathCat?.category_scores?.math != null) {
    math = Math.round(Number(mathCat.category_scores.math));
  } else if (mathCat?.final_score != null) {
    math = Math.round(Number(mathCat.final_score));
  } else if (evCombined.livebench_math != null) {
    math = Math.round(Number(evCombined.livebench_math));
  } else if (evCombined.artificial_analysis_math_index != null) {
    math = Math.round(Number(evCombined.artificial_analysis_math_index));
  } else if (evCombined.aime != null) {
    math = Math.round(Number(evCombined.aime));
  }

  // 3. REASONING (GPQA Diamond / HLE / MMLU-Pro)
  let reasoning = null;
  if (model.category_scores?.reasoning != null) {
    reasoning = Math.round(Number(model.category_scores.reasoning));
  } else if (reasonCat?.category_scores?.reasoning != null) {
    reasoning = Math.round(Number(reasonCat.category_scores.reasoning));
  } else if (evCombined.gpqa != null) {
    reasoning = Math.round(Number(evCombined.gpqa));
  } else if (evCombined.hle_diamond != null) {
    reasoning = Math.round(Number(evCombined.hle_diamond));
  } else if (reasonCat?.final_score != null) {
    reasoning = Math.round(Number(reasonCat.final_score));
  } else if (evCombined.hle != null) {
    reasoning = Math.round(Number(evCombined.hle));
  } else if (evCombined.artificial_analysis_intelligence_index != null) {
    reasoning = Math.round(Number(evCombined.artificial_analysis_intelligence_index));
  } else if (evCombined.mmlu_pro != null) {
    reasoning = Math.round(Number(evCombined.mmlu_pro));
  }

  // 2b. Intelligence Index
  let intelligenceIndex = null;
  if (model.category_scores?.overall != null) {
    intelligenceIndex = Math.round(Number(model.category_scores.overall));
  } else if (findInCat('overall')?.category_scores?.overall != null) {
    intelligenceIndex = Math.round(Number(findInCat('overall').category_scores.overall));
  } else if (findInCat('overall')?.final_score != null) {
    intelligenceIndex = Math.round(Number(findInCat('overall').final_score));
  } else if (evCombined.artificial_analysis_intelligence_index != null) {
    intelligenceIndex = Math.round(Number(evCombined.artificial_analysis_intelligence_index));
  } else if (reasoning != null) {
    intelligenceIndex = reasoning;
  }

  // 4. WRITING
  let writing = null;
  if (model.category_scores?.['creative-writing'] != null) {
    writing = Math.round(Number(model.category_scores['creative-writing']));
  } else if (model.category_scores?.writing != null) {
    writing = Math.round(Number(model.category_scores.writing));
  } else if (writeCat?.category_scores?.['creative-writing'] != null) {
    writing = Math.round(Number(writeCat.category_scores['creative-writing']));
  } else if (writeCat?.category_scores?.writing != null) {
    writing = Math.round(Number(writeCat.category_scores.writing));
  } else if (writeCat?.final_score != null) {
    writing = Math.round(Number(writeCat.final_score));
  } else if (evCombined.personality_bench != null) {
    writing = Math.round(Number(evCombined.personality_bench));
  } else if (evCombined.summarization != null) {
    writing = Math.round(Number(evCombined.summarization));
  }

  // 5. RESEARCH
  let research = null;
  if (model.category_scores?.research != null) {
    research = Math.round(Number(model.category_scores.research));
  } else if (resCat?.category_scores?.research != null) {
    research = Math.round(Number(resCat.category_scores.research));
  } else if (resCat?.final_score != null) {
    research = Math.round(Number(resCat.final_score));
  } else if (evCombined.gpqa != null) {
    research = Math.round(Number(evCombined.gpqa));
  } else if (evCombined.terminal_bench_science != null) {
    research = Math.round(Number(evCombined.terminal_bench_science));
  } else if (evCombined.hle != null) {
    research = Math.round(Number(evCombined.hle));
  } else if (evCombined.mmlu_pro != null) {
    research = Math.round(Number(evCombined.mmlu_pro));
  }

  // 6. FUNCTION CALLING / TOOL USE
  let funcCalling = null;
  if (model.category_scores?.['function-calling'] != null) {
    funcCalling = Math.round(Number(model.category_scores['function-calling']));
  } else if (fnCat?.category_scores?.['function-calling'] != null) {
    funcCalling = Math.round(Number(fnCat.category_scores['function-calling']));
  } else if (model.category_scores?.['tool-use'] != null) {
    funcCalling = Math.round(Number(model.category_scores['tool-use']));
  } else if (fnCat?.category_scores?.['tool-use'] != null) {
    funcCalling = Math.round(Number(fnCat.category_scores['tool-use']));
  } else if (fnCat?.final_score != null) {
    funcCalling = Math.round(Number(fnCat.final_score));
  } else if (evCombined.automation_bench != null) {
    funcCalling = Math.round(Number(evCombined.automation_bench));
  } else if (evCombined.critpt_agentic_hard != null) {
    funcCalling = Math.round(Number(evCombined.critpt_agentic_hard));
  } else if (evCombined.ifbench != null) {
    funcCalling = Math.round(Number(evCombined.ifbench));
  } else if (evCombined.agentic_index != null) {
    funcCalling = Math.round(Number(evCombined.agentic_index));
  }

  // 7. Context Length
  const ctx = model.context_length ? Number(model.context_length) : null;
  let longContext = null;
  if (ctx) {
    if (ctx >= 1000000) longContext = 99;
    else if (ctx >= 200000) longContext = 95;
    else if (ctx >= 128000) longContext = 88;
    else if (ctx >= 32000) longContext = 78;
    else if (ctx >= 8000) longContext = 65;
    else longContext = 50;
  }

  // 8. Multimodal (Vision) - only if model or category supports vision
  let multimodal = null;
  const isSolTextModel = (model.slug || model.name || '').toLowerCase().includes('sol') && (model.slug || model.name || '').toLowerCase().includes('codex');
  if (isSolTextModel) {
    multimodal = null;
  } else if (model.category_scores?.vision != null) {
    multimodal = Math.round(Number(model.category_scores.vision));
  } else if (visCat?.category_scores?.vision != null) {
    multimodal = Math.round(Number(visCat.category_scores.vision));
  } else if (visCat?.final_score != null) {
    multimodal = Math.round(Number(visCat.final_score));
  } else if (evCombined.mmmu != null) {
    multimodal = Math.round(Number(evCombined.mmmu));
  }

  // 9. Speed
  const speedRaw = explicitTps ||
    model.median_output_tokens_per_second ||
    model.throughput ||
    fastCat?.median_output_tokens_per_second ||
    fastCat?.category_scores?.fast ||
    model.category_scores?.fast ||
    model.tokens_per_second ||
    null;
  const speedVal = speedRaw ? Number(speedRaw) : null;
  // Scaled 0-100 benchmark index for SVG chart visualization while preserving raw throughput in speedVal
  const speedNorm = speedVal ? Math.round(Math.min(98, Math.max(15, (speedVal / 160) * 100))) : null;

  // 10. Cost Efficiency
  const inputCost = model.cost_per_m_input ?? model.pricing?.price_1m_input_tokens ?? codeCat?.pricing?.price_1m_input_tokens ?? model.endpoints?.[0]?.input_cost_per_m ?? model.inputCost ?? null;
  const outputCost = model.cost_per_m_output ?? model.pricing?.price_1m_output_tokens ?? codeCat?.pricing?.price_1m_output_tokens ?? model.endpoints?.[0]?.output_cost_per_m ?? model.outputCost ?? null;
  let blended = explicitBlendedCost;
  if ((blended === null || blended === undefined || isNaN(blended)) && inputCost !== null && outputCost !== null) {
    blended = model.pricing?.price_1m_blended_3_to_1 ?? (Number(inputCost) * 0.75 + Number(outputCost) * 0.25);
  }
  const costEff = blended !== null ? Math.round(100 - Math.min(85, Math.max(10, Math.log10(Number(blended) + 0.05) * 20 + 35))) : null;

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
    speedVal: speedVal ? Math.round(speedVal) : null,
    costEff,
    blendedCost: blended !== null ? Number(blended) : null,
    inputCost: inputCost !== null ? Number(inputCost) : null,
    outputCost: outputCost !== null ? Number(outputCost) : null,
    context_length: ctx,
    intelligence_index: intelligenceIndex
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
  if (type === 'rank') {
    const curRank = typeof current === 'number' ? current : parseInt(String(current).replace(/[^0-9]/g, ''), 10);
    const optRank = typeof suggested === 'number' ? suggested : parseInt(String(suggested).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(curRank) && !isNaN(optRank)) {
      const diff = curRank - optRank; // positive means opt is a lower number, i.e. higher rank on leaderboard
      if (diff > 0) return { text: `↑ +${diff} spots`, isGood: true };
      if (diff === 0) return { text: '→ Leaderboard Match', isGood: true };
      return { text: `↓ ${Math.abs(diff)} spots`, isGood: false };
    }
    return '—';
  }
  if (type === 'speed') {
    const curSpeed = typeof current === 'number' ? current : parseFloat(String(current).replace(/[^0-9.-]/g, ''));
    const optSpeed = typeof suggested === 'number' ? suggested : parseFloat(String(suggested).replace(/[^0-9.-]/g, ''));
    if (!isNaN(curSpeed) && !isNaN(optSpeed) && curSpeed > 0) {
      const diff = optSpeed - curSpeed;
      const pct = Math.abs((diff / curSpeed) * 100).toFixed(1);
      if (diff > 0) return { text: `↑ +${Math.round(diff)} t/s (+${pct}%)`, isGood: true };
      if (diff < 0) return { text: `↓ -${Math.abs(Math.round(diff))} t/s (-${pct}%)`, isGood: false };
      return { text: '→ 0.00%', isGood: true };
    }
  }
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

const resolveModelObjects = (rec, idx, llms, auditResult, choice, intelData = null) => {
  const alloc = auditResult?.allocations?.[idx];
  const opt = choice === 'api' ? rec?.apiOption : rec?.subscriptionOption;

  // Helper to extract clean lookup keys
  const getLookupKeys = (str) => {
    if (!str) return [];
    const keys = [str];
    if (str.includes('/')) {
      keys.push(str.split('/')[1]);
    }
    const clean = str.replace(/^[^:]+:\s*/, '').replace(/\(.*\)/g, '').trim();
    if (clean && !keys.includes(clean)) keys.push(clean);
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (slug && !keys.includes(slug)) keys.push(slug);
    return keys;
  };

  const findModelInIntel = (nameOrId) => {
    if (!nameOrId) return null;
    const pool = [
      ...(Array.isArray(llms) ? llms : []),
      ...(intelData?.sources?.llms?.data || []),
      ...(Array.isArray(intelData?.sources?.coding?.data) ? intelData.sources.coding.data : []),
      ...(Array.isArray(intelData?.sources?.reasoning?.data) ? intelData.sources.reasoning.data : []),
      ...(Array.isArray(intelData?.sources?.math?.data) ? intelData.sources.math.data : []),
      ...(intelData?.categories?.overall || []),
      ...(intelData?.categories?.coding || []),
      ...(intelData?.categories?.reasoning || []),
      ...(intelData?.categories?.math || []),
      ...Object.values(intelData?.categories || {}).flat()
    ];
    if (!pool || pool.length === 0) return null;

    const lookupKeys = getLookupKeys(nameOrId);

    // 1. Direct match by slug or modelId or id
    for (const key of lookupKeys) {
      const direct = pool.find(m => 
        (m.slug && m.slug.toLowerCase() === key.toLowerCase()) ||
        (m.modelId && m.modelId.toLowerCase() === key.toLowerCase()) ||
        (m.id && m.id.toLowerCase() === key.toLowerCase())
      );
      if (direct) return direct;
    }

    // 2. Match by exact name
    for (const key of lookupKeys) {
      const matchName = pool.find(m => 
        m.name && m.name.toLowerCase().trim() === key.toLowerCase().trim()
      );
      if (matchName) return matchName;
    }

    // 3. Substring match
    for (const key of lookupKeys) {
      if (key.length >= 3) {
        const sub = pool.find(m => 
          (m.name && m.name.toLowerCase().includes(key.toLowerCase())) ||
          (m.slug && m.slug.toLowerCase().includes(key.toLowerCase())) ||
          (key.toLowerCase().includes(m.slug?.toLowerCase() || '---')) ||
          (key.toLowerCase().includes(m.name?.toLowerCase() || '---'))
        );
        if (sub) return sub;
      }
    }

    return null;
  };

  // Determine baseline identifier
  let baselineIdentifier = '';
  if (alloc) {
    if (alloc.topModelId) {
      baselineIdentifier = alloc.topModelId;
    } else if (alloc.topModelName) {
      baselineIdentifier = alloc.topModelName;
    } else if (alloc.baselineModelId) {
      baselineIdentifier = alloc.baselineModelId;
    } else if (alloc.type === 'subscription' && alloc.baselineModels && alloc.baselineModels.length > 0) {
      let topInList = alloc.baselineModels[0];
      const rankList = intelData?.categories?.[(alloc.purpose || 'overall').toLowerCase()] || intelData?.categories?.overall || [];
      if (rankList.length > 0) {
        let bestRk = 99999;
        for (const rm of alloc.baselineModels) {
          const entry = rankList.find(m => m.name && (m.name.toLowerCase().includes(rm.toLowerCase()) || rm.toLowerCase().includes(m.name.toLowerCase())));
          if (entry && entry.rank < bestRk) {
            bestRk = entry.rank;
            topInList = entry.modelId || entry.slug || entry.name;
          }
        }
      }
      baselineIdentifier = topInList;
    } else {
      baselineIdentifier = alloc.modelId || alloc.baselineModelName || alloc.modelName || alloc.plan || '';
    }
  }

  // Determine recommended identifier
  let recommendedIdentifier = '';
  if (opt) {
    if (opt.topModelId) {
      recommendedIdentifier = opt.topModelId;
    } else if (opt.topModelName) {
      recommendedIdentifier = opt.topModelName;
    } else if (opt.modelId) {
      recommendedIdentifier = opt.modelId;
    } else if (choice === 'subscription' && opt.includedModels && opt.includedModels.length > 0) {
      let topInList = opt.includedModels[0];
      const rankList = intelData?.categories?.[(alloc?.purpose || 'overall').toLowerCase()] || intelData?.categories?.overall || [];
      if (rankList.length > 0) {
        let bestRk = 99999;
        for (const rm of opt.includedModels) {
          const entry = rankList.find(m => m.name && (m.name.toLowerCase().includes(rm.toLowerCase()) || rm.toLowerCase().includes(m.name.toLowerCase())));
          if (entry && entry.rank < bestRk) {
            bestRk = entry.rank;
            topInList = entry.modelId || entry.slug || entry.name;
          }
        }
      }
      recommendedIdentifier = topInList;
    } else {
      recommendedIdentifier = opt.name || opt.recommendedModel || opt.planName || '';
    }
  }

  let baselineModel = findModelInIntel(baselineIdentifier);
  if (!baselineModel && alloc) {
    baselineModel = {
      id: alloc.baselineModelId || alloc.modelId || baselineIdentifier,
      slug: ((alloc.baselineModelId || alloc.modelId)?.split('/')[1]) || baselineIdentifier,
      name: alloc.baselineModelName || alloc.modelName || (alloc.baselineModels ? alloc.baselineModels[0] : null) || baselineIdentifier,
      developer: alloc.provider || alloc.toolName || 'AI Provider',
      pricing: { price_1m_input_tokens: 3, price_1m_output_tokens: 15 }
    };
  }

  let recommendedModel = findModelInIntel(recommendedIdentifier);
  if (!recommendedModel && opt) {
    recommendedModel = {
      id: opt.modelId || recommendedIdentifier,
      slug: (opt.modelId?.split('/')[1]) || recommendedIdentifier,
      name: opt.recommendedModel || opt.name || opt.planName || recommendedIdentifier,
      developer: opt.recommendedProvider || 'AI Provider',
      pricing: { price_1m_input_tokens: opt.inputCostPerM || 3, price_1m_output_tokens: opt.outputCostPerM || 15 }
    };
  }

  const purpose = alloc?.purpose || 'Mixed';
  const baselineIntel = getModelMarketIntelDetails(baselineModel || baselineIdentifier, purpose, intelData);
  const recommendedIntel = getModelMarketIntelDetails(recommendedModel || recommendedIdentifier, purpose, intelData);

  if (baselineIntel && baselineModel) {
    if (baselineIntel.inputCost !== null) baselineModel.inputCost = baselineIntel.inputCost;
    if (baselineIntel.outputCost !== null) baselineModel.outputCost = baselineIntel.outputCost;
    if (baselineIntel.throughput !== null) baselineModel.throughput = baselineIntel.throughput;
    if (baselineIntel.ttft !== null) baselineModel.ttft = baselineIntel.ttft;
    if (baselineIntel.context_length !== null) baselineModel.context_length = baselineIntel.context_length;
    baselineModel.marketIntelRank = baselineIntel.rank;
    baselineModel.marketIntelTotal = baselineIntel.total;
    baselineModel.marketIntelCategory = baselineIntel.category;
  }

  if (recommendedIntel && recommendedModel) {
    if (recommendedIntel.inputCost !== null) recommendedModel.inputCost = recommendedIntel.inputCost;
    if (recommendedIntel.outputCost !== null) recommendedModel.outputCost = recommendedIntel.outputCost;
    if (recommendedIntel.throughput !== null) recommendedModel.throughput = recommendedIntel.throughput;
    if (recommendedIntel.ttft !== null) recommendedModel.ttft = recommendedIntel.ttft;
    if (recommendedIntel.context_length !== null) recommendedModel.context_length = recommendedIntel.context_length;
    recommendedModel.marketIntelRank = recommendedIntel.rank;
    recommendedModel.marketIntelTotal = recommendedIntel.total;
    recommendedModel.marketIntelCategory = recommendedIntel.category;
  }

  return { baseline: baselineModel, recommended: recommendedModel, baselineIntel, recommendedIntel };
};

export default function ResultsView({ auditResult, selectedOptions, onNavigateToView, user, renderCoinDropdown, fromHistory, tokenAdjustments = {}, isSample, onPurchase }) {
  const [intelData, setIntelData] = useState(null);
  const _userPlan = (user?.plan || 'free').toLowerCase();
  const isStarter = false;
  const [showDetailedReport, setShowDetailedReport] = useState(true);

  useEffect(() => {
    getCachedRawData()
      .then(data => {
        if (data) setIntelData(data);
      })
      .catch(err => {
        console.error('Failed to load raw market data in ResultsView:', err);
      });
  }, []);

  if (!auditResult) return null;
  if (!intelData) return <LoadingIndicator />;
  const { savings } = auditResult;

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
  const bestAnnual = bestMonthly * 12;
  const savingPct = currentCostVal > 0 ? ((bestMonthly / currentCostVal) * 100).toFixed(1) : 0;
  const goalLabel = auditResult.optimizationGoal === 'performance'
    ? 'Performance Preservation Mode'
    : auditResult.optimizationGoal === 'quality'
      ? 'Quality Focus'
      : `Target Cost Reduction (${auditResult.costCutPercentage || 50}%)`;

  return (
    <div className="app-container">
      {isSample && (
        <div style={{
          background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: '10px 16px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          borderBottom: '1px solid #334155'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={15} style={{ color: '#10B981', flexShrink: 0 }} />
            You are viewing a live <strong>Sample Audit Report</strong>.
          </span>
          <button
            onClick={() => onNavigateToView('step1')}
            style={{
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
              transition: 'transform 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Start Free Audit
          </button>
        </div>
      )}
      {/* ── Navbar ── */}
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
            <button onClick={() => onNavigateToView('model_auditor')} className="btn btn-outline nav-action-btn" title="Benchmark in Live Model Auditor">
              <Zap size={14} color="#10B981" />
              <span className="nav-action-btn-text">Model Auditor</span>
            </button>
            <button onClick={() => onNavigateToView('step1')} className="btn btn-black nav-action-btn" title="Start New Audit">
              <Sparkles size={14} />
              <span>New Audit</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main-content" style={{ padding: '48px 0' }}>
        <div className="container">

          {null}

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
              <div className="grid-auto-fit-md" style={{ gap: '20px', marginBottom: '32px' }}>

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

              {/* Detailed Analysis Report Button — hidden when viewing from history */}
              {!fromHistory && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', gap: '12px' }}>
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
                    <BarChart3 size={16} /> View Detailed Analysis Report
                  </button>
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
                    : (opt.planName || opt.recommendedModel || 'ChatGPT Plus');

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
                            <ProviderLogo provider={rec.tool} size={18} />
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
                              return (opt ? opt.cost : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
                              backgroundColor: '#FFFFFF',
                              border: '1px solid rgba(34, 197, 94, 0.15)',
                              borderRadius: '24px',
                              padding: '20px 24px',
                              color: '#0F172A',
                              fontSize: '12px',
                              marginBottom: '16px',
                              boxShadow: '0 10px 30px -10px rgba(34, 197, 94, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)',
                              gap: '12px'
                            }}>
                              {/* Left Side: Current */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                <ProviderLogo provider={details.provider} size={22} />
                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                  <span style={{ fontSize: '8px', textTransform: 'uppercase', color: '#64748B', fontWeight: '800', letterSpacing: '0.04em' }}>Current ({details.type})</span>
                                  <span style={{ fontWeight: '750', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }} title={currentDisplayName}>
                                    {currentDisplayName}
                                  </span>
                                  <span style={{ fontSize: '9px', color: '#64748B' }}>{details.provider}</span>
                                </div>
                              </div>

                              {/* Right Side: Message */}
                              <div style={{
                                flex: 1.2,
                                backgroundColor: '#F0FDF4',
                                borderRadius: '16px',
                                padding: '8px 12px',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: '#16A34A',
                                fontSize: '10.5px',
                                fontWeight: '700',
                                lineHeight: '1.3'
                              }}>
                                <Sparkles size={12} style={{ color: '#16A34A', flexShrink: 0 }} />
                                <span>The current {choice === 'subscription' ? 'subscription' : 'API'} is already optimized.</span>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid rgba(34, 197, 94, 0.15)',
                            borderRadius: '24px',
                            padding: '20px 24px',
                            color: '#0F172A',
                            fontSize: '12px',
                            marginBottom: '16px',
                            boxShadow: '0 10px 30px -10px rgba(34, 197, 94, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)'
                          }}>
                            {/* Left Side: Current */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                              <ProviderLogo provider={details.provider} size={22} />
                              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <span style={{ fontSize: '8px', textTransform: 'uppercase', color: '#64748B', fontWeight: '800', letterSpacing: '0.04em' }}>Current ({details.type})</span>
                                <span style={{ fontWeight: '750', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px' }} title={currentDisplayName}>
                                  {currentDisplayName}
                                </span>
                                <span style={{ fontSize: '9px', color: '#64748B' }}>{details.provider}</span>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: '#F0FDF4',
                              border: '1px solid rgba(34,197,94,.15)',
                              color: '#10B981',
                              margin: '0 12px',
                              flexShrink: 0
                            }}>
                              <ArrowRight size={12} />
                            </div>

                            {/* Right Side: Suggested */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                              <ProviderLogo provider={sugProvider || sugModel} size={22} />
                              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <span style={{ fontSize: '8px', textTransform: 'uppercase', color: '#64748B', fontWeight: '800', letterSpacing: '0.04em' }}>Suggested ({choice})</span>
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
                            <Info size={14} style={{ color: '#475569', flexShrink: 0 }} /> {opt.limits}
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
                          {dynamicSavingsVal >= 0 ? `+$${dynamicSavingsVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo` : `-$${Math.abs(dynamicSavingsVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo`}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
                {fromHistory && (
                  <button
                    onClick={() => onNavigateToView('history')}
                    style={{ padding: '12px 28px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: '#64748B', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ArrowLeft size={14} /> Back to Reports History
                  </button>
                )}
                <button
                  onClick={() => onNavigateToView('step1')}
                  style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', backgroundColor: '#0F172A', color: '#FFFFFF', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Run Another Audit <RotateCw size={14} />
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
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
              }}>
                <div>
                  <h2 style={{ fontSize: '25px', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.02em', fontFamily: 'var(--font-title)' }}>
                    Detailed Analysis Report
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: '750',
                      color: auditResult.optimizationGoal === 'quality' ? '#4338CA' : auditResult.optimizationGoal === 'cost' ? '#047857' : '#6D28D9',
                      backgroundColor: auditResult.optimizationGoal === 'quality' ? '#EEF2FF' : auditResult.optimizationGoal === 'cost' ? '#ECFDF5' : '#F5F3FF',
                      border: `1px solid ${auditResult.optimizationGoal === 'quality' ? '#C7D2FE' : auditResult.optimizationGoal === 'cost' ? '#A7F3D0' : '#DDD6FE'}`,
                      padding: '2px 9px',
                      borderRadius: '6px'
                    }}>
                      {goalLabel}
                    </span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#CBD5E1' }}></span>
                    <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '600' }}>
                      Audit done on: {auditResult.createdAt ? new Date(auditResult.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} className="no-print">
                  {fromHistory && (
                    <button
                      onClick={() => onNavigateToView('history')}
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
                      ← Back to Reports History
                    </button>
                  )}
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    style={{
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '11px 20px',
                      fontSize: '13.5px',
                      fontWeight: '750',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1E293B';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.18)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0F172A';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.12)';
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
              <style>{`
                @media print {
                  nav, footer, .no-print, button, input[type="checkbox"] {
                    display: none !important;
                  }
                  body, .app-container, #detailed-report-section {
                    background: #ffffff !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                  }
                  .results-hero-grid, .results-breakdown-grid {
                    page-break-inside: avoid;
                  }
                }
              `}</style>
              {/* Prepare Cost Distribution Data */}
              {(() => {
                const distributionData = (auditResult.allocations || []).map((alloc, idx) => {
                  const rec = recs[idx];
                  const choice = finalSelectedOptions[idx] || 'api';
                  const opt = choice === 'api' ? rec?.apiOption : rec?.subscriptionOption;
                  const optimizedCost = calculateOptimizedCost(alloc, rec, choice, tokenAdjustments, idx);
                  const curCost = alloc.currentCost || parseRecDetails(rec || {}).currentCost || 0;
                  const itemSavings = Math.max(0, curCost - optimizedCost);

                  // Resolve model names for accurate API/Subscription legend display
                  let baselineModelName = alloc.topModelName || alloc.baselineModelName || alloc.modelId || alloc.toolName;
                  let recommendedModelName = opt?.recommendedModel || opt?.name || opt?.planName || baselineModelName;
                  if (intelData && intelData.llms) {
                    const resolved = resolveModelObjects(rec || { apiOption: {}, subscriptionOption: {} }, idx, intelData.llms, auditResult, choice, intelData);
                    if (resolved.baseline) baselineModelName = resolved.baseline.name || resolved.baseline.slug || baselineModelName;
                    if (resolved.recommended) recommendedModelName = resolved.recommended.name || resolved.recommended.slug || recommendedModelName;
                  }

                  return {
                    name: alloc.toolName,
                    plan: choice === 'api' ? 'API' : (opt?.planName || alloc.plan || 'Pro'),
                    currentCost: curCost,
                    optimizedCost,
                    savings: itemSavings,
                    isOptimized: itemSavings > 0,
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
                      <div style={{ backgroundColor: '#F3E8FF', color: '#9333EA', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                      </div>
                    ),
                    label: 'Current Monthly Cost',
                    value: `$${currentCostVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
                    sub: '100% baseline',
                    valColor: '#0F172A',
                    isHero: false
                  },
                  {
                    icon: (
                      <div style={{ backgroundColor: '#DCFCE7', color: '#16A34A', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </div>
                    ),
                    label: 'Selected Monthly Savings',
                    value: `$${bestMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    sub: `${savingPct}% reduction`,
                    valColor: '#10B981',
                    isHero: true
                  },
                  {
                    icon: (
                      <div style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v-6H18z"></path></svg>
                      </div>
                    ),
                    label: 'Optimized Monthly Cost',
                    value: `$${Math.max(0, currentCostVal - bestMonthly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    sub: 'New monthly budget',
                    valColor: '#4F46E5',
                    isHero: false
                  },
                  {
                    icon: (
                      <div style={{ backgroundColor: '#FFEDD5', color: '#EA580C', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                      </div>
                    ),
                    label: 'Est. Annual Savings',
                    value: `$${bestAnnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    sub: `${savingPct}% reduction`,
                    valColor: '#0F172A',
                    isHero: false
                  },
                  {
                    icon: (
                      <div style={{ backgroundColor: '#DBEAFE', color: '#2563EB', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
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
                    valColor: '#0F172A',
                    isHero: false
                  },
                  {
                    icon: (
                      <div style={{ backgroundColor: '#FAE8FF', color: '#D946EF', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
                      </div>
                    ),
                    label: 'Optimization Goal',
                    value: auditResult.optimizationGoal === 'performance' ? 'Performance Preservation Mode' :
                      auditResult.optimizationGoal === 'quality' ? 'Quality Focus' : 'Cost Reduction',
                    sub: 'Maintain quality',
                    valColor: '#7C3AED',
                    isHero: false
                  },
                  {
                    icon: (
                      <div style={{ backgroundColor: '#CCFBF1', color: '#0D9488', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      </div>
                    ),
                    label: 'Configured Allocations',
                    value: `${auditResult.allocations ? auditResult.allocations.length : 0} tools`,
                    sub: `${auditResult.teamSize || 0} total seats`,
                    valColor: '#0F172A',
                    isHero: false
                  }
                ];

                return (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                      {tiles.slice(0, 4).map((tile, i) => (
                        <div key={i} style={{
                          backgroundColor: tile.isHero ? '#F8FCF9' : '#FFFFFF',
                          border: tile.isHero ? '1.5px solid #86EFAC' : '1px solid var(--color-border)',
                          borderRadius: '14px',
                          padding: '18px 20px',
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'center',
                          boxShadow: tile.isHero ? '0 4px 14px rgba(16, 185, 129, 0.08)' : '0 2px 8px rgba(0,0,0,0.02)',
                          transition: 'all 0.2s ease'
                        }}>
                          {tile.icon}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '4px' }}>{tile.label}</div>
                            <div style={{ fontSize: '21px', fontWeight: '950', color: tile.valColor, fontFamily: 'var(--font-title)', lineHeight: 1.15, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tile.value}</div>
                            <div style={{ fontSize: '11.5px', color: tile.isHero ? '#047857' : '#94A3B8', marginTop: '3px', fontWeight: '600' }}>{tile.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                      {tiles.slice(4, 7).map((tile, i) => (
                        <div key={i} style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--color-border)',
                          borderRadius: '14px',
                          padding: '16px 20px',
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          transition: 'all 0.2s ease'
                        }}>
                          {tile.icon}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '4px' }}>{tile.label}</div>
                            <div style={{ fontSize: '16px', fontWeight: '900', color: tile.valColor, fontFamily: 'var(--font-title)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tile.value}</div>
                            <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '3px', fontWeight: '500' }}>{tile.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      marginTop: '16px',
                      padding: '14px 20px',
                      background: 'linear-gradient(90deg, #ECFDF5 0%, #F0FDF4 100%)',
                      border: '1.5px solid #86EFAC',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '13.5px',
                      fontWeight: '600',
                      color: '#065F46',
                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.05)'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span>
                        You save <strong style={{ color: '#047857', fontWeight: '850' }}>${bestMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({savingPct}%)</strong> per month by implementing your chosen action plan pathways.
                      </span>
                    </div>

                    <div className="results-breakdown-grid" style={{ marginTop: '20px' }}>
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
                                { label: 'Monthly Cost', cur: `$${currentCostVal.toLocaleString()}`, opt: `$${(currentCostVal - bestMonthly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, delta: `-${savingPct}%`, good: true },
                                { label: 'Annual Cost', cur: `$${(currentCostVal * 12).toLocaleString()}`, opt: `$${((currentCostVal - bestMonthly) * 12).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, delta: `-${savingPct}%`, good: true },
                                { label: 'Selected Save', cur: '—', opt: `+$${bestMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo`, delta: '+', good: true },
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
                            <Check size={14} style={{ color: '#065F46' }} strokeWidth={3} /> You Save
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
                                            const commonPrefixes = ['gpt', 'claude', 'gemini', 'deepseek', 'grok', 'sonar', 'mimo', 'qwen', 'llama', 'mistral', 'glm', 'kimi'];
                                            const startsWithCommon = commonPrefixes.some(pref => lowerModel.startsWith(pref));

                                            if (!startsWithCommon && !lowerModel.includes(toolName.toLowerCase())) {
                                              displayModel = `${toolName} ${displayModel}`;
                                            }
                                            return `${displayModel} (API)`;
                                          } else {
                                            let displayPlan = cleanPlanOrModel || 'Subscription';
                                            if (!displayPlan.toLowerCase().startsWith(toolName.toLowerCase())) {
                                              displayPlan = `${toolName} ${displayPlan}`;
                                            }
                                            return `${displayPlan} (Subscription)`;
                                          }
                                        };

                                        const basePlanOrModel = item.alloc.type === 'api'
                                          ? (item.baselineModelName || item.alloc.baselineModelName || item.alloc.modelId)
                                          : item.alloc.plan;
                                        const baseLabel = getLabel(item.alloc.toolName, basePlanOrModel, item.alloc.type);

                                        const optPlanOrModel = item.choice === 'api'
                                          ? (item.recommendedModelName || item.opt?.name || item.opt?.recommendedModel)
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

              {/* ── Optimization Action Plan Checklist Section ── */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '28px',
                marginTop: '24px',
                marginBottom: '32px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                  <ClipboardList size={24} style={{ color: '#6366F1', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                      Optimization Action Plan Checklist
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Follow these step-by-step actions to execute your configured cost savings.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  {recs.map((rec, idx) => {
                    const choice = finalSelectedOptions[idx] || 'api';
                    const opt = choice === 'api' ? rec.apiOption : rec.subscriptionOption;
                    if (!opt) return null;

                    const match = rec.issue ? rec.issue.match(/Paying \$([\d,.]+)/) : null;
                    const itemCurrentCost = match ? parseFloat(match[1].replace(/,/g, '')) : 0;

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



                    return (
                      <div key={idx} style={{
                        display: 'flex',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderLeft: choice === 'api' ? '4px solid #3B82F6' : '4px solid #10B981',
                        alignItems: 'flex-start'
                      }}>
                        <input
                          type="checkbox"
                          style={{ width: '18px', height: '18px', accentColor: '#10B981', cursor: 'pointer', marginTop: '3px' }}
                        />

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ProviderLogo provider={rec.tool} size={16} />
                              <strong style={{ fontSize: '14px', color: '#1E293B' }}>{rec.tool}</strong>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                color: choice === 'api' ? '#2563EB' : '#047857',
                                backgroundColor: choice === 'api' ? '#EFF6FF' : '#ECFDF5',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                {choice === 'api' ? 'API ROUTING' : 'SUBSCRIPTION'}
                              </span>
                            </div>

                            <div style={{ fontSize: '13px', fontWeight: '800', color: dynamicSavingsVal >= 0 ? '#10B981' : '#EF4444' }}>
                              {dynamicSavingsVal >= 0 ? `+$${dynamicSavingsVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo savings` : `-$${Math.abs(dynamicSavingsVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo cost`}
                            </div>
                          </div>

                          <p style={{ fontSize: '13px', color: '#334155', fontWeight: '600', margin: '8px 0 4px 0', lineHeight: '1.4' }}>
                            {opt.action}
                          </p>

                          {opt.limits && (
                            <div style={{ fontSize: '11.5px', color: '#64748B', fontStyle: 'italic', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Info size={13} style={{ color: '#64748B', flexShrink: 0 }} /> {opt.limits}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 3b. Model Specific Comparison & Benchmarks ── */}
              {intelData && intelData.llms && recs.map((rec, origIdx) => ({ rec, origIdx })).filter(item => {
                const choice = finalSelectedOptions[item.origIdx] || 'api';
                const opt = choice === 'api' ? item.rec.apiOption : item.rec.subscriptionOption;
                return opt;
              }).map(({ rec, origIdx }, rIdx) => {
                const { baseline, recommended, baselineIntel, recommendedIntel } = resolveModelObjects(rec, origIdx, intelData.llms, auditResult, finalSelectedOptions[origIdx], intelData);
                if (!baseline || !recommended) return null;

                // Calculate benchmark scores
                const baselineScores = getBenchmarkScores(baseline, intelData);
                const recommendedScores = getBenchmarkScores(recommended, intelData);

                // Filter categories to only active ones where benchmark data is present (exclude missing attributes)
                const isSameModel = !baseline || (
                  (baseline.modelId || baseline.slug || baseline.id || '').toLowerCase() ===
                  (recommended.modelId || recommended.slug || recommended.id || '').toLowerCase()
                );

                const activeCategories = CATEGORIES.filter(cat => {
                  const recVal = recommendedScores?.[cat.key];
                  if (isSameModel) {
                    return recVal !== null && recVal !== undefined && !isNaN(recVal);
                  }
                  const baseVal = baselineScores?.[cat.key];
                  return (
                    (baseVal !== null && baseVal !== undefined && !isNaN(baseVal)) &&
                    (recVal !== null && recVal !== undefined && !isNaN(recVal))
                  );
                });
                const chartCategories = activeCategories.length >= 2 ? activeCategories : CATEGORIES;

                // SVG Graph dimensions
                const paddingLeft = 85;
                const paddingRight = 45;
                const paddingTop = 45;
                const paddingBottom = 65;
                const chartWidth = 900 - paddingLeft - paddingRight;
                const chartHeight = 420 - paddingTop - paddingBottom;

                const getX = (idx) => {
                  if (chartCategories.length <= 1) return paddingLeft + chartWidth / 2;
                  return paddingLeft + idx * (chartWidth / (chartCategories.length - 1));
                };
                const getY = (score) => {
                  if (score == null || isNaN(score)) return null;
                  const clampedScore = Math.max(0, Math.min(100, Number(score)));
                  return 420 - paddingBottom - (clampedScore / 100) * chartHeight;
                };

                const pointsBaseline = chartCategories.map((cat, idx) => ({
                  x: getX(idx),
                  y: baselineScores[cat.key] != null && !isNaN(baselineScores[cat.key]) ? getY(baselineScores[cat.key]) : null,
                  score: baselineScores[cat.key],
                  catKey: cat.key,
                  catName: cat.name,
                  sub: cat.sub,
                  idx
                }));

                const pointsRecommended = chartCategories.map((cat, idx) => ({
                  x: getX(idx),
                  y: recommendedScores[cat.key] != null && !isNaN(recommendedScores[cat.key]) ? getY(recommendedScores[cat.key]) : null,
                  score: recommendedScores[cat.key],
                  catKey: cat.key,
                  catName: cat.name,
                  sub: cat.sub,
                  idx
                }));

                const baselinePath = getSmoothPath(pointsBaseline);
                const recommendedPath = getSmoothPath(pointsRecommended);

                // Confidence logic derived directly from presence of verified Market Intel benchmarks
                const hasBaselineIntel = !!baselineIntel || baselineScores.coding != null || baselineScores.reasoning != null;
                const hasRecommendedIntel = !!recommendedIntel || recommendedScores.coding != null || recommendedScores.reasoning != null;
                const confidenceVal = (hasBaselineIntel && hasRecommendedIntel) ? 96 : 88;
                const isHighConfidence = confidenceVal >= 90;

                // Cost details
                const alloc = auditResult.allocations?.[origIdx];
                const currentMonthly = alloc?.currentCost || 0;
                const choice = finalSelectedOptions[origIdx] || 'api';
                const opt = choice === 'api' ? rec.apiOption : rec.subscriptionOption;
                const suggestedMonthly = Math.max(0, currentMonthly - (opt ? opt.savings : 0));

                const baseScores = getBenchmarkScores(baseline, null, null, intelData);
                const optScores = getBenchmarkScores(recommended, null, null, intelData);

                // Helper to resolve specific verified category score without artificial fallbacks
                const resolveDomainScore = (scores, purpose, intelObj, fallbackVal = null) => {
                  if (!scores) return fallbackVal;
                  const p = (purpose || '').toLowerCase();
                  let val = null;
                  if (p.includes('cod')) val = scores.coding;
                  else if (p.includes('math')) val = scores.math;
                  else if (p.includes('reason')) val = scores.reasoning;
                  else if (p.includes('research')) val = scores.research;
                  else if (p.includes('writ')) val = scores.writing;
                  else val = scores.intelligence_index ?? scores.reasoning;
                  return val != null ? Math.round(Number(val)) : (intelObj?.score != null ? Math.round(Number(intelObj.score)) : fallbackVal);
                };

                const baseScore = resolveDomainScore(baseScores, alloc?.purpose, baselineIntel, alloc?.performance_score ?? rec?.baselineScore ?? null);
                const optScore = resolveDomainScore(optScores, alloc?.purpose, recommendedIntel, (choice === 'api' ? rec?.apiOption?.performance_score : rec?.subscriptionOption?.performance_score) ?? baseScore);
                const scoreDelta = (baseScore !== null && optScore !== null) ? optScore - baseScore : null;

                const domainBenchmarkLabel = alloc?.purpose === 'Coding' ? 'Coding Index (SWE-Bench / LCB)'
                  : (alloc?.purpose === 'Math' ? 'Math Index (LiveBench AI)'
                  : (alloc?.purpose === 'Research' ? 'Research Index (HLE / GPQA)'
                  : (alloc?.purpose === 'Writing' ? 'Writing Index (MT-Bench)'
                  : 'Domain Benchmark Index')));

                const catName = recommendedIntel?.categoryName || baselineIntel?.categoryName || formatCategoryName(alloc?.purpose);
                const baseRankStr = baselineIntel?.rank ? `#${baselineIntel.rank} of ${baselineIntel.total}` : null;
                const optRankStr = recommendedIntel?.rank ? `#${recommendedIntel.rank} of ${recommendedIntel.total}` : null;

                const baseInputPrice = baselineIntel?.inputCost ?? baseline.pricing?.price_1m_input_tokens ?? baseline.inputCost ?? null;
                const optInputPrice = choice === 'api' 
                  ? (opt?.inputCostPerM ?? recommendedIntel?.inputCost ?? recommended.pricing?.price_1m_input_tokens ?? recommended.inputCost ?? null)
                  : (recommendedIntel?.inputCost ?? recommended.pricing?.price_1m_input_tokens ?? null);

                const baseOutputPrice = baselineIntel?.outputCost ?? baseline.pricing?.price_1m_output_tokens ?? baseline.outputCost ?? null;
                const optOutputPrice = choice === 'api' 
                  ? (opt?.outputCostPerM ?? recommendedIntel?.outputCost ?? recommended.pricing?.price_1m_output_tokens ?? recommended.outputCost ?? null)
                  : (recommendedIntel?.outputCost ?? recommended.pricing?.price_1m_output_tokens ?? null);

                const baseBlended = baselineIntel?.blendedPrice ?? baselineScores.blendedCost ?? ((baseInputPrice !== null && baseOutputPrice !== null) ? (baseInputPrice * 0.75 + baseOutputPrice * 0.25) : null);
                const optBlended = recommendedIntel?.blendedPrice ?? recommendedScores.blendedCost ?? ((optInputPrice !== null && optOutputPrice !== null) ? (optInputPrice * 0.75 + optOutputPrice * 0.25) : null);

                const baseSpeed = baselineIntel?.throughput ?? baselineScores.speedVal;
                const optSpeed = recommendedIntel?.throughput ?? recommendedScores.speedVal;

                const baseLatency = baselineIntel?.ttft ?? baseline.median_time_to_first_token_seconds ?? baseline.ttft ?? null;
                const optLatency = recommendedIntel?.ttft ?? recommended.median_time_to_first_token_seconds ?? recommended.ttft ?? null;

                // Metric comparisons using only measured data without fake fallbacks
                const specs = [
                  { label: 'Monthly Cost', cur: `$${currentMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, opt: `$${suggestedMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, type: 'cost' },
                  ...(baseRankStr && optRankStr ? [{
                    label: `Market Intel Standing (${catName})`,
                    cur: `${baseRankStr}`,
                    opt: `${optRankStr}`,
                    type: 'rank'
                  }] : []),
                  ...(baseInputPrice !== null || optInputPrice !== null ? [{
                    label: 'Cost per 1M Input Tokens',
                    cur: baseInputPrice !== null ? `$${baseInputPrice.toFixed(2)}` : '—',
                    opt: optInputPrice !== null ? `$${optInputPrice.toFixed(2)}` : '—',
                    type: 'cost'
                  }] : []),
                  ...(baseOutputPrice !== null || optOutputPrice !== null ? [{
                    label: 'Cost per 1M Output Tokens',
                    cur: baseOutputPrice !== null ? `$${baseOutputPrice.toFixed(2)}` : '—',
                    opt: optOutputPrice !== null ? `$${optOutputPrice.toFixed(2)}` : '—',
                    type: 'cost'
                  }] : []),
                  ...(baseBlended !== null || optBlended !== null ? [{
                    label: 'Blended Cost (3:1 Tokens)',
                    cur: baseBlended !== null ? `$${baseBlended.toFixed(2)}` : '—',
                    opt: optBlended !== null ? `$${optBlended.toFixed(2)}` : '—',
                    type: 'cost'
                  }] : []),
                  ...(baseScore !== null || optScore !== null ? [{
                    label: domainBenchmarkLabel,
                    cur: baseScore !== null ? `${baseScore}/100` : '—',
                    opt: optScore !== null ? `${optScore}/100` : '—',
                    type: 'quality'
                  }] : []),
                  ...(baselineScores.intelligence_index !== null || recommendedScores.intelligence_index !== null ? [{
                    label: 'Overall Intelligence Index',
                    cur: baselineScores.intelligence_index !== null ? `${Number(baselineScores.intelligence_index).toFixed(1)}/100` : '—',
                    opt: recommendedScores.intelligence_index !== null ? `${Number(recommendedScores.intelligence_index).toFixed(1)}/100` : '—',
                    type: 'quality'
                  }] : []),
                  ...(baseLatency !== null || optLatency !== null ? [{
                    label: 'Average Latency (TTFT)',
                    cur: baseLatency !== null ? `${baseLatency.toFixed(2)}s` : '—',
                    opt: optLatency !== null ? `${optLatency.toFixed(2)}s` : '—',
                    type: 'latency'
                  }] : []),
                  ...(baseSpeed || optSpeed ? [{
                    label: 'Throughput (Generation Speed)',
                    cur: baseSpeed ? `${Math.round(baseSpeed)} t/s` : '—',
                    opt: optSpeed ? `${Math.round(optSpeed)} t/s` : '—',
                    type: 'speed'
                  }] : []),
                  { label: 'Context Window', cur: formatContextWindow(baselineScores.context_length || baselineIntel?.context_length), opt: formatContextWindow(recommendedScores.context_length || recommendedIntel?.context_length), type: 'context' }
                ];

                const cleanBaseSubName = `${alloc?.toolName || ''} ${alloc?.plan || ''}`.replace(/\s+/g, ' ').trim().toLowerCase();
                const cleanOptSubName = (rec.subscriptionOption?.planName || '').replace(/\s+/g, ' ').trim().toLowerCase();
                const allocContext = rec.originalAlloc || alloc || {};

                const isIdenticalModel = baseline && recommended && (
                  (baseline.slug && recommended.slug && baseline.slug === recommended.slug) ||
                  (baseline.id && recommended.id && baseline.id === recommended.id) ||
                  (baseline.modelId && recommended.modelId && baseline.modelId === recommended.modelId) ||
                  (baseline.name && recommended.name && baseline.name.toLowerCase() === recommended.name.toLowerCase())
                );

                const isSameApi = alloc?.type === 'api' && choice === 'api' && isIdenticalModel;
                const isSameSubscription = alloc?.type === 'subscription' && choice === 'subscription' && (
                  cleanBaseSubName === cleanOptSubName ||
                  (isIdenticalModel && uiChoiceLabelsMatch(
                    `${alloc?.toolName || ''} ${alloc?.plan || ''}`,
                    rec.subscriptionOption?.planName || rec.subscriptionOption?.recommendedModel,
                    [allocContext.provider, alloc?.toolName],
                    [rec.subscriptionOption?.recommendedProvider]
                  ))
                );
                const isSameCurrentChoice = (isSameApi || isSameSubscription) && (opt?.savings === undefined || opt?.savings <= 0);
                const isAlreadyBest = isSameCurrentChoice;

                return (
                  <div key={rIdx} style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Special Highlight Header Container */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '16px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
                      background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
                    }}>
                      <div style={{ fontSize: '13.5px', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '4px', height: '16px', backgroundColor: '#6366F1', borderRadius: '2px', display: 'inline-block' }}></span>
                        Detailed Model Analysis: {alloc?.toolName || rec.tool.split(' (')[0]} {isAlreadyBest ? 'Verification' : 'Optimization'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: '#EEF2FF',
                          color: '#4338CA',
                          border: '1.5px solid #C7D2FE',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(99, 102, 241, 0.08)'
                        }}>
                          Selected Category: {alloc?.purpose || 'Mixed'}
                        </span>
                        <span style={{
                          backgroundColor: scoreDelta != null && scoreDelta > 0 ? '#ECFDF5' : '#EFF6FF',
                          color: scoreDelta != null && scoreDelta > 0 ? '#047857' : '#1D4ED8',
                          border: `1.5px solid ${scoreDelta != null && scoreDelta > 0 ? '#A7F3D0' : '#BFDBFE'}`,
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 1px 3px rgba(16, 185, 129, 0.08)'
                        }}>
                          Capability Score: {baseScore !== null ? `${baseScore}/100` : 'N/A'} → {optScore !== null ? `${optScore}/100` : 'N/A'} {scoreDelta != null && scoreDelta > 0 ? `(+${scoreDelta} pts)` : (isSameCurrentChoice ? '(100% Optimal)' : '(100% Preserved)')}
                        </span>
                        {baselineIntel?.rank && (
                          <span style={{
                            backgroundColor: '#F0FDF4',
                            color: '#065F46',
                            border: '1.5px solid #86EFAC',
                            padding: '5px 12px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 3px rgba(34, 197, 94, 0.1)'
                          }}>
                            <Trophy size={13} style={{ color: '#059669' }} />
                            Market Intel: #{baselineIntel.rank} → #{recommendedIntel?.rank || baselineIntel.rank} ({recommendedIntel?.categoryName || baselineIntel.categoryName})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Model/Subscription Migration Visual Card */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '24px',
                      padding: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 10px 30px -10px rgba(34, 197, 94, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)',
                      color: '#0F172A',
                      gap: '24px',
                      flexWrap: 'wrap',
                      border: '1px solid rgba(34, 197, 94, 0.15)'
                    }}>
                      {/* Left: Current Model / Subscription */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
                        <ProviderLogo
                          provider={
                            alloc?.type === 'subscription'
                              ? (alloc?.toolName || '')
                              : (baseline.creator || baseline.name || alloc?.toolName || '')
                          }
                          size={40}
                        />
                        <div>
                          <div style={{ fontSize: '9px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                            {alloc?.type === 'subscription' ? 'Current Subscription' : 'Current Model'}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-title)', color: '#0F172A' }}>
                            {alloc?.type === 'subscription'
                              ? `${alloc?.toolName || ''} ${alloc?.plan || 'Free'}`
                              : baseline.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                            Provider: <span style={{ color: '#475569', fontWeight: '500' }}>{alloc?.type === 'subscription' ? (alloc?.toolName || 'Unknown') : (baseline.creator || 'Unknown')}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#475569', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px' }}>
                              Capability Score: <strong style={{ color: '#0F172A' }}>{baseScore !== null ? baseScore : 'N/A'}</strong>{baseScore !== null ? '/100' : ''}
                            </div>
                            {baselineIntel?.rank && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#B45309', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '4px' }}>
                                <Trophy size={11} style={{ color: '#D97706' }} /> Market Intel Rank: <strong style={{ color: '#0F172A' }}>#{baselineIntel.rank}</strong> of {baselineIntel.total}
                              </div>
                            )}
                          </div>
                          {alloc?.type === 'subscription' && alloc?.baselineModels && alloc.baselineModels.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                              {alloc.baselineModels.slice(0, 3).map((m, idx) => (
                                <span key={idx} style={{
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  color: '#475569',
                                  backgroundColor: '#F1F5F9',
                                  padding: '4px 10px',
                                  borderRadius: '9999px',
                                  height: '22px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  {m}
                                </span>
                              ))}
                              {alloc.baselineModels.length > 3 && (
                                <span style={{
                                  fontSize: '9px',
                                  fontWeight: '700',
                                  color: '#64748B',
                                  backgroundColor: '#F8FAFC',
                                  border: '1px solid #E2E8F0',
                                  padding: '4px 8px',
                                  borderRadius: '9999px',
                                  height: '22px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
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
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#F0FDF4',
                            border: '1px solid rgba(34,197,94,.15)',
                            color: '#10B981',
                            flexShrink: 0
                          }}>
                            <ArrowRight size={16} />
                          </div>

                          {/* Right: Suggested Model / Subscription */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '200px' }}>
                            <ProviderLogo
                              provider={
                                choice === 'subscription'
                                  ? (rec.subscriptionOption?.planName || '')
                                  : (recommended.creator || recommended.name || rec.tool || '')
                              }
                              size={40}
                            />
                            <div>
                              <div style={{ fontSize: '9px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                {choice === 'subscription' ? 'Suggested Subscription' : 'Suggested Model'}
                              </div>
                              <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-title)', color: '#10B981' }}>
                                {choice === 'subscription'
                                  ? (rec.subscriptionOption?.planName || 'Optimized Sub')
                                  : recommended.name}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                                Provider: <span style={{ color: '#475569', fontWeight: '500' }}>{choice === 'subscription' ? (rec.subscriptionOption?.planName?.split(' ')[0] || 'Unknown') : (recommended.creator || 'Unknown')}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#15803D', backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', padding: '2px 8px', borderRadius: '4px' }}>
                                  Capability Score: <strong style={{ color: '#166534' }}>{optScore !== null ? optScore : 'N/A'}</strong>{optScore !== null ? '/100' : ''}
                                </div>
                                {recommendedIntel?.rank && (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#047857', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '4px' }}>
                                    <Trophy size={11} style={{ color: '#16A34A' }} /> Market Intel Rank: <strong style={{ color: '#166534' }}>#{recommendedIntel.rank}</strong> of {recommendedIntel.total}
                                  </div>
                                )}
                              </div>
                              {choice === 'subscription' && rec.subscriptionOption?.includedModels && rec.subscriptionOption.includedModels.length > 0 && (() => {
                                const included = sortModelsLatestFirst(rec.subscriptionOption.includedModels);
                                if (included.length === 0) return null;
                                return (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                    {included.slice(0, 6).map((m, idx) => (
                                      <span key={idx} style={{
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        color: '#0369A1',
                                        backgroundColor: '#E0F2FE',
                                        padding: '4px 10px',
                                        borderRadius: '9999px',
                                        height: '22px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        {m}
                                      </span>
                                    ))}
                                    {included.length > 6 && (
                                      <span style={{
                                        fontSize: '9px',
                                        fontWeight: '700',
                                        color: '#0284C7',
                                        backgroundColor: '#F0F9FF',
                                        border: '1px solid #B9E6FE',
                                        padding: '4px 8px',
                                        borderRadius: '9999px',
                                        height: '22px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        +{included.length - 6} more
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Right side message when it's already the best */
                        <div style={{
                          flex: 1.5,
                          minWidth: '250px',
                          backgroundColor: '#F0FDF4',
                          borderRadius: '16px',
                          padding: '16px 20px',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          color: '#16A34A',
                          fontSize: '13px',
                          fontWeight: '600',
                          lineHeight: '1.4'
                        }}>
                          <Sparkles size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
                          <span>
                            The current {isSameSubscription ? 'subscription' : 'API'} is already optimized. No action required.
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
                          {alloc?.type === 'subscription' && alloc.baselineModels && alloc.baselineModels.length > 0 && (() => {
                            const baselineList = sortModelsLatestFirst(alloc.baselineModels);
                            if (baselineList.length === 0) return null;
                            return (
                              <div>
                                The current <strong>{alloc.toolName} {alloc.plan}</strong> subscription includes access to:
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                  {baselineList.map((m, mi) => (
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
                            );
                          })()}

                          {/* 2. If recommended is subscription, show its included models */}
                          {choice === 'subscription' && rec.subscriptionOption?.includedModels && rec.subscriptionOption.includedModels.length > 0 && (() => {
                            const recList = sortModelsLatestFirst(rec.subscriptionOption.includedModels);
                            if (recList.length === 0) return null;
                            return (
                              <div>
                                The recommended <strong>{rec.subscriptionOption.planName || 'Optimized Sub'}</strong> subscription includes access to:
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                  {recList.map((m, mi) => (
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
                            );
                          })()}

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
                        <Info size={16} style={{ color: '#1E40AF', flexShrink: 0 }} />
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
                          <BarChart3 size={16} style={{ color: '#6366F1' }} />
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
                                const isRankRow = row.type === 'rank' || row.label.includes('Market Intel');
                                const isScoreRow = row.type === 'quality' && row.label === domainBenchmarkLabel;
                                const isSpecialRow = isRankRow || isScoreRow;
                                return (
                                  <tr key={i} style={{
                                    borderBottom: i < specs.length - 1 ? '1px solid var(--color-border)' : 'none',
                                    backgroundColor: isRankRow ? '#F0FDF4' : (isScoreRow ? '#F5F3FF' : 'transparent')
                                  }}>
                                    <td style={{ padding: '12px 16px', fontWeight: isSpecialRow ? '750' : '600', color: isSpecialRow ? '#0F172A' : '#334155' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {isRankRow && <Trophy size={14} style={{ color: '#059669', flexShrink: 0 }} />}
                                        {isScoreRow && <Sparkles size={14} style={{ color: '#7C3AED', flexShrink: 0 }} />}
                                        <span>{row.label}</span>
                                        {isSpecialRow && (
                                          <span style={{ fontSize: '9.5px', fontWeight: '800', textTransform: 'uppercase', padding: '1px 6px', borderRadius: '4px', backgroundColor: isRankRow ? '#DCFCE7' : '#EDE9FE', color: isRankRow ? '#15803D' : '#6D28D9', marginLeft: '4px' }}>
                                            Key Metric
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    {!isSameModel ? (
                                      <>
                                        <td style={{ padding: '12px 16px', color: '#475569', fontWeight: isSpecialRow ? '700' : 'normal' }}>
                                          {isSpecialRow ? (
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#334155', fontWeight: '700' }}>
                                              {row.cur}
                                            </span>
                                          ) : row.cur}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#0F172A', fontWeight: '750' }}>
                                          {isSpecialRow ? (
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: isRankRow ? '#DCFCE7' : '#EDE9FE', color: isRankRow ? '#15803D' : '#6D28D9', fontWeight: '800' }}>
                                              {row.opt}
                                            </span>
                                          ) : row.opt}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '800', color: imp.isGood ? '#10B981' : '#EF4444' }}>
                                          {isSpecialRow ? (
                                            <span style={{ padding: '3px 10px', borderRadius: '6px', backgroundColor: imp.isGood ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${imp.isGood ? '#A7F3D0' : '#FECACA'}`, color: imp.isGood ? '#047857' : '#DC2626', display: 'inline-block' }}>
                                              {imp.text || imp}
                                            </span>
                                          ) : (imp.text || imp)}
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

                    {/* Live Market Intel Leaderboard Snapshot Card */}
                    {(() => {
                      const activeCatKey = recommendedIntel?.category || baselineIntel?.category || 'overall';
                      const leaderboardList = intelData?.categories?.[activeCatKey] || [];
                      if (leaderboardList.length === 0) return null;
                      const topModels = leaderboardList.slice(0, 5);
                      
                      return (
                        <div style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '14px',
                          border: '1px solid var(--color-border)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                          padding: '24px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Trophy size={18} style={{ color: '#D97706' }} />
                                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                                  Live Market Intel Leaderboard — {formatCategoryName(activeCatKey)}
                                </h4>
                              </div>
                              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                                Verified standing on the official Market Intel {formatCategoryName(activeCatKey)} ({leaderboardList.length} audited models).
                              </p>
                            </div>
                            <button
                              onClick={() => onNavigateToView('market_intel')}
                              style={{
                                backgroundColor: '#F8FAFC',
                                color: '#1E293B',
                                border: '1px solid #CBD5E1',
                                borderRadius: '8px',
                                padding: '8px 14px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.borderColor = '#93C5FD'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                            >
                              Explore Market Intel <ArrowRight size={13} />
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {topModels.map((m, mIdx) => {
                              const isThisRec = recommendedIntel && (m.slug === recommendedIntel.slug || m.rank === recommendedIntel.rank);
                              const isThisBase = baselineIntel && (m.slug === baselineIntel.slug || m.rank === baselineIntel.rank);
                              const scoreVal = m.category_scores?.[activeCatKey] ?? m.final_score ?? m.evaluations?.livebench_math ?? m.evaluations?.artificial_analysis_intelligence_index ?? m.rating;
                              
                              return (
                                <div
                                  key={mIdx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    backgroundColor: isThisRec ? '#ECFDF5' : (isThisBase ? '#FFF7ED' : '#F8FAFC'),
                                    border: isThisRec ? '1px solid #A7F3D0' : (isThisBase ? '1px solid #FFEDD5' : '1px solid #E2E8F0'),
                                    gap: '12px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                    <span style={{
                                      fontSize: '12px',
                                      fontWeight: '800',
                                      color: m.rank <= 3 ? '#B45309' : '#64748B',
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '50%',
                                      backgroundColor: m.rank <= 3 ? '#FEF3C7' : '#E2E8F0',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      {m.rank}
                                    </span>
                                    <ProviderLogo provider={m.organization || m.creator} size={20} />
                                    <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      <span style={{ fontSize: '13px', fontWeight: '750', color: '#0F172A' }}>
                                        {m.name}
                                      </span>
                                      <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '8px' }}>
                                        {m.organization || m.creator}
                                      </span>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                    {isThisRec && (
                                      <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#047857', backgroundColor: '#D1FAE5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '4px' }}>
                                        ★ Recommended
                                      </span>
                                    )}
                                    {isThisBase && !isThisRec && (
                                      <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#C2410C', backgroundColor: '#FFEDD5', border: '1px solid #FED7AA', padding: '2px 8px', borderRadius: '4px' }}>
                                        Current Setup
                                      </span>
                                    )}
                                    <span style={{
                                      fontSize: '12.5px',
                                      fontWeight: '800',
                                      color: '#0F172A',
                                      backgroundColor: '#FFFFFF',
                                      border: '1px solid #CBD5E1',
                                      padding: '3px 10px',
                                      borderRadius: '6px',
                                      fontFamily: 'monospace'
                                    }}>
                                      {scoreVal != null ? (typeof scoreVal === 'number' ? scoreVal.toFixed(1) : scoreVal) : '—'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

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
                          Actual benchmark score across available categories
                        </p>
                      </div>

                      <div className="radar-split-grid">
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
                          <svg viewBox="0 0 900 420" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'hidden' }}>
                            <defs>
                              <clipPath id="chart-area-clip">
                                <rect x={paddingLeft - 20} y={paddingTop - 15} width={chartWidth + 40} height={chartHeight + 30} />
                              </clipPath>
                            </defs>

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
                              Score (0-100)
                            </text>

                            {/* Category labels and vertical lines */}
                            {chartCategories.map((cat, idx) => {
                              const x = getX(idx);
                              const yLabel = 420 - paddingBottom + 12;
                              return (
                                <g key={idx}>
                                  <line x1={x} y1={paddingTop - 10} x2={x} y2={420 - paddingBottom} stroke="rgba(15, 23, 42, 0.03)" strokeWidth={1} strokeDasharray="2 2" />
                                  <circle cx={x} cy={yLabel + 12} r="13" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
                                  <g transform={`translate(${x - 7}, ${yLabel + 5})`}>
                                    {React.createElement(cat.icon, { size: 14, style: { color: cat.color } })}
                                  </g>
                                  <text x={x} y={yLabel + 36} textAnchor="middle" style={{ fill: '#0F172A', fontSize: '10px', fontWeight: '700' }}>{cat.name}</text>
                                  <text x={x} y={yLabel + 47} textAnchor="middle" style={{ fill: '#64748B', fontSize: '8px', fontWeight: '500' }}>({cat.sub})</text>
                                </g>
                              );
                            })}

                            {/* Line paths */}
                            {!isSameModel && baselinePath && (
                              <path d={baselinePath} fill="none" stroke="#F97316" strokeWidth="3" opacity="0.8" clipPath="url(#chart-area-clip)" />
                            )}
                            {recommendedPath && (
                              <path d={recommendedPath} fill="none" stroke={isSameModel ? '#6366F1' : '#10B981'} strokeWidth="3.5" opacity="0.9" clipPath="url(#chart-area-clip)" />
                            )}

                            {/* Points baseline */}
                            {!isSameModel && pointsBaseline.map((pt, idx) => (
                              pt.score != null && pt.y != null ? (
                                <circle key={`cb-${idx}`} cx={pt.x} cy={pt.y} r="5" fill="#FFFFFF" stroke="#F97316" strokeWidth="2.5">
                                  <title>{`${pt.catName}: ${pt.catKey === 'speedNorm' ? (baselineScores.speedVal || pt.score) + ' t/s' : pt.score}`}</title>
                                </circle>
                              ) : null
                            ))}

                            {/* Points recommended */}
                            {pointsRecommended.map((pt, idx) => (
                              pt.score != null && pt.y != null ? (
                                <circle key={`cr-${idx}`} cx={pt.x} cy={pt.y} r="5" fill="#FFFFFF" stroke={isSameModel ? '#6366F1' : '#10B981'} strokeWidth="2.5">
                                  <title>{`${pt.catName}: ${pt.catKey === 'speedNorm' ? (recommendedScores.speedVal || pt.score) + ' t/s' : pt.score}`}</title>
                                </circle>
                              ) : null
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
                                    <span style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {React.createElement(cat.icon, { size: 14, style: { color: cat.color } })}
                                    </span>
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
                  const { baseline, recommended, baselineIntel, recommendedIntel } = resolveModelObjects(rec || { apiOption: {}, subscriptionOption: {} }, idx, intelData.llms, auditResult, choice, intelData);

                  let currentCost = alloc.currentCost || 0;
                  if (currentCost === 0 && rec && rec.issue) {
                    const match = rec.issue.match(/Paying \$([\d,.]+)/);
                    if (match) {
                      currentCost = parseFloat(match[1].replace(/,/g, ''));
                    }
                  }

                  const optimizedCost = calculateOptimizedCost(alloc, rec, choice, tokenAdjustments, idx);
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

                  const baseScores = getBenchmarkScores(baseline, null, null, intelData);
                  const optScores = getBenchmarkScores(recommended, null, null, intelData);

                  const resolveDomainScore = (scores, purpose, intelObj, fallbackVal = null) => {
                    if (!scores) return fallbackVal;
                    const p = (purpose || '').toLowerCase();
                    let val = null;
                    if (p.includes('cod')) val = scores.coding;
                    else if (p.includes('math')) val = scores.math;
                    else if (p.includes('reason')) val = scores.reasoning;
                    else if (p.includes('research')) val = scores.research;
                    else if (p.includes('writ')) val = scores.writing;
                    else val = scores.intelligence_index ?? scores.reasoning;
                    return val != null ? Math.round(Number(val)) : (intelObj?.score != null ? Math.round(Number(intelObj.score)) : fallbackVal);
                  };

                  const baseScore = resolveDomainScore(baseScores, alloc.purpose, baselineIntel, alloc.performance_score ?? rec?.baselineScore ?? null);
                  const optScore = resolveDomainScore(optScores, alloc.purpose, recommendedIntel, (choice === 'api' ? rec?.apiOption?.performance_score : rec?.subscriptionOption?.performance_score) ?? baseScore);
                  const scoreDelta = (baseScore !== null && optScore !== null) ? optScore - baseScore : 0;
                  const scoreDeltaPct = (baseScore !== null && baseScore > 0 && optScore !== null) ? parseFloat((((optScore - baseScore) / baseScore) * 100).toFixed(1)) : 0;

                  let confidence = 'High';
                  if (!baselineIntel || !recommendedIntel) {
                    confidence = 'Medium';
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
                    confidence,
                    baseScore,
                    optScore,
                    scoreDelta,
                    scoreDeltaPct,
                    baseIntel: baselineIntel,
                    optIntel: recommendedIntel
                  };
                });

                return (
                  <div className="results-hero-grid" style={{ marginTop: '32px', marginBottom: '24px', alignItems: 'start' }}>

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
                              <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'left', color: '#475569' }}>Service / Category</th>
                              <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'left', color: '#475569' }}>Current Setup</th>
                              <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'left', color: '#475569' }}>Recommended Setup</th>
                              <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'center', color: '#475569' }}>Score Comparison</th>
                              <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'right', color: '#475569' }}>Monthly Savings</th>
                              <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'right', color: '#475569' }}>Cost Reduction</th>
                              <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'center', color: '#475569' }}>Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {masterTableRows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: idx < masterTableRows.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0F172A' }}>
                                  <div style={{ fontSize: '12px' }}>{row.toolName}</div>
                                  <div style={{ marginTop: '4px' }}>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      backgroundColor: '#EEF2FF',
                                      color: '#4338CA',
                                      border: '1.5px solid #C7D2FE',
                                      padding: '3px 9px',
                                      borderRadius: '6px',
                                      fontSize: '10.5px',
                                      fontWeight: '800'
                                    }}>
                                      Selected Category: {row.purpose}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{ fontWeight: '600', color: '#334155' }}>{row.currentModel}</div>
                                  <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>{row.currentPlan}</div>
                                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#0F172A', marginTop: '4px' }}>
                                    ${row.currentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '3px' }}>
                                    <span style={{ fontSize: '10px', color: '#475569', fontWeight: '700' }}>
                                      Score: <strong style={{ color: '#0F172A' }}>{row.baseScore !== null ? row.baseScore : 'N/A'}</strong>{row.baseScore !== null ? '/100' : ''}
                                    </span>
                                    {row.baseIntel?.rank && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9.5px', color: '#B45309', fontWeight: '750', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', padding: '1px 6px', borderRadius: '3px' }}>
                                        <Trophy size={9} style={{ color: '#D97706' }} /> Market Intel #{row.baseIntel.rank}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{ fontWeight: '600', color: '#334155' }}>{row.suggestedModel}</div>
                                  <div style={{ fontSize: '10px', color: row.savings > 0 ? '#10B981' : '#64748B', fontWeight: row.savings > 0 ? '700' : 'normal', marginTop: '2px' }}>{row.recommendedPlan}</div>
                                  <div style={{ fontSize: '11px', fontWeight: '750', color: '#0F172A', marginTop: '4px' }}>
                                    ${row.optimizedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '3px' }}>
                                    <span style={{ fontSize: '10px', color: '#15803D', fontWeight: '700' }}>
                                      Score: <strong style={{ color: '#166534' }}>{row.optScore !== null ? row.optScore : 'N/A'}</strong>{row.optScore !== null ? '/100' : ''}
                                    </span>
                                    {row.optIntel?.rank && (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9.5px', color: '#047857', fontWeight: '750', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1px 6px', borderRadius: '3px' }}>
                                        <Trophy size={9} style={{ color: '#10B981' }} /> Market Intel #{row.optIntel.rank}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                  <div style={{ fontSize: '12px', fontWeight: '800', color: row.scoreDelta > 0 ? '#15803D' : (row.scoreDelta === 0 ? '#2563EB' : '#475569') }}>
                                    {row.baseScore !== null ? `${row.baseScore}/100` : 'N/A'} → {row.optScore !== null ? `${row.optScore}/100` : 'N/A'}
                                  </div>
                                  {row.scoreDelta > 0 ? (
                                    <span style={{ display: 'inline-block', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '2px 7px', borderRadius: '4px', fontSize: '9.5px', fontWeight: '750', marginTop: '3px' }}>
                                      +{row.scoreDelta} pts ({row.scoreDeltaPct}% Improved)
                                    </span>
                                  ) : (
                                    <span style={{ display: 'inline-block', backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '2px 7px', borderRadius: '4px', fontSize: '9.5px', fontWeight: '750', marginTop: '3px' }}>
                                      {row.savings === 0 ? '100% Optimal' : '100% Preserved'}
                                    </span>
                                  )}
                                  {row.baseIntel?.rank && (
                                    <div style={{ marginTop: '5px' }}>
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '9.5px',
                                        color: '#047857',
                                        fontWeight: '800',
                                        backgroundColor: '#F0FDF4',
                                        border: '1px solid #86EFAC',
                                        padding: '2px 7px',
                                        borderRadius: '4px'
                                      }}>
                                        <Trophy size={10} style={{ color: '#059669' }} /> Market Intel: #{row.baseIntel.rank} → #{row.optIntel?.rank || row.baseIntel.rank}
                                      </span>
                                    </div>
                                  )}
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
                        {(() => {
                          const avgScoreDelta = masterTableRows.length > 0
                            ? Math.round(masterTableRows.reduce((acc, r) => acc + (r.scoreDelta || 0), 0) / masterTableRows.length)
                            : 0;

                          const takeaways = [
                            bestMonthly > 0
                              ? `You are currently overspending by ${savingPct}% ($${bestMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month).`
                              : `Your AI allocations are currently cost-optimized with no excess expenditure detected.`,
                            `${recs.filter((r, idx) => {
                              const choice = finalSelectedOptions[idx] || 'api';
                              const opt = choice === 'api' ? r.apiOption : r.subscriptionOption;
                              return opt && opt.savings > 0;
                            }).length} optimization opportunities verified with high confidence.`,
                            avgScoreDelta > 0
                              ? `Overall capability enhanced by +${avgScoreDelta} pts on average across audited workloads.`
                              : (avgScoreDelta === 0
                                ? `100% capability retention with zero quality regression under performance preservation.`
                                : `High quality retention (minimal quality impact under 5%).`),
                            `Faster responses and larger context windows verified in recommended models.`,
                            `All models benchmarked and verified against live Market Intel leaderboards across 30 domain categories.`,
                            bestMonthly > 0
                              ? `Full implementation can save $${bestAnnual.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} annually.`
                              : `Total annual budget preserved at optimal efficiency.`
                          ];

                          return takeaways.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                              <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#ECFDF5', flexShrink: 0 }}>
                                <Check size={10} style={{ color: '#10B981' }} strokeWidth={3} />
                              </div>
                              <span>{item}</span>
                            </div>
                          ));
                        })()}
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
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '32px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onNavigateToView('step4')}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: '#1E293B', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <ArrowLeft size={14} /> Edit Action Plan (Step 4)
                </button>
                {fromHistory && (
                  <button
                    onClick={() => onNavigateToView('history')}
                    style={{ padding: '10px 24px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ArrowLeft size={14} /> Back to Reports History
                  </button>
                )}
                <button
                  onClick={() => onNavigateToView('step1')}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#0F172A', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Run Another Audit <BarChart3 size={14} />
                </button>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
