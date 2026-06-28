import React, { useState } from 'react';

export default function LandingView({ onNavigateToStep1, onViewSample, onPurchase }) {
  // Localizing this state prevents full App re-renders when adjusting the spend calculator!
  const [monthlySpend, setMonthlySpend] = useState(10000);



  return (
    <main className="main-content">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <div>
              <span className="badge badge-green" style={{ marginBottom: '16px' }}>
                ● AI-powered spend auditing · Free to start
              </span>
              <h1 className="hero-title">
                Stop burning cash <br />
                <span>on AI tools.</span>
              </h1>
            </div>
            <p className="hero-description">
              Audex AI audits your AI stack, flags waste, and delivers a ranked action plan — in under 60 seconds. No consultants needed.
            </p>
            
            <div className="hero-cta">
              <button onClick={onNavigateToStep1} className="btn btn-black" style={{ padding: '14px 28px' }}>
                🚀 Start Free Audit <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E', marginLeft: '6px' }}></span>
              </button>
              <button onClick={onViewSample} className="btn btn-outline" style={{ padding: '14px 28px' }}>
                👁 View Sample
              </button>
            </div>

            <div className="hero-bullet-points">
              <div className="hero-bullet">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Free, no credit card
              </div>
              <div className="hero-bullet">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Ready in 60 seconds
              </div>
              <div className="hero-bullet">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Data never stored
              </div>
            </div>
          </div>

          {/* Savings preview card */}
          <div className="savings-preview-card">
            <div className="savings-header">
              <div>
                <div className="savings-label">Estimated Savings</div>
                <div className="savings-amount-container">
                  <span className="savings-amount">$4,250</span>
                  <span className="savings-period">/mo</span>
                </div>
                <div className="savings-annual">$51,000 saved per year</div>
              </div>
              <span className="badge badge-green">+15% savings <span style={{ marginLeft: '4px', opacity: 0.7 }}>vs. current spend</span></span>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }}></div>

            <div className="savings-list">
              <div className="savings-item">
                <div className="savings-item-info">
                  <div className="savings-item-icon">💬</div>
                  <div>
                    <div className="savings-item-name">ChatGPT Enterprise</div>
                    <div className="savings-item-detail">Over-provisioned by 12 seats</div>
                  </div>
                </div>
                <div className="savings-item-value">-$1,200</div>
              </div>

              <div className="savings-item">
                <div className="savings-item-info">
                  <div className="savings-item-icon">💻</div>
                  <div>
                    <div className="savings-item-name">GitHub Copilot</div>
                    <div className="savings-item-detail">14 inactive users detected</div>
                  </div>
                </div>
                <div className="savings-item-value">-$850</div>
              </div>

              <div className="savings-item">
                <div className="savings-item-info">
                  <div className="savings-item-icon">🎨</div>
                  <div>
                    <div className="savings-item-name">Midjourney</div>
                    <div className="savings-item-detail">Duplicate with Canva AI</div>
                  </div>
                </div>
                <div className="savings-item-value">-$600</div>
              </div>
            </div>

            <button onClick={onNavigateToStep1} className="btn btn-green" style={{ width: '100%', padding: '14px' }}>
              🔍 Audit my AI stack — it's free
            </button>
            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)' }}>
              No sign-up required · Results in &lt;60 seconds
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Teams */}
      <section className="trusted-by">
        <div className="container">
          <div className="trusted-by-title">Trusted by Forward-Thinking Engineering Teams</div>
          <div className="trusted-logos-grid">
            <div className="trusted-logo">■ Linear</div>
            <div className="trusted-logo">▲ Notion</div>
            <div className="trusted-logo">◆ Raycast</div>
            <div className="trusted-logo">● Stripe</div>
            <div className="trusted-logo">▲ Vercel</div>
            <div className="trusted-logo">■ Linear</div>
            <div className="trusted-logo">▲ Notion</div>
            <div className="trusted-logo">◆ Raycast</div>
          </div>
        </div>
      </section>

      {/* 3 Step Section */}
      <section id="how-it-works" className="steps-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">From zero to savings in 3 steps</h2>
            <p>No consultants. No lengthy setup. Just clear data and a ranked action plan.</p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <span className="step-number">01</span>
              <div className="step-icon-container">📥</div>
              <span className="badge badge-orange step-badge">~30 seconds</span>
              <h3 className="step-card-title">Input your tools</h3>
              <p className="step-card-desc">
                Select the AI subscriptions your team pays for. We support Cursor, ChatGPT, GitHub Copilot, Claude, Gemini, and 50+ more platforms.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <span className="step-number">02</span>
              <div className="step-icon-container">📊</div>
              <span className="badge badge-blue step-badge">Instant</span>
              <h3 className="step-card-title">Run the audit</h3>
              <p className="step-card-desc">
                Our deterministic engine benchmarks your stack against real market pricing, identifies seat redundancy, and flags consolidation opportunities.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <span className="step-number">03</span>
              <div className="step-icon-container">🐖</div>
              <span className="badge badge-green step-badge">Actionable</span>
              <h3 className="step-card-title">Act on savings</h3>
              <p className="step-card-desc">
                Get a prioritised, shareable PDF report with concrete actions: which plans to downgrade, which tools to merge, and exact dollar impact.
              </p>
            </div>
          </div>

          <div className="steps-cta">
            <button onClick={onNavigateToStep1} className="btn btn-black" style={{ padding: '14px 28px' }}>
              Start your audit — free →
            </button>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              No account needed · Free forever for teams under 10
            </p>
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="steps-section" style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Pricing System</span>
            <h2 className="section-title">Flexible plans for every stage of growth</h2>
            <p>Scale your AI investments with confidence. Our transparent pricing ensures you only pay for the intelligence you need.</p>
          </div>

          <div className="steps-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {/* Starter Plan */}
            <div className="step-card" style={{ backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <span className="step-number" style={{ top: '24px', right: '24px' }}>Pay As You Go</span>
                <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>Starter</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>For individuals and testing.</div>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>$4.99</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>/ credit</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> 1 credit = 1 report audit
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> Up to 4 active AI models
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> Basic AI insights
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> Community support
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onPurchase('Starter Credit', 'starter', 1)} 
                className="btn btn-outline" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '700' }}
              >
                Add 1 Credit
              </button>
            </div>

            {/* Pro Plan */}
            <div className="step-card" style={{ backgroundColor: '#FFFFFF', border: '2px solid var(--color-green-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-green-primary)', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Most Popular
              </div>
              <div>
                <span className="step-number" style={{ top: '24px', right: '24px' }}>Monthly Sub</span>
                <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>Pro</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>For scaling teams optimizing spend.</div>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>$49.99</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>/ month</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> 10 credits included per month
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> All AI models available
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> Advanced logic reports
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> Priority email support
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onPurchase('Pro Subscription', 'pro', 10)} 
                className="btn btn-green" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '700' }}
              >
                Subscribe (10 Credits)
              </button>
            </div>

            {/* Pro Max Plan */}
            <div className="step-card" style={{ backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <span className="step-number" style={{ top: '24px', right: '24px' }}>All-Inclusive</span>
                <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>Pro Max</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>For premium consultants and large teams.</div>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>$20.00</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>/ month</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> 20 credits added to account
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> All AI models available
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> Real-time expertise consultant
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold' }}>✓</span> 24/7 priority Slack support
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onPurchase('Pro Max', 'proMax', 20)} 
                className="btn btn-black" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '700' }}
              >
                Upgrade (20 Credits)
              </button>
            </div>
          </div>

          {/* Savings Calculator Section */}
          <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', alignItems: 'center', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '48px', boxShadow: 'var(--shadow-lg)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-green-primary)', fontWeight: '700', fontSize: '20px', fontFamily: 'var(--font-title)', marginBottom: '16px' }}>
                <span>🪙</span> Credex Credits
              </div>
              <h3 style={{ fontSize: '32px', marginBottom: '16px' }}>Turn AI optimization into tangible savings</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                Earn credits by successfully implementing our AI audit recommendations, directly reducing your operational costs. Use accumulated credits to subsidize future AI subscriptions.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-bg-accent)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📊</div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Analyze & Identify</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Run audits to uncover inefficiencies in your AI toolstack.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-bg-accent)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📈</div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Optimize & Earn</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Apply recommendations to earn up to 25% back in credits.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-bg-accent)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>💳</div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Redeem</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Use accumulated credits to subsidize future AI subscriptions.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculator Panel */}
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px', backgroundColor: '#F8FAFC' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '24px' }}>Potential Savings Calculator</h4>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Monthly AI Spend</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontWeight: '500' }}>$</span>
                  <input 
                    type="number"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: '100%', padding: '12px 12px 12px 32px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-body)' }}
                  />
                </div>
                <input 
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={monthlySpend}
                  onChange={(e) => setMonthlySpend(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: '16px', accentColor: 'var(--color-green-primary)' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  <span>Estimated Inefficiency (Industry Avg: 18%)</span>
                  <span style={{ fontWeight: '700' }}>18%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '18%', height: '100%', backgroundColor: '#EF4444' }}></div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-green-light)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-green-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Credex Credits</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-green-text)', fontFamily: 'var(--font-title)', marginTop: '4px' }}>
                    ${(monthlySpend * 0.18).toLocaleString()}<span style={{ fontSize: '14px', fontWeight: '500' }}>/mo</span>
                  </div>
                </div>
                <span style={{ fontSize: '24px' }}>💳</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
