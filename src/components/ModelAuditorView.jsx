import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { getCachedRawData, getCachedModelsList } from '../utils/dataCache';
import logoImg from '../assets/audex-ai-logo.png';
import { ProviderLogo } from './MarketIntelView';
import {
  Settings,
  Code2,
  PenTool,
  Calculator,
  Search,
  GraduationCap,
  MessagesSquare,
  Monitor,
  Briefcase,
  Globe,
  Languages,
  ShieldCheck,
  TrendingDown,
  Gem,
  Scale,
  ArrowRight,
  LoaderCircle,
  BarChart3,
  Bot,
  Brain,
  ChevronDown,
  Check,
  Home,
  Sparkles
} from 'lucide-react';

const getNormalizedProvider = (provOrId) => {
  if (!provOrId) return 'Unknown';
  let prov = provOrId;
  if (prov.includes('/')) {
    prov = prov.split('/')[0];
  }
  const p = prov.toLowerCase().trim();
  if (p.includes('gpt') || p.includes('openai') || p.includes('chatgpt')) {
    return 'OpenAI';
  }
  if (p.includes('claude') || p.includes('anthropic')) {
    return 'Anthropic';
  }
  if (p.includes('gemini') || p.includes('google')) {
    return 'Google';
  }
  if (p.includes('meta') || p.includes('llama')) {
    return 'Meta';
  }
  if (p.includes('deepseek')) {
    return 'DeepSeek';
  }
  if (p.includes('mistral')) {
    return 'Mistral';
  }
  if (p.includes('cohere')) {
    return 'Cohere';
  }
  if (p.includes('x-ai') || p.includes('grok') || p.includes('xai')) {
    return 'xAI';
  }
  if (p.includes('moonshot')) {
    return 'Moonshot';
  }
  if (p.includes('alibaba') || p.includes('qwen')) {
    return 'Alibaba';
  }
  if (p.includes('microsoft')) {
    return 'Microsoft';
  }
  if (p.includes('aws') || p.includes('amazon')) {
    return 'Amazon';
  }
  if (p.includes('ibm')) {
    return 'IBM';
  }
  if (p.includes('databricks')) {
    return 'Databricks';
  }
  if (p.includes('snowflake')) {
    return 'Snowflake';
  }
  if (p.includes('cursor')) {
    return 'Cursor';
  }
  if (p.includes('github') || p.includes('copilot')) {
    return 'GitHub';
  }
  if (p.includes('suno')) {
    return 'Suno';
  }
  if (p.includes('runway')) {
    return 'Runway';
  }
  if (p.includes('midjourney')) {
    return 'Midjourney';
  }
  if (p.includes('elevenlabs')) {
    return 'ElevenLabs';
  }
  if (p.includes('gamma')) {
    return 'Gamma';
  }
  if (p.includes('vercel')) {
    return 'Vercel';
  }
  return prov.charAt(0).toUpperCase() + prov.slice(1);
};

const POPULAR_MODELS = [
  { id: 'anthropic/claude-fable-5', name: 'Anthropic: Claude Fable 5' },
  { id: 'openai/gpt-5.5-pro', name: 'OpenAI: GPT-5.5 Pro' },
  { id: 'google/gemini-3.5-flash', name: 'Google: Gemini 3.5 Flash' },
  { id: 'anthropic/claude-opus-4.8', name: 'Anthropic: Claude Opus 4.8' },
  { id: 'google/gemini-3.1-pro-preview', name: 'Google: Gemini 3.1 Pro' },
  { id: 'x-ai/grok-4-20', name: 'xAI: Grok 4.20' },
  { id: 'google/gemini-3-pro', name: 'Google: Gemini 3 Pro' },
  { id: 'openai/gpt-5.4', name: 'OpenAI: GPT-5.4' },
  { id: 'alibaba/qwen3-7-max', name: 'Alibaba: Qwen 3.7 Max' },
  { id: 'meta-llama/muse-spark', name: 'Meta: Muse Spark' }
];

