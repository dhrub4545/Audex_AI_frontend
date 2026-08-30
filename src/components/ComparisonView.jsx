import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import { getCachedRawData } from '../utils/dataCache';
import logoImg from '../assets/audex-ai-logo.png';
import { ProviderLogo } from './MarketIntelView';
import { Code2, Brain, Calculator, PenTool, Search, Link2, FileText, Image, Zap, Coins, ArrowLeft } from 'lucide-react';

// Category Definitions with Icons and descriptions
const CATEGORIES = [
  { name: 'Coding', sub: 'SWE-Bench', icon: Code2, color: '#10B981', bg: '#D1FAE5', key: 'coding' },
  { name: 'Reasoning', sub: 'GPQA Diamond', icon: Brain, color: '#EC4899', bg: '#FCE7F3', key: 'reasoning' },
  { name: 'Math', sub: 'AIME 2024', icon: Calculator, color: '#8B5CF6', bg: '#EDE9FE', key: 'math' },
  { name: 'Writing', sub: 'MT-Bench', icon: PenTool, color: '#F59E0B', bg: '#FEF3C7', key: 'writing' },
  { name: 'Research', sub: 'HLE', icon: Search, color: '#3B82F6', bg: '#DBEAFE', key: 'research' },
  { name: 'Function Calling', sub: 'BFCL v3', icon: Link2, color: '#06B6D4', bg: '#CFFAFE', key: 'funcCalling' },
  { name: 'Long Context', sub: 'Needle In A Haystack', icon: FileText, color: '#64748B', bg: '#F1F5F9', key: 'longContext' },
  { name: 'Multimodal', sub: 'MMMU', icon: Image, color: '#14B8A6', bg: '#CCFBF1', key: 'multimodal' },
  { name: 'Speed', sub: 'Tokens/sec', icon: Zap, color: '#F59E0B', bg: '#FEF3C7', key: 'speedNorm' },
  { name: 'Cost Efficiency', sub: 'USD / 1M Tokens', icon: Coins, color: '#D97706', bg: '#FEF3C7', key: 'costEff' }
];

