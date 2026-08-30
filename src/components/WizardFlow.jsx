import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../config';
import { getCachedModelsList } from '../utils/dataCache';
import logoImg from '../assets/audex-ai-logo.png';
import { ProviderLogo } from './MarketIntelView';
import { 
  Search,
  Code2, 
  PenTool, 
  Calculator, 
  Database, 
  Briefcase, 
  Landmark, 
  HeartPulse, 
  Scale, 
  GraduationCap, 
  Languages, 
  Globe2, 
  MessagesSquare, 
  FileText, 
  ClipboardCheck, 
  ShieldCheck, 
  TrendingDown,
  Film, 
  FlaskConical, 
  Laptop, 
  Sparkles,
  ChevronDown,
  BarChart3,
  Gem,
  Layers,
  Bot,
  Check,
  X
} from 'lucide-react';

const PURPOSE_GROUPS = [
  {
    id: 'development',
    label: 'Development',
    options: [
      { value: 'Coding', label: 'Coding' },
      { value: 'Research', label: 'Research' },
      { value: 'Data', label: 'Data' },
      { value: 'Software', label: 'Software & IT Services' }
    ]
  },
  {
    id: 'content',
    label: 'Content & Language',
    options: [
      { value: 'Writing', label: 'Writing' },
      { value: 'Longer-query', label: 'Longer Queries' },
      { value: 'Literature', label: 'Literature & Language' },
      { value: 'Chinese', label: 'Chinese' },
      { value: 'English', label: 'English' },
      { value: 'French', label: 'French' },
      { value: 'German', label: 'German' },
      { value: 'Japanese', label: 'Japanese' },
      { value: 'Korean', label: 'Korean' },
      { value: 'Polish', label: 'Polish' },
      { value: 'Russian', label: 'Russian' },
      { value: 'Spanish', label: 'Spanish' },
      { value: 'Non-English', label: 'Non-English' }
    ]
  },
  {
    id: 'business',
    label: 'Business & Legal',
    options: [
      { value: 'Business', label: 'Business & Finance' },
      { value: 'Legal', label: 'Legal & Government' },
      { value: 'Math-industry', label: 'Mathematical Industry' }
    ]
  },
  {
    id: 'science',
    label: 'Science & Education',
    options: [
      { value: 'Healthcare', label: 'Medicine & Healthcare' },
      { value: 'Science', label: 'Life & Social Science' },
      { value: 'Expert', label: 'Expert Tasks' }
    ]
  },
  {
    id: 'core',
    label: 'Core & Workloads',
    options: [
      { value: 'Math', label: 'Math' },
      { value: 'Hard-prompts', label: 'Hard Prompts' },
      { value: 'Hard-prompts-english', label: 'Hard Prompts (English)' },
      { value: 'Instruction-following', label: 'Instruction Following' },
      { value: 'Multi-turn', label: 'Multi-turn Chat' },
      { value: 'Media', label: 'Entertainment & Media' },
      { value: 'Mixed', label: 'Mixed Workloads' }
    ]
  }
];

const PURPOSE_OPTIONS = PURPOSE_GROUPS.flatMap(g => g.options);

const getPurposeIcon = (value) => {
  switch (value) {
    case 'Coding': return Code2;
    case 'Writing': return PenTool;
    case 'Research': return Search;
    case 'Math': return Calculator;
    case 'Data': return Database;
    case 'Chinese':
    case 'English':
    case 'French':
    case 'German':
    case 'Japanese':
    case 'Korean':
    case 'Polish':
    case 'Russian':
    case 'Spanish':
    case 'Literature':
      return Languages;
    case 'Non-English':
      return Globe2;
    case 'Hard-prompts':
    case 'Hard-prompts-english':
      return ShieldCheck;
    case 'Instruction-following':
      return ClipboardCheck;
    case 'Multi-turn':
      return MessagesSquare;
    case 'Longer-query':
      return FileText;
    case 'Expert':
      return GraduationCap;
    case 'Business':
      return Briefcase;
    case 'Media':
      return Film;
    case 'Legal':
      return Scale;
    case 'Science':
      return FlaskConical;
    case 'Math-industry':
      return Calculator;
    case 'Healthcare':
      return HeartPulse;
    case 'Software':
      return Laptop;
    case 'Mixed':
      return Sparkles;
    default:
      return Sparkles;
  }
};

const getPurposeIconColor = (value) => {
  switch (value) {
    case 'Coding': return '#3B82F6';
    case 'Writing': return '#F59E0B';
    case 'Research': return '#0D9488';
    case 'Math': return '#8B5CF6';
    case 'Data': return '#10B981';
    case 'Chinese':
    case 'English':
    case 'French':
    case 'German':
    case 'Japanese':
    case 'Korean':
    case 'Polish':
    case 'Russian':
    case 'Spanish':
    case 'Literature':
      return '#06B6D4';
    case 'Non-English':
      return '#3B82F6';
    case 'Hard-prompts':
    case 'Hard-prompts-english':
      return '#EF4444';
    case 'Instruction-following':
      return '#F59E0B';
    case 'Multi-turn':
      return '#8B5CF6';
    case 'Longer-query':
      return '#10B981';
    case 'Expert':
      return '#6366F1';
    case 'Business':
      return '#F97316';
    case 'Media':
      return '#EC4899';
    case 'Legal':
      return '#64748B';
    case 'Science':
      return '#0D9488';
    case 'Math-industry':
      return '#8B5CF6';
    case 'Healthcare':
      return '#EF4444';
    case 'Software':
      return '#0F172A';
    case 'Mixed':
      return '#10B981';
    default:
      return '#10B981';
  }
};

function PurposeSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const spaceBelow = viewportHeight - rect.bottom - 16;
      const spaceAbove = rect.top - 16;
      const popupHeight = 320;

      let openDirection = 'down';
      let maxHeight = 280;

      if (spaceBelow >= popupHeight) {
        openDirection = 'down';
        maxHeight = Math.min(320, spaceBelow);
      } else if (spaceAbove > spaceBelow) {
        openDirection = 'up';
        maxHeight = Math.min(320, spaceAbove);
      } else {
        openDirection = 'down';
        maxHeight = Math.min(280, spaceBelow);
      }



      const newStyle = {
        position: 'fixed',
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        maxHeight: `${maxHeight}px`,
        boxSizing: 'border-box',
        zIndex: 9999
      };

      if (openDirection === 'down') {
        newStyle.top = `${rect.bottom + 8}px`;
        newStyle.animation = 'fadeInSlideDown 180ms ease-out forwards';
      } else {
        newStyle.bottom = `${viewportHeight - rect.top + 8}px`;
        newStyle.animation = 'fadeInSlideUp 180ms ease-out forwards';
      }

      setDropdownStyle(newStyle);
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  const selectedOption = PURPOSE_OPTIONS.find(opt => opt.value === value) || PURPOSE_OPTIONS[0];
  const SelectedIcon = getPurposeIcon(selectedOption.value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: '44px',
          padding: '0 14px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 150ms ease',
          boxSizing: 'border-box',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#94A3B8';
          e.currentTarget.style.backgroundColor = '#FAFAFA';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#10B981';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#E2E8F0';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SelectedIcon size={18} style={{ color: getPurposeIconColor(selectedOption.value), opacity: 0.9, strokeWidth: 2 }} />
          <span style={{ fontSize: '13.5px', fontWeight: '500', color: '#1E293B' }}>{selectedOption.label}</span>
        </div>
        <ChevronDown size={16} style={{ color: '#64748B', transition: 'transform 150ms ease', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {/* Floating Dropdown List */}
      {isOpen && (
        <div
          className="dropdown-scroll"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            borderRadius: '16px',
            boxShadow: '0 18px 60px rgba(15, 23, 42, 0.12)',
            overflowY: 'auto',
            padding: '6px',
            boxSizing: 'border-box',
            minWidth: '240px',
            maxWidth: '350px',
            ...dropdownStyle
          }}
        >
          <style>{`
            @keyframes fadeInSlideDown {
              from {
                opacity: 0;
                transform: translateY(-6px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes fadeInSlideUp {
              from {
                opacity: 0;
                transform: translateY(6px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .dropdown-scroll::-webkit-scrollbar {
              width: 4px;
            }
            .dropdown-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .dropdown-scroll::-webkit-scrollbar-thumb {
              background: #CBD5E1;
              border-radius: 99px;
            }
            .dropdown-scroll::-webkit-scrollbar-thumb:hover {
              background: #10B981;
            }
            
            .dropdown-item {
              display: flex;
              align-items: center;
              gap: 12px;
              width: 100%;
              height: 40px;
              padding: 0 14px;
              border: none;
              background: none;
              border-radius: 10px;
              cursor: pointer;
              text-align: left;
              transition: all 150ms ease;
              box-sizing: border-box;
              position: relative;
            }
            .dropdown-item:hover {
              background-color: #F8FAFC;
              transform: translateY(-1px);
            }
            .dropdown-item.selected {
              background-color: rgba(59, 130, 246, 0.08);
              border-left: 3px solid #3B82F6;
              border-top-left-radius: 0;
              border-bottom-left-radius: 0;
            }
            .dropdown-section-title {
              font-size: 11px;
              text-transform: uppercase;
              font-weight: 700;
              color: #94A3B8;
              letter-spacing: 0.05em;
              padding: 8px 14px 4px 14px;
            }
          `}</style>
          
          {PURPOSE_GROUPS.map((group) => (
            <div key={group.id}>
              <div className="dropdown-section-title">{group.label}</div>
              {group.options.map((option) => {
                const OptionIcon = getPurposeIcon(option.value);
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                  >
                    <OptionIcon 
                      size={18} 
                      style={{ 
                        color: getPurposeIconColor(option.value), 
                        opacity: isSelected ? 1 : 0.8,
                        strokeWidth: isSelected ? 2.5 : 2
                      }} 
                    />
                    <span 
                      style={{ 
                        fontSize: '13.5px', 
                        fontWeight: isSelected ? '600' : '500', 
                        color: isSelected ? '#1E293B' : '#475569' 
                      }}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const FEATURED_FLAGSHIPS = [
  'gpt-5.6',
  'claude opus 5',
  'gemini 3.7 flash',
  'grok 4.6',
  'deepseek v4 pro',
  'claude fable 5',
  'gpt-5.5 pro',
  'gemini 3.5 flash',
  'claude 3.7 sonnet',
  'claude 3.5 sonnet',
  'gpt-5.4',
  'gpt-5.2 codex',
  'grok 4',
  'deepseek r1',
  'qwen3.5 omni plus',
  'qwen2.5 coder 32b',
  'mistral medium 3.5',
  'muse spark'
];

const sortModelsForDisplay = (models) => {
  const cleanNameMap = new Map();
  models.forEach(m => {
    const clean = (m.rawName || m.name || m.id || '').replace(/^[^:]+:\s*/, '').toLowerCase().trim();
    cleanNameMap.set(m.id || m.slug, clean);
  });

  return [...models].sort((a, b) => {
    const cleanA = cleanNameMap.get(a.id || a.slug) || '';
    const cleanB = cleanNameMap.get(b.id || b.slug) || '';

    const idxA = FEATURED_FLAGSHIPS.findIndex(fm => cleanA.startsWith(fm) || cleanA === fm || cleanA.includes(fm));
    const idxB = FEATURED_FLAGSHIPS.findIndex(fm => cleanB.startsWith(fm) || cleanB === fm || cleanB.includes(fm));

    const isFeaturedA = idxA !== -1;
    const isFeaturedB = idxB !== -1;

    if (isFeaturedA && isFeaturedB) {
      return idxA - idxB;
    }
    if (isFeaturedA) return -1;
    if (isFeaturedB) return 1;

    // Prioritize high capability ratings
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    if (ratingA !== ratingB) {
      return ratingB - ratingA;
    }

    const nameA = (a.name || a.id || '');
    const nameB = (b.name || b.id || '');
    return nameA.localeCompare(nameB);
  });
};

export default function WizardFlow({
  currentView,
  onNavigateToView,
  tools,
  setTools,
  selectedToolIds,
  setSelectedToolIds,
  toolConfigs,
  setToolConfigs,
  optimizationGoal,
  setOptimizationGoal,
  costCutPercentage,
  setCostCutPercentage,
  user,
  apiError,
  onTriggerAudit
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [subSearchQuery, setSubSearchQuery] = useState('');
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [step1ViewMode, setStep1ViewMode] = useState('sub'); // 'sub', 'api'
  const [apiProviderFilter, setApiProviderFilter] = useState('ALL');
  const [dbModels, setDbModels] = useState([
    { id: 'openai/gpt-5-6-sol', name: 'OpenAI: GPT-5.6 Sol', developer: 'OpenAI' },
    { id: 'anthropic/claude-opus-5', name: 'Anthropic: Claude Opus 5', developer: 'Anthropic' },
    { id: 'google/gemini-3-7-flash', name: 'Google: Gemini 3.7 Flash', developer: 'Google' },
    { id: 'x-ai/grok-4-6', name: 'xAI: Grok 4.6', developer: 'xAI' },
    { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek: DeepSeek V4 Pro', developer: 'DeepSeek' },
    { id: 'anthropic/claude-fable-5', name: 'Anthropic: Claude Fable 5', developer: 'Anthropic' },
    { id: 'openai/gpt-5-5-pro', name: 'OpenAI: GPT-5.5 Pro', developer: 'OpenAI' },
    { id: 'google/gemini-3-5-flash', name: 'Google: Gemini 3.5 Flash', developer: 'Google' },
    { id: 'anthropic/claude-3-7-sonnet', name: 'Anthropic: Claude 3.7 Sonnet', developer: 'Anthropic' },
    { id: 'alibaba/qwen3-5-omni-plus', name: 'Alibaba: Qwen 3.5 Omni Plus', developer: 'Alibaba' }
  ]);

  // Fetch available models from backend for API dropdowns (cached)
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getCachedModelsList();
        if (data && data.length > 0) {
          setDbModels(data);
        }
      } catch (err) {
        console.error('Failed to fetch models list in Wizard:', err);
      }
    };
    fetchModels();
  }, []);

  const [limitWarning, setLimitWarning] = useState(null);

  const maxAllowedTools = useMemo(() => {
    if (!user) return 2;
    const plan = (user.plan || 'free').toLowerCase();
    if (plan === 'enterprise') return Infinity;
    if (plan === 'pro') return 15;
    return 2;
  }, [user]);

  // Ensure selected tools don't exceed current subscription limit
  useEffect(() => {
    if (selectedToolIds.length > maxAllowedTools) {
      setSelectedToolIds(prev => prev.slice(0, maxAllowedTools));
    }
  }, [maxAllowedTools, selectedToolIds.length, setSelectedToolIds]);

  const getLimitWarningMessage = (maxLimit) => {
    if (maxLimit === 2) {
      return 'Maximum 2 tools allowed per audit analysis on the Free plan. Upgrade your subscription to audit more tools.';
    } else if (maxLimit === 15) {
      return 'Maximum 15 tools allowed per audit analysis on the Pro plan. Upgrade to Enterprise for unlimited tools.';
    }
    return 'Maximum tools limit reached for your current plan.';
  };

  const toggleToolSelection = (toolId) => {
    if (selectedToolIds.includes(toolId)) {
      setSelectedToolIds(selectedToolIds.filter(id => id !== toolId));
      setLimitWarning(null);
    } else {
      if (selectedToolIds.length >= maxAllowedTools) {
        setLimitWarning(getLimitWarningMessage(maxAllowedTools));
        return;
      }
      setLimitWarning(null);
      setSelectedToolIds([...selectedToolIds, toolId]);
      if (!toolConfigs[toolId] || toolConfigs[toolId].length === 0) {
        const tool = tools.find(t => t.id === toolId);
        const initialAllocation = tool?.type === 'subscription'
          ? { id: Date.now().toString(), plan: tool.defaultPlan || 'Free', seats: tool.defaultSeats || 1, purpose: 'Coding' }
          : { id: Date.now().toString(), modelId: tool?.defaultModelId || 'anthropic/claude-fable-5', inputTokens: 10000000, outputTokens: 2500000, purpose: 'Coding' };

        setToolConfigs(prev => ({
          ...prev,
          [toolId]: [initialAllocation]
        }));
      }
    }
  };

  const handleAddApiModel = (modelId) => {
    if (!modelId) return;
    const model = dbModels.find(m => m.id === modelId);
    if (!model) return;

    if (!selectedToolIds.includes(modelId) && selectedToolIds.length >= maxAllowedTools) {
      setLimitWarning(getLimitWarningMessage(maxAllowedTools));
      return;
    }
    setLimitWarning(null);

    // 1. Add tool to tools list if it doesn't exist
    if (!tools.some(t => t.id === modelId)) {
      const newTool = {
        id: modelId,
        name: model.name || modelId,
        desc: 'Direct API access',
        icon: '🔑',
        type: 'api',
        defaultModelId: modelId,
        defaultSeats: 1
      };
      setTools([...tools, newTool]);
    }

    // 2. Add to selectedToolIds if not already selected
    if (!selectedToolIds.includes(modelId)) {
      setSelectedToolIds([...selectedToolIds, modelId]);
    }

    // 3. Initialize config if not present
    if (!toolConfigs[modelId] || toolConfigs[modelId].length === 0) {
      const initialAllocation = {
        id: Date.now().toString(),
        modelId: modelId,
        inputTokens: 10000000,
        outputTokens: 2500000,
        purpose: 'Coding'
      };
      setToolConfigs(prev => ({
        ...prev,
        [modelId]: [initialAllocation]
      }));
    }
  };

  const handleRemoveApiModel = (modelId) => {
    setLimitWarning(null);
    setSelectedToolIds(selectedToolIds.filter(id => id !== modelId));
    setToolConfigs(prev => {
      const copy = { ...prev };
      delete copy[modelId];
      return copy;
    });
  };

  const handleConfigChange = (toolId, allocationId, field, value) => {
    setToolConfigs(prev => ({
      ...prev,
      [toolId]: (prev[toolId] || []).map(alloc => 
        alloc.id === allocationId ? { ...alloc, [field]: value } : alloc
      )
    }));
  };

  const addAllocation = (toolId) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;
    const newAlloc = tool.type === 'subscription'
      ? { id: (Date.now() + Math.random()).toString(), plan: tool.defaultPlan || 'Free', seats: 1, purpose: 'Coding' }
      : { id: (Date.now() + Math.random()).toString(), modelId: tool.defaultModelId || 'anthropic/claude-fable-5', inputTokens: 10000000, outputTokens: 2500000, purpose: 'Coding' };

    setToolConfigs(prev => ({
      ...prev,
      [toolId]: [...(prev[toolId] || []), newAlloc]
    }));
  };

  const removeAllocation = (toolId, allocationId) => {
    setToolConfigs(prev => {
      const current = prev[toolId] || [];
      if (current.length <= 1) return prev; // Keep at least one
      return {
        ...prev,
        [toolId]: current.filter(alloc => alloc.id !== allocationId)
      };
    });
  };

  const handleAddCustomTool = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      if (selectedToolIds.length >= maxAllowedTools) {
        setLimitWarning(getLimitWarningMessage(maxAllowedTools));
        return;
      }
      setLimitWarning(null);
      const customName = searchQuery.trim();
      if (tools.some(t => t.name.toLowerCase() === customName.toLowerCase())) {
        return;
      }
      const newTool = {
        id: customName,
        name: customName,
        desc: 'Custom tool integration',
        icon: '🔧',
        type: 'subscription',
        plans: ['Free', 'Pro', 'Business'],
        defaultPlan: 'Pro',
        defaultSeats: 1
      };

      setTools([...tools, newTool]);
      setSelectedToolIds([...selectedToolIds, customName]);
      setToolConfigs(prev => ({
        ...prev,
        [customName]: [{ id: Date.now().toString(), plan: 'Pro', seats: 1, purpose: 'Coding' }]
      }));
      setSearchQuery('');
    }
  };

  const getProviderName = (model) => {
    if (typeof model === 'object' && model !== null) {
      if (model.developer) return model.developer;
      if (model.creator) return model.creator;
    }
    const modelId = typeof model === 'string' ? model : (model?.id || '');
    const parts = modelId.split('/');
    if (parts.length > 1) {
      const raw = parts[0];
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
    return 'Other';
  };

  const getCleanModelName = (model) => {
    if (!model.name) return model.id;
    return model.name.replace(/^[^:]+:\s*/, '');
  };

  const toggleApiModelSelection = (modelId) => {
    if (selectedToolIds.includes(modelId)) {
      handleRemoveApiModel(modelId);
    } else {
      handleAddApiModel(modelId);
    }
  };

  const subscriptionTools = tools.filter(t => 
    t.type === 'subscription' && (
      t.name.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(subSearchQuery.toLowerCase())
    )
  );

  const availableApiProviders = useMemo(() => {
    const set = new Set();
    dbModels.forEach(m => {
      const p = getProviderName(m);
      if (p && p !== 'Other' && p !== 'Unknown') set.add(p);
    });
    const sorted = Array.from(set).sort();
    return ['ALL', ...sorted];
  }, [dbModels]);

  const filteredDbModels = useMemo(() => {
    let list = dbModels;
    if (apiProviderFilter !== 'ALL') {
      list = list.filter(m => {
        const p = getProviderName(m);
        return p.toLowerCase() === apiProviderFilter.toLowerCase();
      });
    }
    const filtered = list.filter(m => 
      (m.name || '').toLowerCase().includes(apiSearchQuery.toLowerCase()) ||
      (m.id || '').toLowerCase().includes(apiSearchQuery.toLowerCase())
    );

    if (apiSearchQuery.trim() === '') {
      return sortModelsForDisplay(filtered);
    } else {
      return filtered.sort((a, b) => (a.name || a.id || '').localeCompare(b.name || b.id || ''));
    }
  }, [dbModels, apiSearchQuery, apiProviderFilter]);

  const subSelectedCount = useMemo(() => {
    return selectedToolIds.filter(id => tools.some(t => t.id === id && t.type === 'subscription')).length;
  }, [selectedToolIds, tools]);

  const apiSelectedCount = useMemo(() => {
    return selectedToolIds.filter(id => !tools.some(t => t.id === id && t.type === 'subscription')).length;
  }, [selectedToolIds, tools]);

  // STEP 1 RENDER
  const renderStep1 = () => (
    <div className="app-container" style={{ backgroundColor: '#FCFCFD' }}>
      <style>{`
        .wizard-body-wide {
          max-width: 1200px;
          width: 100%;
          padding: 32px 24px;
          margin: 0 auto;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        .step1-view-switcher {
          display: none;
          background: #F1F5F9;
          padding: 4px;
          border-radius: 14px;
          margin-bottom: 16px;
          gap: 6px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          border: 1px solid #E2E8F0;
        }
        .step1-view-btn {
          flex: 1 1 0%;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 12px;
          border: none;
          background: transparent;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #64748B;
          cursor: pointer;
          transition: all 180ms ease;
          white-space: nowrap;
          box-sizing: border-box;
        }
        .step1-view-btn.active {
          background: #FFFFFF;
          color: #0F172A;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
        }
        .step1-tab-text-full {
          display: inline;
        }
        .step1-tab-text-short {
          display: none;
        }
        .step1-tab-count {
          font-size: 11px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 12px;
          background: #E2E8F0;
          color: #64748B;
          transition: all 180ms ease;
          flex-shrink: 0;
        }
        .step1-tab-count.highlight-sub {
          background: #ECFDF5;
          color: #059669;
          border: 1px solid #A7F3D0;
        }
        .step1-tab-count.highlight-api {
          background: #EFF6FF;
          color: #2563EB;
          border: 1px solid #BFDBFE;
        }
        .panel-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          gap: 8px;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .panel-count-badge {
          font-size: 11.5px;
          font-weight: 700;
          color: #64748B;
          background: #F1F5F9;
          padding: 2px 7px;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          flex-shrink: 0;
        }
        .panel-selected-pill {
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 12px;
          background-color: #ECFDF5;
          color: #059669;
          border: 1px solid #A7F3D0;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .panel-selected-pill.api {
          background-color: #EFF6FF;
          color: #2563EB;
          border: 1px solid #BFDBFE;
        }
        .split-workspace {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px;
          margin-bottom: 18px;
          align-items: stretch;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .workspace-panel {
          background-color: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          height: clamp(540px, calc(100vh - 280px), 720px);
          box-sizing: border-box;
          transition: all 200ms ease;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow: hidden;
        }
        .panel-title {
          font-size: 16px;
          font-weight: 750;
          color: #1F2937;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .panel-search-wrapper {
          position: relative;
          margin-bottom: 10px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .panel-search-input {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          height: 40px;
          padding: 8px 36px 8px 36px;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 13px;
          background-color: #FAFAFA;
          color: #1E293B;
          outline: none;
          transition: all 150ms ease;
        }
        .panel-search-input:focus {
          border-color: #3B82F6;
          background-color: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }
        .panel-search-icon {
          color: #94A3B8;
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .search-clear-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .search-clear-btn:hover {
          color: #475569;
          background-color: #E2E8F0;
        }

        /* Provider Filter Chips */
        .api-provider-chips-row {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 8px;
          margin-bottom: 8px;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          flex-shrink: 0;
        }
        .api-provider-chips-row::-webkit-scrollbar {
          display: none;
        }
        .api-provider-chip {
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11.5px;
          font-weight: 700;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          color: #64748B;
          cursor: pointer;
          white-space: nowrap;
          transition: all 150ms ease;
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .api-provider-chip:hover {
          background: #F1F5F9;
          color: #1E293B;
          border-color: #CBD5E1;
        }
        .api-provider-chip.active {
          background: #EFF6FF;
          color: #2563EB;
          border-color: #93C5FD;
          box-shadow: 0 1px 3px rgba(37, 99, 235, 0.12);
        }
        
        /* Scroll Containers */
        .subscription-scroll-container,
        .api-scroll-container {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 4px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
        }
        .subscription-scroll-container::-webkit-scrollbar,
        .api-scroll-container::-webkit-scrollbar {
          width: 5px;
        }
        .subscription-scroll-container::-webkit-scrollbar-track,
        .api-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .subscription-scroll-container::-webkit-scrollbar-thumb,
        .api-scroll-container::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 999px;
        }
        .subscription-scroll-container::-webkit-scrollbar-thumb:hover,
        .api-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
        
        .tool-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 10px;
          margin-bottom: 0;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .tool-card {
          padding: 10px 12px;
          gap: 10px;
          border-radius: 12px;
          border: 1.5px solid #F3F4F6;
          background-color: #FAFAFA;
          cursor: pointer;
          transition: all 180ms ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .tool-card:hover {
          background-color: #FFFFFF;
          border-color: #10B981;
          transform: translateY(-1px);
        }
        .tool-card.selected {
          background-color: #ECFDF5;
          border-color: #10B981;
        }
        .tool-card-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #1F2937;
        }
        .tool-card-desc {
          font-size: 11px;
          color: #6B7280;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Direct API List */
        .api-models-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .api-model-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border: 1.5px solid #F1F5F9;
          background-color: #FAFAFA;
          border-radius: 12px;
          cursor: pointer;
          transition: all 180ms ease;
          box-sizing: border-box;
          min-height: 48px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }
        .api-model-row:hover {
          background-color: #FFFFFF;
          border-color: #3B82F6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
          transform: translateY(-1px);
        }
        .api-model-row.selected {
          background-color: #EFF6FF;
          border-color: #3B82F6;
        }
        .api-row-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
          overflow: hidden;
        }
        .api-logo-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          min-width: 32px;
          min-height: 32px;
          border-radius: 8px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          flex-shrink: 0;
        }
        .api-row-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
          overflow: hidden;
        }
        .api-model-name {
          font-size: 13px;
          font-weight: 700;
          color: #1F2937;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.3;
          width: 100%;
        }
        .api-row-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
          min-width: 0;
          overflow: hidden;
        }
        .api-provider-name {
          font-size: 11px;
          color: #64748B;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .api-context-pill {
          font-size: 9.5px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
          background: #F1F5F9;
          color: #475569;
          border: 1px solid #E2E8F0;
          flex-shrink: 0;
        }
        .api-check-badge {
          width: 20px;
          height: 20px;
          min-width: 20px;
          min-height: 20px;
          border-radius: 50%;
          border: 1.5px solid #D1D5DB;
          background-color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 180ms ease;
          flex-shrink: 0;
          margin-left: 8px;
          font-size: 11px;
          color: #FFFFFF;
          font-weight: 800;
        }
        .api-check-badge.checked {
          border-color: #3B82F6;
          background-color: #3B82F6;
        }
        .api-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6B7280;
          gap: 6px;
          padding: 32px 16px;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
        }
        
        /* Bottom CTA Success Container */
        .bottom-cta-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background-color: #ECFDF5;
          border: 1.5px solid #A7F3D0;
          border-radius: 14px;
          color: #065F46;
          margin-top: 16px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          gap: 12px;
        }
        .bottom-cta-text {
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }
        
        /* Responsive Breakpoints */
        @media (max-width: 1080px) {
          .split-workspace {
            gap: 16px !important;
          }
          .workspace-panel {
            padding: 18px 16px !important;
          }
          .tool-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }

        @media (max-width: 900px) {
          .wizard-body-wide {
            padding: 16px 14px !important;
            overflow-x: hidden !important;
          }
          .step1-view-switcher {
            display: flex !important;
          }
          .split-workspace {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 0 !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .workspace-panel {
            height: auto !important;
            max-height: none !important;
            padding: 16px 14px !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .workspace-panel.hide-on-mobile {
            display: none !important;
          }
          .subscription-scroll-container,
          .api-scroll-container {
            max-height: clamp(340px, calc(100dvh - 380px), 520px) !important;
            min-height: 280px !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
          }
          .tool-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 8px !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          .tool-card {
            padding: 10px 12px !important;
            width: 100% !important;
            min-width: 0 !important;
          }
        }

        @media (max-width: 640px) {
          .wizard-body-wide {
            padding: 14px 10px !important;
          }
          .workspace-panel {
            padding: 14px 12px !important;
            border-radius: 14px !important;
          }
          .wizard-title {
            font-size: 19px !important;
            margin-bottom: 6px !important;
          }
          .wizard-desc {
            font-size: 12px !important;
            margin-bottom: 10px !important;
          }
          .wizard-progress-meta {
            font-size: 11px !important;
            margin-bottom: 4px !important;
          }
          .step1-view-btn {
            font-size: 12px !important;
            padding: 8px 6px !important;
            gap: 4px !important;
          }
          .step1-tab-text-full {
            display: none !important;
          }
          .step1-tab-text-short {
            display: inline !important;
          }
          .api-model-row {
            padding: 8px 10px !important;
            min-height: 44px !important;
          }
          .api-logo-wrapper {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            min-height: 28px !important;
          }
          .api-model-name {
            font-size: 12.5px !important;
          }
          .bottom-cta-banner {
            flex-direction: column !important;
            text-align: center !important;
            gap: 12px !important;
            padding: 14px 12px !important;
            align-items: stretch !important;
          }
          .bottom-cta-banner button {
            width: 100% !important;
            justify-content: center !important;
            padding: 10px 16px !important;
            font-size: 13px !important;
          }
          .wizard-steps-indicator {
            gap: 3px !important;
          }
          .wizard-step-dot {
            width: 18px !important;
            height: 18px !important;
            font-size: 9px !important;
          }
          .wizard-step-line {
            width: 12px !important;
          }
        }

        @media (max-width: 420px) {
          .wizard-body-wide {
            padding: 10px 8px !important;
          }
          .workspace-panel {
            padding: 12px 8px !important;
            border-radius: 12px !important;
          }
          .step1-view-btn {
            font-size: 11px !important;
            padding: 6px 4px !important;
          }
          .panel-title {
            font-size: 15px !important;
          }
          .panel-search-input {
            font-size: 12px !important;
            height: 36px !important;
            padding: 6px 30px 6px 32px !important;
          }
          .api-provider-chip {
            font-size: 10px !important;
            padding: 3px 7px !important;
          }
          .api-scroll-container {
            max-height: clamp(260px, calc(100dvh - 330px), 400px) !important;
          }
          .api-model-row {
            padding: 7px 8px !important;
          }
        }
      `}</style>

      <header className="wizard-header">
        <div className="container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="nav-brand">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="wizard-steps-indicator">
            <span className="wizard-step-dot active">1</span>
            <span className="wizard-step-line"></span>
            <span className="wizard-step-dot">2</span>
            <span className="wizard-step-line"></span>
            <span className="wizard-step-dot">3</span>
            <span className="wizard-step-line"></span>
            <span className="wizard-step-dot">4</span>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="wizard-close">✕</a>
        </div>
      </header>
      
      <main className="main-content wizard-body-wide">
        <div className="wizard-progress-meta">✦ Step 1 of 4 - 25% Complete</div>
        <h2 className="wizard-title" style={{ textAlign: 'center', marginBottom: '8px' }}>Which AI tools does your team use?</h2>
        <p className="wizard-desc" style={{ textAlign: 'center', marginBottom: '12px' }}>Select active subscriptions and direct API access nodes currently in use.</p>
        
        {/* Dynamic Subscription Limit Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 12px',
            borderRadius: '20px',
            fontSize: '11.5px',
            fontWeight: '700',
            backgroundColor: maxAllowedTools === Infinity ? '#F5F3FF' : maxAllowedTools > 2 ? '#ECFDF5' : '#F1F5F9',
            color: maxAllowedTools === Infinity ? '#7C3AED' : maxAllowedTools > 2 ? '#059669' : '#475569',
            border: `1px solid ${maxAllowedTools === Infinity ? '#DDD6FE' : maxAllowedTools > 2 ? '#A7F3D0' : '#E2E8F0'}`
          }}>
            <span>{maxAllowedTools === Infinity ? '⚡' : maxAllowedTools > 2 ? '💎' : '🛡️'}</span>
            <span>
              {user?.plan ? (user.plan.toLowerCase() === 'enterprise' ? 'Enterprise' : user.plan.toLowerCase() === 'pro' ? 'Professional' : 'Free') : 'Free'} Plan: Max {maxAllowedTools === Infinity ? 'Unlimited' : maxAllowedTools} Tools
            </span>
          </span>
        </div>

        {limitWarning && (
          <div style={{
            maxWidth: '680px',
            margin: '0 auto 18px auto',
            padding: '12px 18px',
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #FCA5A5',
            borderRadius: '14px',
            color: '#991B1B',
            fontSize: '13.5px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span>{limitWarning}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button 
                type="button" 
                onClick={() => {
                  onNavigateToView('landing');
                  setTimeout(() => {
                    const el = document.getElementById('pricing');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 120);
                }}
                style={{ 
                  backgroundColor: '#DC2626', 
                  color: '#FFFFFF', 
                  border: 'none', 
                  padding: '7px 15px', 
                  borderRadius: '8px', 
                  fontWeight: '750', 
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
              >
                <span>⚡</span> Upgrade Subscription
              </button>
              <button 
                type="button" 
                onClick={() => setLimitWarning(null)}
                style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', padding: '0 4px' }}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Mobile View Switcher (<= 900px) */}
        <div className="step1-view-switcher">
          <button
            type="button"
            className={`step1-view-btn ${step1ViewMode === 'sub' ? 'active' : ''}`}
            onClick={() => setStep1ViewMode('sub')}
          >
            <Sparkles size={14} style={{ color: step1ViewMode === 'sub' ? '#059669' : '#64748B' }} />
            <span className="step1-tab-text-full">Subscription Tools</span>
            <span className="step1-tab-text-short">Subscriptions</span>
            <span className={`step1-tab-count ${subSelectedCount > 0 ? 'highlight-sub' : ''}`}>
              {subSelectedCount}
            </span>
          </button>
          <button
            type="button"
            className={`step1-view-btn ${step1ViewMode === 'api' ? 'active' : ''}`}
            onClick={() => setStep1ViewMode('api')}
          >
            <Code2 size={14} style={{ color: step1ViewMode === 'api' ? '#2563EB' : '#64748B' }} />
            <span className="step1-tab-text-full">Direct API Models</span>
            <span className="step1-tab-text-short">Direct API</span>
            <span className={`step1-tab-count ${apiSelectedCount > 0 ? 'highlight-api' : ''}`}>
              {apiSelectedCount}
            </span>
          </button>
        </div>

        <div className="split-workspace">
          {/* Left Panel: Subscription Tools */}
          <div className={`workspace-panel ${step1ViewMode === 'api' ? 'hide-on-mobile' : ''}`}>
            <div className="panel-header-row">
              <h3 className="panel-title">
                <Sparkles size={17} style={{ color: 'var(--color-green-primary)' }} /> Subscription AI Tools
              </h3>
              {subSelectedCount > 0 && (
                <span className="panel-selected-pill">{subSelectedCount} selected</span>
              )}
            </div>
            
            <div className="panel-search-wrapper">
              <input 
                type="text"
                placeholder="Search ChatGPT, Claude, Gemini, DeepSeek..."
                className="search-input"
                value={subSearchQuery}
                onChange={(e) => setSubSearchQuery(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
              <Search size={16} style={{ color: '#94A3B8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>

            <div className="subscription-scroll-container" data-lenis-prevent>
              {subscriptionTools.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6B7280', gap: '8px', padding: '40px 0', textAlign: 'center' }}>
                  <Search size={32} style={{ color: '#94A3B8', marginBottom: '4px' }} />
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1F2937' }}>No subscription tools found</span>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Try another search or add a custom tool below.</span>
                </div>
              ) : (
                <div className="tool-grid">
                  {subscriptionTools.map(tool => {
                    const isSelected = selectedToolIds.includes(tool.id);
                    return (
                      <div 
                        key={tool.id} 
                        className={`tool-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleToolSelection(tool.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                          <div className="tool-card-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ProviderLogo provider={tool.id} size={22} />
                          </div>
                          <div className="tool-card-info" style={{ minWidth: 0, flex: 1 }}>
                            <span className="tool-card-name">{tool.name}</span>
                            <span className="tool-card-desc">{tool.desc}</span>
                          </div>
                        </div>
                        
                        {/* Checkbox badge Selection Indicator */}
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? '1.5px solid #10B981' : '1.5px solid #D1D5DB',
                          backgroundColor: isSelected ? '#10B981' : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 180ms ease',
                          flexShrink: 0
                        }}>
                          {isSelected && (
                            <span style={{ color: '#FFFFFF', fontSize: '10px', fontWeight: 'bold' }}>✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Compact Custom Tool section */}
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #E5E7EB', boxSizing: 'border-box' }}>
              {!isAddingCustom ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#475569' }}>Can't find your tool?</span>
                  <button 
                    type="button"
                    onClick={() => setIsAddingCustom(true)}
                    className="btn btn-outline"
                    style={{ padding: '5px 10px', fontSize: '11.5px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    + Add Custom Tool
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Tool Name</span>
                    <button 
                      type="button" 
                      onClick={() => { setIsAddingCustom(false); setSearchQuery(''); }}
                      style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. Midjourney, Notion AI..."
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddCustomTool(e);
                          setIsAddingCustom(false);
                        }
                      }}
                      style={{
                        flex: 1,
                        height: '38px',
                        padding: '6px 12px 6px 36px',
                        border: '1.5px solid #E5E7EB',
                        borderRadius: '10px',
                        fontSize: '13px',
                        backgroundColor: '#FAFAFA'
                      }}
                      autoFocus
                    />
                    <Search size={16} style={{ color: '#94A3B8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <button 
                      type="button"
                      onClick={() => {
                        handleAddCustomTool({ key: 'Enter' });
                        setIsAddingCustom(false);
                      }} 
                      className="btn btn-black"
                      disabled={!searchQuery.trim()}
                      style={{ borderRadius: '10px', padding: '0 14px', height: '38px', display: 'flex', alignItems: 'center', fontSize: '12.5px' }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Direct API Models */}
          <div className={`workspace-panel api-panel ${step1ViewMode === 'sub' ? 'hide-on-mobile' : ''}`}>
            <div className="panel-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="panel-title">
                  <Code2 size={17} style={{ color: '#3B82F6' }} /> Direct API Models
                </h3>
                <span className="panel-count-badge">{filteredDbModels.length}</span>
              </div>
              {apiSelectedCount > 0 && (
                <span className="panel-selected-pill api">{apiSelectedCount} selected</span>
              )}
            </div>

            <div className="panel-search-wrapper">
              <input 
                type="text"
                placeholder="Search models (e.g. GPT-4o, Claude 3.7, Gemini 2.5, DeepSeek)..."
                className="panel-search-input"
                value={apiSearchQuery}
                onChange={(e) => setApiSearchQuery(e.target.value)}
              />
              <Search size={16} className="panel-search-icon" />
              {apiSearchQuery && (
                <button
                  type="button"
                  onClick={() => setApiSearchQuery('')}
                  className="search-clear-btn"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Provider Filter Chips Row */}
            <div className="api-provider-chips-row" data-lenis-prevent>
              {availableApiProviders.map(p => (
                <button
                  key={p}
                  type="button"
                  className={`api-provider-chip ${apiProviderFilter === p ? 'active' : ''}`}
                  onClick={() => setApiProviderFilter(p)}
                >
                  {p === 'ALL' ? 'All Providers' : p}
                </button>
              ))}
            </div>

            <div className="api-scroll-container" data-lenis-prevent>
              {filteredDbModels.length === 0 ? (
                <div className="api-empty-state">
                  <Search size={32} style={{ color: '#94A3B8', marginBottom: '6px' }} />
                  <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#1F2937' }}>No API models found</span>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    {apiSearchQuery ? `No matches for "${apiSearchQuery}"` : 'No models available in this category.'}
                  </span>
                  {(apiSearchQuery || apiProviderFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => { setApiSearchQuery(''); setApiProviderFilter('ALL'); }}
                      className="btn btn-outline"
                      style={{ padding: '5px 12px', fontSize: '11.5px', marginTop: '8px', borderRadius: '8px' }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="api-models-list">
                  {filteredDbModels.map(model => {
                    const isSelected = selectedToolIds.includes(model.id);
                    const cleanName = getCleanModelName(model);
                    const providerName = getProviderName(model);
                    return (
                      <div 
                        key={model.id}
                        className={`api-model-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleApiModelSelection(model.id)}
                      >
                        <div className="api-row-left">
                          <div className="api-logo-wrapper">
                            <ProviderLogo provider={model.developer || model.creator || model.id} size={22} />
                          </div>
                          <div className="api-row-info">
                            <span className="api-model-name" title={cleanName}>{cleanName}</span>
                            <div className="api-row-meta">
                              <span className="api-provider-name">{providerName}</span>
                              {model.context_length ? (
                                <span className="api-context-pill">{Math.round(model.context_length / 1000)}k ctx</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        
                        {/* Checkbox badge Selection Indicator */}
                        <div className={`api-check-badge ${isSelected ? 'checked' : ''}`}>
                          {isSelected && <span>✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Success Banner Bottom CTA */}
        {selectedToolIds.length > 0 ? (
          <div className="bottom-cta-banner">
            <span className="bottom-cta-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✔</span>
              <span>
                <strong>{selectedToolIds.length}</strong> / <strong>{maxAllowedTools === Infinity ? '∞' : maxAllowedTools}</strong> tools selected
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748B', marginLeft: '6px' }}>
                  ({maxAllowedTools === Infinity ? 'Enterprise Unlimited' : maxAllowedTools > 2 ? 'Pro Plan: up to 15' : 'Free Plan: up to 2'})
                </span>
              </span>
            </span>
            <button 
              onClick={() => onNavigateToView('step2')} 
              className="btn btn-black"
              style={{
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '13.5px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Proceed to Configure Usage <span>→</span>
            </button>
          </div>
        ) : (
          <div className="bottom-cta-banner" style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: '#6B7280' }}>
            <span className="bottom-cta-text" style={{ fontWeight: '500' }}>
              Select at least one tool to proceed (Max {maxAllowedTools === Infinity ? 'Unlimited' : maxAllowedTools})
            </span>
            <button 
              className="btn btn-disabled"
              disabled
              style={{
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '13.5px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Proceed to Configure Usage <span>→</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );

  // STEP 2 RENDER
  const renderStep2 = () => (
    <div className="app-container" style={{ backgroundColor: '#FCFCFD' }}>
      <style>{`
        .wizard-tool-config-card {
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 24px;
          background-color: #FFFFFF;
        }
        .wizard-tool-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #F1F5F9;
          padding-bottom: 12px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .allocation-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: flex-end;
          background-color: #F8FAFC;
          padding: 16px;
          border-radius: 10px;
        }
        @media (max-width: 640px) {
          .wizard-tool-config-card {
            padding: 16px 12px !important;
          }
          .wizard-tool-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          .wizard-tool-header button {
            align-self: flex-start !important;
          }
          .allocation-row {
            padding: 14px 10px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
          }
          .sub-input-col {
            flex: 1 1 100% !important;
            width: 100% !important;
            min-width: 100% !important;
          }
        }
      `}</style>
      <header className="wizard-header">
        <div className="container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="nav-brand">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="wizard-steps-indicator">
            <span className="wizard-step-dot completed">1</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot active">2</span>
            <span className="wizard-step-line"></span>
            <span className="wizard-step-dot">3</span>
            <span className="wizard-step-line"></span>
            <span className="wizard-step-dot">4</span>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="wizard-close">✕</a>
        </div>
      </header>

      <main className="main-content wizard-body">
        <div className="wizard-progress-meta">✦ Step 2 of 4 - 50% Complete</div>
        <h2 className="wizard-title">Configure your allocations</h2>
        <p className="wizard-desc">Set plans, workloads, and primary team roles for each active tool or API access.</p>

        <div className="wizard-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {selectedToolIds.map(toolId => {
              const tool = tools.find(t => t.id === toolId) || { name: toolId, plans: ['Free', 'Pro', 'Business'], icon: '⚙', type: 'subscription' };
              const configs = toolConfigs[toolId] || [];

              return (
                <div key={toolId} className="wizard-tool-config-card">
                  <div className="wizard-tool-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: '#FAFAFA',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxSizing: 'border-box'
                        }}
                      >
                        <ProviderLogo provider={tool.id} size={22} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '17px', color: '#1E293B' }}>{tool.name}</strong>
                        <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', backgroundColor: tool.type === 'subscription' ? '#EEF2FF' : '#ECFDF5', color: tool.type === 'subscription' ? '#4F46E5' : '#059669', fontWeight: 600 }}>
                          {tool.type === 'subscription' ? 'Subscription' : 'Direct API'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => addAllocation(toolId)}
                      className="btn btn-outline"
                      style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px' }}
                    >
                      + Add Allocation
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {configs.map((config) => (
                      <div key={config.id} className="allocation-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px' }}>
                        
                        {tool.type === 'subscription' ? (
                          <>
                            {/* Subscription Fields */}
                            <div className="sub-input-col" style={{ flex: '1 1 200px' }}>
                              <span className="sub-input-label">Plan Option</span>
                              <select 
                                className="sub-select"
                                value={config.plan}
                                onChange={(e) => handleConfigChange(toolId, config.id, 'plan', e.target.value)}
                                style={{ width: '100%' }}
                              >
                                {(tool.plans || ['Free', 'Pro', 'Business', 'Max']).map(p => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </select>
                            </div>

                            <div className="sub-input-col" style={{ flex: '1 1 120px' }}>
                              <span className="sub-input-label">Paid Seats</span>
                              <input 
                                type="number" 
                                min="1"
                                className="sub-input"
                                value={config.seats}
                                onChange={(e) => handleConfigChange(toolId, config.id, 'seats', parseInt(e.target.value) || 1)}
                                style={{ width: '100%' }}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            {/* API Fields */}
                            {/* Monthly Input Tokens */}
                            <div className="sub-input-col" style={{ flex: '1 1 250px', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span className="sub-input-label" style={{ marginBottom: 0 }}>Monthly Input Tokens</span>
                                <strong style={{ fontSize: '12px', color: 'var(--color-green-primary)' }}>
                                  {(config.inputTokens / 1000000).toFixed(1)}M
                                </strong>
                              </div>
                              
                              <input 
                                type="number" 
                                min="0"
                                className="sub-input"
                                value={config.inputTokens}
                                onChange={(e) => handleConfigChange(toolId, config.id, 'inputTokens', parseFloat(e.target.value) || 0)}
                                style={{ width: '100%', marginBottom: '8px' }}
                              />
                              
                              <input 
                                type="range"
                                min="100000"
                                max="200000000"
                                step="100000"
                                value={config.inputTokens || 0}
                                onChange={(e) => handleConfigChange(toolId, config.id, 'inputTokens', parseFloat(e.target.value) || 0)}
                                style={{ width: '100%', accentColor: 'var(--color-green-primary)', cursor: 'pointer' }}
                              />
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                <span>0.1M</span>
                                <span>100M</span>
                                <span>200M</span>
                              </div>
                            </div>

                            {/* Monthly Output Tokens */}
                            <div className="sub-input-col" style={{ flex: '1 1 250px', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span className="sub-input-label" style={{ marginBottom: 0 }}>Monthly Output Tokens</span>
                                <strong style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>
                                  {(config.outputTokens / 1000000).toFixed(1)}M
                                </strong>
                              </div>
                              
                              <input 
                                type="number" 
                                min="0"
                                className="sub-input"
                                value={config.outputTokens}
                                onChange={(e) => handleConfigChange(toolId, config.id, 'outputTokens', parseFloat(e.target.value) || 0)}
                                style={{ width: '100%', marginBottom: '8px' }}
                              />
                              
                              <input 
                                type="range"
                                min="50000"
                                max="100000000"
                                step="50000"
                                value={config.outputTokens || 0}
                                onChange={(e) => handleConfigChange(toolId, config.id, 'outputTokens', parseFloat(e.target.value) || 0)}
                                style={{ width: '100%', accentColor: 'var(--color-text-primary)', cursor: 'pointer' }}
                              />
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                <span>0.05M</span>
                                <span>50M</span>
                                <span>100M</span>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Common Purpose Field */}
                        <div className="sub-input-col" style={{ flex: '1 1 180px' }}>
                          <span className="sub-input-label">Purpose / Team Role</span>
                          <PurposeSelect 
                            value={config.purpose}
                            onChange={(val) => handleConfigChange(toolId, config.id, 'purpose', val)}
                          />
                        </div>

                        {configs.length > 1 && (
                          <button 
                            onClick={() => removeAllocation(toolId, config.id)}
                            className="btn btn-outline"
                            style={{ color: '#EF4444', borderColor: '#FCA5A5', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Remove allocation row"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="wizard-actions">
          <button onClick={() => onNavigateToView('step1')} className="btn btn-outline">
            ← Back
          </button>
          <button onClick={() => onNavigateToView('step3')} className="btn btn-black">
            Continue to Optimization Goals <span style={{ marginLeft: '6px' }}>→</span>
          </button>
        </div>
      </main>
    </div>
  );

  // STEP 3 RENDER
  const renderStep3 = () => {
    const isBlocked = false;

    return (
      <div className="app-container" style={{ backgroundColor: '#FCFCFD' }}>
        <header className="wizard-header">
          <div className="container">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="nav-brand">
              <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
              <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
            </a>
            <div className="wizard-steps-indicator">
              <span className="wizard-step-dot completed">1</span>
              <span className="wizard-step-line completed"></span>
              <span className="wizard-step-dot completed">2</span>
              <span className="wizard-step-line completed"></span>
              <span className="wizard-step-dot active">3</span>
              <span className="wizard-step-line"></span>
              <span className="wizard-step-dot">4</span>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="wizard-close">✕</a>
          </div>
        </header>

        <main className="main-content wizard-body-extra-wide">
          <div className="wizard-progress-meta">✦ Step 3 of 4 - 75% Complete</div>
          <h2 className="wizard-title">Select Optimization Target</h2>
          <p className="wizard-desc">Configure your cost-saving thresholds and quality limits for the spend engine audit.</p>

          {apiError && (
            apiError.includes('Database is empty') || 
            apiError.toLowerCase().includes('failed to fetch') || 
            apiError.toLowerCase().includes('fetch failed') || 
            apiError.toLowerCase().includes('network error')
          ) ? (
            <div style={{ padding: '32px', backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', color: '#B45309', borderRadius: '16px', marginBottom: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>⏳</span>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Server Busy & Hydrating</h3>
              <p style={{ fontSize: '14.5px', color: '#92400E', lineHeight: '1.6' }}>
                The background database is currently synchronizing live pricing and capability benchmarks from the Artificial Analysis API. Please wait a few seconds and try again.
              </p>
            </div>
          ) : apiError ? (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              color: '#991B1B',
              padding: '16px 20px',
              borderRadius: '14px',
              marginBottom: '24px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                <div>
                  <strong>Audit Analysis Limit:</strong> {apiError}
                </div>
              </div>
              {(apiError.toLowerCase().includes('limit') || apiError.toLowerCase().includes('upgrade') || apiError.toLowerCase().includes('maximum')) && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateToView('landing');
                    setTimeout(() => {
                      const el = document.getElementById('pricing');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 120);
                  }}
                  style={{
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: '750',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                >
                  ⚡ Upgrade Subscription
                </button>
              )}
            </div>
          ) : null}

          <div className="wizard-card">
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '16px' }}>Optimization Strategy</label>
              
              <style>{`
                .wizard-body-extra-wide {
                  max-width: 1250px;
                  width: 100%;
                  padding: 32px 24px;
                  margin: 0 auto;
                  box-sizing: border-box;
                }
                .strategy-card {
                  background-color: #FFFFFF;
                  border: 2px solid #E2E8F0;
                  border-radius: 16px;
                  padding: 20px;
                  cursor: pointer;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  transition: all 150ms ease;
                  box-sizing: border-box;
                  height: 100%;
                }
                .strategy-card:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
                  border-color: #CBD5E1;
                }
                .strategy-card.selected {
                  background-color: rgba(16, 185, 129, 0.04);
                  border-color: #10B981;
                  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.12);
                }
                .strategy-icon-box {
                  width: 52px;
                  height: 52px;
                  border-radius: 14px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: all 150ms ease;
                  border: 1px solid rgba(79, 70, 229, 0.08);
                }
                @media (max-width: 900px) {
                  .strategy-cards-grid {
                    grid-template-columns: 1fr !important;
                    gap: 16px !important;
                  }
                }
                @media (max-width: 640px) {
                  .wizard-body-extra-wide {
                    padding: 24px 14px !important;
                  }
                  .strategy-card {
                    padding: 16px 14px !important;
                  }
                }
              `}</style>
              
              <div className="strategy-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px' }}>
                
                {/* Performance Preservation */}
                <div 
                  onClick={() => setOptimizationGoal('performance')}
                  className={`strategy-card ${optimizationGoal === 'performance' ? 'selected' : ''}`}
                >
                  <div>
                    <div 
                      className="strategy-icon-box"
                      style={{
                        backgroundColor: optimizationGoal === 'performance' ? '#10B981' : '#ECFDF5',
                        marginBottom: '12px'
                      }}
                    >
                      <ShieldCheck size={20} style={{ color: optimizationGoal === 'performance' ? '#FFFFFF' : '#10B981' }} />
                    </div>
                    <h4 
                      style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: optimizationGoal === 'performance' ? '#10B981' : '#1E293B',
                        margin: '0 0 8px 0',
                        transition: 'color 150ms ease'
                      }}
                    >
                      Performance Preservation
                    </h4>
                    <p style={{ fontSize: '14.5px', color: '#64748B', lineHeight: '1.65', margin: 0 }}>
                      Reduce subscription costs while preserving or improving capabilities. Recommends cheaper options of equal or higher performance.
                    </p>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Preserves model quality
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Finds lower-cost alternatives
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Ideal for production teams
                    </li>
                  </ul>
                </div>

                {/* Target Cost Reduction */}
                <div 
                  onClick={() => setOptimizationGoal('cost')}
                  className={`strategy-card ${optimizationGoal === 'cost' ? 'selected' : ''}`}
                >
                  <div>
                    <div 
                      className="strategy-icon-box"
                      style={{
                        backgroundColor: optimizationGoal === 'cost' ? '#F97316' : '#FFF7ED',
                        marginBottom: '12px'
                      }}
                    >
                      <TrendingDown size={20} style={{ color: optimizationGoal === 'cost' ? '#FFFFFF' : '#F97316' }} />
                    </div>
                    <h4 
                      style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: optimizationGoal === 'cost' ? '#10B981' : '#1E293B',
                        margin: '0 0 8px 0',
                        transition: 'color 150ms ease'
                      }}
                    >
                      Target Cost Reduction
                    </h4>
                    <p style={{ fontSize: '14.5px', color: '#64748B', lineHeight: '1.65', margin: 0 }}>
                      Prioritize cost reduction. Recommends models that meet a minimum specified budget cut target, allowing acceptable capability tradeoffs.
                    </p>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Maximizes savings
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Meets your budget target
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Accepts controlled tradeoffs
                    </li>
                  </ul>
                </div>

                {/* Quality Focus */}
                <div 
                  onClick={() => setOptimizationGoal('quality')}
                  className={`strategy-card ${optimizationGoal === 'quality' ? 'selected' : ''}`}
                >
                  <div>
                    <div 
                      className="strategy-icon-box"
                      style={{
                        backgroundColor: optimizationGoal === 'quality' ? '#4F46E5' : '#EEF2FF',
                        marginBottom: '12px'
                      }}
                    >
                      <Gem 
                        size={22} 
                        strokeWidth={2.2} 
                        style={{ color: optimizationGoal === 'quality' ? '#FFFFFF' : '#4F46E5' }} 
                      />
                    </div>
                    <h4 
                      style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: optimizationGoal === 'quality' ? '#10B981' : '#1E293B',
                        margin: '0 0 8px 0',
                        transition: 'color 150ms ease'
                      }}
                    >
                      Quality Focus
                    </h4>
                    <p style={{ fontSize: '14.5px', color: '#64748B', lineHeight: '1.65', margin: 0 }}>
                      Prioritize maximum AI capability. Recommends the absolute highest-performing models and subscriptions for your workload, regardless of cost.
                    </p>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Highest-performing models
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Best benchmark scores
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span> Cost is secondary
                    </li>
                  </ul>
                </div>

              </div>
            </div>

            {optimizationGoal === 'cost' && (
              <div className="form-group" style={{ marginTop: '32px', padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Target Budget Cut Percentage</label>
                  <strong style={{ fontSize: '18px', color: '#10B981' }}>{costCutPercentage}%</strong>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>10%</span>
                  <input 
                    type="range" 
                    min="10" 
                    max="90" 
                    step="5"
                    className="slider"
                    value={costCutPercentage}
                    onChange={(e) => setCostCutPercentage(parseInt(e.target.value) || 50)}
                    style={{ flex: 1, accentColor: '#10B981' }}
                  />
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>90%</span>
                </div>
                
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748B' }}>
                  The engine will search for alternative models that save at least <strong>{costCutPercentage}%</strong> compared to your current subscription or API cost.
                </div>
              </div>
            )}
          </div>

          <div className="wizard-actions">
            <button onClick={() => onNavigateToView('step2')} className="btn btn-outline">
              ← Back
            </button>
            <button 
              onClick={onTriggerAudit} 
              className={`btn ${isBlocked ? 'btn-disabled' : 'btn-green'}`} 
              disabled={isBlocked}
              style={{ 
                padding: '0 28px',
                height: '48px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '14.5px',
                boxShadow: isBlocked ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.2)',
                transition: 'all 150ms ease',
                cursor: isBlocked ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isBlocked) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isBlocked) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.2)';
                }
              }}
            >
              <BarChart3 size={18} />
              <span>Run Audit</span>
            </button>
          </div>
        </main>
      </div>
    );
  };

  switch (currentView) {
    case 'step1':
      return renderStep1();
    case 'step2':
      return renderStep2();
    case 'step3':
      return renderStep3();
    default:
      return renderStep1();
  }
}
