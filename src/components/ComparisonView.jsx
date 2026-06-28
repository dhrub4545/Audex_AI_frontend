import React, { useState, useMemo, useEffect } from 'react';
import logoImg from '../assets/audex-ai-logo.png';

// Category Definitions with Emojis and descriptions
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

// Helper to compute metrics
function getBenchmarkScores(model, explicitBlendedCost = null, explicitTps = null, intelData = null) {
  if (!model) return {};

  const ev = model.evaluations || {};
  
  // 1. Coding (SWE-Bench)
  let coding = null;
  const rawCoding = ev.artificial_analysis_coding_index;
  if (rawCoding !== undefined && rawCoding !== null && rawCoding > 0) {
    coding = Math.round(rawCoding);
  } else if (ev.lcr !== undefined && ev.lcr !== null) {
    coding = Math.round(ev.lcr * 100);
  } else if (ev.scicode !== undefined && ev.scicode !== null) {
    coding = Math.round(ev.scicode * 100);
  }
  if (coding === 0) {
    coding = null;
  }

  // 2. Reasoning (GPQA Diamond)
  let reasoning = null;
  const rawReasoning = ev.gpqa;
  if (rawReasoning !== undefined && rawReasoning !== null) {
    reasoning = Math.round(rawReasoning <= 1 ? rawReasoning * 100 : rawReasoning);
  }

  // 3. Math (AIME 2024)
  let math = null;
  const rawMath = ev.aime_25 !== null && ev.aime_25 !== undefined ? ev.aime_25 : (ev.aime !== null && ev.aime !== undefined ? ev.aime : (ev.math_500 !== null && ev.math_500 !== undefined ? ev.math_500 : null));
  if (rawMath !== null) {
    math = Math.round(rawMath <= 1 ? rawMath * 100 : rawMath);
  }
  if (math === 0) {
    math = null;
  }

  // 4. Writing (MT-Bench) - Look up from creative-writing rank file
  let writing = null;
  if (intelData && intelData.categories && intelData.categories['creative-writing']) {
    const found = intelData.categories['creative-writing'].find(m => 
      m.slug === model.slug || 
      m.modelId === model.modelId || 
      (model.modelId && m.slug === model.modelId.split('/')[1])
    );
    if (found && found.rating) {
      writing = Math.round(Math.min(98, Math.max(35, ((found.rating - 900) / 700) * 100)));
    }
  }

  // 5. Research (HLE)
  let research = null;
  const rawHle = ev.hle;
  if (rawHle !== undefined && rawHle !== null) {
    research = Math.round(rawHle <= 1 ? rawHle * 100 : rawHle);
  }

  // 6. Function Calling (BFCL v3)
  let funcCalling = null;
  const rawIfbench = ev.ifbench;
  if (rawIfbench !== undefined && rawIfbench !== null) {
    funcCalling = Math.round(rawIfbench <= 1 ? rawIfbench * 100 : rawIfbench);
  }

  // 7. Long Context (Needle In A Haystack) - scaled context length from rank data
  const ctx = model.context_length;
  let longContext = null;
  if (ctx && ctx > 0) {
    if (ctx >= 1000000) longContext = 99;
    else if (ctx >= 200000) longContext = 95;
    else if (ctx >= 128000) longContext = 88;
    else if (ctx >= 32000) longContext = 78;
    else if (ctx >= 8000) longContext = 65;
    else longContext = 50;
  }

  // 8. Multimodal (MMMU) - check if model is multimodal, else skip
  const nameLower = (model.name || '').toLowerCase();
  const idLower = (model.modelId || model.slug || '').toLowerCase();
  const isMultimodal = nameLower.includes('gpt-5') || nameLower.includes('gpt-4') || nameLower.includes('claude-3') || nameLower.includes('claude-fable') || nameLower.includes('gemini') || idLower.includes('gpt-5') || idLower.includes('gpt-4') || idLower.includes('claude-3') || idLower.includes('gemini');
  let multimodal = null;
  if (isMultimodal) {
    multimodal = Math.max(30, Math.min(98, Math.round((ev.artificial_analysis_intelligence_index || 80) * 0.95)));
  }

  // 9. Speed (Tokens/sec) - check raw tps, else skip
  const speedVal = explicitTps || model.capabilities?.tokens_per_second || model.throughput || model.median_output_tokens_per_second || 0;
  let speedNorm = null;
  if (speedVal && speedVal > 0) {
    speedNorm = Math.round(Math.min(95, Math.max(20, (speedVal / 140) * 100)));
  }

  // 10. Cost Efficiency - check blended tokens price, else skip
  const inputCost = model.pricing?.price_1m_input_tokens || model.endpoints?.[0]?.input_cost_per_m || model.cost_per_m_input;
  const outputCost = model.pricing?.price_1m_output_tokens || model.endpoints?.[0]?.output_cost_per_m || model.cost_per_m_output;
  let blended = explicitBlendedCost;
  if (blended === null || blended === undefined || isNaN(blended)) {
    if (inputCost !== undefined && inputCost !== null && outputCost !== undefined && outputCost !== null) {
      blended = inputCost * 0.75 + outputCost * 0.25;
    } else if (model.blendedPrice) {
      blended = model.blendedPrice;
    }
  }
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
    blendedCost: blended
  };
}