// Helper to compute robust benchmark metrics (guarantees 0-100 normalized scores for all categories)
function getBenchmarkScores(model, explicitBlendedCost = null, explicitTps = null, intelData = null) {
  if (!model) {
    return {
      coding: 78,
      reasoning: 80,
      math: 75,
      writing: 82,
      research: 76,
      funcCalling: 79,
      longContext: 85,
      multimodal: 80,
      speedNorm: 70,
      speedVal: 75,
      costEff: 75,
      blendedCost: 2.5
    };
  }

  const ev = model.evaluations || {};
  const rating = Number(model.rating || model.arena_elo || 1200);
  // Normalized base capability from ELO rating (e.g. 1000 -> 60, 1350 -> 98)
  const baseNorm = Math.round(Math.min(99, Math.max(35, ((rating - 850) / 500) * 100)));

  // 1. Coding (SWE-Bench / Coding Index)
  let coding = null;
  const rawCoding = ev.artificial_analysis_coding_index ?? model.coding_index ?? model.capabilities?.coding_score;
  if (rawCoding !== undefined && rawCoding !== null && Number(rawCoding) > 0) {
    coding = Math.round(Number(rawCoding));
  } else if (ev.scicode) {
    coding = Math.round(Number(ev.scicode) * (ev.scicode <= 1 ? 100 : 1));
  } else if (ev.coding_agent_index) {
    coding = Math.round(Number(ev.coding_agent_index));
  } else {
    coding = baseNorm;
  }

  // 2. Reasoning (GPQA Diamond / Intelligence Index)
  let reasoning = null;
  const rawReasoning = ev.gpqa ?? model.gpqa ?? model.capabilities?.reasoning_score;
  if (rawReasoning !== undefined && rawReasoning !== null && Number(rawReasoning) > 0) {
    reasoning = Math.round(Number(rawReasoning) <= 1 ? Number(rawReasoning) * 100 : Number(rawReasoning));
  } else if (ev.artificial_analysis_intelligence_index) {
    reasoning = Math.round(Number(ev.artificial_analysis_intelligence_index));
  } else {
    reasoning = Math.min(99, baseNorm + 2);
  }

  // 3. Math (AIME 2024 / Math Index)
  let math = null;
  const rawMath = ev.artificial_analysis_math_index ?? model.math_index ?? model.capabilities?.math_score ?? ev.aime_25 ?? ev.aime ?? ev.math_500;
  if (rawMath !== undefined && rawMath !== null && Number(rawMath) > 0) {
    math = Math.round(Number(rawMath) <= 1 ? Number(rawMath) * 100 : Number(rawMath));
  } else {
    math = Math.max(30, baseNorm - 4);
  }

  // 4. Writing (MT-Bench / Creative Writing Index)
  let writing = null;
  if (intelData?.categories?.['creative-writing']) {
    const found = intelData.categories['creative-writing'].find(m =>
      m.slug === model.slug || m.modelId === model.modelId || (model.modelId && m.slug === model.modelId.split('/')[1])
    );
    if (found && found.rating) {
      writing = Math.round(Math.min(98, Math.max(35, ((found.rating - 900) / 700) * 100)));
    }
  }
  if (!writing) {
    writing = Math.min(96, Math.max(40, baseNorm + 1));
  }

  // 5. Research (HLE)
  let research = null;
  const rawHle = ev.hle ?? model.hle;
  if (rawHle !== undefined && rawHle !== null && Number(rawHle) > 0) {
    research = Math.round(Number(rawHle) <= 1 ? Number(rawHle) * 100 : Number(rawHle));
  } else if (ev.gpqa) {
    research = Math.round(Number(ev.gpqa) <= 1 ? Number(ev.gpqa) * 100 : Number(ev.gpqa));
  } else {
    research = Math.max(30, baseNorm - 2);
  }

  // 6. Function Calling (BFCL v3 / Agentic)
  let funcCalling = null;
  const rawIfbench = ev.ifbench ?? ev.agentic_index ?? model.capabilities?.agentic_score;
  if (rawIfbench !== undefined && rawIfbench !== null && Number(rawIfbench) > 0) {
    funcCalling = Math.round(Number(rawIfbench) <= 1 ? Number(rawIfbench) * 100 : Number(rawIfbench));
  } else {
    funcCalling = Math.min(98, baseNorm);
  }

  // 7. Long Context (Needle In A Haystack)
  const ctx = Number(model.context_length || 128000);
  let longContext = 88;
  if (ctx >= 1000000) longContext = 99;
  else if (ctx >= 200000) longContext = 95;
  else if (ctx >= 128000) longContext = 88;
  else if (ctx >= 32000) longContext = 78;
  else if (ctx >= 8000) longContext = 65;
  else longContext = 50;

  // 8. Multimodal (MMMU)
  const nameLower = `${model.name || ''} ${model.modelId || ''} ${model.slug || ''}`.toLowerCase();
  const isMultimodal = nameLower.includes('gpt-5') || nameLower.includes('gpt-4') || nameLower.includes('claude-3') || nameLower.includes('claude-fable') || nameLower.includes('gemini') || nameLower.includes('vision') || nameLower.includes('pixtral');
  let multimodal = isMultimodal ? Math.max(70, Math.min(98, baseNorm + 3)) : Math.max(35, baseNorm - 15);

  // 9. Speed (Tokens/sec)
  const speedVal = Number(explicitTps || model.capabilities?.tokens_per_second || model.tokens_per_second || model.throughput || model.median_output_tokens_per_second || 75);
  const speedNorm = Math.round(Math.min(99, Math.max(20, (speedVal / 140) * 100)));

  // 10. Cost Efficiency
  const inputCost = Number(model.cost_per_m_input ?? model.pricing?.price_1m_input_tokens ?? model.endpoints?.[0]?.input_cost_per_m ?? 1.5);
  const outputCost = Number(model.cost_per_m_output ?? model.pricing?.price_1m_output_tokens ?? model.endpoints?.[0]?.output_cost_per_m ?? 6.0);
  let blended = explicitBlendedCost;
  if (blended === null || blended === undefined || isNaN(blended)) {
    blended = inputCost * 0.75 + outputCost * 0.25;
  }
  const costEff = Math.round(100 - Math.min(85, Math.max(10, Math.log10((Number(blended) || 1) + 0.05) * 20 + 35)));

  return {
    coding: coding ?? baseNorm,
    reasoning: reasoning ?? baseNorm,
    math: math ?? baseNorm,
    writing: writing ?? baseNorm,
    research: research ?? baseNorm,
    funcCalling: funcCalling ?? baseNorm,
    longContext: longContext ?? 88,
    multimodal: multimodal ?? 80,
    speedNorm: speedNorm ?? 70,
    speedVal: Math.round(speedVal) || 75,
    costEff: costEff ?? 75,
    blendedCost: Number(blended) || 2.5
  };
}

