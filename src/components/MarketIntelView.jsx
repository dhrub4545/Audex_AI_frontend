import React, { useState, useEffect, useMemo, useDeferredValue, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { getCachedRawData } from '../utils/dataCache';
import { Trophy, TrendingUp, Database, Zap, Sparkles, Image, Video, Check, ChevronDown, Info, Sliders, Eye, ArrowRight, Search, Crosshair, Activity, Sparkle, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import {
  OpenAI,
  Claude,
  Gemini,
  Meta,
  DeepSeek,
  XAI,
  Mistral,
  Perplexity,
  Qwen,
  Moonshot,
  Minimax,
  Zhipu,
  Cohere,
  Microsoft,
  Aws,
  GithubCopilot,
  Github,
  Windsurf,
  V0,
  Vercel,
  Midjourney,
  Runway,
  ElevenLabs,
  Suno,
  Cursor
} from '@lobehub/icons';
import logoImg from '../assets/audex-ai-logo.png';

const GammaLogo = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gamma-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#gamma-grad)" />
  </svg>
);

const VerdentLogo = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 0 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 0 9.5a7 7 0 0 0-8 8.5z" />
    <path d="M19 2v9.5" />
  </svg>
);

export function ProviderLogo({ provider, size = 20 }) {
  const p = (provider || '').toLowerCase().trim();

  const getFallbackColor = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      { bg: '#EFF6FF', text: '#1D4ED8' },
      { bg: '#ECFDF5', text: '#047857' },
      { bg: '#FDF2F8', text: '#BE185D' },
      { bg: '#FAF5FF', text: '#6B21A8' },
      { bg: '#FFFBEB', text: '#B45309' },
      { bg: '#FFF5F5', text: '#C53030' },
      { bg: '#F0FDF4', text: '#166534' }
    ];
    return colors[hash % colors.length];
  };

  const initial = (provider || 'A').trim().charAt(0).toUpperCase();

  if (p.includes('openai') || p.includes('chatgpt')) return <OpenAI size={size} style={{ color: '#19C37D' }} />;
  if (p.includes('anthropic') || p.includes('claude')) {
    return Claude.Color ? <Claude.Color size={size} /> : <Claude size={size} style={{ color: '#D97754' }} />;
  }
  if (p.includes('google') || p.includes('gemini') || p.includes('deepmind')) {
    return Gemini.Color ? <Gemini.Color size={size} /> : <Gemini size={size} />;
  }
  if (p.includes('meta') || p.includes('llama')) {
    return Meta.Color ? <Meta.Color size={size} /> : <Meta size={size} style={{ color: '#044E95' }} />;
  }
  if (p.includes('deepseek')) {
    return DeepSeek.Color ? <DeepSeek.Color size={size} /> : <DeepSeek size={size} style={{ color: '#4D6BFE' }} />;
  }
  if (p.includes('xai') || p.includes('x-ai') || p.includes('grok')) {
    return XAI.Color ? <XAI.Color size={size} /> : <XAI size={size} style={{ color: '#0F172A' }} />;
  }
  if (p.includes('mistral')) {
    return Mistral.Color ? <Mistral.Color size={size} /> : <Mistral size={size} style={{ color: '#FD7E14' }} />;
  }
  if (p.includes('perplexity')) {
    return Perplexity.Color ? <Perplexity.Color size={size} /> : <Perplexity size={size} style={{ color: '#13B5B1' }} />;
  }
  if (p.includes('qwen') || p.includes('alibaba')) {
    return Qwen.Color ? <Qwen.Color size={size} /> : <Qwen size={size} style={{ color: '#0A74FF' }} />;
  }
  if (p.includes('moonshot')) {
    return Moonshot.Color ? <Moonshot.Color size={size} /> : <Moonshot size={size} />;
  }
  if (p.includes('minimax')) {
    return Minimax.Color ? <Minimax.Color size={size} /> : <Minimax size={size} />;
  }
  if (p.includes('cohere')) {
    return Cohere.Color ? <Cohere.Color size={size} /> : <Cohere size={size} style={{ color: '#0C343D' }} />;
  }
  if (p.includes('zhipu')) {
    return Zhipu.Color ? <Zhipu.Color size={size} /> : <Zhipu size={size} />;
  }
  if (p.includes('microsoft')) {
    return Microsoft.Color ? <Microsoft.Color size={size} /> : <Microsoft size={size} />;
  }
  if (p.includes('amazon') || p.includes('aws') || p.includes('bedrock')) {
    return Aws.Color ? <Aws.Color size={size} /> : <Aws size={size} />;
  }

  // Onboarding flow tools mapping:
  if (p.includes('github copilot') || p.includes('github-copilot')) {
    return GithubCopilot.Color ? <GithubCopilot.Color size={size} /> : <GithubCopilot size={size} />;
  }
  if (p.includes('github')) {
    return Github.Color ? <Github.Color size={size} /> : <Github size={size} />;
  }
  if (p.includes('windsurf')) {
    return Windsurf.Color ? <Windsurf.Color size={size} /> : <Windsurf size={size} />;
  }
  if (p.includes('v0')) {
    return V0.Color ? <V0.Color size={size} /> : <V0 size={size} />;
  }
  if (p.includes('vercel')) {
    return Vercel.Color ? <Vercel.Color size={size} /> : <Vercel size={size} />;
  }
  if (p.includes('midjourney')) {
    return Midjourney.Color ? <Midjourney.Color size={size} /> : <Midjourney size={size} />;
  }
  if (p.includes('runway')) {
    return Runway.Color ? <Runway.Color size={size} /> : <Runway size={size} />;
  }
  if (p.includes('elevenlabs')) {
    return ElevenLabs.Color ? <ElevenLabs.Color size={size} /> : <ElevenLabs size={size} />;
  }
  if (p.includes('suno')) {
    return Suno.Color ? <Suno.Color size={size} /> : <Suno size={size} />;
  }
  if (p.includes('cursor')) {
    return Cursor.Color ? <Cursor.Color size={size} /> : <Cursor size={size} />;
  }
  if (p.includes('gamma')) {
    return <GammaLogo size={size} />;
  }
  if (p.includes('verdent')) {
    return <VerdentLogo size={size} />;
  }

  const styleColors = getFallbackColor(provider || 'AI');
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: styleColors.bg,
      color: styleColors.text,
      fontSize: `${Math.round(size * 0.55)}px`,
      fontWeight: '800',
      lineHeight: 1,
      fontFamily: 'var(--font-title)',
      border: '1px solid rgba(0,0,0,0.04)',
      flexShrink: 0
    }}>
      {initial}
    </span>
  );
}

