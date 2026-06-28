import React, { useState } from 'react';
import logoImg from '../assets/audex-ai-logo.png';

export default function ResultsView({ auditResult, onNavigateToView, user, renderCoinDropdown }) {
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  if (!auditResult) return null;
  const { savings, selectedTools } = auditResult;

  // ── Aggregate numbers for the detailed report ──────────────────────────────
  const recs = savings.recommendations || [];
  const currentCostVal = auditResult.totalCurrentCost || recs.reduce((acc, rec) => {
    const match = rec.issue ? rec.issue.match(/Paying \$([\d,.]+)/) : null;
    return match ? acc + parseFloat(match[1].replace(/,/g, '')) : acc;
  }, 0);

  const totalApiSavings = savings.apiMonthly  ?? savings.totalMonthly  ?? 0;
  const totalSubSavings = savings.subMonthly  ?? savings.totalMonthly  ?? 0;
  const bestMonthly     = Math.max(totalApiSavings, totalSubSavings);
  const bestAnnual      = bestMonthly * 12;
  const savingPct       = currentCostVal > 0 ? ((bestMonthly / currentCostVal) * 100).toFixed(1) : 0;
  const goalLabel       = auditResult.optimizationGoal === 'performance'
    ? 'Performance Preservation'
    : auditResult.optimizationGoal === 'quality'
    ? 'Quality Focus'
    : `Target Cost Reduction (${auditResult.costCutPercentage || 50}%)`;

  const phases = [
    { phase: 'Phase 1  (0–7 Days)',   actions: 'Implement top-priority recommendation from the API path options below.',     priority: 'High',   effort: '1–2 days', savings: `$${Math.max(0, totalApiSavings).toLocaleString()}/mo`   },
    { phase: 'Phase 2  (8–14 Days)',  actions: 'Replace remaining over-provisioned subscriptions with cheaper tiers.',       priority: 'High',   effort: '3–5 days', savings: `$${Math.max(0, totalSubSavings * 0.5).toFixed(0)}/mo`  },
    { phase: 'Phase 3  (15–30 Days)', actions: 'Optimize prompts & enable caching across all adopted models.',               priority: 'Medium', effort: '3–4 days', savings: '$500/mo'  },
    { phase: 'Phase 4  (30+ Days)',   actions: 'Monitor, evaluate & fine-tune routing rules.',                               priority: 'Low',    effort: 'Ongoing',  savings: '$300/mo'  },
  ];
  const priorityColor = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' };

  return (
    <div className="app-container">
      {/* ── Navbar ── */}
      <header className="navbar">
        <div className="container">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="brand">
            <img src={logoImg} alt="Audex AI Logo" className="brand-logo" />
            <span className="brand-name">Audex <span style={{ color: 'var(--color-green-primary)' }}>AI</span></span>
          </a>
          <div className="nav-actions">
            {renderCoinDropdown && renderCoinDropdown()}
            <button onClick={() => onNavigateToView('landing')} className="btn btn-outline">Back to Home</button>
            <button onClick={() => onNavigateToView('step1')} className="btn btn-black">Run Another Audit</button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main-content" style={{ padding: '48px 0' }}>
        <div className="container">
          <div className="results-grid">

            {/* ── Sidebar ── */}
            <div className="results-sidebar">
              <div className="results-card" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '800' }}>Spend Audit Overview</h3>

                {/* Current Cost */}
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>Current Stack Cost</span>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', marginTop: '4px' }}>
                    ${currentCostVal.toLocaleString()}<span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>/mo</span>
                  </div>
                </div>

                <div className="results-stats" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* API Pathway */}
                  <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1.5px solid #CBD5E1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px' }}>🔑</span>
                      <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>Option A: Direct API Path</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Monthly Savings:</span>
                      <strong style={{ fontSize: '18px', color: (savings.apiMonthly ?? savings.totalMonthly) < 0 ? '#DC2626' : 'var(--color-green-primary)' }}>
                        {(savings.apiMonthly ?? savings.totalMonthly) < 0 ? `+$${Math.abs(savings.apiMonthly ?? savings.totalMonthly).toLocaleString()}` : `$${(savings.apiMonthly ?? savings.totalMonthly).toLocaleString()}`}
                        <span style={{ fontSize: '11px', fontWeight: 500 }}>/mo</span>
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Annual Savings:</span>
                      <strong style={{ fontSize: '14px', color: (savings.apiAnnual ?? savings.totalAnnual) < 0 ? '#DC2626' : 'var(--color-green-primary)' }}>
                        {(savings.apiAnnual ?? savings.totalAnnual) < 0 ? `+$${Math.abs(savings.apiAnnual ?? savings.totalAnnual).toLocaleString()}` : `$${(savings.apiAnnual ?? savings.totalAnnual).toLocaleString()}`}
                        <span style={{ fontSize: '11px', fontWeight: 500 }}>/yr</span>
                      </strong>
                    </div>
                  </div>

                  {/* Subscription Pathway */}
                  <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#F0FDF4', border: '1.5px solid #A7F3D0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px' }}>💳</span>
                      <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#047857', letterSpacing: '0.05em' }}>Option B: Subscription Path</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Monthly Savings:</span>
                      <strong style={{ fontSize: '18px', color: (savings.subMonthly ?? savings.totalMonthly) < 0 ? '#DC2626' : '#10B981' }}>
                        {(savings.subMonthly ?? savings.totalMonthly) < 0 ? `+$${Math.abs(savings.subMonthly ?? savings.totalMonthly).toLocaleString()}` : `$${(savings.subMonthly ?? savings.totalMonthly).toLocaleString()}`}
                        <span style={{ fontSize: '11px', fontWeight: 500 }}>/mo</span>
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Annual Savings:</span>
                      <strong style={{ fontSize: '14px', color: (savings.subAnnual ?? savings.totalAnnual) < 0 ? '#DC2626' : '#10B981' }}>
                        {(savings.subAnnual ?? savings.totalAnnual) < 0 ? `+$${Math.abs(savings.subAnnual ?? savings.totalAnnual).toLocaleString()}` : `$${(savings.subAnnual ?? savings.totalAnnual).toLocaleString()}`}
                        <span style={{ fontSize: '11px', fontWeight: 500 }}>/yr</span>
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Total Team Seats:</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{auditResult.teamSize || 0} seats</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Optimization Goal:</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>
                      {auditResult.optimizationGoal === 'performance'
                        ? 'Performance Preservation'
                        : auditResult.optimizationGoal === 'quality'
                        ? 'Quality Focus'
                        : `Target Cost Reduction (${auditResult.costCutPercentage}%)`}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Configured Allocations:</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>
                      {auditResult.allocations ? auditResult.allocations.length : (selectedTools ? selectedTools.length : 0)} allocation(s)
                    </strong>
                  </div>
                </div>
              </div>

              {/* Quick Tip card with the new button */}
              <div className="results-card" style={{ padding: '24px', backgroundColor: '#F8FAFC' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>💡 Quick Tip</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Export this optimization report as a PDF to share with your finance department and start trimming down unnecessary seat counts immediately.
                </p>
                <button onClick={() => window.print()} className="btn btn-outline" style={{ width: '100%', marginTop: '16px', fontSize: '12px', padding: '8px' }}>
                  Print/Save PDF Report
                </button>

                {/* ── Detailed Report Toggle Button ── */}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                  <button
                    id="detailed-report-btn"
                    onClick={() => {
                      const next = !showDetailedReport;
                      setShowDetailedReport(next);
                      if (next) {
                        setTimeout(() => {
                          document.getElementById('detailed-report-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 80);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #6366F1',
                      background: showDetailedReport
                        ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                        : '#FFFFFF',
                      color: showDetailedReport ? '#FFFFFF' : '#6366F1',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      boxShadow: showDetailedReport ? '0 4px 14px rgba(99,102,241,0.35)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>📊</span>
                    {showDetailedReport ? 'Hide Detailed Report' : 'View Detailed Report'}
                    <span style={{ fontSize: '10px', opacity: 0.7 }}>{showDetailedReport ? '▲' : '▼'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── Main Recommendations Content ── */}
            <div>
              <h2 className="results-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                Optimisation Action Plan
                <span style={{
                  fontSize: '13px', fontWeight: '700', color: '#1E293B',
                  backgroundColor: '#E2E8F0', padding: '6px 14px', borderRadius: '9999px',
                  display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}>
                  🎯 Mode: {auditResult.optimizationGoal === 'performance'
                    ? 'Performance Preservation'
                    : auditResult.optimizationGoal === 'quality'
                    ? 'Quality Focus'
                    : `Target Cost Reduction (${auditResult.costCutPercentage || 50}%)`}
                </span>
              </h2>
              <p className="results-desc">
                {auditResult.optimizationGoal === 'quality'
                  ? `We analyzed your stack and identified ${savings.recommendations.length} capability upgrade recommendations. Implement these changes to maximize model quality.`
                  : auditResult.optimizationGoal === 'cost'
                  ? `We analyzed your stack targeting a ${auditResult.costCutPercentage || 50}% cost reduction and detected ${savings.recommendations.length} key waste indicators. Implement these steps to optimize your budget.`
                  : `We analyzed your stack and detected ${savings.recommendations.length} key waste indicators. Implement these steps to optimize your budget.`}
              </p>

              {savings.recommendations.length === 0 ? (
                <div style={{ backgroundColor: 'var(--color-green-light)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                  <span style={{ fontSize: '32px' }}>🎉</span>
                  <h3 style={{ marginTop: '16px', color: 'var(--color-green-text)' }}>Your AI spend is perfectly optimized!</h3>
                  <p style={{ marginTop: '8px', fontSize: '14px' }}>No redundancies or over-provisioned seats were detected for your configured team size.</p>
                </div>
              ) : (
                <div className="results-recommendations-list">
                  {savings.recommendations.map((rec, index) => {
                    const match = rec.issue ? rec.issue.match(/Paying \$([\d,.]+)/) : null;
                    const itemCurrentCost = match ? parseFloat(match[1].replace(/,/g, '')) : 0;
                    return (
                      <div key={index} className="rec-card" style={{ display: 'block', padding: '24px', marginBottom: '24px' }}>
                        <div className="rec-info" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <span className="rec-tool" style={{ fontWeight: '800', fontSize: '15px' }}>
                              <span>●</span> {rec.tool}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: '750', color: '#64748B', backgroundColor: '#F1F5F9', padding: '4px 12px', borderRadius: '6px' }}>
                              Current Cost: ${itemCurrentCost.toLocaleString()}/mo
                            </span>
                          </div>
                          <span className="rec-issue" style={{ marginBottom: '20px', display: 'block', fontSize: '13.5px', color: '#475569' }}>{rec.issue}</span>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', width: '100%' }}>

                            {rec.apiOption && (
                              <div style={{ padding: '20px', border: '1.5px solid #CBD5E1', borderRadius: '12px', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>Option A: Direct API Integration</span>
                                    {rec.apiOption.statusText ? (
                                      <span style={{ fontSize: '11px', fontWeight: '750', color: '#3B82F6', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '4px' }}>✓ Current Best</span>
                                    ) : (
                                      <span style={{ fontSize: '11.5px', fontWeight: '750', color: rec.apiOption.savings < 0 ? '#DC2626' : '#10B981', backgroundColor: rec.apiOption.savings < 0 ? '#FEF2F2' : '#F0FDF4', padding: '3px 8px', borderRadius: '9999px' }}>
                                        {rec.apiOption.savings < 0 ? `+$${Math.abs(rec.apiOption.savings).toLocaleString()} cost` : `-$${rec.apiOption.savings.toLocaleString()} save`}
                                      </span>
                                    )}
                                  </div>
                                  <p style={{ fontSize: '13px', color: '#1E293B', fontWeight: '600', margin: '0 0 8px 0', lineHeight: '1.5' }}>{rec.apiOption.action}</p>
                                  {rec.apiOption.statusText && <p style={{ fontSize: '12px', color: '#3B82F6', margin: '4px 0 0 0', fontWeight: '600' }}>💡 {rec.apiOption.statusText}</p>}
                                </div>
                                <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                  <span style={{ fontSize: '12px', color: '#64748B' }}>Est. Monthly Cost:</span>
                                  <strong style={{ fontSize: '15px', color: '#0F172A' }}>${rec.apiOption.cost.toLocaleString()}/mo</strong>
                                </div>
                              </div>
                            )}

                            {rec.subscriptionOption && (
                              <div style={{ padding: '20px', border: '1.5px solid #A7F3D0', borderRadius: '12px', backgroundColor: '#F0FDF4', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#047857', letterSpacing: '0.05em' }}>Option B: Subscription Migration</span>
                                    {rec.subscriptionOption.statusText ? (
                                      <span style={{ fontSize: '11px', fontWeight: '750', color: '#3B82F6', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '4px' }}>✓ Current Best</span>
                                    ) : (
                                      <span style={{ fontSize: '11.5px', fontWeight: '750', color: rec.subscriptionOption.savings < 0 ? '#DC2626' : '#10B981', backgroundColor: rec.subscriptionOption.savings < 0 ? '#FEF2F2' : '#FFFFFF', border: rec.subscriptionOption.savings < 0 ? 'none' : '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '9999px' }}>
                                        {rec.subscriptionOption.savings < 0 ? `+$${Math.abs(rec.subscriptionOption.savings).toLocaleString()} cost` : `-$${rec.subscriptionOption.savings.toLocaleString()} save`}
                                      </span>
                                    )}
                                  </div>
                                  <p style={{ fontSize: '13px', color: '#1E293B', fontWeight: '600', margin: '0 0 6px 0', lineHeight: '1.5' }}>{rec.subscriptionOption.action}</p>
                                  {rec.subscriptionOption.statusText && <p style={{ fontSize: '12px', color: '#3B82F6', margin: '4px 0 0 0', fontWeight: '600' }}>💡 {rec.subscriptionOption.statusText}</p>}
                                  {rec.subscriptionOption.limits && (
                                    <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                      <span>ℹ️</span> {rec.subscriptionOption.limits}
                                    </div>
                                  )}
                                </div>
                                <div style={{ borderTop: '1px dashed #A7F3D0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                  <span style={{ fontSize: '12px', color: '#047857' }}>Est. Monthly Cost:</span>
                                  <strong style={{ fontSize: '15px', color: '#047857' }}>${rec.subscriptionOption.cost.toLocaleString()}/mo</strong>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>{/* end results-grid */}

          {/* ═══════════════════════════════════════════════════════════════
              DETAILED REPORT — toggled by the "📊 View Detailed Report" button
          ═══════════════════════════════════════════════════════════════ */}
          {showDetailedReport && (
            <div id="detailed-report-section" style={{ marginTop: '56px' }}>

              {/* Report Header */}
              <div style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)',
                borderRadius: '20px', padding: '32px 40px', marginBottom: '28px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
              }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>
                    AI Cost Optimization Report
                  </div>
                  <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>
                    📊 Detailed Analysis Report
                  </h2>
                  <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0' }}>
                    Goal: <strong style={{ color: '#E2E8F0' }}>{goalLabel}</strong> · Allocations: <strong style={{ color: '#E2E8F0' }}>{recs.length}</strong> · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div style={{
                  background: `conic-gradient(#10B981 0% ${Math.min(100, Math.abs(parseFloat(savingPct)))}%, #1E293B ${Math.min(100, Math.abs(parseFloat(savingPct)))}% 100%)`,
                  borderRadius: '50%', width: '90px', height: '90px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 4px rgba(16,185,129,0.2)'
                }}>
                  <div style={{ background: '#0F172A', borderRadius: '50%', width: '72px', height: '72px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#10B981', lineHeight: 1 }}>{savingPct}%</span>
                    <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700 }}>SAVINGS</span>
                  </div>
                </div>
              </div>

              {/* ── 1. Executive Summary ── */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '3px', height: '14px', backgroundColor: '#6366F1', borderRadius: '2px', display: 'inline-block' }}></span>
                  Executive Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {[
                    { icon: '💵', label: 'Current Monthly Cost',      value: `$${currentCostVal.toLocaleString()}`,   sub: '100% baseline',               color: '#EF4444' },
                    { icon: '💰', label: 'Potential Monthly Savings',  value: `$${bestMonthly.toLocaleString()}`,      sub: `${savingPct}% reduction`,     color: '#10B981' },
                    { icon: '📅', label: 'Est. Annual Savings',        value: `$${bestAnnual.toLocaleString()}`,       sub: 'best path projection',        color: '#10B981' },
                    { icon: '🔁', label: 'Actionable Changes',         value: `${recs.length} Items`,                  sub: 'recommendations identified',  color: '#6366F1' },
                    { icon: '🎯', label: 'Optimization Goal',          value: goalLabel.split(' (')[0],                sub: goalLabel,                     color: '#F59E0B' },
                    { icon: '📋', label: 'Configured Allocations',     value: `${auditResult.allocations ? auditResult.allocations.length : (selectedTools ? selectedTools.length : 0)} tools`, sub: `${auditResult.teamSize || 0} total seats`, color: '#6366F1' },
                  ].map((tile, i) => (
                    <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div style={{ fontSize: '28px', lineHeight: 1 }}>{tile.icon}</div>
                      <div>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '4px' }}>{tile.label}</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: tile.color, fontFamily: 'var(--font-title)', lineHeight: 1 }}>{tile.value}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px' }}>{tile.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '14px', padding: '14px 20px', backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: '600', color: '#14532D' }}>
                  <span style={{ fontSize: '20px' }}>✅</span>
                  You can save <strong style={{ color: '#15803D' }}>${bestMonthly.toLocaleString()} ({savingPct}%) per month</strong> by implementing the recommended changes below with minimal operational effort.
                </div>
              </div>

              {/* ── 2. Top Opportunities Table ── */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '3px', height: '14px', backgroundColor: '#10B981', borderRadius: '2px', display: 'inline-block' }}></span>
                  Top Optimization Opportunities
                </div>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '14px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                        {['#', 'Tool / Allocation', 'Current Cost', 'API Saving', 'Sub Saving', 'Best Path'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', fontWeight: '700', textAlign: h === '#' ? 'center' : 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recs.map((rec, idx) => {
                        const m = rec.issue ? rec.issue.match(/Paying \$([\d,.]+)/) : null;
                        const cost = m ? parseFloat(m[1].replace(/,/g, '')) : 0;
                        const apiSav = rec.apiOption?.savings ?? 0;
                        const subSav = rec.subscriptionOption?.savings ?? 0;
                        const best = apiSav >= subSav ? 'API Path' : 'Subscription';
                        const bestColor = apiSav >= subSav ? '#3B82F6' : '#10B981';
                        return (
                          <tr key={idx} style={{ borderBottom: idx < recs.length - 1 ? '1px solid var(--color-border)' : 'none', backgroundColor: idx === 0 ? '#F0FDF4' : 'transparent' }}>
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              <span style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: idx === 0 ? '#10B981' : idx === 1 ? '#6366F1' : idx === 2 ? '#F59E0B' : '#E2E8F0', color: idx < 3 ? '#FFFFFF' : '#64748B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>{idx + 1}</span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: '700', color: '#0F172A' }}>{rec.tool}</div>
                              <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.issue}</div>
                            </td>
                            <td style={{ padding: '14px 16px', fontWeight: '700', color: '#EF4444' }}>${cost.toLocaleString()}/mo</td>
                            <td style={{ padding: '14px 16px', fontWeight: '700', color: apiSav > 0 ? '#10B981' : '#94A3B8' }}>
                              {apiSav > 0 ? `+$${apiSav.toLocaleString()}` : rec.apiOption?.statusText ? '✓ Best' : '—'}
                            </td>
                            <td style={{ padding: '14px 16px', fontWeight: '700', color: subSav > 0 ? '#10B981' : '#94A3B8' }}>
                              {subSav > 0 ? `+$${subSav.toLocaleString()}` : rec.subscriptionOption?.statusText ? '✓ Best' : '—'}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: apiSav >= subSav ? '#EFF6FF' : '#F0FDF4', color: bestColor }}>{best}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── 3. Cost Comparison + Roadmap ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

                {/* Cost Before vs After */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '3px', height: '14px', backgroundColor: '#F59E0B', borderRadius: '2px', display: 'inline-block' }}></span>
                    Cost Comparison — Before vs After
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '14px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                          <th style={{ padding: '10px 16px', fontWeight: '700', textAlign: 'left',  fontSize: '11px', color: '#64748B' }}>Metric</th>
                          <th style={{ padding: '10px 16px', fontWeight: '700', textAlign: 'right', fontSize: '11px', color: '#64748B' }}>Current</th>
                          <th style={{ padding: '10px 16px', fontWeight: '700', textAlign: 'right', fontSize: '11px', color: '#64748B' }}>Optimized</th>
                          <th style={{ padding: '10px 16px', fontWeight: '700', textAlign: 'right', fontSize: '11px', color: '#64748B' }}>Δ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Monthly Cost',  cur: `$${currentCostVal.toLocaleString()}`,     opt: `$${(currentCostVal - bestMonthly).toFixed(2)}`,      delta: `-${savingPct}%`, good: true },
                          { label: 'Annual Cost',   cur: `$${(currentCostVal*12).toLocaleString()}`, opt: `$${((currentCostVal - bestMonthly)*12).toFixed(0)}`,  delta: `-${savingPct}%`, good: true },
                          { label: 'API Path Save', cur: '—', opt: `+$${Math.max(0, totalApiSavings).toLocaleString()}/mo`, delta: '↓', good: true },
                          { label: 'Sub Path Save', cur: '—', opt: `+$${Math.max(0, totalSubSavings).toLocaleString()}/mo`, delta: '↓', good: true },
                          { label: 'Team Seats',    cur: `${auditResult.teamSize || 0}`, opt: `${auditResult.teamSize || 0}`, delta: '→', good: true },
                          { label: 'Allocations',   cur: `${recs.length}`, opt: `${recs.length}`, delta: '→', good: true },
                        ].map((row, i) => (
                          <tr key={i} style={{ borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none' }}>
                            <td style={{ padding: '10px 16px', fontWeight: '600', color: '#374151' }}>{row.label}</td>
                            <td style={{ padding: '10px 16px', textAlign: 'right', color: '#6B7280' }}>{row.cur}</td>
                            <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '700', color: '#0F172A' }}>{row.opt}</td>
                            <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '800', fontSize: '12px', color: row.good ? '#10B981' : '#EF4444' }}>{row.delta}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ padding: '14px 16px', backgroundColor: '#F0FDF4', borderTop: '2px solid #86EFAC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#14532D' }}>🎯 You Save</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#10B981' }}>${bestMonthly.toLocaleString()}/month</div>
                        <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600' }}>${bestAnnual.toLocaleString()}/year</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Implementation Roadmap */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '3px', height: '14px', backgroundColor: '#8B5CF6', borderRadius: '2px', display: 'inline-block' }}></span>
                    Implementation Roadmap
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {phases.map((ph, i) => (
                      <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px 18px', position: 'relative', overflow: 'hidden', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', backgroundColor: priorityColor[ph.priority] }}></div>
                        <div style={{ paddingLeft: '6px', flex: 1 }}>
                          <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '800', color: '#64748B', marginBottom: '4px', letterSpacing: '0.06em' }}>{ph.phase}</div>
                          <p style={{ fontSize: '12.5px', color: '#374151', fontWeight: '600', margin: '0 0 8px', lineHeight: '1.4' }}>{ph.actions}</p>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '11px' }}>
                            <span style={{ color: '#94A3B8' }}>Priority: <strong style={{ color: priorityColor[ph.priority] }}>{ph.priority}</strong></span>
                            <span style={{ color: '#94A3B8' }}>Effort: <strong style={{ color: '#374151' }}>{ph.effort}</strong></span>
                            <span style={{ color: '#94A3B8' }}>Est: <strong style={{ color: '#10B981' }}>{ph.savings}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── 4. Key Takeaways ── */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '24px 28px', marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '3px', height: '14px', backgroundColor: '#10B981', borderRadius: '2px', display: 'inline-block' }}></span>
                  Summary &amp; Key Takeaways
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    `Current monthly stack cost is $${currentCostVal.toLocaleString()} across ${recs.length} allocation(s).`,
                    `Best saving path reduces cost by ${savingPct}% ($${bestMonthly.toLocaleString()}/mo, $${bestAnnual.toLocaleString()}/yr).`,
                    `${recs.length} optimization opportunit${recs.length !== 1 ? 'ies' : 'y'} identified — ${recs.filter(r => r.apiOption && r.apiOption.savings > 0).length} via API path, ${recs.filter(r => r.subscriptionOption && r.subscriptionOption.savings > 0).length} via subscription.`,
                    `Implementing Phase 1 alone gives $${Math.max(0, totalApiSavings).toLocaleString()}/mo in immediate savings with minimal risk.`,
                    `Optimization goal: ${goalLabel}. All recommendations aligned to this target.`,
                    `Full implementation across all ${recs.length} changes can save up to $${bestAnnual.toLocaleString()} annually.`,
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: '10px', fontSize: '12.5px', color: '#374151', lineHeight: '1.5' }}>
                      <span style={{ color: '#10B981', fontWeight: '900', fontSize: '16px', flexShrink: 0, marginTop: '-1px' }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', fontSize: '11.5px', color: '#92400E', fontWeight: '500' }}>
                  <strong>Note:</strong> Savings are estimated based on the Audex AI audit engine using live subscription pricing. Actual savings may vary based on usage patterns.
                </div>
              </div>

              {/* Collapse button */}
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  onClick={() => { setShowDetailedReport(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{ padding: '10px 28px', borderRadius: '10px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  ▲ Collapse Report
                </button>
              </div>

            </div>
          )}{/* end showDetailedReport */}

        </div>
      </main>
    </div>
  );
}