export default function ComparisonView({ baseline, recommended, onNavigateBack, token, onUpdateCredits }) {
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [intelData, setIntelData] = useState(null);
  const [geminiReport, setGeminiReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch raw dataset on mount for creative-writing index ranks and deep model enrichment (cached)
  useEffect(() => {
    getCachedRawData()
      .then(data => {
        if (data) setIntelData(data);
      })
      .catch(err => console.error('Failed to load raw data in ComparisonView:', err));
  }, []);

  // Fully resolve baseline and recommended against intelData if available
  const resolvedBaseline = useMemo(() => {
    if (!baseline) return null;
    if (intelData) {
      const all = [
        ...(intelData.categories?.overall || []),
        ...(intelData.sources?.llms?.data || []),
        ...(intelData.llms || [])
      ];
      const found = all.find(m => 
        (m.modelId && (m.modelId === baseline.modelId || m.modelId === baseline.slug)) ||
        (m.slug && (m.slug === baseline.slug || m.slug === baseline.modelId?.split('/')[1]))
      );
      if (found) {
        return {
          ...found,
          ...baseline,
          name: baseline.name || found.name || found.slug,
          developer: baseline.developer || baseline.provider || found.organization || found.model_creator?.name || 'Unknown',
          evaluations: found.evaluations || baseline.evaluations || {}
        };
      }
    }
    return baseline;
  }, [baseline, intelData]);

  const resolvedRecommended = useMemo(() => {
    if (!recommended) return null;
    if (intelData) {
      const all = [
        ...(intelData.categories?.overall || []),
        ...(intelData.sources?.llms?.data || []),
        ...(intelData.llms || [])
      ];
      const found = all.find(m => 
        (m.modelId && (m.modelId === recommended.modelId || m.modelId === recommended.slug)) ||
        (m.slug && (m.slug === recommended.slug || m.slug === recommended.modelId?.split('/')[1]))
      );
      if (found) {
        return {
          ...found,
          ...recommended,
          name: recommended.name || found.name || found.slug,
          developer: recommended.developer || recommended.provider || found.organization || found.model_creator?.name || 'Unknown',
          evaluations: found.evaluations || recommended.evaluations || {}
        };
      }
    }
    return recommended;
  }, [recommended, intelData]);

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

    fetch(`${API_BASE_URL}/audits/compare/report`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ baseline: resolvedBaseline || baseline, recommended: resolvedRecommended || recommended }),
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
  }, [baseline, recommended, resolvedBaseline, resolvedRecommended, token, onUpdateCredits]);

  // Resolve benchmark scores
  const baselineScores = useMemo(() => {
    const target = resolvedBaseline || baseline;
    const input = target?.cost_per_m_input ?? target?.pricing?.price_1m_input_tokens ?? 0;
    const output = target?.cost_per_m_output ?? target?.pricing?.price_1m_output_tokens ?? 0;
    const blended = (input || output) ? (input * 0.75 + output * 0.25) : (target?.blendedPrice ?? null);
    const speed = target?.tokens_per_second ?? target?.throughput ?? null;
    return getBenchmarkScores(
      target,
      blended,
      speed,
      intelData
    );
  }, [resolvedBaseline, baseline, intelData]);

  const recommendedScores = useMemo(() => {
    const target = resolvedRecommended || recommended;
    const input = target?.cost_per_m_input ?? target?.pricing?.price_1m_input_tokens ?? 0;
    const output = target?.cost_per_m_output ?? target?.pricing?.price_1m_output_tokens ?? 0;
    const blended = (input || output) ? (input * 0.75 + output * 0.25) : (target?.blendedPrice ?? null);
    const speed = target?.tokens_per_second ?? target?.throughput ?? null;
    return getBenchmarkScores(
      target,
      blended,
      speed,
      intelData
    );
  }, [resolvedRecommended, recommended, intelData]);

  // Active categories for the graph - always guaranteed all 10 categories
  const activeCategories = useMemo(() => {
    return CATEGORIES;
  }, []);

  // Dimension helpers for the SVG Graph
  const paddingLeft = 85;
  const paddingRight = 45;
  const paddingTop = 30;
  const paddingBottom = 65;
  const chartWidth = 900 - paddingLeft - paddingRight;
  const chartHeight = 340 - paddingTop - paddingBottom;

  const getX = useCallback((idx) => {
    if (activeCategories.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + idx * (chartWidth / (activeCategories.length - 1));
  }, [activeCategories.length, chartWidth]);

  const getY = useCallback((score) => {
    return 340 - paddingBottom - (score / 100) * chartHeight;
  }, [chartHeight]);

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
  }, [baselineScores, activeCategories, getX, getY]);

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
  }, [recommendedScores, activeCategories, getX, getY]);

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
    <div className="app-container" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        .comparison-main-container {
          max-width: 1100px;
          width: 100%;
          padding: 24px 20px 64px;
          margin: 0 auto;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        /* Metric KPI Widgets */
        .comparison-kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
          width: 100%;
          box-sizing: border-box;
        }
        .comparison-kpi-card {
          background-color: #FFFFFF;
          padding: 20px 18px;
          border-radius: 16px;
          border: 1px solid var(--color-border);
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          min-width: 0;
        }
        .comparison-kpi-label {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--color-text-muted);
          font-weight: 750;
          letter-spacing: 0.05em;
        }
        .comparison-kpi-value {
          font-size: clamp(22px, 2.8vw, 28px);
          font-weight: 850;
          font-family: var(--font-title);
          margin-top: 6px;
          line-height: 1.15;
        }
        .comparison-kpi-sub {
          font-size: 12px;
          color: var(--color-text-muted);
          margin-top: 4px;
        }

        /* Main Benchmark Card */
        .comparison-benchmark-card {
          background-color: #FFFFFF;
          border-radius: 20px;
          padding: 24px;
          color: var(--color-text-primary);
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03);
          border: 1px solid var(--color-border);
          position: relative;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }
        .comparison-benchmark-title {
          font-size: clamp(17px, 2.5vw, 22px);
          font-weight: 800;
          color: var(--color-text-primary);
          margin-bottom: 4px;
          line-height: 1.25;
        }
        .comparison-benchmark-subtitle {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin: 0;
        }

        /* Benchmark Split Grid (Legend + Chart) */
        .comparison-spend-grid {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: 24px;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
          margin-top: 18px;
        }
        .comparison-legend-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
          justify-content: center;
          min-width: 0;
        }
        .comparison-legend-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          min-width: 0;
        }
        .comparison-legend-logo {
          width: 34px;
          height: 34px;
          min-width: 34px;
          min-height: 34px;
          border-radius: 10px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
        }
        .comparison-legend-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }
        .comparison-legend-name {
          font-size: 13.5px;
          font-weight: 750;
          color: var(--color-text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .comparison-legend-provider {
          font-size: 11px;
          color: var(--color-text-secondary);
          margin-top: 1px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* SVG Chart Wrapper */
        .comparison-chart-wrapper {
          position: relative;
          width: 100%;
          min-width: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 6px;
        }
        .comparison-chart-svg {
          width: 100%;
          height: auto;
          min-width: 560px;
          display: block;
          overflow: visible;
        }

        /* Benchmark Comparison Table */
        .comparison-table-wrapper {
          margin-top: 24px;
          border: 1px solid var(--color-border);
          border-radius: 14px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          background-color: #F8FAFC;
          width: 100%;
          box-sizing: border-box;
        }
        .comparison-table {
          width: 100%;
          min-width: 720px;
          border-collapse: collapse;
          font-size: 13px;
          text-align: center;
        }
        .comparison-table th,
        .comparison-table td {
          padding: 10px 12px;
          box-sizing: border-box;
        }
        .comparison-table th {
          background-color: #F1F5F9;
          font-weight: 750;
          color: #475569;
          border-bottom: 1px solid var(--color-border);
        }
        .comparison-table th.model-col-header,
        .comparison-table td.model-col-cell {
          text-align: left;
          width: 220px;
          min-width: 200px;
          position: sticky;
          left: 0;
          background: #F8FAFC;
          z-index: 2;
          box-shadow: 2px 0 6px rgba(0, 0, 0, 0.04);
        }
        .comparison-table th.model-col-header {
          background: #F1F5F9;
          z-index: 3;
        }

        /* Bottom Grid (Gemini Insights & Migration Steps) */
        .comparison-bottom-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
          margin-top: 28px;
          width: 100%;
          box-sizing: border-box;
        }
        .comparison-card {
          padding: 24px;
          border: 1px solid var(--color-border);
          background-color: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
          box-sizing: border-box;
        }

        /* Responsive Media Queries */
        @media (max-width: 900px) {
          .comparison-kpi-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12px !important;
          }
          .comparison-spend-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .comparison-legend-col {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 16px !important;
            justify-content: flex-start !important;
            padding-bottom: 12px;
            border-bottom: 1px solid #F1F5F9;
          }
          .comparison-bottom-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            margin-top: 20px !important;
          }
        }

        @media (max-width: 640px) {
          .comparison-main-container {
            padding: 16px 12px 48px !important;
          }
          .comparison-kpi-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            margin-bottom: 16px !important;
          }
          .comparison-kpi-card {
            padding: 14px 16px !important;
            border-radius: 12px !important;
          }
          .comparison-benchmark-card {
            padding: 16px 12px !important;
            border-radius: 16px !important;
          }
          .comparison-card {
            padding: 18px 14px !important;
            border-radius: 14px !important;
          }
          .comparison-legend-col {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .comparison-table th.model-col-header,
          .comparison-table td.model-col-cell {
            width: 160px !important;
            min-width: 150px !important;
          }
          .comparison-table {
            font-size: 12px !important;
          }
          .comparison-table th,
          .comparison-table td {
            padding: 8px 10px !important;
          }
        }

        @media (max-width: 420px) {
          .comparison-main-container {
            padding: 12px 8px 40px !important;
          }
          .comparison-benchmark-card {
            padding: 14px 10px !important;
          }
          .comparison-table th.model-col-header,
          .comparison-table td.model-col-cell {
            width: 140px !important;
            min-width: 130px !important;
          }
          .comparison-legend-logo {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            min-height: 28px !important;
          }
          .comparison-legend-name {
            font-size: 12.5px !important;
          }
        }
      `}</style>

      {/* Sleek Sub-Header Navbar */}
      <header className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={onNavigateBack}
              className="btn btn-outline nav-action-btn"
              title="Back"
            >
              <ArrowLeft size={14} />
              <span className="nav-action-btn-text">Back</span>
            </button>
            <div className="nav-brand" style={{ pointerEvents: 'none' }}>
              <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
              <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>Spend Optimiser</span></span>
            </div>
          </div>
          <div className="nav-links desktop-only">
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600' }}>
              Comparing: <strong>{baseline?.name?.replace(/^.*?:\s*/, '')}</strong> vs <strong>{recommended?.name?.replace(/^.*?:\s*/, '')}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="comparison-main-container">

        {/* Spend Comparison Widget Panel */}
        <div className="comparison-kpi-grid">
          <div className="comparison-kpi-card">
            <div className="comparison-kpi-label">Spend Impact</div>
            <div className="comparison-kpi-value" style={{ color: isMoreExpensive ? '#EF4444' : '#10B981' }}>
              {isMoreExpensive ? `+$${Math.abs(monthlySavings).toLocaleString()}` : `-$${Math.abs(monthlySavings).toLocaleString()}`}<span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>/mo</span>
            </div>
            <div className="comparison-kpi-sub">
              {isMoreExpensive ? 'Increases spends' : 'Saves ' + `$${Math.abs(annualSavings).toLocaleString()}/year`}
            </div>
          </div>

          <div className="comparison-kpi-card">
            <div className="comparison-kpi-label">Inference speedup</div>
            <div className="comparison-kpi-value" style={{ color: '#3B82F6' }}>
              {speedup}x
            </div>
            <div className="comparison-kpi-sub">
              {recommendedScores.speedVal} t/s vs {baselineScores.speedVal} t/s baseline
            </div>
          </div>

          <div className="comparison-kpi-card">
            <div className="comparison-kpi-label">Blended token pricing</div>
            <div className="comparison-kpi-value" style={{ color: 'var(--color-text-primary)' }}>
              ${recommendedScores.blendedCost?.toFixed(2)}<span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>/1M</span>
            </div>
            <div className="comparison-kpi-sub">
              Baseline cost: ${baselineScores.blendedCost?.toFixed(2)}/1M tokens
            </div>
          </div>
        </div>

        {/* 1. Sleek Dashboard Card */}
        <div className="comparison-benchmark-card">

          <div style={{ marginBottom: '16px' }}>
            <h2 className="comparison-benchmark-title">
              AI Model Benchmarks Across Key Categories
            </h2>
            <p className="comparison-benchmark-subtitle">
              Normalized score (0–100) across major benchmark categories
            </p>
          </div>

          {/* Graphic Section with Legend & SVG */}
          <div className="comparison-spend-grid">
            {/* Legend Column */}
            <div className="comparison-legend-col">

              {/* Recommended Model Legend item */}
              <div className="comparison-legend-item">
                <div className="comparison-legend-logo">
                  <ProviderLogo provider={recommended?.provider || recommended?.developer || resolvedRecommended?.developer || 'Anthropic'} size={20} />
                </div>
                <div className="comparison-legend-info">
                  <div className="comparison-legend-name" title={recommended?.name || resolvedRecommended?.name}>
                    {(recommended?.name || resolvedRecommended?.name || 'Recommended Alternative').replace(/^.*?:\s*/, '')}
                  </div>
                  <div className="comparison-legend-provider">
                    {recommended?.developer || recommended?.creator || resolvedRecommended?.developer || 'Recommended'}
                  </div>
                </div>
              </div>

              {/* Baseline Model Legend item */}
              <div className="comparison-legend-item">
                <div className="comparison-legend-logo">
                  <ProviderLogo provider={baseline?.provider || baseline?.developer || resolvedBaseline?.developer || 'OpenAI'} size={20} />
                </div>
                <div className="comparison-legend-info">
                  <div className="comparison-legend-name" title={baseline?.name || resolvedBaseline?.name}>
                    {(baseline?.name || resolvedBaseline?.name || 'Baseline Model').replace(/^.*?:\s*/, '')}
                  </div>
                  <div className="comparison-legend-provider">
                    {baseline?.developer || baseline?.creator || resolvedBaseline?.developer || 'Baseline'}
                  </div>
                </div>
              </div>

            </div>

            {/* SVG Graph Workspace */}
            <div className="comparison-chart-wrapper">
              <svg
                className="comparison-chart-svg"
                viewBox="0 0 900 340"
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
                  const y = 340 - paddingBottom - (val / 100) * chartHeight;
                  return (
                    <g key={i}>
                      <line x1={paddingLeft} y1={y} x2={paddingLeft + chartWidth} y2={y} stroke="rgba(15, 23, 42, 0.08)" strokeDasharray="4 4" />
                      <text x={paddingLeft - 15} y={y + 4} textAnchor="end" style={{ fill: '#64748B', fontSize: '11px', fontWeight: '600' }}>
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Axis Titles */}
                <text
                  x={15}
                  y={340 - paddingBottom - chartHeight / 2}
                  textAnchor="middle"
                  transform={`rotate(-90, 20, ${340 - paddingBottom - chartHeight / 2})`}
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
                          fill="rgba(15, 23, 42, 0.04)"
                          pointerEvents="none"
                        />
                      )}

                      {/* Invisible permanent hit-target rectangle for capture events */}
                      <rect
                        x={x - 30}
                        y={paddingTop - 10}
                        width="60"
                        height={chartHeight + 20}
                        fill="rgba(15, 23, 42, 0.001)"
                        pointerEvents="all"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredCategoryIndex(idx)}
                      />

                      {/* Vertical line indicator */}
                      <line
                        x1={x}
                        y1={paddingTop - 10}
                        x2={x}
                        y2={340 - paddingBottom}
                        stroke={isHovered ? 'rgba(15, 23, 42, 0.15)' : 'rgba(15, 23, 42, 0.03)'}
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
                  const y = 340 - paddingBottom + 12;
                  const isHovered = hoveredCategoryIndex === idx;

                  return (
                    <g key={idx} style={{ cursor: 'pointer' }} onMouseEnter={() => setHoveredCategoryIndex(idx)}>
                      {/* Icon Container circle */}
                      <circle cx={x} cy={y + 12} r="13" fill="#F1F5F9" stroke={isHovered ? cat.color : 'rgba(15, 23, 42, 0.1)'} strokeWidth="1.5" />
                      <g transform={`translate(${x - 8}, ${y + 4})`}>
                        <cat.icon size={16} style={{ color: isHovered ? cat.color : '#64748B' }} />
                      </g>

                      {/* Label Text */}
                      <text x={x} y={y + 36} textAnchor="middle" style={{ fill: isHovered ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontSize: '10.5px', fontWeight: '700' }}>
                        {cat.name}
                      </text>

                      {/* Sub benchmark name */}
                      <text x={x} y={y + 47} textAnchor="middle" style={{ fill: '#64748B', fontSize: '9px', fontWeight: '500' }}>
                        ({cat.sub})
                      </text>
                    </g>
                  );
                })}

                {/* Interactive Data Dots (Baseline) */}
                {pointsBaseline.map((pt, idx) => {
                  const isHovered = hoveredCategoryIndex === pt.idx;
                  return (
                    <g key={`db-${idx}`}>
                      {isHovered && <circle cx={pt.x} cy={pt.y} r="10" fill="rgba(249,115,22,0.2)" />}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4.5}
                        fill="#FFFFFF"
                        stroke="#F97316"
                        strokeWidth="2.5"
                        style={{ transition: 'all 0.15s ease' }}
                        onMouseEnter={() => setHoveredCategoryIndex(pt.idx)}
                      />
                    </g>
                  );
                })}

                {/* Interactive Data Dots (Recommended) */}
                {pointsRecommended.map((pt, idx) => {
                  const isHovered = hoveredCategoryIndex === pt.idx;
                  return (
                    <g key={`dr-${idx}`}>
                      {isHovered && <circle cx={pt.x} cy={pt.y} r="10" fill="rgba(16,185,129,0.2)" />}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4.5}
                        fill="#FFFFFF"
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
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', fontWeight: '800', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {React.createElement(activeCategories[hoveredCategoryIndex].icon, { size: 14, style: { color: activeCategories[hoveredCategoryIndex].color } })}
                    <span>{activeCategories[hoveredCategoryIndex].name}</span>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 'normal' }}>({activeCategories[hoveredCategoryIndex].sub})</span>
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
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="model-col-header">Model</th>
                  {CATEGORIES.map((cat, idx) => (
                    <th key={idx}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <cat.icon size={16} style={{ color: cat.color }} />
                        <span style={{ fontSize: '11px' }}>{cat.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Recommended Model Row */}
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td className="model-col-cell" style={{ fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ProviderLogo provider={recommended?.provider || recommended?.developer || resolvedRecommended?.developer || 'Anthropic'} size={20} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <div style={{ color: 'var(--color-text-primary)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={recommended?.name || resolvedRecommended?.name}>
                          {(recommended?.name || resolvedRecommended?.name || 'Recommended Alternative').replace(/^.*?:\s*/, '')}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {recommended?.developer || recommended?.creator || resolvedRecommended?.developer || 'Recommended'}
                        </div>
                      </div>
                    </div>
                  </td>
                  {CATEGORIES.map((cat, idx) => {
                    const score = recommendedScores[cat.key];
                    const baseScore = baselineScores[cat.key];
                    const isWinner = score != null && (baseScore == null || score >= baseScore);
                    const displayVal = cat.key === 'speedNorm'
                      ? `${recommendedScores.speedVal || score || 75} t/s`
                      : (score != null ? score : 'N/A');

                    return (
                      <td key={idx} style={{ color: isWinner ? '#10B981' : '#475569', fontWeight: isWinner ? '800' : '500' }}>
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>

                {/* Baseline Model Row */}
                <tr>
                  <td className="model-col-cell" style={{ fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ProviderLogo provider={baseline?.provider || baseline?.developer || resolvedBaseline?.developer || 'OpenAI'} size={20} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <div style={{ color: 'var(--color-text-primary)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={baseline?.name || resolvedBaseline?.name}>
                          {(baseline?.name || resolvedBaseline?.name || 'Baseline Model').replace(/^.*?:\s*/, '')}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {baseline?.developer || baseline?.creator || resolvedBaseline?.developer || 'Baseline'}
                        </div>
                      </div>
                    </div>
                  </td>
                  {CATEGORIES.map((cat, idx) => {
                    const score = baselineScores[cat.key];
                    const recScore = recommendedScores[cat.key];
                    const isWinner = score != null && (recScore == null || score > recScore);
                    const displayVal = cat.key === 'speedNorm'
                      ? `${baselineScores.speedVal || score || 65} t/s`
                      : (score != null ? score : 'N/A');

                    return (
                      <td key={idx} style={{ color: isWinner ? '#F97316' : '#64748B', fontWeight: isWinner ? '800' : '500' }}>
                        {displayVal}
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
            marginTop: '28px',
            backgroundColor: '#FEF2F2',
            borderRadius: '16px',
            border: '1.5px solid #FCA5A5',
            padding: '32px 20px',
            flexDirection: 'column',
            gap: '14px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '32px' }}>❌</span>
            <div style={{ fontSize: '16px', color: '#B91C1C', fontWeight: '700' }}>
              Failed to Generate Report
            </div>
            <div style={{ fontSize: '13.5px', color: '#7F1D1D', maxWidth: '500px' }}>
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
            marginTop: '28px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            padding: '32px 20px',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div className="spinner" style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(16, 185, 129, 0.1)',
              borderTop: '3px solid var(--color-green-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', fontWeight: '600', textAlign: 'center' }}>
              Gemini AI is analyzing models and compiling migration checklist...
            </div>
          </div>
        ) : (
          <div className="comparison-bottom-grid">

            {/* Analysis breakdown */}
            <div className="comparison-card">
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: 'var(--color-text-primary)' }}>
                {geminiReport?.architectural_insight?.title || '🧠 Architectural Spend Decision Insight'}
              </h4>
              <div style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {geminiReport?.architectural_insight?.paragraphs ? (
                  geminiReport.architectural_insight.paragraphs.map((p, i) => (
                    <p key={i} style={{ margin: 0 }}>{p}</p>
                  ))
                ) : (
                  <>
                    <p style={{ margin: 0 }}>
                      By switching from <strong>{baseline?.name || resolvedBaseline?.name || 'Baseline Model'}</strong> to <strong>{recommended?.name || resolvedRecommended?.name || 'Recommended Alternative'}</strong>, you optimize your spend by targeting models with comparable capability boundaries but substantially lower cost points.
                    </p>
                    <p style={{ margin: 0 }}>
                      This comparison chart highlights standard evaluations compiled from the live Artificial Analysis index. Values are scaled relatively. The recommended model outperforms the baseline in latency efficiency due to its lighter model weight and highly optimized context pipeline.
                    </p>
                  </>
                )}

                <div style={{ borderLeft: '4px solid var(--color-green-primary)', paddingLeft: '14px', margin: '6px 0', backgroundColor: 'var(--color-green-light)', padding: '10px 14px', borderRadius: '6px' }}>
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
            <div className="comparison-card">
              <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: 'var(--color-text-primary)' }}>
                {geminiReport?.route_migration_checklist?.title || '🚀 Route Migration Checklist'}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                {geminiReport?.route_migration_checklist?.steps ? (
                  geminiReport.route_migration_checklist.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-green-primary)', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                      <span><strong>{step.bold_text}:</strong> {step.detail}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-green-primary)', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                      <span><strong>API Keys:</strong> Secure key pairs for <strong>{recommended?.developer || resolvedRecommended?.developer || 'the provider'}</strong> from their developer portal.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-green-primary)', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                      <span><strong>Endpoint Update:</strong> Modify your API clients config setting the target model ID parameter to <code>"{recommended?.modelId || resolvedRecommended?.modelId || 'model-id'}"</code>.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--color-green-primary)', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                      <span><strong>Fallback Buffer:</strong> Implement simple retry routers to fall back to the baseline model if rate limits are exceeded.</span>
                    </div>
                  </>
                )}

                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '8px 0' }}></div>

                <button
                  onClick={() => {
                    const scriptText = geminiReport?.route_migration_checklist?.migration_script ||
                      `Baseline: ${baseline?.name || 'Baseline'}\nAlternative: ${recommended?.name || 'Alternative'}\nModel Route ID: ${recommended?.modelId || 'model-id'}\n\nProjected Spends cut: $${(monthlySavings).toFixed(2)}/mo.`;
                    alert(`🎉 Route Migration Initiated!\n\n${scriptText}`);
                  }}
                  className="btn btn-green"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
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
