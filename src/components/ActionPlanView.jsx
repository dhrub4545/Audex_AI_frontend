import React from 'react';
import logoImg from '../assets/audex-ai-logo.png';
import openaiLogo from '../assets/openai.svg';
import claudeLogo from '../assets/claude.svg';
import geminiLogo from '../assets/gemini.svg';
import githubLogo from '../assets/github.svg';
import perplexityLogo from '../assets/perplexity.svg';
import xaiLogo from '../assets/xai.svg';
import cursorLogo from '../assets/cursor.svg';
import windsurfLogo from '../assets/windsurf.svg';

const getProviderLogo = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('openai') || n.includes('chatgpt')) return openaiLogo;
  if (n.includes('anthropic') || n.includes('claude')) return claudeLogo;
  if (n.includes('google') || n.includes('gemini')) return geminiLogo;
  if (n.includes('github') || n.includes('copilot')) return githubLogo;
  if (n.includes('perplexity')) return perplexityLogo;
  if (n.includes('xai') || n.includes('grok')) return xaiLogo;
  if (n.includes('cursor')) return cursorLogo;
  if (n.includes('windsurf') || n.includes('codeium')) return windsurfLogo;
  return null;
};

export default function ActionPlanView({
  auditResult,
  selectedOptions,
  setSelectedOptions,
  onNavigateToView
}) {
  if (!auditResult || !auditResult.savings) return null;
  const recs = auditResult.savings.recommendations || [];

  const handleSelectOption = (idx, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [idx]: option
    }));
  };

  const getSavingsPillStyle = (savings) => ({
    fontSize: '11.5px',
    fontWeight: '750',
    color: savings < 0 ? '#DC2626' : '#10B981',
    backgroundColor: savings < 0 ? '#FEF2F2' : '#F0FDF4',
    padding: '3px 8px',
    borderRadius: '9999px'
  });

  return (
    <div className="app-container" style={{ backgroundColor: '#FCFCFD', minHeight: '100vh' }}>
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
            <span className="wizard-step-dot completed">✓</span>
            <span className="wizard-step-line completed"></span>
            <span className="wizard-step-dot active">4</span>
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToView('landing'); }} className="wizard-close">✕</a>
        </div>
      </header>

      <main className="main-content wizard-body" style={{ paddingBottom: '60px', maxWidth: '1200px' }}>
        <div className="wizard-progress-meta">✦ Step 4 of 4 - 100% Complete</div>
        <h2 className="wizard-title">Optimisation Action Plan</h2>
        <p className="wizard-desc">
          We analyzed your stack and detected {recs.length} key waste indicators. Select your preferred pathway for each recommendation.
        </p>

        {/* Two-Column Layout: Info Sidebar (left) + Recommendations (right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: '28px',
          marginTop: '24px',
          alignItems: 'start'
        }}>

          {/* LEFT COLUMN — Sticky Info Panel */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #F0F9FF 0%, #EFF6FF 40%, #F0FDF4 100%)',
              border: '1px solid #BFDBFE',
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Top accent */}
              <div style={{
                position: 'absolute', top: 0, left: 0, height: '4px', width: '100%',
                background: 'linear-gradient(90deg, #3B82F6 0%, #10B981 100%)',
                borderRadius: '16px 16px 0 0'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '20px' }}>🧭</span>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                  How This Works
                </h3>
              </div>

              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.7', margin: '0 0 18px 0' }}>
                Our AI engine analyzed your subscriptions and usage patterns to identify cost-saving opportunities. For each tool, choose your preferred <strong>optimisation pathway</strong>.
              </p>

              {/* Option A */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '26px', height: '26px', borderRadius: '7px',
                    backgroundColor: '#EFF6FF', color: '#3B82F6',
                    fontSize: '12px', fontWeight: '800'
                  }}>A</span>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1E293B' }}>Direct API Integration</span>
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                  Pay only for what you use with per-token pricing. Best for variable or lower usage volumes.
                </p>
              </div>

              {/* Option B */}
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '26px', height: '26px', borderRadius: '7px',
                    backgroundColor: '#ECFDF5', color: '#047857',
                    fontSize: '12px', fontWeight: '800'
                  }}>B</span>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1E293B' }}>Subscription Migration</span>
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                  Switch to a better-fit subscription tier. Ideal for predictable billing and bundled model access.
                </p>
              </div>

              {/* Pro Tip */}
              <div style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px' }}>💡</span>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#92400E' }}>Pro Tip</span>
                </div>
                <p style={{ fontSize: '11.5px', color: '#78350F', lineHeight: '1.6', margin: 0 }}>
                  The green-highlighted option is our AI-recommended highest-value pathway for your usage profile.
                </p>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div style={{
              marginTop: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '20px 24px'
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📊 Audit Summary
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Tools Analyzed</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{recs.length}</span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Est. Monthly Savings</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#10B981' }}>
                    ${(auditResult.savings.totalMonthly || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Est. Annual Savings</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#10B981' }}>
                    ${(auditResult.savings.totalAnnual || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Recommendation Cards */}
          <div>
            <div className="results-recommendations-list">
          {recs.map((rec, idx) => {
            const currentChoice = selectedOptions[idx] || 'api';
            const match = rec.issue ? rec.issue.match(/Paying \$([\d,.]+)/) : null;
            const itemCurrentCost = match ? parseFloat(match[1].replace(/,/g, '')) : 0;

            return (
              <div key={idx} className="rec-card" style={{ display: 'block', padding: '24px', marginBottom: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
                <div className="rec-info" style={{ width: '100%' }}>
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className="rec-tool" style={{ fontWeight: '800', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      {(() => {
                        const logo = getProviderLogo(rec.tool);
                        return logo ? (
                          <img src={logo} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ color: '#94A3B8' }}>●</span>
                        );
                      })()}
                      <span>{rec.tool}</span>
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '750', color: '#64748B', backgroundColor: '#F1F5F9', padding: '4px 12px', borderRadius: '6px' }}>
                      Current Cost: ${itemCurrentCost.toLocaleString()}/mo
                    </span>
                  </div>
                  
                  <span className="rec-issue" style={{ marginBottom: '20px', display: 'block', fontSize: '13.5px', color: '#475569' }}>
                    {rec.issue}
                  </span>

                  {/* Side-by-Side Options Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', width: '100%' }}>
                    
                    {/* Option A: Direct API Integration */}
                    {rec.apiOption && (
                      <div 
                        onClick={() => handleSelectOption(idx, 'api')}
                        style={{
                          padding: '20px',
                          border: currentChoice === 'api' ? '2.5px solid #3B82F6' : '1.5px solid #CBD5E1',
                          borderRadius: '12px',
                          backgroundColor: currentChoice === 'api' ? '#EFF6FF' : '#F8FAFC',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '16px',
                          cursor: 'pointer',
                          opacity: currentChoice === 'api' ? 1 : 0.75,
                          boxShadow: currentChoice === 'api' ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                      >
                        {/* Radio Check Indicator */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: currentChoice === 'api' ? '5px solid #3B82F6' : '2px solid #94A3B8',
                          backgroundColor: '#FFFFFF',
                          transition: 'all 0.2s'
                        }} />

                        <div style={{ paddingRight: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569', letterSpacing: '0.05em' }}>
                              Option A: Direct API Integration
                            </span>
                            {!rec.apiOption.statusText && (
                              <span style={getSavingsPillStyle(rec.apiOption.savings)}>
                                {rec.apiOption.savings < 0 ? `+$${Math.abs(rec.apiOption.savings).toLocaleString()}` : `-$${rec.apiOption.savings.toLocaleString()}`} save
                              </span>
                            )}
                          </div>
                          
                          <p style={{ fontSize: '13px', color: '#1E293B', fontWeight: '600', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                            {rec.apiOption.action}
                          </p>
                          {rec.apiOption.statusText && (
                            <p style={{ fontSize: '12px', color: '#3B82F6', margin: '4px 0 0 0', fontWeight: '600' }}>
                              💡 {rec.apiOption.statusText}
                            </p>
                          )}
                          
                          {rec.apiOption.limits && (
                            <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                              <span>ℹ️</span> {rec.apiOption.limits}
                            </div>
                          )}

                          {rec.apiOption.includedModels && rec.apiOption.includedModels.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                Models Included:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {rec.apiOption.includedModels.map((model, mi) => (
                                  <span key={mi} style={{
                                    fontSize: '11px', fontWeight: '600',
                                    color: '#475569', backgroundColor: '#F1F5F9',
                                    border: '1px solid #CBD5E1',
                                    padding: '2px 8px', borderRadius: '6px',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word'
                                  }}>
                                    {model}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>Est. Monthly Cost:</span>
                          <strong style={{ fontSize: '15px', color: '#0F172A' }}>
                            ${rec.apiOption.cost.toLocaleString()}/mo
                          </strong>
                        </div>
                      </div>
                    )}

                    {/* Option B: Subscription Migration */}
                    {rec.subscriptionOption && (
                      <div 
                        onClick={() => handleSelectOption(idx, 'subscription')}
                        style={{
                          padding: '20px',
                          border: currentChoice === 'subscription' ? '2.5px solid #10B981' : '1.5px solid #A7F3D0',
                          borderRadius: '12px',
                          backgroundColor: currentChoice === 'subscription' ? '#ECFDF5' : '#F0FDF4',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '16px',
                          cursor: 'pointer',
                          opacity: currentChoice === 'subscription' ? 1 : 0.75,
                          boxShadow: currentChoice === 'subscription' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                      >
                        {/* Radio Check Indicator */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: currentChoice === 'subscription' ? '5px solid #10B981' : '2px solid #94A3B8',
                          backgroundColor: '#FFFFFF',
                          transition: 'all 0.2s'
                        }} />

                        <div style={{ paddingRight: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#047857', letterSpacing: '0.05em' }}>
                              Option B: Subscription Migration
                            </span>
                            {!rec.subscriptionOption.statusText && (
                              <span style={getSavingsPillStyle(rec.subscriptionOption.savings)}>
                                {rec.subscriptionOption.savings < 0 ? `+$${Math.abs(rec.subscriptionOption.savings).toLocaleString()}` : `-$${rec.subscriptionOption.savings.toLocaleString()}`} save
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: '13px', color: '#1E293B', fontWeight: '600', margin: '0 0 6px 0', lineHeight: '1.5' }}>
                            {rec.subscriptionOption.action}
                          </p>
                          {rec.subscriptionOption.statusText && (
                            <p style={{ fontSize: '12px', color: '#3B82F6', margin: '4px 0 0 0', fontWeight: '600' }}>
                              💡 {rec.subscriptionOption.statusText}
                            </p>
                          )}

                          {rec.subscriptionOption.limits && (
                            <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                              <span>ℹ️</span> {rec.subscriptionOption.limits}
                            </div>
                          )}

                          {rec.subscriptionOption.includedModels && rec.subscriptionOption.includedModels.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                Models Included:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {rec.subscriptionOption.includedModels.map((model, mi) => (
                                  <span key={mi} style={{
                                    fontSize: '11px', fontWeight: '600',
                                    color: '#047857', backgroundColor: '#ECFDF5',
                                    border: '1px solid #A7F3D0',
                                    padding: '2px 8px', borderRadius: '6px',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word'
                                  }}>
                                    {model}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ borderTop: '1px dashed #A7F3D0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '12px', color: '#047857' }}>Est. Monthly Cost:</span>
                          <strong style={{ fontSize: '15px', color: '#047857' }}>
                            ${rec.subscriptionOption.cost.toLocaleString()}/mo
                          </strong>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
            </div>

            {/* Wizard Footer Navigation Actions */}
            <div className="wizard-actions" style={{ marginTop: '32px' }}>
              <button onClick={() => onNavigateToView('step3')} className="btn btn-outline">
                ← Back to Step 3
              </button>
              <button 
                onClick={() => onNavigateToView('results')} 
                className="btn btn-green"
                style={{ padding: '12px 32px' }}
              >
                Generate Final Audit Report 📊
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
