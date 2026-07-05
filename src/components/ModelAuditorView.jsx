import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Check
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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      const selectedIndex = options.findIndex(opt => opt.value === value);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
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
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelect(options[highlightedIndex].value);
        }
      } else {
        setIsOpen(true);
        const selectedIndex = options.findIndex(opt => opt.value === value);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        const selectedIndex = options.findIndex(opt => opt.value === value);
        setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      } else {
        setHighlightedIndex(prev => (prev + 1) % options.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex(prev => (prev - 1 + options.length) % options.length);
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

export default function ModelAuditorView({ onNavigateToView, renderCoinDropdown, onCompareModels }) {
  const [currentModelId, setCurrentModelId] = useState('anthropic/claude-fable-5');
  const [targetUseCase, setTargetUseCase] = useState('Mixed');
  const [monthlyInputTokens, setMonthlyInputTokens] = useState(20000000); // 20M prompt tokens
  const [monthlyOutputTokens, setMonthlyOutputTokens] = useState(5000000); // 5M completion tokens
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [availableModels, setAvailableModels] = useState(POPULAR_MODELS);
  const [optimizationGoal, setOptimizationGoal] = useState('performance');
  const [costCutPercentage, setCostCutPercentage] = useState(50);

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

  // Fetch raw analysis data from the backend
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

      return {
        ...found,
        modelId: rec.modelId,
        name: found.name || found.model_name || found.slug || rec.name,
        creator: found.organization || found.model_creator?.name || rec.developer || 'Unknown',
        rating: found.rating || found.arena_elo || 0,
        rank: rec.category_rank || found.rank || 999,
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

    return {
      name: rec.name,
      creator: rec.developer,
      modelId: rec.modelId,
      slug: rec.modelId.split('/')[1],
      rank: rec.category_rank || 999,
      rating: 0,
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

  // Fetch all available models for dropdown baseline selection
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/audits/models/list');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setAvailableModels(data);
          }
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
        const response = await fetch('http://localhost:5000/api/audits/audit-recommendation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
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
          try {
            const parsed = JSON.parse(errText);
            if (parsed && parsed.error) {
              errMsg = parsed.error;
            }
          } catch (err) {
            console.error(err);
          }
          throw new Error(errMsg);
        }

        const data = await response.json();
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
  }, [currentModelId, targetUseCase, monthlyInputTokens, monthlyOutputTokens, optimizationGoal, costCutPercentage]);

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
        .strategy-card {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.7);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          transition: all 200ms ease;
        }
        .strategy-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(15, 23, 42, 0.05);
          border-color: #CBD5E1;
        }
        .strategy-card.selected {
          background-color: rgba(236, 253, 245, 0.5);
          border-color: #10B981;
          border-width: 1.5px;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
        }
        .intel-rank-row {
          display: grid;
          background: rgba(255, 255, 255, 0.72) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(226, 232, 240, 0.7) !important;
          border-radius: 12px;
          transition: all 200ms ease;
        }
        .intel-rank-row:hover {
          transform: translateY(-2px);
          border-color: rgba(16, 185, 129, 0.3) !important;
          background-color: rgba(255, 255, 255, 0.85) !important;
          box-shadow: 0 8px 16px rgba(15, 23, 42, 0.05) !important;
        }
        .intel-rank-row.selected {
          border-color: var(--color-green-primary) !important;
          background-color: rgba(236, 253, 245, 0.5) !important;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.15) !important;
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
        }
        input[type="range"].modern-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-green-primary);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
          transition: transform 150ms ease;
        }
        input[type="range"].modern-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
      `}</style>

      {/* Header */}
      <header className="navbar">
        <div className="container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="brand">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="nav-links">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="nav-link">Home</a>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span style={{ fontWeight: '700', color: 'var(--color-text-primary)', fontSize: '14px' }}>Two-API Model Spend Engine</span>
          </div>
          <div className="nav-actions">
            {renderCoinDropdown && renderCoinDropdown()}
            <button onClick={() => onNavigateToView('landing')} className="btn btn-outline">
              Back to Home
            </button>
            <button onClick={() => onNavigateToView('step1')} className="btn btn-black">
              Run Stack Audit
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content" style={{ padding: '48px 0' }}>
        <div className="container" style={{ maxWidth: '1280px' }}>

          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <span className="badge badge-green" style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Brain size={12} /> Capability & Market Pricing Intelligence
            </span>
            <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              LLM Router & Capability Optimizer
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
              Benchmark your workloads against the live Artificial Analysis capability and pricing indexes to locate 10x cheaper and faster model alternatives.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '32px' }}>

            {/* Left Column: Workload Configuration */}
            <div>
              <div className="wizard-card" style={{ padding: '24px', position: 'sticky', top: '96px', border: '1px solid var(--color-border)', background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <select
                    className="modern-select"
                    value={targetUseCase}
                    onChange={(e) => setTargetUseCase(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <optgroup label="── Core Capabilities ──">
                      <option value="Coding">Coding</option>
                      <option value="Math">Math</option>
                      <option value="Writing">Creative Writing</option>
                      <option value="Research">Research</option>
                      <option value="Expert">Expert Tasks</option>
                      <option value="Instruction-following">Instruction Following</option>
                      <option value="Multi-turn">Multi-turn Chat</option>
                      <option value="Longer-query">Longer Queries</option>
                      <option value="Hard-prompts">Hard Prompts</option>
                      <option value="Hard-prompts-english">Hard Prompts (English)</option>
                      <option value="Mixed">Mixed / Overall</option>
                    </optgroup>
                    <optgroup label="── Industry Verticals ──">
                      <option value="Software">Software &amp; IT Services</option>
                      <option value="Business">Business &amp; Finance</option>
                      <option value="Healthcare">Medicine &amp; Healthcare</option>
                      <option value="Legal">Legal &amp; Government</option>
                      <option value="Science">Life &amp; Social Science</option>
                      <option value="Math-industry">Mathematical Industry</option>
                      <option value="Media">Entertainment &amp; Media</option>
                      <option value="Literature">Literature &amp; Language</option>
                    </optgroup>
                    <optgroup label="── Languages ──">
                      <option value="English">English</option>
                      <option value="Chinese">Chinese</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                      <option value="Polish">Polish</option>
                      <option value="Russian">Russian</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Non-english">Non-English</option>
                    </optgroup>
                  </select>
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
            <div>
              {error && (
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
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.72)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: '1px solid rgba(255, 255, 255, 0.75)',
                  padding: '24px',
                  borderRadius: '18px',
                  marginBottom: '24px',
                  boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.18), 0 0 22px rgba(16, 185, 129, 0.08), 0 12px 40px rgba(15, 23, 42, 0.06)'
                }}>
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
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
                    }}>
                      <ProviderLogo provider={getNormalizedProvider(results.currentBaseline.modelId)} size={24} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{results.currentBaseline.name}</div>
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
                  <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Top Alternative Model Recommendations</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                          className={`intel-rank-row ${isSelected ? 'selected' : ''}`}
                          style={{
                            gridTemplateColumns: '30px 1fr auto auto',
                            padding: '16px 20px',
                            gap: '16px',
                            alignItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <span className={`intel-rank-number ${idx < 3 ? 'is-top-three' : ''}`}>{idx + 1}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
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
                              <strong style={{ color: '#1E293B', fontSize: '14.5px' }}>{rec.name.replace(/^.*?:\s*/, '')}</strong>
                              <small style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>{rec.developer} · {rec.modelId.split('/')[1]}</small>
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompareClick(rec);
                            }}
                            className="btn btn-outline"
                            style={{
                              padding: '6px 12px',
                              fontSize: '11px',
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

                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                            <span className={`badge ${isMoreExpensive ? 'badge-orange' : 'badge-green'}`} style={{ padding: '6px 12px', fontSize: '12.5px', fontWeight: '750' }}>
                              {isMoreExpensive ? 'Adds ' : 'Saves '}${Math.abs(rec.projected_monthly_savings).toLocaleString()}/mo
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                              Cost: ${rec.monthly_cost.toFixed(2)}/mo
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dynamic deep comparison panel */}
                  {selectedRecommendation && (
                    <div className="wizard-card" style={{ marginTop: '32px', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px', backgroundColor: '#F8FAFC' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B' }}>
                          <Search size={16} style={{ color: 'var(--color-green-primary)' }} /> Comparison details: {results?.currentBaseline?.name} vs {selectedRecommendation.name}
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

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center', marginBottom: '24px' }}>

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

                      <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
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
                <div style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                  {optimizationGoal === 'cost'
                    ? `No alternative models found that cut cost by ${costCutPercentage}% from this baseline. Try selecting a lower savings target or a more expensive baseline model.`
                    : "No alternative models found that match or exceed the baseline quality. Try selecting a different baseline model or use-case."}
                </div>
              )}
            </div>{/* end right column */}

          </div>{/* end 2-col grid */}

        </div>{/* end container */}
      </main>


      {hoveredModel && (() => {
        const rect = hoveredElement
          ? hoveredElement.getBoundingClientRect()
          : { top: hoverPosition.y, bottom: hoverPosition.y, left: hoverPosition.x, right: hoverPosition.x, width: 0, height: 0 };

        // Consume scrollTick to satisfy ESLint and force position refreshes on scroll/resize
        const _tick = scrollTick;

        const tooltipWidth = tooltipDimensions.width;
        const tooltipHeight = tooltipDimensions.height;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const requiredSpace = tooltipHeight + 20; // height + spacing

        let top;
        if (spaceBelow >= requiredSpace) {
          // Render below
          top = rect.bottom + 10;
        } else if (spaceAbove >= requiredSpace) {
          // Render above
          top = rect.top - tooltipHeight - 10;
        } else {
          // Render in whichever direction has more space
          if (spaceBelow >= spaceAbove) {
            top = rect.bottom + 10;
          } else {
            top = rect.top - tooltipHeight - 10;
          }
        }

        // Clamp top/bottom coordinates to prevent vertical overflow outside visible screen
        top = Math.max(10, Math.min(window.innerHeight - tooltipHeight - 10, top));

        // Center horizontally relative to hovered target element
        let left = rect.left + rect.width / 2 - tooltipWidth / 2;
        // Clamp left/right coordinates to prevent horizontal overflow outside visible screen
        left = Math.max(10, Math.min(window.innerWidth - tooltipWidth - 10, left));

        const aaScore = (targetUseCase === 'Coding')
          ? (hoveredModel.evaluations?.artificial_analysis_coding_index || hoveredModel.coding_index)
          : (targetUseCase === 'Math')
            ? (hoveredModel.evaluations?.artificial_analysis_math_index || hoveredModel.math_index)
            : (hoveredModel.evaluations?.artificial_analysis_intelligence_index || hoveredModel.intelligence_index);

        return (
          <div
            ref={tooltipRef}
            style={{
              position: 'fixed',
              left: `${left}px`,
              top: `${top}px`,
              width: `${tooltipWidth}px`,
              zIndex: 9999,
              pointerEvents: 'none',
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              color: '#1E293B',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              animation: 'fadeIn 0.15s ease'
            }}>
            {/* Title & Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
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
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(236, 253, 245, 0.8)', color: '#047857', fontSize: '10.5px', fontWeight: '800', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
                  Rank #{hoveredModel.rank}
                </span>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
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
