import React, { useState, useEffect, useMemo, useDeferredValue, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { Trophy, TrendingUp, Database, Zap, Sparkles, Image, Video, Check, ChevronDown } from 'lucide-react';
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
  const [showScatterLabels, setShowScatterLabels] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreators, setSelectedCreators] = useState(new Set());
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Explorer settings
  const [explorerCategory, setExplorerCategory] = useState('llms'); // 'llms', 'text_to_image', 'text_to_video', 'text_to_speech'
  const [sortConfig, setSortConfig] = useState({ key: 'intelligence_index', direction: 'descending' });

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
        let tooltipHeight = 450;
        if (tooltipRef.current) {
          const rect = tooltipRef.current.getBoundingClientRect();
          if (rect.width > 0) tooltipWidth = rect.width;
          if (rect.height > 0) tooltipHeight = rect.height;
        }
        const padding = 16;

        let left = x + 20;
        if (left + tooltipWidth + padding > window.innerWidth) {
          left = x - tooltipWidth - 20;
        }
        if (left < padding) {
          left = padding;
        }

        let top = y + 10;
        if (top + tooltipHeight + padding > window.innerHeight) {
          top = y - tooltipHeight - 10;
        }
        if (top < padding) {
          top = padding;
        }

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

  // Fetch raw analysis data from the backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/audits/analysis/raw-data`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch raw market data');
        return res.json();
      })
      .then(data => {
        setIntelData(data);
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

  // Spotlight cards calculations
  const spotlightStats = useMemo(() => {
    if (!intelData) return { speedChampion: null, bestValue: null, topImage: null, topVideo: null };
    const llms = intelData.llms || [];

    let speedChampion = null;
    let maxThroughput = -1;
    llms.forEach(m => {
      if (m.throughput && m.throughput > maxThroughput) {
        maxThroughput = m.throughput;
        speedChampion = m;
      }
    });

    let bestValue = null;
    let minPrice = Infinity;
    llms.forEach(m => {
      if (m.intelligence_index && m.intelligence_index >= 75 && m.blendedPrice < minPrice) {
        minPrice = m.blendedPrice;
        bestValue = m;
      }
    });

    const media = intelData.media || {};
    const imgModels = media.text_to_image || [];
    const vidModels = media.text_to_video || [];

    const topImage = imgModels.find(m => m.rank === 1) || imgModels[0] || null;
    const topVideo = vidModels.find(m => m.rank === 1) || vidModels[0] || null;

    return { speedChampion, bestValue, topImage, topVideo };
  }, [intelData]);

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
      let models = categoryModels.map(catModel => {
        const inputCost = catModel.pricing?.price_1m_input_tokens || 0;
        const outputCost = catModel.pricing?.price_1m_output_tokens || 0;
        const blendedPrice = catModel.pricing?.price_1m_blended_3_to_1 || (inputCost * 0.75 + outputCost * 0.25);

        return {
          ...catModel,
          name: catModel.name || catModel.model_name || catModel.slug,
          creator: catModel.organization || catModel.model_creator?.name || 'Unknown',
          rating: catModel.rating || catModel.arena_elo || 0,
          rank: catModel.rank,
          intelligence_index: catModel.evaluations?.artificial_analysis_intelligence_index || null,
          coding_index: catModel.evaluations?.artificial_analysis_coding_index || null,
          math_index: catModel.evaluations?.artificial_analysis_math_index || null,
          gpqa: catModel.evaluations?.gpqa || null,
          hle: catModel.evaluations?.hle || null,
          throughput: catModel.median_output_tokens_per_second || null,
          ttft: catModel.median_time_to_first_token_seconds || null,
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

  const maxScatterX = useMemo(() => {
    if (chartData.length === 0) return 100;
    const maxVal = Math.max(...chartData.map(d => xAxis === 'price' ? d.blendedPrice : d.throughput));
    return maxVal > 0 ? maxVal * 1.08 : 100;
  }, [chartData, xAxis]);

  const scatterPoints = useMemo(() => {
    const paddingLeft = 70;
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 60;
    const width = 840 - paddingLeft - paddingRight;
    const height = 480 - paddingTop - paddingBottom;

    return chartData.map(m => {
      let xVal = xAxis === 'price' ? m.blendedPrice : m.throughput;
      let yVal = 0;
      if (yAxis === 'intelligence') yVal = m.intelligence_index;
      else if (yAxis === 'coding') yVal = m.coding_index;
      else if (yAxis === 'math') yVal = m.math_index;
      else if (yAxis === 'gpqa') yVal = m.gpqa ? m.gpqa * 100 : 0;
      else if (yAxis === 'hle') yVal = m.hle ? m.hle * 100 : 0;

      const x = paddingLeft + (xVal / maxScatterX) * width;
      const y = 480 - paddingBottom - (yVal / 100) * height;

      // Key models that are highly visible will have direct textual labels in the scatter plot
      const isKeyModel = [
        'claude-fable-5', 'gpt-5-5-pro', 'gemini-3-5-flash', 'claude-opus-4-8', 'gemini-3-1-pro', 'grok-4-20', 'gemini-3-pro', 'gpt-5-4', 'qwen3-7-max', 'muse-spark'
      ].some(k => m.slug?.toLowerCase().includes(k));

      return { x, y, model: m, xVal, yVal, isKeyModel };
    });
  }, [chartData, xAxis, yAxis, maxScatterX]);

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

    let list = [];
    if (explorerCategory === 'llms') {
      // Use filtered list for LLMs if user is searching/filtering
      list = [...filteredLlms];
    } else {
      list = [...(intelData.media?.[explorerCategory] || [])];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(m =>
          (m.name || '').toLowerCase().includes(q) ||
          (m.creator || '').toLowerCase().includes(q)
        );
      }
    }

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
  }, [intelData, explorerCategory, filteredLlms, searchQuery, sortConfig]);

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
            {/* Spotlight Grid */}
            <div className="spotlight-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>

              <div className="spotlight-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s ease', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Zap size={20} style={{ color: '#0284c7' }} />
                  <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '3px 8px', borderRadius: '9999px', textTransform: 'uppercase' }}>Speed</span>
                </div>
                <div className="spotlight-label" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Speed Champion</div>
                <div className="spotlight-value" style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
                  {spotlightStats.speedChampion ? `${spotlightStats.speedChampion.throughput} t/s` : 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getDeveloperColor(spotlightStats.speedChampion?.creator) }}></span>
                  {spotlightStats.speedChampion ? spotlightStats.speedChampion.name : 'N/A'}
                </div>
              </div>

              <div className="spotlight-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s ease', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Sparkles size={20} style={{ color: '#059669' }} />
                  <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#ECFDF5', color: '#047857', padding: '3px 8px', borderRadius: '9999px', textTransform: 'uppercase' }}>Value</span>
                </div>
                <div className="spotlight-label" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Best Frontier Value</div>
                <div className="spotlight-value" style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
                  {spotlightStats.bestValue ? `$${spotlightStats.bestValue.blendedPrice.toFixed(2)}/M` : 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getDeveloperColor(spotlightStats.bestValue?.creator) }}></span>
                  {spotlightStats.bestValue ? spotlightStats.bestValue.name : 'N/A'}
                </div>
              </div>

              <div className="spotlight-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s ease', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Image size={20} style={{ color: '#dc2626' }} />
                  <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '3px 8px', borderRadius: '9999px', textTransform: 'uppercase' }}>Image</span>
                </div>
                <div className="spotlight-label" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Top Image Model</div>
                <div className="spotlight-value" style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
                  {spotlightStats.topImage ? `ELO ${spotlightStats.topImage.elo}` : 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getDeveloperColor(spotlightStats.topImage?.creator) }}></span>
                  {spotlightStats.topImage ? spotlightStats.topImage.name : 'N/A'}
                </div>
              </div>

              <div className="spotlight-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s ease', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Video size={20} style={{ color: '#7c3aed' }} />
                  <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#FAF5FF', color: '#6B21A8', padding: '3px 8px', borderRadius: '9999px', textTransform: 'uppercase' }}>Video</span>
                </div>
                <div className="spotlight-label" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>Top Video Model</div>
                <div className="spotlight-value" style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
                  {spotlightStats.topVideo ? `ELO ${spotlightStats.topVideo.elo}` : 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getDeveloperColor(spotlightStats.topVideo?.creator) }}></span>
                  {spotlightStats.topVideo ? spotlightStats.topVideo.name : 'N/A'}
                </div>
              </div>

            </div>

            {/* Filter controls panel (Search, Providers) */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', alignItems: 'start', marginBottom: '40px' }}>

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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
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
                            onMouseEnter={() => {
                              if (tooltipTimeoutRef.current) {
                                clearTimeout(tooltipTimeoutRef.current);
                                tooltipTimeoutRef.current = null;
                              }
                              setHoveredModel(model);
                              setActiveTooltipModel(model);
                              setIsTooltipVisible(true);
                            }}
                            onMouseMove={handleRowMouseMove}
                            onMouseLeave={() => {
                              setHoveredModel(null);
                              tooltipTimeoutRef.current = setTimeout(() => {
                                setIsTooltipVisible(false);
                              }, 60);
                            }}
                            onFocus={() => {
                              setHoveredModel(model);
                              setActiveTooltipModel(model);
                              setIsTooltipVisible(true);
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
                          transform: `translate3d(${tooltipPos.left}px, ${tooltipPos.top + (isTooltipVisible ? 0 : 8)}px, 0) scale(${isTooltipVisible ? 1 : 0.98})`,
                          opacity: isTooltipVisible ? 1 : 0,
                          visibility: isTooltipVisible ? 'visible' : 'hidden',
                          pointerEvents: 'none',
                          width: 'min(420px, calc(100vw - 32px))',
                          height: 'auto',
                          zIndex: 9999,
                          padding: '18px',
                          background: 'rgba(255, 255, 255, 0.78)',
                          backdropFilter: 'blur(24px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                          borderRadius: '24px',
                          color: '#0F172A',
                          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
                          border: '1px solid rgba(255, 255, 255, 0.55)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>

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

                    {/* Setup Toggles */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Y-Axis Quality metric</label>
                        <select
                          value={yAxis}
                          onChange={(e) => setYAxis(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            fontFamily: 'var(--font-body)',
                            fontWeight: '600',
                            fontSize: '13.5px'
                          }}
                        >
                          <option value="intelligence">Intelligence Index</option>
                          <option value="coding">Coding Index</option>
                          <option value="math">Math Index</option>
                          <option value="gpqa">GPQA (Graduate Level Reasoning)</option>
                          <option value="hle">HLE (Humanity Last Exam)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>X-Axis Performance metric</label>
                        <select
                          value={xAxis}
                          onChange={(e) => setXAxis(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            fontFamily: 'var(--font-body)',
                            fontWeight: '600',
                            fontSize: '13.5px'
                          }}
                        >
                          <option value="price">Blended Cost per 1M tokens ($)</option>
                          <option value="speed">Throughput Speed (t/s)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifySelf: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={showScatterLabels}
                          onChange={(e) => setShowScatterLabels(e.target.checked)}
                          style={{ accentColor: 'var(--color-green-primary)' }}
                        />
                        Show direct name labels for top frontier models
                      </label>
                    </div>

                    {/* White, report-style workspace keeps the data easy to print and compare. */}
                    <div className="intel-scatter-workspace">

                      <div className="intel-scatter-caption">
                        <strong>Quality Index: {yAxis.toUpperCase()}</strong>
                        <strong>Efficiency Index: {xAxis === 'price' ? 'Cost' : 'Speed'}</strong>
                      </div>

                      <svg viewBox="0 0 840 480" style={{ width: '100%', height: '100%', display: 'block' }}>

                        {/* Horizontal Ticks (Y) */}
                        {Array.from({ length: 5 }).map((_, i) => {
                          const val = 25 * i;
                          const y = 420 - (val / 100) * 380;
                          return (
                            <g key={i}>
                              <line x1="70" y1={y} x2="800" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                              <text x="55" y={y + 4} textAnchor="end" style={{ fill: '#64748B', fontSize: '11px', fontWeight: '600' }}>
                                {val}
                              </text>
                            </g>
                          );
                        })}

                        {/* Vertical Ticks (X) */}
                        {Array.from({ length: 5 }).map((_, i) => {
                          const val = (maxScatterX / 4) * i;
                          const x = 70 + (i / 4) * 730;
                          return (
                            <g key={i}>
                              <line x1={x} y1="40" x2={x} y2="420" stroke="#E2E8F0" strokeDasharray="3 3" />
                              <text x={x} y="442" textAnchor="middle" style={{ fill: '#64748B', fontSize: '11px', fontWeight: '600' }}>
                                {xAxis === 'price' ? `$${val.toFixed(1)}` : `${Math.round(val)}`}
                              </text>
                            </g>
                          );
                        })}

                        {/* Title Labels */}
                        <text x="435" y="470" textAnchor="middle" style={{ fill: '#94A3B8', fontSize: '12px', fontWeight: '700' }}>
                          {xAxis === 'price' ? 'Cost per 1M Blended Tokens (3:1 input:output ratio)' : 'Median output tokens per second'}
                        </text>
                        <text x="20" y="230" textAnchor="middle" transform="rotate(-90, 20, 230)" style={{ fill: '#94A3B8', fontSize: '12px', fontWeight: '700' }}>
                          {yAxis.charAt(0).toUpperCase() + yAxis.slice(1)} score
                        </text>

                        {/* Axis Base Lines */}
                        <line x1="70" y1="40" x2="70" y2="420" stroke="#94A3B8" strokeWidth="1.5" />
                        <line x1="70" y1="420" x2="800" y2="420" stroke="#94A3B8" strokeWidth="1.5" />

                        {/* Direct Name Labels (Replicates the beautiful text labeling in AA) */}
                        {showScatterLabels && scatterPoints.map((pt, idx) => {
                          if (!pt.isKeyModel) return null;
                          return (
                            <text
                              key={`lbl-${idx}`}
                              x={pt.x + 8}
                              y={pt.y - 4}
                              style={{
                                fill: '#334155',
                                fontSize: '10px',
                                fontWeight: '700',
                                pointerEvents: 'none',
                                textShadow: '0 1px 0 #fff'
                              }}
                            >
                              {pt.model.name.replace(/(OpenAI|Anthropic|Google|Meta|DeepSeek):\s*/i, '')}
                            </text>
                          );
                        })}

                        {/* Points */}
                        {scatterPoints.map((pt, idx) => {
                          const color = getDeveloperColor(pt.model.creator);
                          const isHovered = hoveredChartPoint?.model.slug === pt.model.slug;
                          return (
                            <circle
                              key={idx}
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 12 : pt.isKeyModel ? 7 : 5.5}
                              fill={color}
                              stroke="#FFFFFF"
                              strokeWidth={isHovered ? 2.5 : 1}
                              style={{ cursor: 'pointer', transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)' }}
                              onMouseEnter={() => setHoveredChartPoint(pt)}
                              onMouseLeave={() => setHoveredChartPoint(null)}
                            />
                          );
                        })}

                      </svg>

                      {/* Floating Chart Tooltip Overlay */}
                      {hoveredChartPoint && (
                        <div style={{
                          position: 'absolute',
                          bottom: '24px',
                          left: '24px',
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                          padding: '16px',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(15,23,42,0.16)',
                          maxWidth: '280px',
                          fontSize: '13px',
                          zIndex: 10,
                          lineHeight: '1.5',
                          border: '1px solid var(--color-border)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getDeveloperColor(hoveredChartPoint.model.creator) }}></span>
                            <strong style={{ fontSize: '14.5px' }}>{hoveredChartPoint.model.name}</strong>
                          </div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '8px' }}>Developer: {hoveredChartPoint.model.creator}</div>
                          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }}></div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <div style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>Quality score</div>
                              <strong>{hoveredChartPoint.yVal.toFixed(1)}</strong>
                            </div>
                            <div>
                              <div style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>Blended Cost</div>
                              <strong>${hoveredChartPoint.model.blendedPrice.toFixed(2)}/M</strong>
                            </div>
                            <div>
                              <div style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>Throughput</div>
                              <strong>{hoveredChartPoint.model.throughput ? `${hoveredChartPoint.model.throughput} t/s` : 'N/A'}</strong>
                            </div>
                            <div>
                              <div style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>Latency (TTFT)</div>
                              <strong>{hoveredChartPoint.model.ttft ? `${hoveredChartPoint.model.ttft.toFixed(2)}s` : 'N/A'}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scatter Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px', justifyContent: 'center' }}>
                      {[
                        { name: 'OpenAI', color: '#10B981' },
                        { name: 'Anthropic', color: '#F97316' },
                        { name: 'Google', color: '#3B82F6' },
                        { name: 'Meta', color: '#8B5CF6' },
                        { name: 'DeepSeek', color: '#06B6D4' },
                        { name: 'Mistral', color: '#EF4444' },
                        { name: 'Qwen/Alibaba', color: '#14B8A6' }
                      ].map(dev => (
                        <div key={dev.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dev.color }}></span>
                          {dev.name}
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {/* 3. Explorer Tab (Rich Table Interface) */}
                {activeTab === 'explorer' && (
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>

                    {/* Category Nav Selector */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'llms', label: 'Frontier Text LLMs' },
                        { id: 'text_to_image', label: 'Text-to-Image' },
                        { id: 'text_to_video', label: 'Text-to-Video' },
                        { id: 'text_to_speech', label: 'Text-to-Speech' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setExplorerCategory(cat.id);
                            // Auto reset sorting keys depending on categories
                            if (cat.id === 'llms') {
                              setSortConfig({ key: 'intelligence_index', direction: 'descending' });
                            } else {
                              setSortConfig({ key: 'rank', direction: 'ascending' });
                            }
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            backgroundColor: explorerCategory === cat.id ? '#0F172A' : '#FFFFFF',
                            color: explorerCategory === cat.id ? '#FFFFFF' : 'var(--color-text-secondary)',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Table Render */}
                    <div style={{ overflowX: 'auto' }}>
                      {explorerCategory === 'llms' ? (
                        <table className="intel-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                              <th onClick={() => handleSort('name')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800' }}>Model Name {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                              <th onClick={() => handleSort('creator')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800' }}>Creator {sortConfig.key === 'creator' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                              <th onClick={() => handleSort('intelligence_index')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800', textAlign: 'center' }}>Quality Index {sortConfig.key === 'intelligence_index' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                              <th onClick={() => handleSort('coding_index')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800', textAlign: 'center' }}>Coding Index {sortConfig.key === 'coding_index' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                              <th onClick={() => handleSort('math_index')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800', textAlign: 'center' }}>Math Index {sortConfig.key === 'math_index' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                              <th onClick={() => handleSort('throughput')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800', textAlign: 'center' }}>Speed (t/s) {sortConfig.key === 'throughput' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                              <th onClick={() => handleSort('blendedPrice')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800', textAlign: 'right' }}>Cost / 1M {sortConfig.key === 'blendedPrice' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedExplorerData.map((row, idx) => (
                              <tr key={`${row.slug}-${idx}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '12px 8px', fontWeight: '750' }}>{row.name}</td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getDeveloperColor(row.creator) }}></span>
                                    {row.creator}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '700' }}>{row.intelligence_index !== null ? row.intelligence_index.toFixed(1) : '-'}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>{row.coding_index !== null ? row.coding_index.toFixed(1) : '-'}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>{row.math_index !== null ? row.math_index.toFixed(1) : '-'}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '700', color: 'var(--color-green-primary)' }}>{row.throughput !== null ? `${row.throughput} t/s` : '-'}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '700' }}>${row.blendedPrice.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <table className="intel-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                              <th onClick={() => handleSort('rank')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800' }}>Rank {sortConfig.key === 'rank' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                              <th onClick={() => handleSort('name')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800' }}>Model Name {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                              <th onClick={() => handleSort('creator')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800' }}>Creator {sortConfig.key === 'creator' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                              <th onClick={() => handleSort('elo')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800', textAlign: 'center' }}>ELO Rating {sortConfig.key === 'elo' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                              <th onClick={() => handleSort('release_date')} style={{ padding: '12px 8px', cursor: 'pointer', fontWeight: '800', textAlign: 'right' }}>Release Date {sortConfig.key === 'release_date' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedExplorerData.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '12px 8px', fontWeight: '800' }}>#{row.rank || idx + 1}</td>
                                <td style={{ padding: '12px 8px', fontWeight: '750' }}>{row.name}</td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getDeveloperColor(row.creator) }}></span>
                                    {row.creator}
                                  </div>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '700', color: 'var(--color-green-primary)' }}>{row.elo || '-'}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'right' }}>{row.release_date || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

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
