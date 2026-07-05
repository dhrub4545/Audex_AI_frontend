import React, { useState, useEffect } from 'react';
import logoImg from '../assets/audex-ai-logo.png';

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

export default function ModelAuditorView({ 
  onNavigateToView, 
  user, 
  renderCoinDropdown, 
  onCompareModels,
  optimizationGoal: propOptimizationGoal,
  setOptimizationGoal: propSetOptimizationGoal,
  costCutPercentage: propCostCutPercentage,
  setCostCutPercentage: propSetCostCutPercentage,
  targetUseCase: propTargetUseCase,
  setTargetUseCase: propSetTargetUseCase
}) {
  const [currentModelId, setCurrentModelId] = useState('anthropic/claude-fable-5');
  const [localTargetUseCase, setLocalTargetUseCase] = useState('Mixed');
  const targetUseCase = propTargetUseCase !== undefined ? propTargetUseCase : localTargetUseCase;
  const setTargetUseCase = propSetTargetUseCase !== undefined ? propSetTargetUseCase : setLocalTargetUseCase;

  const [monthlyInputTokens, setMonthlyInputTokens] = useState(20000000); // 20M prompt tokens
  const [monthlyOutputTokens, setMonthlyOutputTokens] = useState(5000000); // 5M completion tokens
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
          } catch (e) {}
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
            <span className="badge badge-green" style={{ marginBottom: '12px' }}>
              ● Capability & Market Pricing Intelligence
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
              <div className="wizard-card" style={{ padding: '24px', position: 'sticky', top: '96px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚙</span> Workload Profile
                </h3>

                {/* Dropdown for Baseline Model */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    Current Baseline Model
                  </label>
                  <select 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', fontWeight: '500', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                    value={currentModelId}
                    onChange={(e) => setCurrentModelId(e.target.value)}
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>

                {/* Target Use Case Selectors */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    Primary Workload Use-Case
                  </label>
                  <select
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
                      color: 'var(--color-text-primary)',
                      appearance: 'auto'
                    }}
                  >
                    <optgroup label="── Core Capabilities ──">
                      <option value="Coding">💻 Coding</option>
                      <option value="Math">🔢 Math</option>
                      <option value="Writing">✍️ Creative Writing</option>
                      <option value="Research">🔍 Research</option>
                      <option value="Expert">🎓 Expert Tasks</option>
                      <option value="Instruction-following">📋 Instruction Following</option>
                      <option value="Multi-turn">💬 Multi-turn Chat</option>
                      <option value="Longer-query">📝 Longer Queries</option>
                      <option value="Hard-prompts">💣 Hard Prompts</option>
                      <option value="Hard-prompts-english">🇬🇧💣 Hard Prompts (English)</option>
                      <option value="Mixed">⚙️ Mixed / Overall</option>
                    </optgroup>
                    <optgroup label="── Industry Verticals ──">
                      <option value="Software">🖥️ Software &amp; IT Services</option>
                      <option value="Business">💼 Business &amp; Finance</option>
                      <option value="Healthcare">🏥 Medicine &amp; Healthcare</option>
                      <option value="Legal">⚖️ Legal &amp; Government</option>
                      <option value="Science">🔬 Life &amp; Social Science</option>
                      <option value="Math-industry">📐 Mathematical Industry</option>
                      <option value="Media">🎬 Entertainment &amp; Media</option>
                      <option value="Literature">📚 Literature &amp; Language</option>
                    </optgroup>
                    <optgroup label="── Languages ──">
                      <option value="English">🇬🇧 English</option>
                      <option value="Chinese">🇨🇳 Chinese</option>
                      <option value="French">🇫🇷 French</option>
                      <option value="German">🇩🇪 German</option>
                      <option value="Japanese">🇯🇵 Japanese</option>
                      <option value="Korean">🇰🇷 Korean</option>
                      <option value="Polish">🇵🇱 Polish</option>
                      <option value="Russian">🇷🇺 Russian</option>
                      <option value="Spanish">🇪🇸 Spanish</option>
                      <option value="Non-english">🌐 Non-English</option>
                    </optgroup>
                  </select>
                </div>

                {/* Optimization Strategy Section */}
                <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    Optimization Goal
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setOptimizationGoal('performance')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: optimizationGoal === 'performance' ? '1.5px solid var(--color-text-primary)' : '1px solid var(--color-border)',
                        backgroundColor: optimizationGoal === 'performance' ? 'var(--color-bg-accent)' : '#FFFFFF',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>🛡️</span> Performance Preservation
                    </button>
                    <button
                      type="button"
                      onClick={() => setOptimizationGoal('cost')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: optimizationGoal === 'cost' ? '1.5px solid var(--color-text-primary)' : '1px solid var(--color-border)',
                        backgroundColor: optimizationGoal === 'cost' ? 'var(--color-bg-accent)' : '#FFFFFF',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>📉</span> Target Cost Reduction
                    </button>
                    <button
                      type="button"
                      onClick={() => setOptimizationGoal('quality')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: optimizationGoal === 'quality' ? '1.5px solid var(--color-text-primary)' : '1px solid var(--color-border)',
                        backgroundColor: optimizationGoal === 'quality' ? 'var(--color-bg-accent)' : '#FFFFFF',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>💎</span> Quality Focus
                    </button>
                  </div>

                  {optimizationGoal === 'cost' && (
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px dashed var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600' }}>Min Cost Cut Target</span>
                        <strong style={{ color: 'var(--color-green-primary)' }}>{costCutPercentage}%</strong>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        step="5"
                        value={costCutPercentage}
                        onChange={(e) => setCostCutPercentage(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--color-green-primary)', cursor: 'pointer' }}
                      />
                    </div>
                  )}
                </div>

                <hr style={{ margin: '20px 0', border: 'none', borderBottom: '1px solid var(--color-border)' }} />

                {/* Monthly Input Tokens Slider */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700' }}>Monthly Input (Prompt)</span>
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
                    style={{ width: '100%', accentColor: 'var(--color-green-primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    <span>1M</span>
                    <span>100M</span>
                    <span>200M</span>
                  </div>
                </div>

                {/* Monthly Output Tokens Slider */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700' }}>Monthly Output (Completion)</span>
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
                    style={{ width: '100%', accentColor: 'var(--color-text-primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
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
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>⏳</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Server Busy & Hydrating</h3>
                  <p style={{ fontSize: '14.5px', color: '#92400E', lineHeight: '1.6' }}>
                    The background database is currently synchronizing live pricing and capability benchmarks from the Artificial Analysis API. Please wait a few seconds and adjust the filters to try again.
                  </p>
                </div>
              ) : error ? (
                <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '12px', marginBottom: '24px' }}>
                  ⚠️ <strong>API Connection Error:</strong> {error}
                </div>
              ) : null}

              {/* Baseline stats bar */}
              {results && results.currentBaseline && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', color: '#FFFFFF', padding: '24px', borderRadius: '16px', marginBottom: '24px', boxShadow: 'var(--shadow-md)' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em', fontWeight: 700 }}>Current Baseline Cost</span>
                    <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>
                      ${results.currentBaseline.monthly_cost.toLocaleString()}<span style={{ fontSize: '14px', fontWeight: '400', color: '#94A3B8' }}>/mo</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{results.currentBaseline.name}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                      Index capability: {results.currentBaseline.performance_score}/100 · {results.currentBaseline.tokens_per_second} t/s
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
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
                    {results.recommendations.map((rec, idx) => {
                      const isSelected = selectedRecommendation?.modelId === rec.modelId;
                      const isMoreExpensive = rec.projected_monthly_savings < 0;
                      const isHovered = hoveredModel?.modelId === rec.modelId || hoveredModel?.slug === rec.modelId.split('/')[1];

                      return (
                        <div 
                          key={rec.modelId} 
                          onClick={() => setSelectedRecommendation(rec)}
                          onMouseEnter={() => setHoveredModel(resolveHoveredModelDetails(rec))}
                          onMouseMove={(e) => setHoverPosition({ x: e.clientX, y: e.clientY })}
                          onMouseLeave={() => setHoveredModel(null)}
                          className={`intel-rank-row ${isHovered ? 'is-hovered' : ''}`}
                          style={{
                            border: isSelected 
                              ? '2px solid var(--color-green-primary)' 
                              : isHovered 
                                ? '1px solid #CBD5E1' 
                                : '1px solid var(--color-border)',
                            gridTemplateColumns: '30px 1fr auto auto',
                            boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                            padding: '16px 20px',
                            gap: '16px',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: isHovered ? '#F8FAFC' : '#FFFFFF',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span className={`intel-rank-number ${idx < 3 ? 'is-top-three' : ''}`}>{idx + 1}</span>
                          <span className="intel-rank-name">
                            <strong>{rec.name.replace(/^.*?:\s*/, '')}</strong>
                            <small>{rec.developer} · {rec.modelId.split('/')[1]}</small>
                          </span>
                          
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
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'var(--color-green-light)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#FFFFFF';
                            }}
                          >
                            ⚖️ Compare
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
                    <div className="wizard-card" style={{ marginTop: '32px', border: '1.5px solid var(--color-border)', borderRadius: '16px', padding: '28px', backgroundColor: '#F8FAFC' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '800' }}>
                          🔍 Comparison details: {results?.currentBaseline?.name} vs {selectedRecommendation.name}
                        </h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => handleCompareClick(selectedRecommendation)}
                            className="btn btn-outline" 
                            style={{ 
                              padding: '8px 16px', 
                              fontSize: '12px', 
                              borderRadius: '6px',
                              border: '1.5px solid var(--color-green-primary)',
                              color: 'var(--color-green-text)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: '600',
                              backgroundColor: '#FFFFFF',
                              cursor: 'pointer'
                            }}
                          >
                            📊 Compare ⚖️
                          </button>
                          <button 
                            onClick={() => handleApplyMigration(selectedRecommendation)}
                            className="btn btn-green" 
                            style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Migrate Route 🚀
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
        const tooltipWidth = 420;
        const tooltipHeight = 440;
        let left = hoverPosition.x + 20;
        if (left + tooltipWidth > window.innerWidth) {
          left = hoverPosition.x - tooltipWidth - 20;
        }
        left = Math.max(10, left);

        let top = hoverPosition.y + 10;
        if (top + tooltipHeight > window.innerHeight) {
          top = window.innerHeight - tooltipHeight - 20;
        }
        top = Math.max(10, top);

        const aaScore = (targetUseCase === 'Coding')
          ? (hoveredModel.evaluations?.artificial_analysis_coding_index || hoveredModel.coding_index)
          : (targetUseCase === 'Math')
          ? (hoveredModel.evaluations?.artificial_analysis_math_index || hoveredModel.math_index)
          : (hoveredModel.evaluations?.artificial_analysis_intelligence_index || hoveredModel.intelligence_index);

        return (
          <div style={{
            position: 'fixed',
            left: `${left}px`,
            top: `${top}px`,
            width: `${tooltipWidth}px`,
            zIndex: 9999,
            pointerEvents: 'none',
            padding: '20px',
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            color: '#FFFFFF',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'fadeIn 0.15s ease'
          }}>
            {/* Title & Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {hoveredModel.name}
                </h4>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Created by <strong>{hoveredModel.creator}</strong> • Released {hoveredModel.release_date || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '20px', backgroundColor: '#1E293B', fontSize: '10.5px', fontWeight: '750', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  Rank #{hoveredModel.rank}
                </span>
              </div>
            </div>

            {/* Primary Benchmark and Notes */}
            {(hoveredModel.primary_benchmark || hoveredModel.notes) && (
              <div style={{ padding: '10px 14px', backgroundColor: '#1E293B', borderRadius: '8px', borderLeft: '4px solid #4F46E5', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {hoveredModel.primary_benchmark && (
                  <span style={{ fontSize: '11.5px', color: '#C7D2FE' }}>
                    <strong>Primary Focus:</strong> {hoveredModel.primary_benchmark}
                  </span>
                )}
                {hoveredModel.notes && (
                  <span style={{ fontSize: '11.5px', color: '#E2E8F0', fontStyle: 'italic' }}>
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
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  {hasAA && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
                        Artificial Analysis
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap', color: '#E2E8F0' }}>
                        {hoveredModel.artificial_analysis_rank !== null && hoveredModel.artificial_analysis_rank !== undefined && (
                          <div>Rank: <strong style={{ color: '#F8FAFC' }}>#{hoveredModel.artificial_analysis_rank}</strong></div>
                        )}
                        {aaScore !== null && aaScore !== undefined && aaScore !== 0 && (
                          <div>Score: <strong style={{ color: '#3B82F6' }}>{aaScore.toFixed(1)}</strong></div>
                        )}
                      </div>
                    </div>
                  )}
                  {hasArena && hasAA && <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '4px 0' }}></div>}
                  {hasArena && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
                        Arena AI
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap', color: '#E2E8F0' }}>
                        {hoveredModel.arena_rank !== null && hoveredModel.arena_rank !== undefined && (
                          <div>Rank: <strong style={{ color: '#F8FAFC' }}>#{hoveredModel.arena_rank}</strong></div>
                        )}
                        {hoveredModel.rating > 0 && (
                          <div>Score: <strong style={{ color: '#10B981' }}>{hoveredModel.rating.toFixed(0)}</strong></div>
                        )}
                        {hoveredModel.votes !== null && hoveredModel.votes !== undefined && (
                          <div>Votes: <strong style={{ color: '#F8FAFC' }}>{hoveredModel.votes.toLocaleString()}</strong></div>
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
                  <div><span style={{ color: '#94A3B8' }}>License:</span> <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hoveredModel.license || 'N/A'}</strong></div>
                  <div><span style={{ color: '#94A3B8' }}>Context:</span> <strong style={{ display: 'block' }}>{hoveredModel.context_length ? `${(hoveredModel.context_length / 1000).toFixed(0)}k` : 'N/A'}</strong></div>
                  <div><span style={{ color: '#94A3B8' }}>Votes:</span> <strong style={{ display: 'block' }}>{hoveredModel.votes ? hoveredModel.votes.toLocaleString() : 'N/A'}</strong></div>
                </div>
              </div>

              {/* Column 2: Pricing */}
              {hoveredModel.pricing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h5 style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Pricing (per 1M)</h5>
                  <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div><span style={{ color: '#94A3B8' }}>Blended:</span> <strong style={{ color: '#F97316', display: 'block' }}>${(hoveredModel.pricing.price_1m_blended_3_to_1 || 0).toFixed(2)}</strong></div>
                    <div><span style={{ color: '#94A3B8' }}>Input:</span> <strong style={{ display: 'block' }}>${(hoveredModel.pricing.price_1m_input_tokens || 0).toFixed(2)}</strong></div>
                    <div><span style={{ color: '#94A3B8' }}>Output:</span> <strong style={{ display: 'block' }}>${(hoveredModel.pricing.price_1m_output_tokens || 0).toFixed(2)}</strong></div>
                  </div>
                </div>
              )}

              {/* Column 3: Speed & Latency */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Performance</h5>
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div><span style={{ color: '#94A3B8' }}>Speed:</span> <strong style={{ color: '#3B82F6', display: 'block' }}>{hoveredModel.throughput > 0 ? `${hoveredModel.throughput} t/s` : 'N/A'}</strong></div>
                  <div><span style={{ color: '#94A3B8' }}>Latency:</span> <strong style={{ color: '#EAB308', display: 'block' }}>{hoveredModel.ttft > 0 ? `${hoveredModel.ttft}s` : 'N/A'}</strong></div>
                </div>
              </div>
            </div>

            {/* Section 3: Evaluations */}
            {hoveredModel.evaluations && Object.keys(hoveredModel.evaluations).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                <h5 style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Evaluations & Benchmarks</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                  {Object.entries(hoveredModel.evaluations).map(([key, val]) => {
                    if (val === null || val === undefined) return null;
                    return (
                      <div 
                        key={key} 
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(255,255,255,0.05)',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ color: '#94A3B8' }}>{formatEvalName(key)}:</span>
                        <strong style={{ color: '#10B981' }}>{formatEvalValue(key, val)}</strong>
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