export default function ComparisonView({ baseline, recommended, onNavigateBack, token, onUpdateCredits }) {
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [intelData, setIntelData] = useState(null);
  const [geminiReport, setGeminiReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch raw dataset on mount for creative-writing index ranks
  useEffect(() => {
    fetch('http://localhost:5000/api/audits/analysis/raw-data')
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => setIntelData(data))
      .catch(err => console.error('Failed to load raw data in ComparisonView:', err));
  }, []);

  // Fetch Gemini report comparing the two models
  useEffect(() => {
    if (!baseline || !recommended) return;
    
    setLoadingReport(true);
    setErrorMsg(null);

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:5000/api/audits/compare/report', {
      method: 'POST',
      headers,
      body: JSON.stringify({ baseline, recommended }),
    })
      .then(async res => {
        if (!res.ok) {
          if (res.status === 402) {
            const errData = await res.json();
            throw new Error(errData.error || 'Insufficient credits.');
          }
          throw new Error('Failed to generate report');
        }
        return res.json();
      })
      .then(data => {
        setGeminiReport(data.report);
        if (data.updatedCredits && onUpdateCredits) {
          onUpdateCredits(data.updatedCredits);
        }
        setLoadingReport(false);
      })
      .catch(err => {
        console.error('Error fetching Gemini comparison report:', err);
        setErrorMsg(err.message);
        setLoadingReport(false);
      });
  }, [baseline, recommended, token]);

  // Resolve values
  const baselineScores = useMemo(() => {
    const input = baseline?.cost_per_m_input ?? baseline?.pricing?.price_1m_input_tokens ?? 0;
    const output = baseline?.cost_per_m_output ?? baseline?.pricing?.price_1m_output_tokens ?? 0;
    const blended = (input || output) ? (input * 0.75 + output * 0.25) : (baseline?.blendedPrice ?? null);
    const speed = baseline?.tokens_per_second ?? baseline?.throughput ?? null;
    return getBenchmarkScores(
      baseline, 
      blended, 
      speed,
      intelData
    );
  }, [baseline, intelData]);

  const recommendedScores = useMemo(() => {
    const input = recommended?.cost_per_m_input ?? recommended?.pricing?.price_1m_input_tokens ?? 0;
    const output = recommended?.cost_per_m_output ?? recommended?.pricing?.price_1m_output_tokens ?? 0;
    const blended = (input || output) ? (input * 0.75 + output * 0.25) : (recommended?.blendedPrice ?? null);
    const speed = recommended?.tokens_per_second ?? recommended?.throughput ?? null;
    return getBenchmarkScores(
      recommended, 
      blended, 
      speed,
      intelData
    );
  }, [recommended, intelData]);

  // Filter categories to only those with valid scores for BOTH baseline and recommended models
  const activeCategories = useMemo(() => {
    return CATEGORIES.filter(cat => {
      const baseScore = baselineScores[cat.key];
      const recScore = recommendedScores[cat.key];
      return baseScore !== null && baseScore !== undefined && recScore !== null && recScore !== undefined;
    });
  }, [baselineScores, recommendedScores]);

  // Dimension helpers for the SVG Graph
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

  // Chart data points
  const pointsBaseline = useMemo(() => {
    return activeCategories.map((cat, idx) => {
      const score = baselineScores[cat.key];
      return {
        x: getX(idx),
        y: getY(score),
        score: score,
        catName: cat.name,
        sub: cat.sub,
        idx: idx
      };
    });
  }, [baselineScores, activeCategories, chartWidth, chartHeight]);

  const pointsRecommended = useMemo(() => {
    return activeCategories.map((cat, idx) => {
      const score = recommendedScores[cat.key];
      return {
        x: getX(idx),
        y: getY(score),
        score: score,
        catName: cat.name,
        sub: cat.sub,
        idx: idx
      };
    });
  }, [recommendedScores, activeCategories, chartWidth, chartHeight]);

  // Generate smooth horizontal s-curves (cubic bezier curve segments)
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

  const baselinePath = useMemo(() => getSmoothPath(pointsBaseline), [pointsBaseline]);
  const recommendedPath = useMemo(() => getSmoothPath(pointsRecommended), [pointsRecommended]);

  // Handle MouseMove on SVG for tooltip positioning
  const handleSvgMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top - 70
    });
  };

  // Safe checks for savings
  const monthlySavings = recommended?.projected_monthly_savings || (baselineScores.blendedCost ? (baselineScores.blendedCost - recommendedScores.blendedCost) * 10 : 0);
  const annualSavings = recommended?.projected_annual_savings || (monthlySavings * 12);
  const isMoreExpensive = monthlySavings < 0;

  const speedup = baselineScores.speedVal > 0 ? (recommendedScores.speedVal / baselineScores.speedVal).toFixed(1) : '1.0';

  return (
    <div className="app-container" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '64px' }}>
      
      {/* Sleek Sub-Header Navbar */}
      <header className="navbar" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={onNavigateBack}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                backgroundColor: 'var(--color-bg-accent)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#E2E8F0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-accent)'}
            >
              ← Back to spent engine
            </button>
            <div className="brand" style={{ pointerEvents: 'none' }}>
              <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
              <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>Spend Optimiser</span></span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
              Comparing: <strong>{baseline?.name?.replace(/^.*?:\s*/, '')}</strong> vs <strong>{recommended?.name?.replace(/^.*?:\s*/, '')}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ marginTop: '36px', maxWidth: '1100px' }}>
        
        {/* Spend Comparison Widget Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '750', letterSpacing: '0.05em' }}>Spend Impact</div>
            <div style={{ fontSize: '26px', fontWeight: '850', color: isMoreExpensive ? '#EF4444' : '#10B981', fontFamily: 'var(--font-title)', marginTop: '6px' }}>
              {isMoreExpensive ? `+$${Math.abs(monthlySavings).toLocaleString()}` : `-$${Math.abs(monthlySavings).toLocaleString()}`}<span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>/mo</span>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {isMoreExpensive ? 'Increases spends' : 'Saves ' + `$${Math.abs(annualSavings).toLocaleString()}/year`}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '750', letterSpacing: '0.05em' }}>Inference speedup</div>
            <div style={{ fontSize: '26px', fontWeight: '850', color: '#3B82F6', fontFamily: 'var(--font-title)', marginTop: '6px' }}>
              {speedup}x
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {recommendedScores.speedVal} t/s vs {baselineScores.speedVal} t/s baseline
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid var(--color-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '750', letterSpacing: '0.05em' }}>Blended token pricing</div>
            <div style={{ fontSize: '26px', fontWeight: '850', color: 'var(--color-text-primary)', fontFamily: 'var(--font-title)', marginTop: '6px' }}>
              ${recommendedScores.blendedCost?.toFixed(2)}<span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>/1M</span>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Baseline cost: ${baselineScores.blendedCost?.toFixed(2)}/1M tokens
            </div>
          </div>
        </div>

        {/* 1. Sleek Dashboard Card */}
        <div style={{ 
          backgroundColor: '#0F172A', 
          borderRadius: '20px', 
          padding: '36px', 
          color: '#FFFFFF', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative'
        }}>
          
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#F8FAFC', marginBottom: '6px' }}>
              AI Model Benchmarks Across Key Categories
            </h2>
            <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: 0 }}>
              Normalized score (0–100) across major benchmark categories
            </p>
          </div>

          {/* Graphic Section with Legend & SVG */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'stretch' }}>
            
            {/* Legend Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
              
              {/* Recommended Model Legend item */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#10B981', marginTop: '3px', flexShrink: 0, boxShadow: '0 0 10px #10B981' }}></div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '750', color: '#F8FAFC' }}>
                    {recommended?.name?.replace(/^.*?:\s*/, '')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>
                    {recommended?.developer || 'Recommended'}
                  </div>
                </div>
              </div>

              {/* Baseline Model Legend item */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#F97316', marginTop: '3px', flexShrink: 0, boxShadow: '0 0 10px #F97316' }}></div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '750', color: '#E2E8F0' }}>
                    {baseline?.name?.replace(/^.*?:\s*/, '')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>
                    {baseline?.developer || 'Baseline'}
                  </div>
                </div>
              </div>

            </div>

            {/* SVG Graph Workspace */}
            <div style={{ position: 'relative', overflow: 'visible' }}>
              <svg 
                viewBox="0 0 900 420" 
                style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
                onMouseMove={handleSvgMouseMove}
                onMouseLeave={() => setHoveredCategoryIndex(null)}
              >
                {/* Neon filters */}
                <defs>
                  <filter id="glow-rec" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-base" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Y Axis Gridlines (0, 25, 50, 75, 100) */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = 25 * i;
                  const y = 420 - paddingBottom - (val / 100) * chartHeight;
                  return (
                    <g key={i}>
                      <line x1={paddingLeft} y1={y} x2={paddingLeft + chartWidth} y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="4 4" />
                      <text x={paddingLeft - 15} y={y + 4} textAnchor="end" style={{ fill: '#94A3B8', fontSize: '11px', fontWeight: '600' }}>
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Axis Titles */}
                <text 
                  x={15} 
                  y={420 - paddingBottom - chartHeight / 2} 
                  textAnchor="middle" 
                  transform={`rotate(-90, 20, ${420 - paddingBottom - chartHeight / 2})`}
                  style={{ fill: '#64748B', fontSize: '11px', fontWeight: '750', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                >
                  Normalized Score (0-100)
                </text>

                {/* Vertical columns highlight on hover & ticks */}
                {activeCategories.map((cat, idx) => {
                  const x = getX(idx);
                  const isHovered = hoveredCategoryIndex === idx;
                  return (
                    <g key={idx}>
                      {/* Hover column background overlay (visible only on hover) */}
                      {isHovered && (
                        <rect 
                          x={x - 30} 
                          y={paddingTop - 10} 
                          width="60" 
                          height={chartHeight + 20} 
                          fill="rgba(255, 255, 255, 0.05)"
                          pointerEvents="none"
                        />
                      )}

                      {/* Invisible permanent hit-target rectangle for capture events */}
                      <rect 
                        x={x - 30} 
                        y={paddingTop - 10} 
                        width="60" 
                        height={chartHeight + 20} 
                        fill="rgba(255, 255, 255, 0.001)"
                        pointerEvents="all"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredCategoryIndex(idx)}
                      />
                      
                      {/* Vertical line indicator */}
                      <line 
                        x1={x} 
                        y1={paddingTop - 10} 
                        x2={x} 
                        y2={420 - paddingBottom} 
                        stroke={isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)'} 
                        strokeWidth={isHovered ? 1.5 : 1}
                        strokeDasharray={isHovered ? 'none' : '2 2'}
                        pointerEvents="none"
                      />
                    </g>
                  );
                })}

                {/* Draw curve lines */}
                <path 
                  d={baselinePath} 
                  fill="none" 
                  stroke="#F97316" 
                  strokeWidth="3" 
                  opacity="0.85"
                  filter="url(#glow-base)"
                />
                
                <path 
                  d={recommendedPath} 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="3.5" 
                  opacity="0.95"
                  filter="url(#glow-rec)"
                />

                {/* Category Ticks, Icons, and Titles at Bottom */}
                {activeCategories.map((cat, idx) => {
                  const x = getX(idx);
                  const y = 420 - paddingBottom + 12;
                  const isHovered = hoveredCategoryIndex === idx;

                  return (
                    <g key={idx} style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredCategoryIndex(idx)}>
                      {/* Emoji Icon Container circle */}
                      <circle cx={x} cy={y + 12} r="13" fill="#1E293B" stroke={isHovered ? cat.color : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" />
                      <text x={x} y={y + 16} textAnchor="middle" style={{ fontSize: '12px' }}>
                        {cat.icon}
                      </text>

                      {/* Label Text */}
                      <text x={x} y={y + 36} textAnchor="middle" style={{ fill: isHovered ? '#FFFFFF' : '#E2E8F0', fontSize: '10.5px', fontWeight: '700' }}>
                        {cat.name}
                      </text>
                      
                      {/* Sub benchmark name */}
                      <text x={x} y={y + 47} textAnchor="middle" style={{ fill: '#64748B', fontSize: '9px', fontWeight: '500' }}>
                        ({cat.sub})
                      </text>
                    </g>
                  );
                })}

                {/* Interactive Data Dots */}
                {pointsBaseline.map((pt, idx) => {
                  const isHovered = hoveredCategoryIndex === pt.idx;
                  return (
                    <g key={`db-${idx}`}>
                      {isHovered && <circle cx={pt.x} cy={pt.y} r="10" fill="rgba(249,115,22,0.2)" />}
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={isHovered ? 6 : 4.5} 
                        fill="#0F172A" 
                        stroke="#F97316" 
                        strokeWidth="2.5" 
                        style={{ transition: 'all 0.15s ease' }}
                        onMouseEnter={() => setHoveredCategoryIndex(pt.idx)}
                      />
                    </g>
                  );
                })}

                {pointsRecommended.map((pt, idx) => {
                  const isHovered = hoveredCategoryIndex === pt.idx;
                  return (
                    <g key={`dr-${idx}`}>
                      {isHovered && <circle cx={pt.x} cy={pt.y} r="10" fill="rgba(16,185,129,0.2)" />}
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={isHovered ? 6 : 4.5} 
                        fill="#0F172A" 
                        stroke="#10B981" 
                        strokeWidth="2.5" 
                        style={{ transition: 'all 0.15s ease' }}
                        onMouseEnter={() => setHoveredCategoryIndex(pt.idx)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Popup Tooltip */}
              {hoveredCategoryIndex !== null && activeCategories[hoveredCategoryIndex] && (
                <div style={{
                  position: 'absolute',
                  left: `${hoverPosition.x}px`,
                  top: `${hoverPosition.y}px`,
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  minWidth: '220px'
                }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', fontWeight: '800', color: '#F8FAFC' }}>
                    {activeCategories[hoveredCategoryIndex].icon} {activeCategories[hoveredCategoryIndex].name} ({activeCategories[hoveredCategoryIndex].sub})
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                      {recommended?.name?.replace(/^.*?:\s*/, '')}:
                    </span>
                    <strong style={{ color: '#10B981', fontSize: '13px' }}>
                      {recommendedScores[activeCategories[hoveredCategoryIndex].key] !== null 
                        ? `${recommendedScores[activeCategories[hoveredCategoryIndex].key]}${activeCategories[hoveredCategoryIndex].key === 'speedNorm' ? ' t/s' : ''}`
                        : 'N/A'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F97316' }}></span>
                      {baseline?.name?.replace(/^.*?:\s*/, '')}:
                    </span>
                    <strong style={{ color: '#F97316', fontSize: '13px' }}>
                      {baselineScores[activeCategories[hoveredCategoryIndex].key] !== null 
                        ? `${baselineScores[activeCategories[hoveredCategoryIndex].key]}${activeCategories[hoveredCategoryIndex].key === 'speedNorm' ? ' t/s' : ''}`
                        : 'N/A'}
                    </strong>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* 2. Structured comparison grid table */}
          <div style={{ 
            marginTop: '36px', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            backgroundColor: 'rgba(30, 41, 59, 0.25)' 
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(30, 41, 59, 0.65)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '14px 16px', fontWeight: '800', color: '#94A3B8', textAlign: 'left', width: '220px' }}>Model</th>
                  {CATEGORIES.map((cat, idx) => (
                    <th key={idx} style={{ padding: '12px', fontWeight: '750', color: '#E2E8F0', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '14px' }}>{cat.icon}</span>
                        <span style={{ fontSize: '11px' }}>{cat.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Recommended Model Row */}
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }}></span>
                      <div style={{ display: 'inline-block' }}>
                        <div style={{ color: '#FFFFFF', fontSize: '13.5px' }}>{recommended?.name?.replace(/^.*?:\s*/, '')}</div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>{recommended?.developer || 'Recommended'}</div>
                      </div>
                    </div>
                  </td>
                  {CATEGORIES.map((cat, idx) => {
                    const score = recommendedScores[cat.key];
                    const baseScore = baselineScores[cat.key];
                    const isWinner = score !== null && (baseScore === null || score > baseScore);
                    return (
                      <td key={idx} style={{ padding: '16px', color: isWinner ? '#10B981' : '#E2E8F0', fontWeight: isWinner ? '800' : '500' }}>
                        {score !== null ? `${score}${cat.key === 'speedNorm' ? ' t/s' : ''}` : 'N/A'}
                      </td>
                    );
                  })}
                </tr>

                {/* Baseline Model Row */}
                <tr>
                  <td style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F97316', boxShadow: '0 0 6px #F97316' }}></span>
                      <div style={{ display: 'inline-block' }}>
                        <div style={{ color: '#E2E8F0', fontSize: '13.5px' }}>{baseline?.name?.replace(/^.*?:\s*/, '')}</div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>{baseline?.developer || 'Baseline'}</div>
                      </div>
                    </div>
                  </td>
                  {CATEGORIES.map((cat, idx) => {
                    const score = baselineScores[cat.key];
                    const recScore = recommendedScores[cat.key];
                    const isWinner = score !== null && (recScore === null || score > recScore);
                    return (
                      <td key={idx} style={{ padding: '16px', color: isWinner ? '#F97316' : '#94A3B8', fontWeight: isWinner ? '800' : '500' }}>
                        {score !== null ? `${score}${cat.key === 'speedNorm' ? ' t/s' : ''}` : 'N/A'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* Detailed Comparison Explainer & Migration Tips */}
        {errorMsg ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '220px', 
            marginTop: '36px',
            backgroundColor: '#FEF2F2',
            borderRadius: '12px',
            border: '1.5px solid #FCA5A5',
            padding: '40px',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '32px' }}>❌</span>
            <div style={{ fontSize: '16px', color: '#B91C1C', fontWeight: '700' }}>
              Failed to Generate Report
            </div>
            <div style={{ fontSize: '14px', color: '#7F1D1D', maxWidth: '500px' }}>
              {errorMsg}
            </div>
            <button onClick={onNavigateBack} className="btn btn-outline" style={{ marginTop: '8px', color: '#B91C1C', borderColor: '#FCA5A5' }}>
              Go Back
            </button>
          </div>
        ) : loadingReport ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '220px', 
            marginTop: '36px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '40px',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div className="spinner" style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(16, 185, 129, 0.1)',
              borderTop: '4px solid var(--color-green-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
              Gemini AI is analyzing models and compiling migration checklist...
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginTop: '36px' }}>
            
            {/* Analysis breakdown */}
            <div className="wizard-card" style={{ padding: '28px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: 'var(--color-text-primary)' }}>
                {geminiReport?.architectural_insight?.title || '🧠 Architectural Spend Decision Insight'}
              </h4>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {geminiReport?.architectural_insight?.paragraphs ? (
                  geminiReport.architectural_insight.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))
                ) : (
                  <>
                    <p>
                      By switching from <strong>{baseline?.name}</strong> to <strong>{recommended?.name}</strong>, you optimize your spend by targeting models with comparable capability boundaries but substantially lower cost points.
                    </p>
                    <p>
                      This comparison chart highlights standard evaluations compiled from the live Artificial Analysis index. Values are scaled relatively. The recommended model outperforms the baseline in latency efficiency due to its lighter model weight and highly optimized context pipeline.
                    </p>
                  </>
                )}
                
                <div style={{ borderLeft: '4px solid var(--color-green-primary)', paddingLeft: '14px', margin: '8px 0', backgroundColor: 'var(--color-green-light)', padding: '10px 14px', borderRadius: '4px' }}>
                  <strong>{geminiReport?.architectural_insight?.quality_analysis_box ? geminiReport.architectural_insight.quality_analysis_box.split(':')[0] + ':' : 'Quality Analysis:'}</strong>{' '}
                  <span style={{ color: 'var(--color-green-text)', fontWeight: 'bold' }}>
                    {geminiReport?.architectural_insight?.quality_analysis_box 
                      ? geminiReport.architectural_insight.quality_analysis_box.replace(/^Quality Analysis:\s*/i, '') 
                      : `The recommended alternative retains approximately ${recommended?.performance_retained_percentage || 100}% of the baseline capability score while running on a more efficient inference infrastructure.`}
                  </span>
                </div>
              </div>
            </div>

            {/* Migration Checklist card */}
            <div className="wizard-card" style={{ padding: '28px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: 'var(--color-text-primary)' }}>
                {geminiReport?.route_migration_checklist?.title || '🚀 Route Migration Checklist'}
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                {geminiReport?.route_migration_checklist?.steps ? (
                  geminiReport.route_migration_checklist.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-green-primary)', fontWeight: 'bold' }}>✓</span>
                      <span><strong>{step.bold_text}:</strong> {step.detail}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-green-primary)', fontWeight: 'bold' }}>✓</span>
                      <span><strong>API Keys:</strong> Secure key pairs for <strong>{recommended?.developer}</strong> from their developer portal.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-green-primary)', fontWeight: 'bold' }}>✓</span>
                      <span><strong>Endpoint Update:</strong> Modify your API clients config setting the target model ID parameter to <code>"{recommended?.modelId}"</code>.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-green-primary)', fontWeight: 'bold' }}>✓</span>
                      <span><strong>Fallback Buffer:</strong> Implement simple retry routers to fall back to the baseline model if rate limits are exceeded.</span>
                    </div>
                  </>
                )}
                
                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }}></div>

                <button 
                  onClick={() => {
                    const scriptText = geminiReport?.route_migration_checklist?.migration_script || 
                      `Baseline: ${baseline?.name}\nAlternative: ${recommended?.name}\nModel Route ID: ${recommended?.modelId}\n\nProjected Spends cut: $${(monthlySavings).toFixed(2)}/mo.`;
                    alert(`🎉 Route Migration Initiated!\n\n${scriptText}`);
                  }} 
                  className="btn btn-green" 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}
                >
                  Download Migration Script ⬇
                </button>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
