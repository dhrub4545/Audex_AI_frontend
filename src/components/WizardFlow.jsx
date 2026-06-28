import React, { useState, useEffect } from 'react';
import logoImg from '../assets/audex-ai-logo.png';

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
  const [dbModels, setDbModels] = useState([
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
  ]);

  // Fetch available models from backend for API dropdowns
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/audits/models/list');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setDbModels(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch models list in Wizard:', err);
      }
    };
    fetchModels();
  }, []);

  const toggleToolSelection = (toolId) => {
    if (selectedToolIds.includes(toolId)) {
      setSelectedToolIds(selectedToolIds.filter(id => id !== toolId));
    } else {
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

  // Filter tools based on query
  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subscriptionTools = filteredTools.filter(t => t.type === 'subscription');
  const apiTools = filteredTools.filter(t => t.type === 'api');
  const selectedApiTools = tools.filter(t => t.type === 'api' && selectedToolIds.includes(t.id));

  // STEP 1 RENDER
  const renderStep1 = () => (
    <div className="app-container" style={{ backgroundColor: '#FCFCFD' }}>
      <header className="wizard-header">
        <div className="container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="brand">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="wizard-steps-indicator">
            <span className="wizard-step-dot active">1</span>
            <span className="wizard-step-line"></span>
            <span className="wizard-step-dot">2</span>
            <span className="wizard-step-line"></span>
            <span className="wizard-step-dot">3</span>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="wizard-close">✕</a>
        </div>
      </header>

      <main className="main-content wizard-body">
        <div className="wizard-progress-meta">✦ Step 1 of 3 - 33% Complete</div>
        <h2 className="wizard-title">Which AI tools does your team use?</h2>
        <p className="wizard-desc">Select active subscriptions and direct API access nodes currently in use.</p>

        <div className="wizard-card" style={{ padding: '32px' }}>
          
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', marginBottom: '16px' }}>Subscription-Based AI Tools</h3>
          <div className="tool-grid" style={{ marginBottom: '40px' }}>
            {subscriptionTools.map(tool => {
              const isSelected = selectedToolIds.includes(tool.id);
              return (
                <div 
                  key={tool.id} 
                  className={`tool-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleToolSelection(tool.id)}
                >
                  <div className="tool-card-icon">{tool.icon}</div>
                  <div className="tool-card-info">
                    <span className="tool-card-name">{tool.name}</span>
                    <span className="tool-card-desc">{tool.desc}</span>
                  </div>
                  <div className="tool-card-select-badge"></div>
                </div>
              );
            })}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '32px 0' }}></div>

          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', marginBottom: '16px' }}>Direct API Access</h3>
          
          {/* Dropdown for adding direct API models */}
          <div style={{ marginBottom: '20px' }}>
            <select
              className="sub-select"
              value=""
              onChange={(e) => handleAddApiModel(e.target.value)}
              style={{ width: '100%', height: '42px', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', fontWeight: '500', backgroundColor: '#FFFFFF', cursor: 'pointer', outline: 'none' }}
            >
              <option value="" disabled>Choose an API model...</option>
              {dbModels
                .filter(m => !selectedToolIds.includes(m.id))
                .map(m => (
                  <option key={m.id} value={m.id}>{m.name || m.id}</option>
                ))
              }
            </select>
          </div>

          {/* Selected API Model blocks */}
          {selectedApiTools.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {selectedApiTools.map(tool => (
                <div 
                  key={tool.id} 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: 'var(--color-bg-accent)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '20px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <span>🔑 {tool.name}</span>
                  <button 
                    type="button"
                    onClick={() => handleRemoveApiModel(tool.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '700',
                      padding: '0 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1
                    }}
                    title="Remove model"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="search-container">
            <span className="search-label">Missing a tool? Search or add custom</span>
            <div className="search-input-wrapper">
              <input 
                type="text" 
                placeholder="e.g. Midjourney, Notion AI, Custom Script..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleAddCustomTool}
              />
              <span className="search-icon">🔍</span>
              {searchQuery && !tools.some(t => t.name.toLowerCase() === searchQuery.toLowerCase()) && (
                <button 
                  onClick={() => handleAddCustomTool({ key: 'Enter' })} 
                  className="btn btn-black"
                  style={{ borderRadius: '6px', padding: '10px 16px' }}
                >
                  + Add Custom
                </button>
              )}
            </div>
          </div>

          {selectedToolIds.length > 0 && (
            <div className="selection-alert">
              <span>✔</span> {selectedToolIds.length} tools selected · proceed to configure usage
            </div>
          )}
        </div>

        <div className="wizard-actions" style={{ justifyContent: 'flex-end' }}>
          <button 
            onClick={() => onNavigateToView('step2')} 
            className={`btn ${selectedToolIds.length > 0 ? 'btn-black' : 'btn-disabled'}`}
            disabled={selectedToolIds.length === 0}
          >
            Continue to Configure Usage <span style={{ marginLeft: '6px' }}>→</span>
          </button>
        </div>
      </main>
    </div>
  );

  // STEP 2 RENDER
  const renderStep2 = () => (
    <div className="app-container" style={{ backgroundColor: '#FCFCFD' }}>
      <header className="wizard-header">
        <div className="container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="brand">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="wizard-steps-indicator">
            <span className="wizard-step-dot completed">✓</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot active">2</span>
            <span className="wizard-step-line"></span>
            <span className="wizard-step-dot">3</span>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="wizard-close">✕</a>
        </div>
      </header>

      <main className="main-content wizard-body">
        <div className="wizard-progress-meta">✦ Step 2 of 3 - 67% Complete</div>
        <h2 className="wizard-title">Configure your allocations</h2>
        <p className="wizard-desc">Set plans, workloads, and primary team roles for each active tool or API access.</p>

        <div className="wizard-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {selectedToolIds.map(toolId => {
              const tool = tools.find(t => t.id === toolId) || { name: toolId, plans: ['Free', 'Pro', 'Business'], icon: '⚙', type: 'subscription' };
              const configs = toolConfigs[toolId] || [];

              return (
                <div key={toolId} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{tool.icon}</span>
                      <div>
                        <strong style={{ fontSize: '18px', color: '#1E293B' }}>{tool.name}</strong>
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
                    {configs.map((config, index) => (
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
                          <select 
                            className="sub-select"
                            value={config.purpose}
                            onChange={(e) => handleConfigChange(toolId, config.id, 'purpose', e.target.value)}
                            style={{ width: '100%' }}
                          >
                            <option value="Coding">Coding 💻</option>
                            <option value="Writing">Writing ✍</option>
                            <option value="Research">Research 🔍</option>
                            <option value="Math">Math 🔢</option>
                            <option value="Data">Data 📊</option>
                            <option value="Chinese">Chinese 🇨🇳</option>
                            <option value="English">English 🇬🇧</option>
                            <option value="French">French 🇫🇷</option>
                            <option value="German">German 🇩🇪</option>
                            <option value="Japanese">Japanese 🇯🇵</option>
                            <option value="Korean">Korean 🇰🇷</option>
                            <option value="Polish">Polish 🇵🇱</option>
                            <option value="Russian">Russian 🇷🇺</option>
                            <option value="Spanish">Spanish 🇪🇸</option>
                            <option value="Non-English">Non-English 🌐</option>
                            <option value="Hard-prompts">Hard Prompts 💣</option>
                            <option value="Hard-prompts-english">Hard Prompts (English) 🇬🇧💣</option>
                            <option value="Instruction-following">Instruction Following 📋</option>
                            <option value="Multi-turn">Multi-turn Chat 💬</option>
                            <option value="Longer-query">Longer Queries 📝</option>
                            <option value="Expert">Expert Tasks 🎓</option>
                            <option value="Business">Business & Finance 💼</option>
                            <option value="Media">Entertainment & Media 🎬</option>
                            <option value="Legal">Legal & Government ⚖</option>
                            <option value="Science">Life & Social Science 🔬</option>
                            <option value="Math-industry">Mathematical Industry 📐</option>
                            <option value="Healthcare">Medicine & Healthcare 🏥</option>
                            <option value="Software">Software & IT Services 🖥</option>
                            <option value="Literature">Literature & Language 📚</option>
                            <option value="Mixed">Mixed Workloads ⚙</option>
                          </select>
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
    const credits = user ? (user.credits || { starter: 0, pro: 0, proMax: 0 }) : { starter: 1 };
    const hasPremiumCredits = (credits.pro || 0) > 0 || (credits.proMax || 0) > 0;
    const hasAnyCredits = (credits.starter || 0) > 0 || hasPremiumCredits;
    const numTools = selectedToolIds.length;
    const isBlocked = user && (!hasAnyCredits || (numTools > 4 && !hasPremiumCredits));

    return (
      <div className="app-container" style={{ backgroundColor: '#FCFCFD' }}>
        <header className="wizard-header">
          <div className="container">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="brand">
              <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
              <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
            </a>
            <div className="wizard-steps-indicator">
              <span className="wizard-step-dot completed">✓</span>
              <span className="wizard-step-line completed"></span>
              <span className="wizard-step-dot completed">✓</span>
              <span className="wizard-step-line completed"></span>
              <span className="wizard-step-dot active">3</span>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="wizard-close">✕</a>
          </div>
        </header>

        <main className="main-content wizard-body">
          <div className="wizard-progress-meta">✦ Step 3 of 3 - 100% Complete</div>
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
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
              ⚠️ <strong>Error connecting to backend API:</strong> {apiError} <br />
              Please make sure backend server is running on localhost:5000, or try again.
            </div>
          ) : null}

          {user && !hasAnyCredits && (
            <div style={{ backgroundColor: '#FFF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
              ⚠️ <strong>Out of Credits:</strong> You do not have any remaining audit credits in your account balance.
              <div style={{ marginTop: '12px' }}>
                <button 
                  onClick={() => { onNavigateToView('landing'); setTimeout(() => { const el = document.getElementById('pricing'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 150); }} 
                  className="btn btn-black" 
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px' }}
                >
                  🛒 Purchase Credits / Subscribe
                </button>
              </div>
            </div>
          )}

          {user && hasAnyCredits && numTools > 4 && !hasPremiumCredits && (
            <div style={{ backgroundColor: '#FFF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
              ⚠️ <strong>Premium Credits Required:</strong> You have selected {numTools} tools. Starter credits only allow auditing up to 4 tools. Please purchase a Pro or Pro Max subscription, or deselect some tools in Step 1.
              <div style={{ marginTop: '12px' }}>
                <button 
                  onClick={() => { onNavigateToView('landing'); setTimeout(() => { const el = document.getElementById('pricing'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 150); }} 
                  className="btn btn-black" 
                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px' }}
                >
                  🛒 Upgrade Plan
                </button>
              </div>
            </div>
          )}

          <div className="wizard-card" style={{ padding: '32px' }}>
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '16px' }}>Optimization Strategy</label>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {/* Performance Preservation */}
                <div 
                  onClick={() => setOptimizationGoal('performance')}
                  style={{
                    border: '2px solid ' + (optimizationGoal === 'performance' ? '#10B981' : '#E2E8F0'),
                    borderRadius: '12px',
                    padding: '24px',
                    cursor: 'pointer',
                    backgroundColor: optimizationGoal === 'performance' ? '#F0FDF4' : '#FFFFFF',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🛡️</span>
                    <strong style={{ fontSize: '16px', color: '#1E293B' }}>Performance Preservation</strong>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                    Reduce subscription costs while preserving or improving model capabilities. Recommends cheaper options of equal or higher performance.
                  </p>
                </div>

                {/* Target Cost Reduction */}
                <div 
                  onClick={() => setOptimizationGoal('cost')}
                  style={{
                    border: '2px solid ' + (optimizationGoal === 'cost' ? '#10B981' : '#E2E8F0'),
                    borderRadius: '12px',
                    padding: '24px',
                    cursor: 'pointer',
                    backgroundColor: optimizationGoal === 'cost' ? '#F0FDF4' : '#FFFFFF',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px' }}>📉</span>
                    <strong style={{ fontSize: '16px', color: '#1E293B' }}>Target Cost Reduction</strong>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                    Prioritize cost reduction. Recommends models that meet a minimum specified budget cut target, allowing acceptable capability degradation.
                  </p>
                </div>

                {/* Quality Focus */}
                <div 
                  onClick={() => setOptimizationGoal('quality')}
                  style={{
                    border: '2px solid ' + (optimizationGoal === 'quality' ? '#10B981' : '#E2E8F0'),
                    borderRadius: '12px',
                    padding: '24px',
                    cursor: 'pointer',
                    backgroundColor: optimizationGoal === 'quality' ? '#F0FDF4' : '#FFFFFF',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px' }}>💎</span>
                    <strong style={{ fontSize: '16px', color: '#1E293B' }}>Quality Focus</strong>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                    Prioritize maximum AI capability. Recommends the absolute highest-performing models and subscriptions for your workload, regardless of cost.
                  </p>
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
              style={{ padding: '12px 28px' }}
            >
              📊 Run Audit
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