function formatCategoryName(key) {
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
    <div className="custom-select-container" ref={containerRef} style={{ position: 'relative', width: '280px' }}>
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

export default function MarketIntelView({ onNavigateToView, renderCoinDropdown }) {
  const [intelData, setIntelData] = useState(null);
  const [loadingIntel, setLoadingIntel] = useState(true);
  const [intelError, setIntelError] = useState(null);

  // View states: 'rankings' (horizontal bars), 'scatter' (scatter plot), 'explorer' (database table)
  const [activeTab, setActiveTab] = useState('rankings');

  // Rankings tab settings
  const [rankingIndex, setRankingIndex] = useState('quality'); // 'quality', 'coding', 'math', 'speed', 'latency'
  const [activeCategory, setActiveCategory] = useState('overall');

  // Scatter tab settings
  const [xAxis, setXAxis] = useState('price'); // 'price' or 'speed'
  const [yAxis, setYAxis] = useState('intelligence'); // 'intelligence', 'coding', 'math', 'gpqa', 'hle'
  const [scaleMode, setScaleMode] = useState('log'); // 'log' (Logarithmic) or 'linear'
  const [filterOutliers, setFilterOutliers] = useState(true);
  const [showFrontierLine, setShowFrontierLine] = useState(true);
  const [showScatterLabels, setShowScatterLabels] = useState(true);
  const [selectedScatterPoint, setSelectedScatterPoint] = useState(null);
  const [activeLegendProvider, setActiveLegendProvider] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreators, setSelectedCreators] = useState(new Set());
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Explorer settings - exclusively Frontier Text LLMs
  const [sortConfig, setSortConfig] = useState({ key: 'intelligence_index', direction: 'descending' });
  const [tablePage, setTablePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Hover states
  const [hoveredModel, setHoveredModel] = useState(null);
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);

  // Refined hover states for smooth, flicker-free, throttled tooltips
  const [activeTooltipModel, setActiveTooltipModel] = useState(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
  const latestPos = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);
  const tooltipTimeoutRef = useRef(null);
  const tooltipRef = useRef(null);

  const handleRowMouseMove = (e) => {
    latestPos.current = { x: e.clientX, y: e.clientY };
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;

        const x = latestPos.current.x;
        const y = latestPos.current.y;

        let tooltipWidth = 420;
        let tooltipHeight = 440;
        if (tooltipRef.current) {
          const rect = tooltipRef.current.getBoundingClientRect();
          if (rect.width > 0) tooltipWidth = rect.width;
          if (rect.height > 0) tooltipHeight = rect.height;
        }
        const padding = 16;
        const topNavOffset = 76; // Navbar clearance

        let left = x + 18;
        if (left + tooltipWidth + padding > window.innerWidth) {
          left = x - tooltipWidth - 18;
        }
        left = Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, left));

        let top = y - 40;
        if (top + tooltipHeight + padding > window.innerHeight) {
          top = window.innerHeight - tooltipHeight - padding;
        }
        top = Math.max(topNavOffset, top);

        setTooltipPos({ left, top });
      });
    }
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  // Fetch raw analysis data from the backend (cached)
  useEffect(() => {
    getCachedRawData()
      .then(data => {
        if (data) setIntelData(data);
        setLoadingIntel(false);
      })
      .catch(err => {
        console.error(err);
        setIntelError(err.message);
        setLoadingIntel(false);
      });
  }, []);

  // Standard Developer Colors
  const getDeveloperColor = (creator) => {
    const c = (creator || '').toLowerCase();
    if (c.includes('openai')) return '#10B981'; // Teal-green
    if (c.includes('anthropic')) return '#F97316'; // Coral-orange
    if (c.includes('google')) return '#3B82F6'; // Royal Blue
    if (c.includes('meta')) return '#8B5CF6'; // Violet-purple
    if (c.includes('deepseek')) return '#06B6D4'; // Bright Cyan
    if (c.includes('mistral')) return '#EF4444'; // Red-salmon
    if (c.includes('cohere')) return '#D97706'; // Golden amber
    if (c.includes('qwen') || c.includes('alibaba')) return '#14B8A6'; // Mint teal
    return '#64748B'; // Slate Grey
  };

  // Get distinct list of creators for filter options
  const creatorsList = useMemo(() => {
    if (!intelData || !intelData.llms) return [];
    const set = new Set();
    intelData.llms.forEach(m => {
      if (m.creator) set.add(m.creator);
    });
    return Array.from(set).sort();
  }, [intelData]);

  // Toggle creator filters
  const toggleCreator = (creator) => {
    const next = new Set(selectedCreators);
    if (next.has(creator)) {
      next.delete(creator);
    } else {
      next.add(creator);
    }
    setSelectedCreators(next);
  };

  const clearFilters = () => {
    setSelectedCreators(new Set());
    setSearchQuery('');
  };

  // Filtered and prepared data for LLM analyses
  const filteredLlms = useMemo(() => {
    if (!intelData || !intelData.llms) return [];
    return intelData.llms.filter(m => {
      // 1. Search Query
      if (deferredSearchQuery) {
        const q = deferredSearchQuery.toLowerCase();
        const matchesName = (m.name || '').toLowerCase().includes(q);
        const matchesCreator = (m.creator || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCreator) return false;
      }
      // 2. Creator Multi-select
      if (selectedCreators.size > 0 && !selectedCreators.has(m.creator)) {
        return false;
      }
      return true;
    });
  }, [intelData, deferredSearchQuery, selectedCreators]);

  // rankingsData: LLMs sorted by the active ranking index, filtering out nulls
  const rankingsData = useMemo(() => {
    let targetCat = activeCategory;
    if (!targetCat) {
      if (rankingIndex === 'quality' || rankingIndex === 'speed' || rankingIndex === 'latency') {
        targetCat = 'overall';
      } else if (rankingIndex === 'coding') {
        targetCat = 'coding';
      } else if (rankingIndex === 'math') {
        targetCat = 'math';
      }
    }

    if (intelData && intelData.categories && targetCat && intelData.categories[targetCat]) {
      const categoryModels = intelData.categories[targetCat];
      const llmMap = new Map((intelData.llms || []).map(m => [m.slug, m]));

      let models = categoryModels.map(catModel => {
        const fullLlm = llmMap.get(catModel.slug) || {};
        const inputCost = catModel.pricing?.price_1m_input_tokens || fullLlm.inputCost || 0;
        const outputCost = catModel.pricing?.price_1m_output_tokens || fullLlm.outputCost || 0;
        const blendedPrice = fullLlm.blendedPrice || (inputCost * 0.75 + outputCost * 0.25);

        return {
          ...fullLlm,
          ...catModel,
          name: catModel.name || fullLlm.name || catModel.slug,
          creator: catModel.organization || fullLlm.creator || 'Unknown',
          rating: catModel.rating || fullLlm.intelligence_index || 0,
          rank: catModel.rank,
          intelligence_index: catModel.evaluations?.artificial_analysis_intelligence_index || fullLlm.intelligence_index || null,
          coding_index: catModel.evaluations?.artificial_analysis_coding_index || fullLlm.coding_index || null,
          math_index: catModel.evaluations?.artificial_analysis_math_index || fullLlm.math_index || null,
          gpqa: catModel.evaluations?.gpqa || fullLlm.gpqa || null,
          hle: catModel.evaluations?.hle || fullLlm.hle || null,
          throughput: catModel.median_output_tokens_per_second || fullLlm.throughput || null,
          ttft: catModel.median_time_to_first_token_seconds || fullLlm.ttft || null,
          blendedPrice: blendedPrice
        };
      });

      // Apply sorting if speed or latency index is selected (and no explicit category dropdown is active)
      if (!activeCategory) {
        if (rankingIndex === 'speed') {
          models = [...models].sort((a, b) => {
            const aVal = a.throughput === null || a.throughput === undefined ? 0 : a.throughput;
            const bVal = b.throughput === null || b.throughput === undefined ? 0 : b.throughput;
            return bVal - aVal;
          });
        } else if (rankingIndex === 'latency') {
          models = [...models].sort((a, b) => {
            const aVal = a.ttft === null || a.ttft === undefined || a.ttft === 0 ? Infinity : a.ttft;
            const bVal = b.ttft === null || b.ttft === undefined || b.ttft === 0 ? Infinity : b.ttft;
            return aVal - bVal;
          });
        }
      }

      // Filter by search query and creator
      return models.filter(m => {
        if (deferredSearchQuery) {
          const q = deferredSearchQuery.toLowerCase();
          const matchesName = (m.name || '').toLowerCase().includes(q);
          const matchesCreator = (m.creator || '').toLowerCase().includes(q);
          if (!matchesName && !matchesCreator) return false;
        }
        if (selectedCreators.size > 0 && !selectedCreators.has(m.creator)) {
          return false;
        }
        return true;
      });
    }

    return [];
  }, [intelData, activeCategory, rankingIndex, deferredSearchQuery, selectedCreators]);

  // Max bounds for relative bar scaling in horizontal ranking chart
  const _rankingMaxAndMin = useMemo(() => {
    if (rankingsData.length === 0) return { max: 100, min: 0 };
    if (activeCategory && intelData?.categories?.[activeCategory]) {
      const ratings = rankingsData.map(m => m.rating || 0).filter(r => r > 0);
      const max = ratings.length > 0 ? Math.max(...ratings) : 100;
      const min = ratings.length > 0 ? Math.min(...ratings) : 0;
      return { max, min };
    }
    if (rankingIndex === 'speed') {
      return { max: Math.max(...rankingsData.map(m => m.throughput || 0)), min: 0 };
    }
    if (rankingIndex === 'latency') {
      return { max: Math.max(...rankingsData.map(m => m.ttft || 0)), min: 0 };
    }
    return { max: 100, min: 0 }; // Indices are out of 100
  }, [rankingsData, rankingIndex, activeCategory, intelData]);

  // A focused shortlist reads better than a wall of labels and avoids re-rendering
  // dozens of interactive columns whenever the user searches or filters.
  const visibleRankings = useMemo(() => rankingsData.slice(0, 18), [rankingsData]);

  // Scatter plot points
  const chartData = useMemo(() => {
    return filteredLlms.filter(m => {
      let xVal, yVal;
      if (xAxis === 'price') xVal = m.blendedPrice;
      else if (xAxis === 'speed') xVal = m.throughput;

      if (yAxis === 'intelligence') yVal = m.intelligence_index;
      else if (yAxis === 'coding') yVal = m.coding_index;
      else if (yAxis === 'math') yVal = m.math_index;
      else if (yAxis === 'gpqa') yVal = m.gpqa;
      else if (yAxis === 'hle') yVal = m.hle;

      return xVal !== null && xVal !== undefined && !isNaN(xVal) &&
        yVal !== null && yVal !== undefined && !isNaN(yVal);
    });
  }, [filteredLlms, xAxis, yAxis]);

  const { scatterPoints, paretoFrontierPoints, paretoPathD, xTicks } = useMemo(() => {
    const paddingLeft = 80;
    const paddingRight = 45;
    const paddingTop = 45;
    const paddingBottom = 65;
    const width = 880 - paddingLeft - paddingRight;
    const height = 500 - paddingTop - paddingBottom;

    if (chartData.length === 0) {
      return { scatterPoints: [], paretoFrontierPoints: [], paretoPathD: '', xTicks: [] };
    }

    let minX, maxX;
    let ticks = [];

    if (xAxis === 'price') {
      if (scaleMode === 'log') {
        minX = 0.03;
        maxX = filterOutliers ? 30 : 300;
        const logTicks = filterOutliers ? [0.05, 0.20, 1.0, 5.0, 20.0] : [0.05, 0.20, 1.0, 5.0, 25.0, 100.0, 250.0];
        const logMin = Math.log10(minX);
        const logMax = Math.log10(maxX);
        ticks = logTicks.map(val => {
          const ratio = Math.max(0, Math.min(1, (Math.log10(val) - logMin) / (logMax - logMin)));
          return {
            val,
            label: val < 1 ? `$${val.toFixed(2)}` : `$${val.toFixed(0)}`,
            x: paddingLeft + ratio * width
          };
        });
      } else {
        minX = 0;
        maxX = filterOutliers ? 30 : Math.max(...chartData.map(d => d.blendedPrice || 0), 10);
        ticks = [0, 0.25, 0.5, 0.75, 1.0].map(ratio => {
          const val = maxX * ratio;
          return {
            val,
            label: `$${val.toFixed(val < 10 ? 1 : 0)}`,
            x: paddingLeft + ratio * width
          };
        });
      }
    } else {
      // Speed / throughput
      if (scaleMode === 'log') {
        minX = 15;
        maxX = filterOutliers ? 600 : 2200;
        const logTicks = filterOutliers ? [25, 50, 100, 250, 500] : [25, 50, 100, 250, 500, 1000, 2000];
        const logMin = Math.log10(minX);
        const logMax = Math.log10(maxX);
        ticks = logTicks.map(val => {
          const ratio = Math.max(0, Math.min(1, (Math.log10(val) - logMin) / (logMax - logMin)));
          return {
            val,
            label: `${val} t/s`,
            x: paddingLeft + ratio * width
          };
        });
      } else {
        minX = 0;
        maxX = filterOutliers ? 600 : Math.max(...chartData.map(d => d.throughput || 0), 100);
        ticks = [0, 0.25, 0.5, 0.75, 1.0].map(ratio => {
          const val = maxX * ratio;
          return {
            val,
            label: `${Math.round(val)} t/s`,
            x: paddingLeft + ratio * width
          };
        });
      }
    }

    const logMin = Math.log10(Math.max(minX, 0.001));
    const logMax = Math.log10(Math.max(maxX, minX + 0.001));

    // Map each point
    const points = chartData.map(m => {
      let xVal = xAxis === 'price' ? (m.blendedPrice || 0) : (m.throughput || 0);
      let yVal = 0;
      if (yAxis === 'intelligence') yVal = m.intelligence_index || 0;
      else if (yAxis === 'coding') yVal = m.coding_index || 0;
      else if (yAxis === 'math') yVal = m.math_index || 0;
      else if (yAxis === 'gpqa') yVal = m.gpqa ? (m.gpqa <= 1 ? m.gpqa * 100 : m.gpqa) : 0;
      else if (yAxis === 'hle') yVal = m.hle ? (m.hle <= 1 ? m.hle * 100 : m.hle) : 0;

      let xRatio = 0;
      if (scaleMode === 'log') {
        const safeVal = Math.max(xVal, minX);
        xRatio = Math.max(0, Math.min(1, (Math.log10(safeVal) - logMin) / (logMax - logMin)));
      } else {
        xRatio = Math.max(0, Math.min(1, (xVal - minX) / (maxX - minX || 1)));
      }

      const x = paddingLeft + xRatio * width;
      const y = 500 - paddingBottom - (Math.max(0, Math.min(100, yVal)) / 100) * height;

      return {
        x,
        y,
        model: m,
        xVal,
        yVal,
        isKeyModel: false
      };
    });

    // Compute Pareto Frontier Points
    let frontierPoints = [];
    if (xAxis === 'price') {
      // Lower price is better -> sort by price ascending, find points with strictly higher quality
      const sortedByPrice = [...points].sort((a, b) => a.xVal - b.xVal);
      let runningMaxY = -1;
      for (const pt of sortedByPrice) {
        if (pt.yVal > runningMaxY + 0.3 && pt.xVal <= maxX && pt.xVal >= minX) {
          runningMaxY = pt.yVal;
          frontierPoints.push(pt);
        }
      }
    } else {
      // Higher speed is better -> sort by speed descending, find points with strictly higher quality
      const sortedBySpeed = [...points].sort((a, b) => b.xVal - a.xVal);
      let runningMaxY = -1;
      for (const pt of sortedBySpeed) {
        if (pt.yVal > runningMaxY + 0.3 && pt.xVal <= maxX && pt.xVal >= minX) {
          runningMaxY = pt.yVal;
          frontierPoints.push(pt);
        }
      }
      frontierPoints.sort((a, b) => a.xVal - b.xVal);
    }

    // Build smooth path for Pareto frontier
    let pathD = '';
    if (frontierPoints.length > 0) {
      pathD = `M ${frontierPoints[0].x} ${frontierPoints[0].y}`;
      for (let i = 1; i < frontierPoints.length; i++) {
        const prev = frontierPoints[i - 1];
        const curr = frontierPoints[i];
        const midX = (prev.x + curr.x) / 2;
        pathD += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
      }
    }

    // Mark key landmark models for de-duplicated labels:
    const landmarkSet = new Set();
    // Add top 4 frontier models
    frontierPoints.slice(-4).forEach(pt => landmarkSet.add(pt.model.slug));
    if (frontierPoints.length > 0) landmarkSet.add(frontierPoints[0].model.slug);

    // Notable famous flagships
    const topFamousSlugs = ['claude-opus-5', 'claude-fable-5', 'gpt-5-6-sol', 'gemini-3-5-flash', 'deepseek-v4-flash', 'grok-4-6'];
    points.forEach(pt => {
      if (topFamousSlugs.some(s => pt.model.slug?.includes(s)) && landmarkSet.size < 8) {
        landmarkSet.add(pt.model.slug);
      }
    });

    points.forEach(pt => {
      pt.isKeyModel = landmarkSet.has(pt.model.slug);
    });

    return {
      scatterPoints: points,
      paretoFrontierPoints: frontierPoints,
      paretoPathD: pathD,
      xTicks: ticks,
      chartBounds: { paddingLeft, paddingRight, paddingTop, paddingBottom, width, height }
    };
  }, [chartData, xAxis, yAxis, scaleMode, filterOutliers]);

  // Explorer Table sorting and pagination
  const handleSort = (key) => {
    let direction = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const sortedExplorerData = useMemo(() => {
    if (!intelData) return [];

    let list = [...filteredLlms];

    list.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'ascending'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
      }
    });

    return list;
  }, [intelData, filteredLlms, sortConfig]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setTablePage(1);
  }, [deferredSearchQuery, selectedCreators, sortConfig]);

  const paginatedExplorerData = useMemo(() => {
    if (rowsPerPage === -1) return sortedExplorerData;
    const start = (tablePage - 1) * rowsPerPage;
    return sortedExplorerData.slice(start, start + rowsPerPage);
  }, [sortedExplorerData, tablePage, rowsPerPage]);

  const totalPages = useMemo(() => {
    if (rowsPerPage === -1 || sortedExplorerData.length === 0) return 1;
    return Math.ceil(sortedExplorerData.length / rowsPerPage);
  }, [sortedExplorerData, rowsPerPage]);

  // Quick stats computed from current ranking
  const _avgThroughput = useMemo(() => {
    if (!intelData || !intelData.llms) return 0;
    const items = intelData.llms.filter(m => m.throughput);
    if (items.length === 0) return 0;
    return Math.round(items.reduce((acc, m) => acc + m.throughput, 0) / items.length);
  }, [intelData]);

  return (
    <div className="app-container" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        .intel-glass-panel {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 16px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .eval-glass-pill {
          padding: 5px 10px;
          border-radius: 10px;
          background-color: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.18);
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
          cursor: default;
        }
        .eval-glass-pill:hover {
          transform: translateY(-1px);
          border-color: rgba(148, 163, 184, 0.35);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }
      `}</style>

      {/* Sleek Sub-Header Navbar */}
      <header className="navbar" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => onNavigateToView('landing')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: 'var(--color-text-secondary)',
                padding: '8px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
                backgroundColor: 'var(--color-bg-accent)'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#E2E8F0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-accent)'}
            >
              ← Back
            </button>
            <div className="brand" style={{ pointerEvents: 'none' }}>
              <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
              <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>Market Intel</span></span>
            </div>
          </div>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center' }}>
            {renderCoinDropdown ? renderCoinDropdown() : null}
            <button onClick={() => onNavigateToView('step1')} className="btn btn-black">
              Start Free Audit
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ padding: '40px 24px', maxWidth: '1280px' }}>

        {/* Title Block */}
        <div style={{ marginBottom: '32px' }}>
          <span className="badge badge-green" style={{ marginBottom: '12px', display: 'inline-block' }}>
            Live Artificial Analysis Stream
          </span>
          <h1 style={{ fontSize: '38px', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '8px' }}>
            LLM & AI Leaderboard
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '780px' }}>
            Compare LLM frontier capabilities, speed performance, and real deployment costs based on raw api responses. Zero fallbacks, zero synthetic estimates.
          </p>
        </div>

        {/* Loading / Error States */}
        {loadingIntel ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-text-secondary)', fontSize: '15px' }}>
            <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', width: '36px', height: '36px', borderRadius: '50%', borderLeftColor: 'var(--color-green-primary)', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }}></div>
            Hydrating market analytics from Artificial Analysis...
          </div>
        ) : intelError ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#EF4444', border: '1px dashed #EF4444', borderRadius: '12px', backgroundColor: '#FEF2F2' }}>
            ⚠️ Failed to load raw market intelligence: {intelError}. Please check connection or sync status.
          </div>
        ) : (
          <>
            

            {/* Filter controls panel (Search, Providers) */}
            <div className="market-intel-layout" style={{ marginBottom: '40px' }}>

              {/* Sidebar Filters */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0F172A' }}>Filters</h3>
                  {(searchQuery || selectedCreators.size > 0) && (
                    <button
                      onClick={clearFilters}
                      style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Text Search */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Search Model or Creator</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. o1, Anthropic..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      fontFamily: 'var(--font-body)'
                    }}
                  />
                </div>

                {/* Providers Checklist */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>AI Providers</label>
                  <div data-lenis-prevent style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                    {creatorsList.map(creator => (
                      <label
                        key={creator}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '13px',
                          color: selectedCreators.has(creator) ? '#0F172A' : 'var(--color-text-secondary)',
                          fontWeight: selectedCreators.has(creator) ? '700' : '500',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCreators.has(creator)}
                          onChange={() => toggleCreator(creator)}
                          style={{
                            accentColor: 'var(--color-green-primary)',
                            width: '15px',
                            height: '15px',
                            cursor: 'pointer'
                          }}
                        />
                        <ProviderLogo provider={creator} size={16} />
                        {creator}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Workspace (Tabs & Content) */}
              <div>

                {/* Main View Tab Selector */}
                <div style={{ display: 'flex', borderBottom: '2px solid var(--color-border)', gap: '32px', marginBottom: '24px' }}>
                  <button
                    onClick={() => setActiveTab('rankings')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'rankings' ? '3px solid var(--color-green-primary)' : '3px solid transparent',
                      padding: '12px 8px',
                      fontSize: '16px',
                      fontWeight: '800',
                      color: activeTab === 'rankings' ? '#0F172A' : 'var(--color-text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginBottom: '-2px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Trophy size={16} /> Leaderboard Rankings
                  </button>
                  <button
                    onClick={() => setActiveTab('scatter')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'scatter' ? '3px solid var(--color-green-primary)' : '3px solid transparent',
                      padding: '12px 8px',
                      fontSize: '16px',
                      fontWeight: '800',
                      color: activeTab === 'scatter' ? '#0F172A' : 'var(--color-text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginBottom: '-2px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <TrendingUp size={16} /> Speed vs Cost Scatter Plot
                  </button>
                  <button
                    onClick={() => setActiveTab('explorer')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === 'explorer' ? '3px solid var(--color-green-primary)' : '3px solid transparent',
                      padding: '12px 8px',
                      fontSize: '16px',
                      fontWeight: '800',
                      color: activeTab === 'explorer' ? '#0F172A' : 'var(--color-text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginBottom: '-2px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Database size={16} /> Database Table Explorer
                  </button>
                </div>

                {/* Tab content */}

                {/* 1. Rankings Tab (Beautiful Replicated Bar Charts) */}
                {activeTab === 'rankings' && (
                  <div className="intel-chart-card">

                    {/* Inner Index Tabs and Category Select Dropdown */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                          { id: 'quality', label: 'Overall Quality' },
                          { id: 'coding', label: 'Coding Index' },
                          { id: 'math', label: 'Math Index' },
                          { id: 'speed', label: 'Throughput (Speed)' },
                          { id: 'latency', label: 'Latency (TTFT)' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setRankingIndex(opt.id);
                              setActiveCategory(null);
                            }}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '9999px',
                              border: '1px solid var(--color-border)',
                              backgroundColor: (!activeCategory && rankingIndex === opt.id) ? '#0F172A' : '#F1F5F9',
                              color: (!activeCategory && rankingIndex === opt.id) ? '#FFFFFF' : 'var(--color-text-primary)',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {intelData?.categories && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: '750', color: 'var(--color-text-secondary)' }}>
                            Category Leaderboard:
                          </span>
                          <CustomSelect
                            value={activeCategory || ''}
                            onChange={(val) => setActiveCategory(val || null)}
                            options={[
                              { value: '', label: '-- Standard Computed Indices --' },
                              ...Object.keys(intelData.categories).map(catKey => ({
                                value: catKey,
                                label: formatCategoryName(catKey)
                              }))
                            ]}
                            placeholder="Select Category"
                          />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800' }}>
                        {activeCategory
                          ? `${formatCategoryName(activeCategory)} Leaderboard`
                          : `${rankingIndex.charAt(0).toUpperCase() + rankingIndex.slice(1)} Index Leaderboard`
                        }
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        Top {visibleRankings.length} of {rankingsData.length} models
                      </span>
                    </div>

                    {/* Focused rank rows keep model names, scores and comparisons legible. */}
                    <div className="intel-rank-list" role="list" aria-label={`${rankingIndex} leaderboard chart`}>
                      {visibleRankings.map((model, idx) => {
                        const rankVal = model.rank || idx + 1;
                        return (
                          <button
                            key={`${activeCategory || rankingIndex}-${model.slug}-${idx}`}
                            type="button"
                            className={`intel-rank-row ${hoveredModel?.slug === model.slug ? 'is-hovered' : ''}`}
                            style={{
                              gridTemplateColumns: '30px 1fr'
                            }}
                            onMouseEnter={(e) => {
                              if (tooltipTimeoutRef.current) {
                                clearTimeout(tooltipTimeoutRef.current);
                                tooltipTimeoutRef.current = null;
                              }
                              setHoveredModel(model);
                              setActiveTooltipModel(model);
                              setIsTooltipVisible(true);
                              handleRowMouseMove(e);
                            }}
                            onMouseMove={handleRowMouseMove}
                            onMouseLeave={() => {
                              setHoveredModel(null);
                              tooltipTimeoutRef.current = setTimeout(() => {
                                setIsTooltipVisible(false);
                              }, 60);
                            }}
                            onFocus={(e) => {
                              setHoveredModel(model);
                              setActiveTooltipModel(model);
                              setIsTooltipVisible(true);
                              handleRowMouseMove(e);
                            }}
                            onBlur={() => {
                              setHoveredModel(null);
                              setIsTooltipVisible(false);
                            }}
                          >
                            <span className={`intel-rank-number ${rankVal <= 3 ? 'is-top-three' : ''}`}>{rankVal}</span>
                            <span className="intel-rank-name">
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                                  <ProviderLogo provider={model.creator} size={21} />
                                </span>
                                <strong style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '700' }}>
                                  {model.name.replace(/^.*?:\s*/, '')}
                                </strong>
                              </span>
                              <small style={{ display: 'block', marginTop: '3px', color: 'var(--color-text-muted)', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {model.creator} {model.model_name ? ` • ${model.model_name}` : ''}
                              </small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Details tooltip block at hover position */}
                    {activeTooltipModel && (
                      <div
                        ref={tooltipRef}
                        className="intel-rank-tooltip-card"
                        style={{
                          position: 'fixed',
                          left: 0,
                          top: 0,
                          transform: `translate3d(${tooltipPos.left}px, ${tooltipPos.top + (isTooltipVisible ? 0 : 6)}px, 0) scale(${isTooltipVisible ? 1 : 0.98})`,
                          opacity: isTooltipVisible ? 1 : 0,
                          visibility: isTooltipVisible ? 'visible' : 'hidden',
                          pointerEvents: 'none',
                          width: 'min(420px, calc(100vw - 32px))',
                          maxHeight: 'min(520px, calc(100vh - 96px))',
                          overflowY: 'auto',
                          zIndex: 9999,
                          padding: '18px 20px',
                          background: 'rgba(255, 255, 255, 0.94)',
                          backdropFilter: 'blur(24px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                          borderRadius: '20px',
                          color: '#0F172A',
                          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(226, 232, 240, 0.9)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          transition: 'transform 120ms cubic-bezier(0.25, 1, 0.5, 1), opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), scale 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Title & Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(15, 23, 42, 0.08)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <ProviderLogo provider={activeTooltipModel.creator} size={24} />
                              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-title)' }}>
                                {activeTooltipModel.name.replace(/^.*?:\s*/, '')}
                              </h4>
                            </div>
                            <span style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                              Created by <strong style={{ color: '#0F172A' }}>{activeTooltipModel.creator}</strong> • Released {activeTooltipModel.release_date || 'N/A'}
                            </span>
                          </div>

                          {/* Rank Badge */}
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              background: 'rgba(15, 23, 42, 0.05)',
                              fontSize: '11px',
                              fontWeight: '700',
                              border: '1px solid rgba(15, 23, 42, 0.1)',
                              color: '#0F172A',
                              letterSpacing: '0.02em'
                            }}>
                              Rank #{activeTooltipModel.rank}
                            </span>
                          </div>
                        </div>

                        {/* Primary Focus & Notes */}
                        {(activeTooltipModel.primary_benchmark || activeTooltipModel.notes) && (
                          <div className="intel-glass-panel" style={{ gap: '4px', borderLeft: '3px solid rgba(37, 99, 235, 0.5)', padding: '12px 14px' }}>
                            {activeTooltipModel.primary_benchmark && (
                              <span style={{ fontSize: '11.5px', color: '#2563EB', fontWeight: '600' }}>
                                <strong>Primary Focus:</strong> {activeTooltipModel.primary_benchmark}
                              </span>
                            )}
                            {activeTooltipModel.notes && (
                              <span style={{ fontSize: '11.5px', color: '#475569', fontStyle: 'italic', lineHeight: 1.4 }}>
                                "{activeTooltipModel.notes}"
                              </span>
                            )}
                          </div>
                        )}

                        {/* Score and Ranking Breakdown Box */}
                        {(() => {
                          const hasArena = (activeTooltipModel.arena_rank !== null && activeTooltipModel.arena_rank !== undefined) ||
                            (activeTooltipModel.rating > 0) ||
                            (activeTooltipModel.votes !== null && activeTooltipModel.votes !== undefined);

                          const aaScore = (activeCategory === 'coding' || (!activeCategory && rankingIndex === 'coding'))
                            ? (activeTooltipModel.evaluations?.artificial_analysis_coding_index || activeTooltipModel.coding_index)
                            : (activeCategory === 'math' || (!activeCategory && rankingIndex === 'math'))
                              ? (activeTooltipModel.evaluations?.artificial_analysis_math_index || activeTooltipModel.math_index)
                              : (activeTooltipModel.evaluations?.artificial_analysis_intelligence_index || activeTooltipModel.intelligence_index);

                          const hasAA = (activeTooltipModel.artificial_analysis_rank !== null && activeTooltipModel.artificial_analysis_rank !== undefined) ||
                            (aaScore !== null && aaScore !== undefined && aaScore !== 0);

                          if (!hasArena && !hasAA) return null;

                          return (
                            <div className="intel-glass-panel" style={{ gap: '10px', padding: '14px' }}>
                              {hasAA && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
                                    Artificial Analysis
                                  </div>
                                  <div style={{ display: 'flex', gap: '20px', fontSize: '13px', flexWrap: 'wrap', color: '#475569' }}>
                                    {activeTooltipModel.artificial_analysis_rank !== null && activeTooltipModel.artificial_analysis_rank !== undefined && (
                                      <div>Rank: <strong style={{ color: '#0F172A' }}>#{activeTooltipModel.artificial_analysis_rank}</strong></div>
                                    )}
                                    {aaScore !== null && aaScore !== undefined && aaScore !== 0 && (
                                      <div>Score: <strong style={{ color: '#2563EB' }}>{aaScore.toFixed(1)}</strong></div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {hasArena && hasAA && <div style={{ borderTop: '1px dashed rgba(15, 23, 42, 0.08)', margin: '4px 0' }}></div>}
                              {hasArena && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
                                    Arena AI
                                  </div>
                                  <div style={{ display: 'flex', gap: '20px', fontSize: '13px', flexWrap: 'wrap', color: '#475569' }}>
                                    {activeTooltipModel.arena_rank !== null && activeTooltipModel.arena_rank !== undefined && (
                                      <div>Rank: <strong style={{ color: '#0F172A' }}>#{activeTooltipModel.arena_rank}</strong></div>
                                    )}
                                    {activeTooltipModel.rating > 0 && (
                                      <div>Score: <strong style={{ color: '#059669' }}>{activeTooltipModel.rating.toFixed(0)}</strong></div>
                                    )}
                                    {activeTooltipModel.votes !== null && activeTooltipModel.votes !== undefined && (
                                      <div>Votes: <strong style={{ color: '#0F172A' }}>{activeTooltipModel.votes.toLocaleString()}</strong></div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Details Grid (Metadata, Pricing, Performance) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>

                          {/* Column 1: Metadata */}
                          <div className="intel-glass-panel" style={{ gap: '6px', padding: '12px' }}>
                            <h5 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '700' }}>Metadata</h5>
                            <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div>
                                <span style={{ color: '#64748B', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>License</span>
                                <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: '#0F172A', fontWeight: '600' }}>
                                  {activeTooltipModel.license || 'N/A'}
                                </strong>
                              </div>
                              <div>
                                <span style={{ color: '#64748B', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Context</span>
                                <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A', fontWeight: '600' }}>
                                  {activeTooltipModel.context_length ? `${(activeTooltipModel.context_length / 1000).toFixed(0)}k` : 'N/A'}
                                </strong>
                              </div>
                            </div>
                          </div>

                          {/* Column 2: Pricing */}
                          {activeTooltipModel.pricing && (
                            <div className="intel-glass-panel" style={{ gap: '6px', padding: '12px' }}>
                              <h5 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '700' }}>Pricing (/1M)</h5>
                              <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div>
                                  <span style={{ color: '#64748B', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Blended</span>
                                  <strong style={{ color: '#D97706', display: 'block', fontSize: '14px', fontWeight: '700' }}>
                                    ${(activeTooltipModel.pricing.price_1m_blended_3_to_1 || 0).toFixed(2)}
                                  </strong>
                                </div>
                                <div>
                                  <span style={{ color: '#64748B', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Input</span>
                                  <strong style={{ display: 'block', fontSize: '12px', color: '#0F172A', fontWeight: '600' }}>
                                    ${(activeTooltipModel.pricing.price_1m_input_tokens || 0).toFixed(2)}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Column 3: Performance */}
                          <div className="intel-glass-panel" style={{ gap: '6px', padding: '12px' }}>
                            <h5 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '700' }}>Performance</h5>
                            <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div>
                                <span style={{ color: '#64748B', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Speed</span>
                                <strong style={{ color: '#2563EB', display: 'block', fontSize: '13px', fontWeight: '600' }}>
                                  {activeTooltipModel.throughput > 0 ? `${activeTooltipModel.throughput} t/s` : 'N/A'}
                                </strong>
                              </div>
                              <div>
                                <span style={{ color: '#64748B', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Latency</span>
                                <strong style={{ color: '#D97706', display: 'block', fontSize: '13px', fontWeight: '600' }}>
                                  {activeTooltipModel.ttft > 0 ? `${activeTooltipModel.ttft}s` : 'N/A'}
                                </strong>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Section 3: Evaluations */}
                        {activeTooltipModel.evaluations && Object.keys(activeTooltipModel.evaluations).length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(15, 23, 42, 0.08)', paddingTop: '10px' }}>
                            <h5 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '700' }}>Evaluations & Benchmarks</h5>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {Object.entries(activeTooltipModel.evaluations).map(([key, val]) => {
                                if (val === null || val === undefined) return null;
                                return (
                                  <div
                                    key={key}
                                    className="eval-glass-pill"
                                  >
                                    <span style={{ color: '#64748B' }}>{formatEvalName(key)}:</span>
                                    <strong style={{ color: '#059669', fontWeight: '600' }}>{formatEvalValue(key, val)}</strong>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Scatter Plot Tab */}
                {activeTab === 'scatter' && (
                  <div className="intel-chart-card">

                    {/* Setup Toggles & Controls Bar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px', backgroundColor: '#F8FAFC', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                      
                      {/* Y-Axis Selector */}
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '750', textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>
                          <Activity size={13} style={{ color: 'var(--color-green-primary)' }} /> Y-Axis (Quality Metric)
                        </label>
                        <select
                          value={yAxis}
                          onChange={(e) => setYAxis(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #CBD5E1',
                            fontFamily: 'var(--font-body)',
                            fontWeight: '600',
                            fontSize: '13px',
                            backgroundColor: '#FFFFFF',
                            color: '#0F172A',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="intelligence">Intelligence Index (Overall)</option>
                          <option value="coding">Coding Agent Index</option>
                          <option value="math">Math Index</option>
                          <option value="gpqa">GPQA (Graduate Reasoning)</option>
                          <option value="hle">HLE (Humanity Last Exam)</option>
                        </select>
                      </div>

                      {/* X-Axis Selector */}
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '750', textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>
                          <TrendingUp size={13} style={{ color: 'var(--color-green-primary)' }} /> X-Axis (Efficiency Metric)
                        </label>
                        <select
                          value={xAxis}
                          onChange={(e) => setXAxis(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #CBD5E1',
                            fontFamily: 'var(--font-body)',
                            fontWeight: '600',
                            fontSize: '13px',
                            backgroundColor: '#FFFFFF',
                            color: '#0F172A',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="price">Blended Cost per 1M tokens ($)</option>
                          <option value="speed">Throughput Speed (t/s)</option>
                        </select>
                      </div>

                      {/* Scale Mode Switcher */}
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '750', textTransform: 'uppercase', color: '#475569', marginBottom: '6px' }}>
                          <Sliders size={13} style={{ color: 'var(--color-green-primary)' }} /> Distribution Scale
                        </label>
                        <div style={{ display: 'flex', backgroundColor: '#E2E8F0', padding: '3px', borderRadius: '8px', gap: '3px' }}>
                          <button
                            type="button"
                            onClick={() => setScaleMode('log')}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: scaleMode === 'log' ? '700' : '550',
                              backgroundColor: scaleMode === 'log' ? '#FFFFFF' : 'transparent',
                              color: scaleMode === 'log' ? 'var(--color-green-text)' : '#64748B',
                              boxShadow: scaleMode === 'log' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Sparkle size={11} /> Log Scale (Best)
                          </button>
                          <button
                            type="button"
                            onClick={() => setScaleMode('linear')}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: scaleMode === 'linear' ? '700' : '550',
                              backgroundColor: scaleMode === 'linear' ? '#FFFFFF' : 'transparent',
                              color: scaleMode === 'linear' ? 'var(--color-green-text)' : '#64748B',
                              boxShadow: scaleMode === 'linear' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            Linear
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Filter & View Toggles */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', padding: '0 4px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={showFrontierLine}
                            onChange={(e) => setShowFrontierLine(e.target.checked)}
                            style={{ accentColor: 'var(--color-green-primary)', width: '15px', height: '15px' }}
                          />
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '10px', height: '3px', backgroundColor: '#10B981', borderRadius: '2px', display: 'inline-block' }}></span>
                            Pareto Frontier (Optimal Value Curve)
                          </span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={showScatterLabels}
                            onChange={(e) => setShowScatterLabels(e.target.checked)}
                            style={{ accentColor: 'var(--color-green-primary)', width: '15px', height: '15px' }}
                          />
                          Show Landmark Model Badges
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={filterOutliers}
                            onChange={(e) => setFilterOutliers(e.target.checked)}
                            style={{ accentColor: 'var(--color-green-primary)', width: '15px', height: '15px' }}
                          />
                          Focus Mainstream ({xAxis === 'price' ? '≤ $30/M' : '≤ 600 t/s'})
                        </label>
                      </div>

                      {/* Active points count badge */}
                      <div style={{ fontSize: '12px', fontWeight: '650', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                        {scatterPoints.length} models mapped
                      </div>
                    </div>

                    {/* Report-style interactive workspace */}
                    <div className="intel-scatter-workspace" style={{ borderRadius: '18px', border: '1px solid #E2E8F0', padding: '20px 16px 12px 16px', background: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>

                      <div className="intel-scatter-caption" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px 12px 12px', borderBottom: '1px solid #F1F5F9', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '750', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#3B82F6' }}></span>
                          QUALITY: {yAxis.toUpperCase()} INDEX (0–100)
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', backgroundColor: '#F1F5F9', padding: '4px 10px', borderRadius: '20px' }}>
                          {scaleMode === 'log' ? '⚡ Logarithmic Scale — Models distributed evenly across tiers' : 'Linear Scale'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '750', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          EFFICIENCY: {xAxis === 'price' ? 'BLENDED COST ($/1M)' : 'OUTPUT SPEED (T/S)'}
                          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#10B981' }}></span>
                        </div>
                      </div>

                      <svg viewBox="0 0 880 500" style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                        <defs>
                          {/* Frontier Curve Gradient */}
                          <linearGradient id="frontierCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="50%" stopColor="#06B6D4" />
                            <stop offset="100%" stopColor="#3B82F6" />
                          </linearGradient>

                          {/* Optimal Value Zone Radial Aura */}
                          <radialGradient id="optimalZoneAura" cx="15%" cy="20%" r="50%">
                            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.08)" />
                            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.0)" />
                          </radialGradient>

                          {/* Subtle Card Drop Shadow */}
                          <filter id="pillShadow" x="-10%" y="-20%" width="130%" height="150%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.08" />
                          </filter>
                        </defs>

                        {/* Optimal Value Zone Watermark / Background tint */}
                        <rect x="80" y="45" width="360" height="200" fill="url(#optimalZoneAura)" rx="14" />
                        <text x="95" y="70" style={{ fill: '#059669', fontSize: '10.5px', fontWeight: '800', letterSpacing: '0.05em', opacity: 0.75 }}>
                          ★ OPTIMAL VALUE ZONE (High Quality, Low Cost)
                        </text>

                        {/* Horizontal Gridlines & Y-Ticks */}
                        {[0, 25, 50, 75, 100].map((val) => {
                          const y = 500 - 65 - (val / 100) * (500 - 45 - 65);
                          return (
                            <g key={`y-${val}`}>
                              <line x1="80" y1={y} x2="835" y2={y} stroke={val === 0 ? '#94A3B8' : '#F1F5F9'} strokeWidth={val === 0 ? 1.5 : 1} strokeDasharray={val === 0 ? 'none' : '4 4'} />
                              <text x="68" y={y + 4} textAnchor="end" style={{ fill: '#64748B', fontSize: '11px', fontWeight: '650' }}>
                                {val}
                              </text>
                            </g>
                          );
                        })}

                        {/* Vertical Gridlines & X-Ticks */}
                        {xTicks.map((tick, i) => (
                          <g key={`x-${i}`}>
                            <line x1={tick.x} y1="45" x2={tick.x} y2="435" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                            <text x={tick.x} y="456" textAnchor="middle" style={{ fill: '#64748B', fontSize: '11px', fontWeight: '650' }}>
                              {tick.label}
                            </text>
                          </g>
                        ))}

                        {/* Axis Base Border Lines */}
                        <line x1="80" y1="45" x2="80" y2="435" stroke="#CBD5E1" strokeWidth="1.5" />
                        <line x1="80" y1="435" x2="835" y2="435" stroke="#CBD5E1" strokeWidth="1.5" />

                        {/* X-Axis Title Label */}
                        <text x="457" y="488" textAnchor="middle" style={{ fill: '#475569', fontSize: '12px', fontWeight: '750' }}>
                          {xAxis === 'price' ? 'Blended Cost per 1M Tokens (3:1 input:output ratio)' : 'Throughput Output Speed (median tokens / sec)'}
                        </text>

                        {/* Y-Axis Title Label */}
                        <text x="24" y="240" textAnchor="middle" transform="rotate(-90, 24, 240)" style={{ fill: '#475569', fontSize: '12px', fontWeight: '750' }}>
                          {yAxis.charAt(0).toUpperCase() + yAxis.slice(1)} Index Score (0–100)
                        </text>

                        {/* Pareto Frontier Curve */}
                        {showFrontierLine && paretoPathD && (
                          <g>
                            <path
                              d={paretoPathD}
                              stroke="url(#frontierCurveGrad)"
                              strokeWidth="3"
                              fill="none"
                              strokeLinecap="round"
                              style={{ filter: 'drop-shadow(0 2px 4px rgba(16,185,129,0.25))' }}
                            />
                            {paretoFrontierPoints.map((pt, i) => (
                              <circle
                                key={`pareto-dot-${i}`}
                                cx={pt.x}
                                cy={pt.y}
                                r="5.5"
                                fill="#FFFFFF"
                                stroke="#10B981"
                                strokeWidth="2.5"
                              />
                            ))}
                          </g>
                        )}

                        {/* Scatter Points */}
                        {scatterPoints.map((pt, idx) => {
                          const color = getDeveloperColor(pt.model.creator);
                          const isHovered = hoveredChartPoint?.model.slug === pt.model.slug;
                          const isSelected = selectedScatterPoint?.model.slug === pt.model.slug;
                          const isFilteredOut = activeLegendProvider && !pt.model.creator?.toLowerCase().includes(activeLegendProvider.toLowerCase());

                          return (
                            <g
                              key={idx}
                              onClick={() => setSelectedScatterPoint(pt)}
                              onMouseEnter={() => setHoveredChartPoint(pt)}
                              onMouseLeave={() => setHoveredChartPoint(null)}
                              style={{ cursor: 'pointer' }}
                            >
                              {/* Pulsing halo ring on hover/select */}
                              {(isHovered || isSelected) && (
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="16"
                                  fill="none"
                                  stroke={color}
                                  strokeWidth="2"
                                  opacity="0.45"
                                />
                              )}
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered || isSelected ? 9 : pt.isKeyModel ? 6.5 : 4.5}
                                fill={color}
                                stroke="#FFFFFF"
                                strokeWidth={isHovered || isSelected ? 2.5 : 1.2}
                                opacity={isFilteredOut ? 0.12 : 0.9}
                                style={{ transition: 'r 0.18s ease, fill 0.18s ease' }}
                              />
                            </g>
                          );
                        })}

                        {/* Smart Landmark Labels (De-duplicated & anti-collision badge pills) */}
                        {showScatterLabels && scatterPoints.map((pt, idx) => {
                          if (!pt.isKeyModel && hoveredChartPoint?.model.slug !== pt.model.slug && selectedScatterPoint?.model.slug !== pt.model.slug) {
                            return null;
                          }
                          const isHighlighted = hoveredChartPoint?.model.slug === pt.model.slug || selectedScatterPoint?.model.slug === pt.model.slug;
                          const cleanName = pt.model.name.replace(/^(Anthropic|OpenAI|Google|Meta|DeepSeek|Mistral|xAI|Qwen):\s*/i, '').slice(0, 22);

                          const labelX = pt.x + 10;
                          const labelY = pt.y - 12;

                          return (
                            <g key={`badge-${idx}`} style={{ pointerEvents: 'none' }}>
                              <line
                                x1={pt.x}
                                y1={pt.y}
                                x2={labelX}
                                y2={labelY + 6}
                                stroke="#94A3B8"
                                strokeWidth="1"
                                opacity="0.6"
                              />
                              <rect
                                x={labelX}
                                y={labelY - 6}
                                width={cleanName.length * 6.6 + 14}
                                height="18"
                                rx="5"
                                fill={isHighlighted ? '#0F172A' : 'rgba(255,255,255,0.96)'}
                                stroke={isHighlighted ? '#0F172A' : '#CBD5E1'}
                                strokeWidth="1"
                                filter="url(#pillShadow)"
                              />
                              <text
                                x={labelX + 7}
                                y={labelY + 6}
                                style={{
                                  fill: isHighlighted ? '#FFFFFF' : '#1E293B',
                                  fontSize: '9.5px',
                                  fontWeight: '750',
                                  fontFamily: 'var(--font-body)'
                                }}
                              >
                                {cleanName}
                              </text>
                            </g>
                          );
                        })}

                      </svg>

                      {/* Floating Chart Tooltip */}
                      {hoveredChartPoint && !selectedScatterPoint && (
                        <div style={{
                          position: 'absolute',
                          bottom: '24px',
                          left: '24px',
                          backgroundColor: 'rgba(255, 255, 255, 0.96)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          color: '#0F172A',
                          padding: '16px 18px',
                          borderRadius: '16px',
                          boxShadow: '0 12px 36px rgba(15,23,42,0.18)',
                          maxWidth: '310px',
                          fontSize: '13px',
                          zIndex: 10,
                          lineHeight: '1.5',
                          border: '1px solid #E2E8F0',
                          pointerEvents: 'none',
                          transition: 'all 0.15s ease'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <ProviderLogo provider={hoveredChartPoint.model.creator} size={20} />
                            <strong style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {hoveredChartPoint.model.name}
                            </strong>
                          </div>
                          <div style={{ color: '#64748B', fontSize: '11px', marginBottom: '8px', fontWeight: '600' }}>
                            Provider: {hoveredChartPoint.model.creator}
                          </div>
                          <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '8px 0' }}></div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                              <div style={{ color: '#64748B', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Quality Score</div>
                              <strong style={{ color: '#059669', fontSize: '15px' }}>{hoveredChartPoint.yVal.toFixed(1)}</strong>
                            </div>
                            <div style={{ backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                              <div style={{ color: '#64748B', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Blended Cost</div>
                              <strong style={{ color: '#D97706', fontSize: '15px' }}>${hoveredChartPoint.model.blendedPrice.toFixed(2)}/M</strong>
                            </div>
                            <div style={{ backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                              <div style={{ color: '#64748B', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Throughput</div>
                              <strong style={{ color: '#2563EB', fontSize: '13px' }}>{hoveredChartPoint.model.throughput ? `${Math.round(hoveredChartPoint.model.throughput)} t/s` : 'N/A'}</strong>
                            </div>
                            <div style={{ backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                              <div style={{ color: '#64748B', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Latency (TTFT)</div>
                              <strong style={{ color: '#7C3AED', fontSize: '13px' }}>{hoveredChartPoint.model.ttft ? `${hoveredChartPoint.model.ttft.toFixed(2)}s` : 'N/A'}</strong>
                            </div>
                          </div>
                          <div style={{ marginTop: '8px', fontSize: '10.5px', color: '#94A3B8', textAlign: 'center', fontStyle: 'italic' }}>
                            Click dot to pin details & audit
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pinned Model Inspector Box (when user clicks a dot) */}
                    {selectedScatterPoint && (
                      <div style={{ marginTop: '16px', padding: '20px 24px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1.5px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '280px' }}>
                          <ProviderLogo provider={selectedScatterPoint.model.creator} size={36} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                                {selectedScatterPoint.model.name}
                              </h4>
                              <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#E2E8F0', padding: '2px 8px', borderRadius: '12px', color: '#334155' }}>
                                {selectedScatterPoint.model.creator}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                              <span>Quality: <strong style={{ color: '#059669' }}>{selectedScatterPoint.yVal.toFixed(1)}/100</strong></span>
                              <span>•</span>
                              <span>Blended: <strong style={{ color: '#D97706' }}>${selectedScatterPoint.model.blendedPrice.toFixed(2)}/1M</strong></span>
                              <span>•</span>
                              <span>Speed: <strong style={{ color: '#2563EB' }}>{selectedScatterPoint.model.throughput ? `${Math.round(selectedScatterPoint.model.throughput)} t/s` : 'N/A'}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => {
                              if (onNavigateToView) onNavigateToView('auditor');
                            }}
                            className="btn btn-green"
                            style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
                          >
                            <Crosshair size={14} /> Audit in Model Auditor
                          </button>
                          <button
                            onClick={() => setSelectedScatterPoint(null)}
                            className="btn btn-outline"
                            style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', backgroundColor: '#FFFFFF' }}
                          >
                            Close Inspector
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Interactive Provider Filter Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setActiveLegendProvider(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          border: activeLegendProvider === null ? '1.5px solid var(--color-green-primary)' : '1px solid #E2E8F0',
                          backgroundColor: activeLegendProvider === null ? '#ECFDF5' : '#FFFFFF',
                          color: activeLegendProvider === null ? 'var(--color-green-text)' : '#64748B',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        All Providers
                      </button>

                      {[
                        { name: 'OpenAI', color: '#10B981' },
                        { name: 'Anthropic', color: '#F97316' },
                        { name: 'Google', color: '#3B82F6' },
                        { name: 'Meta', color: '#8B5CF6' },
                        { name: 'DeepSeek', color: '#06B6D4' },
                        { name: 'Mistral', color: '#EF4444' },
                        { name: 'Qwen/Alibaba', color: '#14B8A6' },
                        { name: 'Cohere', color: '#D97706' }
                      ].map(dev => {
                        const isActive = activeLegendProvider === dev.name;
                        return (
                          <button
                            key={dev.name}
                            type="button"
                            onClick={() => setActiveLegendProvider(isActive ? null : dev.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              border: isActive ? `1.5px solid ${dev.color}` : '1px solid #E2E8F0',
                              backgroundColor: isActive ? `${dev.color}15` : '#FFFFFF',
                              color: isActive ? '#0F172A' : '#64748B',
                              fontSize: '11.5px',
                              fontWeight: isActive ? '750' : '600',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dev.color }}></span>
                            {dev.name}
                          </button>
                        );
                      })}
                    </div>

                  </div>
                )}

                {/* 3. Explorer Tab (Frontier Text LLMs Table) */}
                {activeTab === 'explorer' && (
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px 32px', boxShadow: 'var(--shadow-sm)' }}>

                    {/* Header Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Database size={18} style={{ color: 'var(--color-green-primary)' }} /> Frontier Text LLMs Explorer
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748B' }}>
                          Showing {sortedExplorerData.length} live benchmarked models. Click any column header to sort.
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Rows per page:</span>
                        <select
                          value={rowsPerPage}
                          onChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value));
                            setTablePage(1);
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: '#F8FAFC',
                            cursor: 'pointer'
                          }}
                        >
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                          <option value={-1}>All ({sortedExplorerData.length})</option>
                        </select>
                      </div>
                    </div>

                    {/* Table Render */}
                    <div style={{ overflowX: 'auto' }}>
                      <table className="intel-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569', backgroundColor: '#F8FAFC' }}>
                            <th onClick={() => handleSort('name')} style={{ padding: '12px 14px', cursor: 'pointer', fontWeight: '800' }}>
                              Model Name {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('creator')} style={{ padding: '12px 14px', cursor: 'pointer', fontWeight: '800' }}>
                              Developer {sortConfig.key === 'creator' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('intelligence_index')} style={{ padding: '12px 10px', cursor: 'pointer', fontWeight: '800', textAlign: 'center' }}>
                              Quality Score {sortConfig.key === 'intelligence_index' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('coding_index')} style={{ padding: '12px 10px', cursor: 'pointer', fontWeight: '800', textAlign: 'center' }}>
                              Coding Index {sortConfig.key === 'coding_index' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('math_index')} style={{ padding: '12px 10px', cursor: 'pointer', fontWeight: '800', textAlign: 'center' }}>
                              Math Index {sortConfig.key === 'math_index' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('throughput')} style={{ padding: '12px 10px', cursor: 'pointer', fontWeight: '800', textAlign: 'center' }}>
                              Speed (t/s) {sortConfig.key === 'throughput' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('ttft')} style={{ padding: '12px 10px', cursor: 'pointer', fontWeight: '800', textAlign: 'center' }}>
                              Latency (TTFT) {sortConfig.key === 'ttft' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th onClick={() => handleSort('blendedPrice')} style={{ padding: '12px 14px', cursor: 'pointer', fontWeight: '800', textAlign: 'right' }}>
                              Blended Cost/1M {sortConfig.key === 'blendedPrice' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                            </th>
                            <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '800' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedExplorerData.map((row, idx) => (
                            <tr key={`${row.slug}-${idx}`} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }} className="table-row-hover">
                              <td style={{ padding: '12px 14px', fontWeight: '750', color: '#0F172A' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <ProviderLogo provider={row.creator} size={18} />
                                  <span>{row.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 14px', color: '#475569' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: getDeveloperColor(row.creator) }}></span>
                                  <span>{row.creator}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '800', color: row.intelligence_index ? '#059669' : '#94A3B8' }}>
                                {row.intelligence_index !== null && row.intelligence_index !== undefined ? row.intelligence_index.toFixed(1) : '-'}
                              </td>
                              <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600', color: '#334155' }}>
                                {row.coding_index !== null && row.coding_index !== undefined ? row.coding_index.toFixed(1) : '-'}
                              </td>
                              <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600', color: '#334155' }}>
                                {row.math_index !== null && row.math_index !== undefined ? row.math_index.toFixed(1) : '-'}
                              </td>
                              <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '750', color: '#2563EB' }}>
                                {row.throughput !== null && row.throughput !== undefined && row.throughput > 0 ? `${Math.round(row.throughput)} t/s` : '-'}
                              </td>
                              <td style={{ padding: '12px 10px', textAlign: 'center', color: '#64748B', fontWeight: '600' }}>
                                {row.ttft !== null && row.ttft !== undefined && row.ttft > 0 ? `${row.ttft.toFixed(2)}s` : '-'}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: '#D97706' }}>
                                ${row.blendedPrice.toFixed(2)}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                <button
                                  onClick={() => {
                                    if (onNavigateToView) onNavigateToView('auditor');
                                  }}
                                  className="btn btn-outline"
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '11.5px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--color-green-primary)',
                                    color: 'var(--color-green-text)',
                                    backgroundColor: '#FFFFFF',
                                    cursor: 'pointer',
                                    fontWeight: '700'
                                  }}
                                >
                                  Audit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {rowsPerPage !== -1 && totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: '600' }}>
                          Showing {((tablePage - 1) * rowsPerPage) + 1}–{Math.min(tablePage * rowsPerPage, sortedExplorerData.length)} of {sortedExplorerData.length} models
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            disabled={tablePage <= 1}
                            onClick={() => setTablePage(p => Math.max(1, p - 1))}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: tablePage <= 1 ? '#F1F5F9' : '#FFFFFF',
                              color: tablePage <= 1 ? '#94A3B8' : '#0F172A',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: tablePage <= 1 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            ← Previous
                          </button>

                          <span style={{ fontSize: '12px', fontWeight: '750', color: '#334155', padding: '0 8px' }}>
                            Page {tablePage} of {totalPages}
                          </span>

                          <button
                            type="button"
                            disabled={tablePage >= totalPages}
                            onClick={() => setTablePage(p => Math.min(totalPages, p + 1))}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: tablePage >= totalPages ? '#F1F5F9' : '#FFFFFF',
                              color: tablePage >= totalPages ? '#94A3B8' : '#0F172A',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: tablePage >= totalPages ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>

          </>
        )}

      </main>

    </div>
  );
}