function _formatCategoryName(key) {
  if (!key) return '';
  if (key === 'overall') return 'Overall Index';
  if (key === 'coding') return 'Coding Index';
  if (key === 'math') return 'Math Index';
  if (key === 'exclude-ties') return 'Exclude Ties';

  // Replace dashes with spaces, capitalize words
  let formatted = key
    .replace(/^industry-/, '')
    .split('-')
    .map(word => {
      if (word === 'and') return '&';
      if (word === 'it') return 'IT';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  if (key.startsWith('industry-')) {
    formatted = `${formatted} Industry`;
  }
  return formatted;
}

function formatEvalName(key) {
  if (key === 'artificial_analysis_intelligence_index') return 'AA Intelligence Index';
  if (key === 'artificial_analysis_coding_index') return 'AA Coding Index';
  if (key === 'artificial_analysis_math_index') return 'AA Math Index';
  if (key === 'gpqa') return 'GPQA';
  if (key === 'hle') return 'HLE';
  if (key === 'ifbench') return 'IFBench';
  if (key === 'scicode') return 'SciCode';
  if (key === 'lcr') return 'LiveCodeBench';

  return key
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatEvalValue(key, val) {
  if (val === null || val === undefined) return 'N/A';
  if (typeof val === 'number') {
    if (val > 0 && val <= 1 && key !== 'artificial_analysis_intelligence_index' && key !== 'artificial_analysis_coding_index' && key !== 'artificial_analysis_math_index') {
      return `${(val * 100).toFixed(1)}%`;
    }
    return val.toFixed(1);
  }
  return String(val);
}


function CustomSelect({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const getInitialHighlightIndex = () => {
    const selectedIdx = options.findIndex(opt => opt.value === value);
    if (selectedIdx >= 0) return selectedIdx;
    const firstNonHeader = options.findIndex(opt => !opt.isHeader);
    return firstNonHeader >= 0 ? firstNonHeader : 0;
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHighlightedIndex(getInitialHighlightIndex());
    }
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen) {
        if (highlightedIndex >= 0 && highlightedIndex < options.length && !options[highlightedIndex].isHeader) {
          handleSelect(options[highlightedIndex].value);
        }
      } else {
        setIsOpen(true);
        setHighlightedIndex(getInitialHighlightIndex());
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(getInitialHighlightIndex());
      } else {
        let nextIdx = (highlightedIndex + 1) % options.length;
        while (options[nextIdx] && options[nextIdx].isHeader) {
          nextIdx = (nextIdx + 1) % options.length;
        }
        setHighlightedIndex(nextIdx);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        let prevIdx = (highlightedIndex - 1 + options.length) % options.length;
        while (options[prevIdx] && options[prevIdx].isHeader) {
          prevIdx = (prevIdx - 1 + options.length) % options.length;
        }
        setHighlightedIndex(prevIdx);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const listRef = useRef(null);
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="custom-select-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: '46px',
          padding: '0 16px',
          borderRadius: '12px',
          background: 'rgba(248, 250, 252, 0.95)',
          border: isOpen ? '1px solid #10B981' : '1px solid #D9E2EC',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)',
          fontSize: '14px',
          fontWeight: '600',
          color: '#1E293B',
          cursor: 'pointer',
          outline: 'none',
          transition: 'background .18s, color .18s, border .18s, box-shadow .18s',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--color-text-secondary)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease-out'
          }}
        />
      </button>

      {isOpen && (
        <ul
          className="custom-select-menu"
          ref={listRef}
          role="listbox"
          data-lenis-prevent
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
            maxHeight: '320px',
            overflowY: 'auto',
            padding: '6px',
            margin: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'fadeInScale 180ms ease-out',
            transformOrigin: 'top center'
          }}
        >
          {options.map((opt, idx) => {
            if (opt.isHeader) {
              return (
                <li
                  key={`header-${idx}`}
                  style={{
                    padding: '8px 14px',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    marginTop: idx > 0 ? '6px' : '0',
                    marginBottom: '2px',
                    borderBottom: '1px solid #F1F5F9'
                  }}
                >
                  {opt.label}
                </li>
              );
            }
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '42px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isSelected ? '600' : '500',
                  color: isSelected
                    ? '#047857'
                    : isHighlighted
                      ? '#059669'
                      : '#334155',
                  backgroundColor: isSelected
                    ? '#D1FAE5'
                    : isHighlighted
                      ? '#ECFDF5'
                      : 'transparent',
                  transition: 'background .18s, color .18s, border .18s, box-shadow .18s'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</span>
                {isSelected && <Check size={14} style={{ color: '#047857' }} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


export default function ModelAuditorView({ 
  onNavigateToView, 
  renderCoinDropdown, 
  onCompareModels,
  optimizationGoal: propOptimizationGoal,
  setOptimizationGoal: propSetOptimizationGoal,
  costCutPercentage: propCostCutPercentage,
  setCostCutPercentage: propSetCostCutPercentage,
  targetUseCase: propTargetUseCase,
  setTargetUseCase: propSetTargetUseCase,
  token,
  user,
  onPurchase
}) {

  const [currentModelId, setCurrentModelId] = useState('anthropic/claude-fable-5');
  const [localTargetUseCase, setLocalTargetUseCase] = useState('Mixed');
  const targetUseCase = propTargetUseCase !== undefined ? propTargetUseCase : localTargetUseCase;
  const setTargetUseCase = propSetTargetUseCase !== undefined ? propSetTargetUseCase : setLocalTargetUseCase;

  const [monthlyInputTokens, setMonthlyInputTokens] = useState(20000000); // 20M prompt tokens
  const [monthlyOutputTokens, setMonthlyOutputTokens] = useState(5000000); // 5M completion tokens
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [availableModels, setAvailableModels] = useState(POPULAR_MODELS);
  
  const [localOptimizationGoal, setLocalOptimizationGoal] = useState('performance');
  const [localCostCutPercentage, setLocalCostCutPercentage] = useState(50);

  const optimizationGoal = propOptimizationGoal !== undefined ? propOptimizationGoal : localOptimizationGoal;
  const setOptimizationGoal = propSetOptimizationGoal !== undefined ? propSetOptimizationGoal : setLocalOptimizationGoal;
  const costCutPercentage = propCostCutPercentage !== undefined ? propCostCutPercentage : localCostCutPercentage;
  const setCostCutPercentage = propSetCostCutPercentage !== undefined ? propSetCostCutPercentage : setLocalCostCutPercentage;

  const [intelData, setIntelData] = useState(null);
  const [hoveredModel, setHoveredModel] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState(null);
  const [tooltipDimensions, setTooltipDimensions] = useState({ width: 420, height: 440 });
  const [scrollTick, setScrollTick] = useState(0);

  // Measure tooltip size
  const tooltipRef = useCallback((node) => {
    if (node !== null) {
      const rect = node.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width !== tooltipDimensions.width || rect.height !== tooltipDimensions.height)) {
        setTooltipDimensions({ width: rect.width, height: rect.height });
      }
    }
  }, [tooltipDimensions]);

  // Recalculate positions on scroll / resize while active
  useEffect(() => {
    if (!hoveredElement) return;

    const handleScrollResize = () => {
      setScrollTick(t => t + 1);
    };

    window.addEventListener('scroll', handleScrollResize, { passive: true });
    window.addEventListener('resize', handleScrollResize);

    return () => {
      window.removeEventListener('scroll', handleScrollResize);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [hoveredElement]);

  // Fetch raw analysis data from the backend (cached)
  useEffect(() => {
    getCachedRawData()
      .then(data => {
        if (data) setIntelData(data);
      })
      .catch(err => {
        console.error('Failed to load raw market data in AuditorView:', err);
      });
  }, []);

  const resolveHoveredModelDetails = (rec) => {
    if (!intelData) return null;
    const catKey = {
      'Coding': 'coding',
      'Math': 'math',
      'Writing': 'creative-writing',
      'Research': 'research',
      'Mixed': 'overall'
    }[targetUseCase] || 'overall';

    const categoryModels = intelData.categories?.[catKey] || intelData.categories?.overall || [];
    let found = categoryModels.find(m => m.modelId === rec.modelId || m.slug === rec.modelId.split('/')[1]);

    if (!found) {
      for (const key in intelData.categories) {
        found = intelData.categories[key].find(m => m.modelId === rec.modelId || m.slug === rec.modelId.split('/')[1]);
        if (found) break;
      }
    }

    if (!found && intelData.llms) {
      const llmItem = intelData.llms.find(m => m.slug === rec.modelId.split('/')[1]);
      if (llmItem) {
        found = {
          ...llmItem,
          rank: rec.category_rank || 999,
          organization: llmItem.creator || 'Unknown'
        };
      }
    }

    if (found) {
      const inputCost = found.pricing?.price_1m_input_tokens || rec.cost_per_m_input || 0;
      const outputCost = found.pricing?.price_1m_output_tokens || rec.cost_per_m_output || 0;
      const blendedPrice = found.pricing?.price_1m_blended_3_to_1 || (inputCost * 0.75 + outputCost * 0.25);
      const devName = found.organization || found.model_creator?.name || rec.developer || rec.name?.split(':')[0] || 'Unknown';

      return {
        ...found,
        modelId: rec.modelId || found.modelId || found.slug,
        slug: found.slug || rec.modelId?.split('/')[1] || rec.slug,
        name: rec.name || found.name || found.model_name || found.slug,
        developer: devName,
        creator: devName,
        provider: devName,
        rating: found.rating || found.arena_elo || 0,
        rank: rec.category_rank || found.rank || 999,
        evaluations: found.evaluations || {
          artificial_analysis_coding_index: found.coding_index,
          artificial_analysis_math_index: found.math_index,
          artificial_analysis_intelligence_index: found.intelligence_index,
          gpqa: found.gpqa,
          hle: found.hle
        },
        intelligence_index: found.evaluations?.artificial_analysis_intelligence_index || null,
        coding_index: found.evaluations?.artificial_analysis_coding_index || null,
        math_index: found.evaluations?.artificial_analysis_math_index || null,
        gpqa: found.evaluations?.gpqa || null,
        hle: found.evaluations?.hle || null,
        throughput: found.median_output_tokens_per_second || rec.tokens_per_second || null,
        ttft: found.median_time_to_first_token_seconds || (rec.time_to_first_token_ms / 1000) || null,
        blendedPrice: blendedPrice,
        cost_per_m_input: rec.cost_per_m_input || inputCost,
        cost_per_m_output: rec.cost_per_m_output || outputCost,
        tokens_per_second: rec.tokens_per_second || found.median_output_tokens_per_second || 0
      };
    }

    const fallbackDev = rec.developer || rec.name?.split(':')[0] || (rec.modelId ? rec.modelId.split('/')[0] : 'Unknown');
    return {
      ...rec,
      name: rec.name || rec.modelId,
      developer: fallbackDev,
      creator: fallbackDev,
      provider: fallbackDev,
      modelId: rec.modelId,
      slug: rec.modelId ? rec.modelId.split('/')[1] : (rec.slug || 'model'),
      rank: rec.category_rank || 999,
      rating: rec.rating || 1200,
      pricing: {
        price_1m_blended_3_to_1: (rec.cost_per_m_input || 0) * 0.75 + (rec.cost_per_m_output || 0) * 0.25,
        price_1m_input_tokens: rec.cost_per_m_input || 0,
        price_1m_output_tokens: rec.cost_per_m_output || 0
      },
      throughput: rec.tokens_per_second || null,
      ttft: (rec.time_to_first_token_ms / 1000) || null,
      context_length: rec.context_length || 128000,
      cost_per_m_input: rec.cost_per_m_input || 0,
      cost_per_m_output: rec.cost_per_m_output || 0,
      tokens_per_second: rec.tokens_per_second || 0
    };
  };

  // Fetch all available models for dropdown baseline selection (cached)
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getCachedModelsList();
        if (data && data.length > 0) {
          setAvailableModels(data);
        }
      } catch (err) {
        console.error('Failed to fetch models list:', err);
      }
    };
    fetchModels();
  }, []);

  // Fetch recommendations whenever controls are adjusted
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const reqHeaders = {
          'Content-Type': 'application/json'
        };
        if (token) {
          reqHeaders['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/audits/audit-recommendation`, {
          method: 'POST',
          headers: reqHeaders,
          body: JSON.stringify({
            currentModelId,
            targetUseCase,
            monthlyTokens: monthlyInputTokens + monthlyOutputTokens,
            inputTokenRatio: (monthlyInputTokens + monthlyOutputTokens) > 0 ? (monthlyInputTokens / (monthlyInputTokens + monthlyOutputTokens)) : 0.8,
            optimizationGoal,
            costCutPercentage
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          let errMsg = 'Failed to compute recommendations from backend.';
          let isUpgrade = response.status === 401 || response.status === 403;
          try {
            const parsed = JSON.parse(errText);
            if (parsed && parsed.error) {
              errMsg = parsed.error;
            }
            if (parsed && parsed.upgradeRequired) {
              isUpgrade = true;
            }
          } catch (err) {
            console.error(err);
          }
          if (isUpgrade) {
            setUpgradeRequired(true);
          }
          throw new Error(errMsg);
        }

        const data = await response.json();
        setUpgradeRequired(false);
        setResults(data);
        if (data.recommendations && data.recommendations.length > 0) {
          setSelectedRecommendation(data.recommendations[0]);
        } else {
          setSelectedRecommendation(null);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchRecommendations();
    }, 250); // debounce API requests while sliding

    return () => clearTimeout(delayDebounce);
  }, [currentModelId, targetUseCase, monthlyInputTokens, monthlyOutputTokens, optimizationGoal, costCutPercentage, token]);

  const handleApplyMigration = (rec) => {
    alert(`🎉 Migration Plan Initiated!\n\nTo transition from ${results?.currentBaseline?.name} to ${rec.name}:\n1. Obtain direct API keys from the provider (${rec.developer}).\n2. Initialize your client SDK and replace the model parameter with "${rec.modelId}".\n3. Projected annual savings: $${rec.projected_annual_savings.toLocaleString()}!`);
  };

  const handleCompareClick = (rec) => {
    if (!results || !results.currentBaseline) return;

    // Resolve baseline details
    const baselineRec = {
      modelId: results.currentBaseline.modelId,
      name: results.currentBaseline.name,
      developer: results.currentBaseline.developer || results.currentBaseline.name.split(':')[0] || 'Unknown',
      tokens_per_second: results.currentBaseline.tokens_per_second || 0,
      time_to_first_token_ms: results.currentBaseline.time_to_first_token_ms || 0,
      cost_per_m_input: results.currentBaseline.cost_per_m_input || 0,
      cost_per_m_output: results.currentBaseline.cost_per_m_output || 0,
      monthly_cost: results.currentBaseline.monthly_cost || 0
    };

    const baselineDetails = resolveHoveredModelDetails(baselineRec);
    const recommendedDetails = resolveHoveredModelDetails(rec);

    if (onCompareModels) {
      onCompareModels(baselineDetails, recommendedDetails);
    }
  };

  return (
    <div className="app-container" style={{ backgroundColor: '#FCFCFD' }}>
      <style>{`
        .auditor-main-container {
          padding: 40px 0;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        .auditor-title {
          font-size: clamp(22px, 3.8vw, 36px);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
          line-height: 1.2;
          color: #0F172A;
        }
        .auditor-main-layout {
          display: grid;
          grid-template-columns: 380px minmax(0, 1fr);
          gap: 32px;
          align-items: start;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .auditor-sidebar-card {
          padding: 24px;
          position: sticky;
          top: 88px;
          border: 1px solid var(--color-border);
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 16px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }
        .strategy-card {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          transition: all 180ms ease;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .strategy-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(15, 23, 42, 0.05);
          border-color: #CBD5E1;
        }
        .strategy-card.selected {
          background-color: rgba(236, 253, 245, 0.6);
          border-color: #10B981;
          border-width: 1.5px;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
        }
        .strategy-icon-box {
          width: 36px;
          height: 36px;
          min-width: 36px;
          min-height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 180ms ease;
        }
        .auditor-baseline-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.85);
          padding: 22px 24px;
          border-radius: 18px;
          margin-bottom: 24px;
          box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.18), 0 0 22px rgba(16, 185, 129, 0.08), 0 12px 40px rgba(15, 23, 42, 0.06);
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          gap: 16px;
        }
        .intel-rank-row {
          display: flex;
          background: rgba(255, 255, 255, 0.75) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          border-radius: 14px;
          transition: all 180ms ease;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .intel-rank-row:hover {
          transform: translateY(-2px);
          border-color: rgba(16, 185, 129, 0.35) !important;
          background-color: rgba(255, 255, 255, 0.95) !important;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06) !important;
        }
        .intel-rank-row.selected {
          border-color: var(--color-green-primary) !important;
          background-color: rgba(236, 253, 245, 0.6) !important;
          box-shadow: 0 0 16px rgba(16, 185, 129, 0.18) !important;
        }
        .intel-rank-number {
          width: 26px;
          height: 26px;
          min-width: 26px;
          min-height: 26px;
          border-radius: 50%;
          font-size: 11.5px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #F1F5F9;
          color: #64748B;
        }
        .intel-rank-number.is-top-three {
          background: #ECFDF5;
          color: #059669;
          border: 1px solid #A7F3D0;
        }
        .auditor-rec-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          gap: 16px;
          cursor: pointer;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .auditor-rec-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
          overflow: hidden;
        }
        .auditor-rec-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .auditor-deep-compare-card {
          margin-top: 28px;
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 24px;
          background-color: #F8FAFC;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }
        .auditor-deep-compare-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }
        .auditor-table-wrapper {
          border: 1px solid var(--color-border);
          border-radius: 10px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          background-color: #FFFFFF;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        
        /* Custom Select styling */
        select.modern-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 36px !important;
        }
        select.modern-select:focus {
          outline: none;
          border-color: var(--color-green-primary) !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }
        
        /* Range slider customizations */
        input[type="range"].modern-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: #E2E8F0;
          border-radius: 999px;
          outline: none;
          touch-action: manipulation;
        }
        input[type="range"].modern-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-green-primary);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
          transition: transform 150ms ease;
        }
        input[type="range"].modern-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .auditor-main-layout {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 24px !important;
          }
          .auditor-sidebar-card {
            position: static !important;
            margin-bottom: 0 !important;
            padding: 20px 16px !important;
          }
        }

        @media (max-width: 768px) {
          .auditor-main-container {
            padding: 24px 0 !important;
          }
          .auditor-title {
            font-size: clamp(22px, 5vw, 28px) !important;
          }
          .auditor-baseline-bar {
            padding: 18px 16px !important;
            gap: 14px !important;
          }
          .auditor-rec-row {
            padding: 14px 14px !important;
          }
          .auditor-deep-compare-card {
            padding: 18px 14px !important;
          }
        }

        @media (max-width: 640px) {
          .auditor-main-container {
            padding: 20px 0 !important;
          }
          .auditor-title {
            font-size: 22px !important;
          }
          .auditor-sidebar-card {
            padding: 16px 12px !important;
            border-radius: 14px !important;
          }
          .strategy-card {
            padding: 12px 10px !important;
          }
          .auditor-baseline-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 16px 12px !important;
            gap: 12px !important;
          }
          .auditor-rec-row {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 12px 10px !important;
            gap: 10px !important;
          }
          .auditor-rec-right {
            justify-content: space-between !important;
            width: 100% !important;
            border-top: 1px solid rgba(226, 232, 240, 0.7) !important;
            padding-top: 10px !important;
            margin-top: 2px !important;
          }
          .auditor-deep-compare-card {
            padding: 16px 12px !important;
            border-radius: 14px !important;
          }
          .auditor-deep-compare-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .auditor-deep-compare-header > div {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .auditor-deep-compare-header button {
            width: 100% !important;
            justify-content: center !important;
            padding: 8px 12px !important;
            font-size: 11.5px !important;
          }
          .grid-auto-fit-sm {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .auditor-tooltip-card {
            position: fixed !important;
            left: 10px !important;
            right: 10px !important;
            bottom: 10px !important;
            top: auto !important;
            width: auto !important;
            max-width: calc(100vw - 20px) !important;
            max-height: 80vh !important;
            pointer-events: auto !important;
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.28) !important;
            border-radius: 18px !important;
          }
        }

        @media (max-width: 420px) {
          .auditor-main-container {
            padding: 16px 0 !important;
          }
          .auditor-sidebar-card {
            padding: 14px 10px !important;
            border-radius: 12px !important;
          }
          .strategy-card {
            padding: 10px 8px !important;
          }
          .auditor-deep-compare-header > div {
            grid-template-columns: 1fr !important;
          }
          .intel-rank-row {
            border-radius: 10px !important;
          }
          .auditor-table-wrapper table {
            font-size: 11.5px !important;
          }
          .auditor-table-wrapper td,
          .auditor-table-wrapper th {
            padding: 8px 10px !important;
          }
        }
      `}</style>

      {/* Header */}
      <header className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px', gap: '8px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="nav-brand" title="Audex AI Home">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="nav-links desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="nav-link" style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>Home</a>
            <span style={{ fontWeight: '700', color: 'var(--color-text-primary)', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Model Auditor Engine
              {user && (user.plan || '').toLowerCase() === 'enterprise' && (
                <span style={{ fontSize: '10px', backgroundColor: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', padding: '2px 8px', borderRadius: '9999px', fontWeight: '800' }}>
                  ENTERPRISE
                </span>
              )}
            </span>
          </div>
          <div className="nav-actions">
            {renderCoinDropdown && renderCoinDropdown()}
            <button onClick={() => onNavigateToView('landing')} className="btn btn-outline nav-action-btn nav-btn-home" title="Back to Home">
              <Home size={14} />
              <span className="nav-action-btn-text">Home</span>
            </button>
            <button onClick={() => onNavigateToView('step1')} className="btn btn-black nav-action-btn" title="Run Stack Audit">
              <Sparkles size={14} />
              <span>Stack Audit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content auditor-main-container">
        <div className="container" style={{ maxWidth: '1280px' }}>

          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <span className="badge badge-green" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Brain size={12} /> Capability & Market Pricing Intelligence
            </span>
            <h1 className="auditor-title">
              LLM Router & Capability Optimizer
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.5 }}>
              Benchmark your workloads against the live Artificial Analysis capability and pricing indexes to locate 10x cheaper and faster model alternatives.
            </p>
          </div>

          <div className="auditor-main-layout">

            {/* Left Column: Workload Configuration */}
            <div>
              <div className="wizard-card auditor-sidebar-card">
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={18} style={{ color: 'var(--color-green-primary)' }} /> Workload Profile
                </h3>

                {/* Dropdown for Baseline Model */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    Current Baseline Model
                  </label>
                  <CustomSelect
                    value={currentModelId}
                    onChange={(val) => setCurrentModelId(val)}
                    options={availableModels.map(model => ({ value: model.id, label: model.name }))}
                    placeholder="Select Baseline Model"
                  />
                </div>

                {/* Target Use Case Selectors */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    Primary Workload Use-Case
                  </label>
                  <CustomSelect
                    value={targetUseCase}
                    onChange={(val) => setTargetUseCase(val)}
                    options={[
                      { isHeader: true, label: '── Core Capabilities ──' },
                      { value: 'Coding', label: 'Coding' },
                      { value: 'Math', label: 'Math' },
                      { value: 'Writing', label: 'Creative Writing' },
                      { value: 'Research', label: 'Research' },
                      { value: 'Expert', label: 'Expert Tasks' },
                      { value: 'Instruction-following', label: 'Instruction Following' },
                      { value: 'Multi-turn', label: 'Multi-turn Chat' },
                      { value: 'Longer-query', label: 'Longer Queries' },
                      { value: 'Hard-prompts', label: 'Hard Prompts' },
                      { value: 'Hard-prompts-english', label: 'Hard Prompts (English)' },
                      { value: 'Mixed', label: 'Mixed / Overall' },
                      { isHeader: true, label: '── Industry Verticals ──' },
                      { value: 'Software', label: 'Software & IT Services' },
                      { value: 'Business', label: 'Business & Finance' },
                      { value: 'Healthcare', label: 'Medicine & Healthcare' },
                      { value: 'Legal', label: 'Legal & Government' },
                      { value: 'Science', label: 'Life & Social Science' },
                      { value: 'Math-industry', label: 'Mathematical Industry' },
                      { value: 'Media', label: 'Entertainment & Media' },
                      { value: 'Literature', label: 'Literature & Language' },
                      { isHeader: true, label: '── Languages ──' },
                      { value: 'English', label: 'English' },
                      { value: 'Chinese', label: 'Chinese' },
                      { value: 'French', label: 'French' },
                      { value: 'German', label: 'German' },
                      { value: 'Japanese', label: 'Japanese' },
                      { value: 'Korean', label: 'Korean' },
                      { value: 'Polish', label: 'Polish' },
                      { value: 'Russian', label: 'Russian' },
                      { value: 'Spanish', label: 'Spanish' },
                      { value: 'Non-english', label: 'Non-English' }
                    ]}
                    placeholder="Select Use Case"
                  />
                </div>

                {/* Optimization Strategy Section */}
                <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
                    Optimization Goal
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>

                    {/* Performance Preservation */}
                    <div
                      onClick={() => setOptimizationGoal('performance')}
                      className={`strategy-card ${optimizationGoal === 'performance' ? 'selected' : ''}`}
                    >
                      <div
                        className="strategy-icon-box"
                        style={{
                          backgroundColor: optimizationGoal === 'performance' ? '#10B981' : '#ECFDF5',
                          flexShrink: 0
                        }}
                      >
                        <ShieldCheck size={16} style={{ color: optimizationGoal === 'performance' ? '#FFFFFF' : '#10B981' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B', margin: '0 0 4px 0' }}>
                          Performance Preservation
                        </h4>
                        <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.4', margin: 0 }}>
                          Reduce subscription costs while preserving or improving capabilities.
                        </p>
                      </div>
                    </div>

                    {/* Target Cost Reduction */}
                    <div
                      onClick={() => setOptimizationGoal('cost')}
                      className={`strategy-card ${optimizationGoal === 'cost' ? 'selected' : ''}`}
                    >
                      <div
                        className="strategy-icon-box"
                        style={{
                          backgroundColor: optimizationGoal === 'cost' ? '#F97316' : '#FFF7ED',
                          flexShrink: 0
                        }}
                      >
                        <TrendingDown size={16} style={{ color: optimizationGoal === 'cost' ? '#FFFFFF' : '#F97316' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B', margin: '0 0 4px 0' }}>
                          Target Cost Reduction
                        </h4>
                        <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.4', margin: 0 }}>
                          Prioritize cost reduction with specified budget cut target.
                        </p>
                      </div>
                    </div>

                    {/* Quality Focus */}
                    <div
                      onClick={() => setOptimizationGoal('quality')}
                      className={`strategy-card ${optimizationGoal === 'quality' ? 'selected' : ''}`}
                    >
                      <div
                        className="strategy-icon-box"
                        style={{
                          backgroundColor: optimizationGoal === 'quality' ? '#4F46E5' : '#EEF2FF',
                          flexShrink: 0
                        }}
                      >
                        <Gem size={16} style={{ color: optimizationGoal === 'quality' ? '#FFFFFF' : '#4F46E5' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B', margin: '0 0 4px 0' }}>
                          Quality Focus
                        </h4>
                        <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.4', margin: 0 }}>
                          Maximize model quality and intelligence capabilities.
                        </p>
                      </div>
                    </div>

                  </div>

                  {optimizationGoal === 'cost' && (
                    <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid rgba(226, 232, 240, 0.8)', backdropFilter: 'blur(8px)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#475569' }}>Min Cost Cut Target</span>
                        <strong style={{ color: 'var(--color-green-primary)' }}>{costCutPercentage}%</strong>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        step="5"
                        value={costCutPercentage}
                        onChange={(e) => setCostCutPercentage(parseInt(e.target.value))}
                        className="modern-slider"
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  )}
                </div>

                <hr style={{ margin: '24px 0', border: 'none', borderBottom: '1px solid rgba(226, 232, 240, 0.7)' }} />

                {/* Monthly Input Tokens Slider */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', color: '#1E293B' }}>Monthly Input (Prompt)</span>
                    <strong style={{ color: 'var(--color-green-primary)' }}>
                      {(monthlyInputTokens / 1000000).toFixed(0)}M tokens
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="200000000"
                    step="1000000"
                    value={monthlyInputTokens}
                    onChange={(e) => setMonthlyInputTokens(parseInt(e.target.value))}
                    className="modern-slider"
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                    <span>1M</span>
                    <span>100M</span>
                    <span>200M</span>
                  </div>
                </div>

                {/* Monthly Output Tokens Slider */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', color: '#1E293B' }}>Monthly Output (Completion)</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>
                      {(monthlyOutputTokens / 1000000).toFixed(1)}M tokens
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="100000000"
                    step="500000"
                    value={monthlyOutputTokens}
                    onChange={(e) => setMonthlyOutputTokens(parseInt(e.target.value))}
                    className="modern-slider"
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                    <span>0.5M</span>
                    <span>50M</span>
                    <span>100M</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Recommendations & Calculations */}
            <div style={{ minWidth: 0 }}>
              {upgradeRequired ? (
                <div style={{ padding: '44px 32px', backgroundColor: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '20px', textAlign: 'center', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)', marginBottom: '24px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#F5F3FF', border: '1.5px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#7C3AED' }}>
                    <ShieldCheck size={28} strokeWidth={2.2} />
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
                    ⚡ Enterprise Subscription Required
                  </span>
                  <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>
                    Unlock Live AI Model Auditor
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 24px auto' }}>
                    Live AI Model Auditing, dynamic token burn calculations, and Pareto frontier optimization require an active <strong>Enterprise</strong> subscription.
                  </p>
                  <button
                    onClick={() => onPurchase ? onPurchase('enterprise') : onNavigateToView('landing')}
                    className="btn btn-black"
                    style={{ padding: '14px 28px', borderRadius: '10px', fontSize: '14.5px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', backgroundColor: '#0F172A', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)' }}
                  >
                    <Sparkles size={16} /> Upgrade to Enterprise Plan
                  </button>
                </div>
              ) : error && (
                error.includes('Database is empty') ||
                error.includes('403') ||
                error.includes('Key is missing') ||
                error.toLowerCase().includes('failed to fetch') ||
                error.toLowerCase().includes('fetch failed') ||
                error.toLowerCase().includes('network error')
              ) ? (
                <div style={{ padding: '32px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', color: '#B45309', borderRadius: '16px', marginBottom: '24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <LoaderCircle size={48} className="animate-spin" style={{ color: '#B45309' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Server Busy & Hydrating</h3>
                  <p style={{ fontSize: '14.5px', color: '#92400E', lineHeight: '1.6' }}>
                    The background database is currently synchronizing live pricing and capability benchmarks from the Artificial Analysis API. Please wait a few seconds and adjust the filters to try again.
                  </p>
                </div>
              ) : error ? (
                <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LoaderCircle size={16} className="animate-spin" style={{ color: '#B91C1C' }} /> <strong>API Connection Error:</strong> {error}
                </div>
              ) : null}

              {/* Baseline stats bar */}
              {results && results.currentBaseline && (
                <div className="auditor-baseline-bar">
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', fontWeight: 700 }}>Current Baseline Cost</span>
                    <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-title)', color: '#1E293B', lineHeight: '1.1', marginTop: '4px' }}>
                      ${results.currentBaseline.monthly_cost.toLocaleString()}<span style={{ fontSize: '15px', fontWeight: '500', color: '#64748B' }}>/mo</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                      flexShrink: 0
                    }}>
                      <ProviderLogo provider={getNormalizedProvider(results.currentBaseline.modelId)} size={24} />
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{results.currentBaseline.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        Index capability: <strong style={{ color: '#047857' }}>{results.currentBaseline.performance_score}</strong>/100 · <strong style={{ color: '#1E293B' }}>{results.currentBaseline.tokens_per_second}</strong> t/s
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations list */}
              {loading && !results ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
                  <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-green-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Calculating alternative values from Artificial Analysis...</span>
                </div>
              ) : results && results.recommendations && results.recommendations.length > 0 ? (
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '16px' }}>Top Alternative Model Recommendations</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
                    {results.recommendations.map((rec, idx) => {
                      const isSelected = selectedRecommendation?.modelId === rec.modelId;
                      const isMoreExpensive = rec.projected_monthly_savings < 0;

                      return (
                        <div
                          key={rec.modelId}
                          onClick={() => setSelectedRecommendation(rec)}
                          onMouseEnter={(e) => {
                            setHoveredModel(resolveHoveredModelDetails(rec));
                            setHoveredElement(e.currentTarget);
                          }}
                          onMouseMove={(e) => setHoverPosition({ x: e.clientX, y: e.clientY })}
                          onMouseLeave={() => {
                            setHoveredModel(null);
                            setHoveredElement(null);
                          }}
                          className={`intel-rank-row auditor-rec-row ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="auditor-rec-left">
                            <span className={`intel-rank-number ${idx < 3 ? 'is-top-three' : ''}`}>{idx + 1}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                              <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '10px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid rgba(226, 232, 240, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                                flexShrink: 0
                              }}>
                                <ProviderLogo provider={getNormalizedProvider(rec.developer || rec.modelId)} size={20} />
                              </div>
                              <span className="intel-rank-name" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <strong style={{ color: '#1E293B', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {rec.name.replace(/^.*?:\s*/, '')}
                                </strong>
                                <small style={{ color: '#64748B', fontSize: '11.5px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {rec.developer} · {rec.modelId.split('/')[1]}
                                </small>
                              </span>
                            </div>
                          </div>

                          <div className="auditor-rec-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompareClick(rec);
                              }}
                              className="btn btn-outline"
                              style={{
                                padding: '6px 12px',
                                fontSize: '11.5px',
                                borderRadius: '6px',
                                border: '1px solid var(--color-green-primary)',
                                color: 'var(--color-green-text)',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Scale size={12} /> Compare
                            </button>

                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                              <span className={`badge ${isMoreExpensive ? 'badge-orange' : 'badge-green'}`} style={{ padding: '5px 10px', fontSize: '12px', fontWeight: '750' }}>
                                {isMoreExpensive ? 'Adds ' : 'Saves '}${Math.abs(rec.projected_monthly_savings).toLocaleString()}/mo
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                Cost: ${rec.monthly_cost.toFixed(2)}/mo
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dynamic deep comparison panel */}
                  {selectedRecommendation && (
                    <div className="wizard-card auditor-deep-compare-card">
                      <div className="auditor-deep-compare-header">
                        <h4 style={{ fontSize: '15.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', margin: 0 }}>
                          <Search size={16} style={{ color: 'var(--color-green-primary)', flexShrink: 0 }} /> Comparison: {results?.currentBaseline?.name} vs {selectedRecommendation.name}
                        </h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleCompareClick(selectedRecommendation)}
                            className="btn btn-outline"
                            style={{
                              padding: '8px 16px',
                              fontSize: '12px',
                              borderRadius: '8px',
                              border: '1.5px solid var(--color-green-primary)',
                              color: 'var(--color-green-text)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: '700',
                              backgroundColor: '#FFFFFF',
                              cursor: 'pointer'
                            }}
                          >
                            <Scale size={14} /> Compare
                          </button>
                          <button
                            onClick={() => handleApplyMigration(selectedRecommendation)}
                            className="btn btn-green"
                            style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                          >
                            Migrate Route <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid-auto-fit-sm" style={{ textAlign: 'center', marginBottom: '24px', gap: '12px' }}>

                        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Annual Saving</div>
                          <div style={{ fontSize: '20px', fontWeight: '800', color: selectedRecommendation.projected_annual_savings >= 0 ? '#10B981' : '#EF4444', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
                            {selectedRecommendation.projected_annual_savings >= 0 ? '+' : '-'}${Math.abs(selectedRecommendation.projected_annual_savings).toLocaleString()}
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Inference speedup</div>
                          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-green-text)', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
                            {(selectedRecommendation.tokens_per_second / (results?.currentBaseline?.tokens_per_second || 1)).toFixed(1)}x
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{selectedRecommendation.tokens_per_second} vs {results?.currentBaseline?.tokens_per_second} tokens/s</div>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>Quality retainment</div>
                          <div style={{ fontSize: '20px', fontWeight: '800', color: selectedRecommendation.performance_retained_percentage >= 100 ? '#10B981' : '#F59E0B', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
                            {selectedRecommendation.performance_retained_percentage}%
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{selectedRecommendation.performance_score} vs {results?.currentBaseline?.performance_score} index score</div>
                        </div>

                      </div>

                      <div className="auditor-table-wrapper">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ backgroundColor: 'var(--color-bg-accent)', borderBottom: '1px solid var(--color-border)' }}>
                              <th style={{ padding: '10px 16px', fontWeight: '700' }}>Metric</th>
                              <th style={{ padding: '10px 16px', fontWeight: '700' }}>{results?.currentBaseline?.name}</th>
                              <th style={{ padding: '10px 16px', fontWeight: '700' }}>{selectedRecommendation.name}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '10px 16px', fontWeight: '600' }}>Input price / million</td>
                              <td style={{ padding: '10px 16px' }}>${results?.currentBaseline?.cost_per_m_input.toFixed(2)}</td>
                              <td style={{ padding: '10px 16px', color: 'var(--color-green-text)', fontWeight: '600' }}>
                                ${selectedRecommendation.cost_per_m_input.toFixed(2)}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '10px 16px', fontWeight: '600' }}>Output price / million</td>
                              <td style={{ padding: '10px 16px' }}>${results?.currentBaseline?.cost_per_m_output.toFixed(2)}</td>
                              <td style={{ padding: '10px 16px', color: 'var(--color-green-text)', fontWeight: '600' }}>
                                ${selectedRecommendation.cost_per_m_output.toFixed(2)}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '10px 16px', fontWeight: '600' }}>Prompt cache read / million</td>
                              <td style={{ padding: '10px 16px' }}>-</td>
                              <td style={{ padding: '10px 16px' }}>${selectedRecommendation.cache_read_cost_per_m.toFixed(2)}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '10px 16px', fontWeight: '600' }}>Time To First Token</td>
                              <td style={{ padding: '10px 16px' }}>{results?.currentBaseline?.time_to_first_token_ms}ms</td>
                              <td style={{ padding: '10px 16px', color: selectedRecommendation.time_to_first_token_ms <= results?.currentBaseline?.time_to_first_token_ms ? 'var(--color-green-text)' : 'inherit' }}>
                                {selectedRecommendation.time_to_first_token_ms}ms
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: '10px 16px', fontWeight: '600' }}>Estimated monthly cost</td>
                              <td style={{ padding: '10px 16px', fontWeight: '600' }}>${results?.currentBaseline?.monthly_cost.toLocaleString()}</td>
                              <td style={{ padding: '10px 16px', color: 'var(--color-green-text)', fontWeight: '700' }}>
                                ${selectedRecommendation.monthly_cost.toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 32px',
                  backgroundColor: optimizationGoal === 'performance' ? '#F0FDF4' : '#F8FAFC',
                  border: optimizationGoal === 'performance' ? '1.5px solid #BBF7D0' : '1px dashed var(--color-border)',
                  borderRadius: '16px',
                  boxShadow: optimizationGoal === 'performance' ? '0 4px 16px rgba(16, 185, 129, 0.06)' : 'none'
                }}>
                  {optimizationGoal === 'performance' ? (
                    <div style={{ maxWidth: '440px', margin: '0 auto' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#DCFCE7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        color: '#16A34A'
                      }}>
                        <BadgeCheck size={26} strokeWidth={2.2} />
                      </div>
                      <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#166534', marginBottom: '8px' }}>
                        Already Optimized
                      </h4>
                      <p style={{ fontSize: '13.5px', color: '#15803D', lineHeight: 1.5, margin: 0 }}>
                        Your baseline model (<strong>{results?.currentBaseline?.name || 'Selected Model'}</strong>) is currently the highest-ranked option with optimal cost in this category. No alternative provides superior capability at a lower price.
                      </p>
                    </div>
                  ) : optimizationGoal === 'cost' ? (
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
                      No alternative models found that cut cost by {costCutPercentage}% from this baseline. Try selecting a lower savings target or a more expensive baseline model.
                    </p>
                  ) : (
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
                      No alternative models found that exceed the baseline quality. Your current model is at the top of the quality rankings.
                    </p>
                  )}
                </div>
              )}
            </div>{/* end right column */}

          </div>{/* end 2-col grid */}

        </div>{/* end container */}
      </main>


      {hoveredModel && (() => {
        const rect = hoveredElement
          ? hoveredElement.getBoundingClientRect()
          : null;

        // Consume scrollTick to satisfy ESLint and force position refreshes on scroll/resize
        const _tick = scrollTick;

        const tooltipWidth = Math.min(420, window.innerWidth - 32);
        const tooltipHeight = tooltipDimensions.height || 420;
        const padding = 16;
        const topNavOffset = 76; // Keep clear of top navbar

        // Determine anchor point from mouse position or element bounds
        const mouseX = hoverPosition.x || (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
        const mouseY = hoverPosition.y || (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);

        // Horizontal positioning:
        // Position adjacent to cursor, flipping to left if near right edge of screen
        let left = mouseX + 18;
        if (left + tooltipWidth + padding > window.innerWidth) {
          left = mouseX - tooltipWidth - 18;
        }
        // Safety clamp within viewport margins
        left = Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, left));

        // Vertical positioning:
        // Anchor vertically near cursor / hovered element
        let top = mouseY - 40;
        if (top + tooltipHeight + padding > window.innerHeight) {
          top = window.innerHeight - tooltipHeight - padding;
        }
        // Safety clamp below navbar
        top = Math.max(topNavOffset, top);

        const aaScore = (targetUseCase === 'Coding')
          ? (hoveredModel.evaluations?.artificial_analysis_coding_index || hoveredModel.coding_index)
          : (targetUseCase === 'Math')
            ? (hoveredModel.evaluations?.artificial_analysis_math_index || hoveredModel.math_index)
            : (hoveredModel.evaluations?.artificial_analysis_intelligence_index || hoveredModel.intelligence_index);

        return (
          <div
            ref={tooltipRef}
            className="auditor-tooltip-card"
            style={{
              position: 'fixed',
              left: `${left}px`,
              top: `${top}px`,
              width: `${tooltipWidth}px`,
              maxHeight: 'min(520px, calc(100vh - 96px))',
              overflowY: 'auto',
              zIndex: 9999,
              padding: '18px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: '20px',
              color: '#0F172A',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              animation: 'fadeIn 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
              boxSizing: 'border-box'
            }}>
            {/* Title & Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '12px', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  flexShrink: 0
                }}>
                  <ProviderLogo provider={getNormalizedProvider(hoveredModel.creator || hoveredModel.modelId)} size={18} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {hoveredModel.name}
                  </h4>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Created by <strong>{hoveredModel.creator}</strong>
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(236, 253, 245, 0.8)', color: '#047857', fontSize: '10.5px', fontWeight: '800', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
                  Rank #{hoveredModel.rank}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setHoveredModel(null);
                    setHoveredElement(null);
                  }}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748B',
                    padding: 0,
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Primary Benchmark and Notes */}
            {(hoveredModel.primary_benchmark || hoveredModel.notes) && (
              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 246, 255, 0.7)', borderRadius: '10px', borderLeft: '4px solid #3B82F6', display: 'flex', flexDirection: 'column', gap: '2px', border: '1px solid rgba(191, 219, 254, 0.4)', borderLeftWidth: '4px' }}>
                {hoveredModel.primary_benchmark && (
                  <span style={{ fontSize: '11.5px', color: '#1D4ED8' }}>
                    <strong>Primary Focus:</strong> {hoveredModel.primary_benchmark}
                  </span>
                )}
                {hoveredModel.notes && (
                  <span style={{ fontSize: '11.5px', color: '#475569', fontStyle: 'italic' }}>
                    "{hoveredModel.notes}"
                  </span>
                )}
              </div>
            )}

            {/* Score and Ranking Breakdown Box */}
            {(() => {
              const hasArena = (hoveredModel.arena_rank !== null && hoveredModel.arena_rank !== undefined) ||
                (hoveredModel.rating > 0) ||
                (hoveredModel.votes !== null && hoveredModel.votes !== undefined);

              const hasAA = (hoveredModel.artificial_analysis_rank !== null && hoveredModel.artificial_analysis_rank !== undefined) ||
                (aaScore !== null && aaScore !== undefined && aaScore !== 0);

              if (!hasArena && !hasAA) return null;

              return (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: 'rgba(248, 250, 252, 0.8)',
                  borderRadius: '10px',
                  border: '1px solid rgba(226, 232, 240, 0.8)'
                }}>
                  {hasAA && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
                        Artificial Analysis
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap', color: '#475569' }}>
                        {hoveredModel.artificial_analysis_rank !== null && hoveredModel.artificial_analysis_rank !== undefined && (
                          <div>Rank: <strong style={{ color: '#1E293B' }}>#{hoveredModel.artificial_analysis_rank}</strong></div>
                        )}
                        {aaScore !== null && aaScore !== undefined && aaScore !== 0 && (
                          <div>Score: <strong style={{ color: '#3B82F6' }}>{aaScore.toFixed(1)}</strong></div>
                        )}
                      </div>
                    </div>
                  )}
                  {hasArena && hasAA && <div style={{ borderTop: '1px dashed rgba(226, 232, 240, 0.8)', margin: '4px 0' }}></div>}
                  {hasArena && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
                        Arena AI
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap', color: '#475569' }}>
                        {hoveredModel.arena_rank !== null && hoveredModel.arena_rank !== undefined && (
                          <div>Rank: <strong style={{ color: '#1E293B' }}>#{hoveredModel.arena_rank}</strong></div>
                        )}
                        {hoveredModel.rating > 0 && (
                          <div>Score: <strong style={{ color: '#10B981' }}>{hoveredModel.rating.toFixed(0)}</strong></div>
                        )}
                        {hoveredModel.votes !== null && hoveredModel.votes !== undefined && (
                          <div>Votes: <strong style={{ color: '#1E293B' }}>{hoveredModel.votes.toLocaleString()}</strong></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Details Grid */}
            <div className="grid-auto-fit-sm" style={{ gap: '12px' }}>
              {/* Column 1: Metadata */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Metadata</h5>
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div><span style={{ color: '#64748B' }}>License:</span> <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1E293B' }}>{hoveredModel.license || 'N/A'}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Context:</span> <strong style={{ display: 'block', color: '#1E293B' }}>{hoveredModel.context_length ? `${(hoveredModel.context_length / 1000).toFixed(0)}k` : 'N/A'}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Votes:</span> <strong style={{ display: 'block', color: '#1E293B' }}>{hoveredModel.votes ? hoveredModel.votes.toLocaleString() : 'N/A'}</strong></div>
                </div>
              </div>

              {/* Column 2: Pricing */}
              {hoveredModel.pricing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h5 style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Pricing (per 1M)</h5>
                  <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div><span style={{ color: '#64748B' }}>Blended:</span> <strong style={{ color: '#F97316', display: 'block' }}>${(hoveredModel.pricing.price_1m_blended_3_to_1 || 0).toFixed(2)}</strong></div>
                    <div><span style={{ color: '#64748B' }}>Input:</span> <strong style={{ display: 'block', color: '#1E293B' }}>${(hoveredModel.pricing.price_1m_input_tokens || 0).toFixed(2)}</strong></div>
                    <div><span style={{ color: '#64748B' }}>Output:</span> <strong style={{ display: 'block', color: '#1E293B' }}>${(hoveredModel.pricing.price_1m_output_tokens || 0).toFixed(2)}</strong></div>
                  </div>
                </div>
              )}

              {/* Column 3: Speed & Latency */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Performance</h5>
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div><span style={{ color: '#64748B' }}>Speed:</span> <strong style={{ color: '#3B82F6', display: 'block' }}>{hoveredModel.throughput > 0 ? `${hoveredModel.throughput} t/s` : 'N/A'}</strong></div>
                  <div><span style={{ color: '#64748B' }}>Latency:</span> <strong style={{ color: '#EAB308', display: 'block' }}>{hoveredModel.ttft > 0 ? `${hoveredModel.ttft}s` : 'N/A'}</strong></div>
                </div>
              </div>
            </div>

            {/* Section 3: Evaluations */}
            {hoveredModel.evaluations && Object.keys(hoveredModel.evaluations).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '12px' }}>
                <h5 style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Evaluations & Benchmarks</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                  {Object.entries(hoveredModel.evaluations).map(([key, val]) => {
                    if (val === null || val === undefined) return null;
                    return (
                      <div
                        key={key}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(241, 245, 249, 0.8)',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ color: '#64748B' }}>{formatEvalName(key)}:</span>
                        <strong style={{ color: '#047857' }}>{formatEvalValue(key, val)}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
