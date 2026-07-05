import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, Rocket, Eye, Search, Square, Triangle, Circle, Target, Download,
  BarChart2, ArrowRight, Check, Coins, TrendingUp, CreditCard, AlertTriangle,
  Cpu, Users, Copy, GitMerge, EyeOff, BarChart3, LineChart, Key, Binary,
  FileCheck, Scale, ShieldCheck, Recycle, Sparkles, Bot, Video, Volume2,
  Music, Presentation, Layers, Sliders, ClipboardCheck
} from 'lucide-react';
import {
  OpenAI,
  Claude,
  Gemini,
  GithubCopilot,
  Cursor,
  DeepSeek,
  Perplexity,
  Meta,
  XAI,
  Midjourney,
  Mistral,
  Vercel,
  Runway,
  ElevenLabs,
  Suno
} from '@lobehub/icons';
import turtleOutline from '../assets/Audex-outline.jpg';

export default function LandingView({ onNavigateToStep1, onViewSample, onPurchase }) {
  // Localizing this state prevents full App re-renders when adjusting the spend calculator!
  const [monthlySpend, setMonthlySpend] = useState(10000);

  const pipelineRef = useRef(null);
  const [isPipelineAnimated, setIsPipelineAnimated] = useState(false);

  useEffect(() => {
    const currentRef = pipelineRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPipelineAnimated(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const PROVIDERS = [
    'OpenAI', 'Anthropic', 'Google', 'Meta', 'xAI', 'Perplexity',
    'DeepSeek', 'Mistral', 'GitHub', 'Cursor', 'Vercel', 'Runway',
    'Midjourney', 'ElevenLabs', 'Suno', 'Gamma'
  ];

  const CAPABILITIES = [
    'AI Spend', 'Cost Optimization', 'Seat Utilization', 'Duplicate Detection',
    'Vendor Consolidation', 'Shadow AI', 'Usage Analytics', 'ROI Tracking',
    'API Optimization', 'Token Analysis', 'License Audit',
    'Capability Benchmarking', 'AI Governance', 'Waste Recovery'
  ];

  // Missing official logo in @lobehub/icons:
  // - Gamma (using custom premium gradient SVG fallback)
  const providerIcons = {
    openai: <OpenAI size={20} />,
    anthropic: <Claude size={20} />,
    google: <Gemini size={20} />,
    meta: <Meta size={20} />,
    xai: <XAI size={20} />,
    perplexity: <Perplexity size={20} />,
    deepseek: <DeepSeek size={20} />,
    mistral: <Mistral size={20} />,
    github: <GithubCopilot size={20} />,
    cursor: <Cursor size={20} />,
    vercel: <Vercel size={20} />,
    runway: <Runway size={20} />,
    midjourney: <Midjourney size={20} />,
    elevenlabs: <ElevenLabs size={20} />,
    suno: <Suno size={20} />,
    gamma: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M12 2L2 22h20L12 2z" fill="url(#gammaGradient)" />
        <defs>
          <linearGradient id="gammaGradient" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8A2BE2" />
            <stop offset="100%" stopColor="#DA70D6" />
          </linearGradient>
        </defs>
      </svg>
    )
  };

  const getProviderIcon = (name) => {
    return providerIcons[name.toLowerCase()] ?? null;
  };

  const getProviderTheme = (name) => {
    const n = name.toLowerCase();

    // Default values (white)
    let bg = 'rgba(255, 255, 255, 1)';
    let bgHover = 'rgba(248, 250, 252, 1)';
    let border = 'var(--color-border)';
    let borderHover = 'var(--color-border-hover)';
    let iconColor = 'var(--color-text-secondary)';
    let iconColorHover = 'var(--color-text-primary)';

    if (n === 'openai') {
      bg = 'rgba(16, 185, 129, 0.03)';
      bgHover = 'rgba(16, 185, 129, 0.06)';
      border = 'rgba(16, 185, 129, 0.15)';
      borderHover = 'rgba(16, 185, 129, 0.3)';
      iconColor = 'rgba(16, 185, 129, 0.7)';
      iconColorHover = 'rgba(16, 185, 129, 1)';
    } else if (n === 'google') {
      bg = 'rgba(59, 130, 246, 0.03)';
      bgHover = 'rgba(59, 130, 246, 0.06)';
      border = 'rgba(59, 130, 246, 0.15)';
      borderHover = 'rgba(59, 130, 246, 0.3)';
      iconColor = 'rgba(59, 130, 246, 0.7)';
      iconColorHover = 'rgba(59, 130, 246, 1)';
    } else if (n === 'anthropic') {
      bg = 'rgba(217, 119, 6, 0.03)';
      bgHover = 'rgba(217, 119, 6, 0.06)';
      border = 'rgba(217, 119, 6, 0.15)';
      borderHover = 'rgba(217, 119, 6, 0.3)';
      iconColor = 'rgba(217, 119, 6, 0.7)';
      iconColorHover = 'rgba(217, 119, 6, 1)';
    } else if (n === 'meta') {
      bg = 'rgba(59, 130, 246, 0.03)';
      bgHover = 'rgba(59, 130, 246, 0.06)';
      border = 'rgba(59, 130, 246, 0.15)';
      borderHover = 'rgba(59, 130, 246, 0.3)';
      iconColor = 'rgba(59, 130, 246, 0.7)';
      iconColorHover = 'rgba(59, 130, 246, 1)';
    } else if (n === 'github') {
      bg = 'rgba(71, 85, 105, 0.03)';
      bgHover = 'rgba(71, 85, 105, 0.06)';
      border = 'rgba(71, 85, 105, 0.15)';
      borderHover = 'rgba(71, 85, 105, 0.3)';
      iconColor = 'rgba(71, 85, 105, 0.7)';
      iconColorHover = 'rgba(71, 85, 105, 1)';
    } else if (n === 'cursor') {
      bg = 'rgba(99, 102, 241, 0.03)';
      bgHover = 'rgba(99, 102, 241, 0.06)';
      border = 'rgba(99, 102, 241, 0.15)';
      borderHover = 'rgba(99, 102, 241, 0.3)';
      iconColor = 'rgba(99, 102, 241, 0.7)';
      iconColorHover = 'rgba(99, 102, 241, 1)';
    } else if (n === 'perplexity') {
      bg = 'rgba(139, 92, 246, 0.03)';
      bgHover = 'rgba(139, 92, 246, 0.06)';
      border = 'rgba(139, 92, 246, 0.15)';
      borderHover = 'rgba(139, 92, 246, 0.3)';
      iconColor = 'rgba(139, 92, 246, 0.7)';
      iconColorHover = 'rgba(139, 92, 246, 1)';
    } else if (n === 'runway') {
      bg = 'rgba(124, 58, 237, 0.03)';
      bgHover = 'rgba(124, 58, 237, 0.06)';
      border = 'rgba(124, 58, 237, 0.15)';
      borderHover = 'rgba(124, 58, 237, 0.3)';
      iconColor = 'rgba(124, 58, 237, 0.7)';
      iconColorHover = 'rgba(124, 58, 237, 1)';
    } else if (n === 'midjourney') {
      bg = 'rgba(100, 116, 139, 0.03)';
      bgHover = 'rgba(100, 116, 139, 0.06)';
      border = 'rgba(100, 116, 139, 0.15)';
      borderHover = 'rgba(100, 116, 139, 0.3)';
      iconColor = 'rgba(100, 116, 139, 0.7)';
      iconColorHover = 'rgba(100, 116, 139, 1)';
    }

    return {
      '--pill-bg': bg,
      '--pill-bg-hover': bgHover,
      '--pill-border': border,
      '--pill-border-hover': borderHover,
      '--pill-icon-color': iconColor,
      '--pill-icon-color-hover': iconColorHover
    };
  };

  const getCapabilityIcon = (name) => {
    const n = name.toLowerCase();
    if (n === 'ai spend') return <Coins size={16} />;
    if (n === 'cost optimization') return <TrendingUp size={16} />;
    if (n === 'seat utilization') return <Users size={16} />;
    if (n === 'duplicate detection') return <Copy size={16} />;
    if (n === 'vendor consolidation') return <GitMerge size={16} style={{ transform: 'rotate(90deg)' }} />;
    if (n === 'shadow ai') return <EyeOff size={16} />;
    if (n === 'usage analytics') return <BarChart3 size={16} />;
    if (n === 'roi tracking') return <LineChart size={16} />;
    if (n === 'api optimization') return <Key size={16} />;
    if (n === 'token analysis') return <Binary size={16} />;
    if (n === 'license audit') return <FileCheck size={16} />;
    if (n === 'capability benchmarking') return <Scale size={16} />;
    if (n === 'ai governance') return <ShieldCheck size={16} />;
    if (n === 'waste recovery') return <Recycle size={16} />;
    return <Sparkles size={16} />;
  };

  const getCapabilityTheme = (name) => {
    const n = name.toLowerCase();

    // Default green-themed values (AI Spend, Cost, ROI, waste recovery, consolidation)
    let bg = 'rgba(16, 185, 129, 0.02)';
    let bgHover = 'rgba(16, 185, 129, 0.05)';
    let border = 'rgba(16, 185, 129, 0.12)';
    let borderHover = 'rgba(16, 185, 129, 0.25)';
    let iconColor = 'rgba(16, 185, 129, 0.65)';
    let iconColorHover = 'rgba(16, 185, 129, 1)';

    // Blue-themed capabilities (Seat, License, Governance, Benchmarking)
    if (n.includes('seat') || n.includes('license') || n.includes('governance') || n.includes('benchmarking')) {
      bg = 'rgba(59, 130, 246, 0.02)';
      bgHover = 'rgba(59, 130, 246, 0.05)';
      border = 'rgba(59, 130, 246, 0.12)';
      borderHover = 'rgba(59, 130, 246, 0.25)';
      iconColor = 'rgba(59, 130, 246, 0.65)';
      iconColorHover = 'rgba(59, 130, 246, 1)';
    }
    // Purple/Indigo themed (Shadow, Duplicate, API, Token, Analytics)
    else if (n.includes('shadow') || n.includes('duplicate') || n.includes('api') || n.includes('token') || n.includes('analytics')) {
      bg = 'rgba(139, 92, 246, 0.02)';
      bgHover = 'rgba(139, 92, 246, 0.05)';
      border = 'rgba(139, 92, 246, 0.12)';
      borderHover = 'rgba(139, 92, 246, 0.25)';
      iconColor = 'rgba(139, 92, 246, 0.65)';
      iconColorHover = 'rgba(139, 92, 246, 1)';
    }

    return {
      '--pill-bg': bg,
      '--pill-bg-hover': bgHover,
      '--pill-border': border,
      '--pill-border-hover': borderHover,
      '--pill-icon-color': iconColor,
      '--pill-icon-color-hover': iconColorHover
    };
  };



  return (
    <main className="main-content">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content" style={{ transform: 'translateY(-70px)' }}>
            <div>
              <span className="badge badge-green" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} fill="currentColor" /> AI-powered spend auditing · Free to start
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
              <button onClick={onNavigateToStep1} className="btn btn-black" style={{ padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Rocket size={18} /> Start Free Audit <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E', marginLeft: '2px' }}></span>
              </button>
              <button onClick={onViewSample} className="btn btn-outline" style={{ padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} /> View Sample
              </button>
            </div>

            <div className="hero-bullet-points">
              <div className="hero-bullet">
                <Check size={14} strokeWidth={3} />
                Free, no credit card
              </div>
              <div className="hero-bullet">
                <Check size={14} strokeWidth={3} />
                Ready in 60 seconds
              </div>
              <div className="hero-bullet">
                <Check size={14} strokeWidth={3} />
                Data never stored
              </div>
            </div>
          </div>

          {/* Savings preview card */}
          <div className="hero-card-wrapper" style={{ position: 'relative', zIndex: 1, transform: "translateY(-50px)" }}>
            <style>{`
              .hero-turtle {
                position: absolute;
                top: 50%;
                right: 63%;
                transform: translateY(-50%);
                height: auto;
                width: 400px;
                z-index: -1;
                pointer-events: none;
              }
              @media (max-width: 1024px) {
                .hero-turtle {
                  right: 35%;
                  height: 90%;
                  width: auto;
                }
              }
              @media (max-width: 768px) {
                .hero-turtle {
                  display: none;
                }
              }
              .savings-preview-card {
                background-color: white;
                border-radius: 20px;
                border: 1px solid var(--color-border);
                box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02);
                padding: 24px 32px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                width: calc(100% + 40px);
                margin-right: -40px;
                box-sizing: border-box;
              }
              .savings-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background-color: white;
                border: 1px solid var(--color-border);
                border-radius: 12px;
                padding: 12px 20px;
                transition: all 0.2s ease;
                box-shadow: 0 1px 2px rgba(0,0,0,0.02);
              }
              .savings-row:hover {
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                transform: translateY(-1px);
              }
            `}</style>
            <img src={turtleOutline} className="hero-turtle" alt="" aria-hidden="true" />
            <div className="savings-preview-card">
              {/* 1. Header Layout */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                {/* Left Side */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Estimated Annual Savings</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '800', color: '#16A34A', lineHeight: 1 }}>$30,180</span>
                    <TrendingUp color="#16A34A" size={24} strokeWidth={2.5} />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, marginTop: '8px', lineHeight: 1.5 }}>
                    Based on your team's AI subscriptions,<br />we identified approximately<br />
                    <strong style={{ color: 'var(--color-text-primary)' }}>$2,515/month</strong> in avoidable spend across 6 recommendations.
                  </p>
                </div>

                {/* Right Side */}
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', minWidth: '140px' }}>
                  <AlertTriangle color="#EF4444" size={20} />
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#991B1B', marginTop: '4px' }}>High waste detected</div>
                  <div style={{ fontSize: '11px', color: '#B91C1C', lineHeight: 1.4 }}>Act now to recover<br />$2,515/month</div>
                </div>
              </div>

              {/* 2. Subtle Divider */}
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }}></div>

              {/* 3. Section Title */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Top Savings Opportunities</div>

                {/* 4 & 5. Savings Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                  {/* Row 1 */}
                  <div className="savings-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}><OpenAI size={18} /></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>ChatGPT Enterprise</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Over-provisioned by 12 seats</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#EF4444', textAlign: 'right' }}>-$1,200/mo</span>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="savings-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}><GithubCopilot size={18} /></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>GitHub Copilot</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>14 inactive users detected</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#EF4444', textAlign: 'right' }}>-$850/mo</span>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="savings-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}><Midjourney size={18} /></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>Midjourney</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Duplicate with Canva AI</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#EF4444', textAlign: 'right' }}>-$600/mo</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* CTA & Microcopy */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <button onClick={onNavigateToStep1} className="btn btn-green" style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px' }}>
                  <Search size={18} /> Audit my AI stack — it's free
                </button>
                <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  No sign-up required • Results in under 60 seconds
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Trusted Teams */}
      <section className="trusted-by">
        <style>{`
          .trusted-by {
            padding: 30px 0;
            background-color: #FAFAFA;
            border-top: 1px solid var(--color-border);
            border-bottom: 1px solid var(--color-border);
          }
          .trusted-by-title {
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #94A3B8;
            margin-bottom: 20px;
          }
          .marquee-container {
            overflow: hidden;
            width: 100%;
            position: relative;
            padding: 2px 0;
            mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
          }
          .marquee-track {
            display: flex;
            width: max-content;
          }
          .marquee-track.left-to-right {
            animation: scrollRight 48s linear infinite;
          }
          .marquee-track.right-to-left {
            animation: scrollLeft 48s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
          .marquee-group {
            display: flex;
            align-items: center;
            gap: 16px;
            padding-right: 16px;
            flex-shrink: 0;
          }
          .marquee-pill {
            height: 52px;
            border-radius: 9999px;
            background-color: var(--pill-bg, #FFFFFF);
            border: 1px solid var(--pill-border, var(--color-border));
            box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02);
            padding: 0 24px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            font-size: 13.5px;
            color: var(--color-text-primary);
            box-sizing: border-box;
            white-space: nowrap;
            transition: 
              transform 200ms ease-out, 
              box-shadow 200ms ease-out, 
              border-color 200ms ease-out, 
              background-color 200ms ease-out;
          }
          .marquee-pill:hover {
            transform: translateY(-2px);
            background-color: var(--pill-bg-hover, #F8FAFC);
            border-color: var(--pill-border-hover, var(--color-border-hover));
            box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
          }
          .marquee-pill svg, .marquee-pill img {
            color: var(--pill-icon-color, var(--color-text-secondary));
            transition: color 200ms ease-out;
          }
          .marquee-pill:hover svg, .marquee-pill:hover img {
            color: var(--pill-icon-color-hover, var(--color-text-primary));
          }
          @keyframes scrollLeft {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          @keyframes scrollRight {
            0% { transform: translate3d(-50%, 0, 0); }
            100% { transform: translate3d(0, 0, 0); }
          }
          @media (max-width: 768px) {
            .marquee-pill {
              height: 46px;
              padding: 0 16px;
              font-size: 12px;
            }
            .marquee-track.left-to-right {
              animation-duration: 35s;
            }
            .marquee-track.right-to-left {
              animation-duration: 35s;
            }
          }
        `}</style>
        <div className="trusted-by-title">Everything That Powers Smarter AI Decisions</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Row 1: Supported AI Platforms */}
          <div className="marquee-container">
            <div className="marquee-track left-to-right">
              <div className="marquee-group">
                {PROVIDERS.map(p => (
                  <div key={p} className="marquee-pill" style={getProviderTheme(p)}>
                    {getProviderIcon(p)}
                    <span>{p}</span>
                  </div>
                ))}
              </div>
              <div className="marquee-group">
                {PROVIDERS.map(p => (
                  <div key={p + '-dup'} className="marquee-pill" style={getProviderTheme(p)}>
                    {getProviderIcon(p)}
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Optimization Capabilities */}
          <div className="marquee-container">
            <div className="marquee-track right-to-left">
              <div className="marquee-group">
                {CAPABILITIES.map(c => (
                  <div key={c} className="marquee-pill" style={getCapabilityTheme(c)}>
                    {getCapabilityIcon(c)}
                    <span>{c}</span>
                  </div>
                ))}
              </div>
              <div className="marquee-group">
                {CAPABILITIES.map(c => (
                  <div key={c + '-dup'} className="marquee-pill" style={getCapabilityTheme(c)}>
                    {getCapabilityIcon(c)}
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Pipeline Section */}
      <section id="how-it-works" ref={pipelineRef} className={`steps-section how-it-works-pipeline ${isPipelineAnimated ? 'animate' : ''}`}>
        <style>{`
          .how-it-works-pipeline {
            position: relative;
            background-color: #FFFFFF;
            border-top: 1px solid var(--color-border);
            border-bottom: 1px solid var(--color-border);
            padding: 50px 0;
          }
          .pipeline-wrapper {
            position: relative;
            margin-top: 56px;
            width: 100%;
          }
          .pipeline-row {
            display: flex;
            justify-content: space-between;
            align-items: stretch;
            gap: 16px;
            position: relative;
            z-index: 1;
          }
          .pipeline-card {
            flex: 1;
            background: #FFFFFF;
            border: 1px solid var(--color-border);
            border-radius: 16px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: relative;
            z-index: 2;
            opacity: 0;
            transform: translateY(24px);
            transition: 
              opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), 
              transform 600ms cubic-bezier(0.16, 1, 0.3, 1),
              border-color 250ms ease, 
              box-shadow 250ms ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.03);
          }
          .animate .pipeline-card {
            opacity: 1;
            transform: translateY(0);
          }
          .animate .pipeline-card:nth-child(1) { transition-delay: 100ms; }
          .animate .pipeline-card:nth-child(2) { transition-delay: 250ms; }
          .animate .pipeline-card:nth-child(3) { transition-delay: 400ms; }
          .animate .pipeline-card:nth-child(4) { transition-delay: 550ms; }
          .animate .pipeline-card:nth-child(5) { transition-delay: 700ms; }

          .pipeline-card:hover {
            transform: translateY(-4px);
            border-color: rgba(16, 185, 129, 0.3);
            box-shadow: 0 12px 32px -4px rgba(16, 185, 129, 0.08), 0 4px 12px -2px rgba(16, 185, 129, 0.03);
          }

          .pipeline-icon-container {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .pipeline-card:hover .pipeline-icon-container {
            transform: scale(1.1);
          }

          .pipeline-step-num {
            font-size: 10px;
            font-weight: 700;
            color: var(--color-text-muted);
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .pipeline-card-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-text-primary);
            margin: 4px 0 2px 0;
            font-family: var(--font-title);
          }
          .pipeline-card-subtitle {
            font-size: 12px;
            font-weight: 600;
            color: var(--color-green-primary);
            margin-bottom: 12px;
          }
          .pipeline-card-desc {
            font-size: 12.5px;
            line-height: 1.5;
            color: var(--color-text-muted);
            margin-bottom: 24px;
            flex-grow: 1;
          }

          .mini-vis {
            width: 100%;
            background: #F8FAFC;
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 12px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            overflow: hidden;
            position: relative;
          }

          .inventory-vis {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            justify-content: center;
          }
          .inventory-vis .chip {
            font-size: 10px;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 9999px;
            background: #FFFFFF;
            border: 1px solid var(--color-border);
            color: var(--color-text-primary);
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            transition: transform 300ms ease;
          }
          .animate .inventory-vis .chip {
            animation: pulseChip 2s infinite ease-in-out;
          }
          .animate .inventory-vis .chip:nth-child(1) { animation-delay: 0.1s; }
          .animate .inventory-vis .chip:nth-child(2) { animation-delay: 0.4s; }
          .animate .inventory-vis .chip:nth-child(3) { animation-delay: 0.7s; }
          .animate .inventory-vis .chip:nth-child(4) { animation-delay: 1.0s; }
          .animate .inventory-vis .chip:nth-child(5) { animation-delay: 1.3s; }
          @keyframes pulseChip {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); border-color: rgba(16, 185, 129, 0.3); }
          }

          .normalize-vis {
            flex-direction: column;
            gap: 8px;
            justify-content: center;
          }
          .normalize-vis .slider-row {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .normalize-vis .label {
            font-size: 9px;
            font-weight: 700;
            color: var(--color-text-muted);
            width: 36px;
            text-transform: uppercase;
          }
          .normalize-vis .slider-track {
            flex-grow: 1;
            height: 4px;
            background: #E2E8F0;
            border-radius: 999px;
            overflow: hidden;
            position: relative;
          }
          .normalize-vis .slider-fill {
            height: 100%;
            border-radius: 999px;
            width: 0%;
            transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .animate .normalize-vis .seats-fill { width: 70%; background: #3B82F6; transition-delay: 0.2s; }
          .animate .normalize-vis .tokens-fill { width: 45%; background: #8B5CF6; transition-delay: 0.5s; }
          .animate .normalize-vis .apis-fill { width: 85%; background: #10B981; transition-delay: 0.8s; }

          .benchmark-vis {
            position: relative;
          }
          .radar-svg {
            transform: scale(0.9);
          }
          .radar-labels-grid {
            position: absolute;
            bottom: 4px;
            width: 100%;
            display: flex;
            justify-content: space-around;
            font-size: 8px;
            font-weight: 700;
            color: var(--color-text-muted);
            text-transform: uppercase;
          }

          .optimize-vis {
            gap: 8px;
            justify-content: space-around;
          }
          .cost-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 6px;
            border-radius: 6px;
            min-width: 64px;
            border: 1px dashed var(--color-border);
            background: #FFFFFF;
          }
          .cost-box .title {
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--color-text-muted);
          }
          .cost-box .val {
            font-size: 11px;
            font-weight: 700;
          }
          .cost-box.current .val {
            color: var(--color-text-primary);
          }
          .cost-box.optimized {
            border-style: solid;
            border-color: rgba(16, 185, 129, 0.2);
            background: rgba(16, 185, 129, 0.02);
            position: relative;
          }
          .cost-box.optimized .val {
            color: var(--color-green-primary);
          }
          .cost-box .savings {
            font-size: 8px;
            font-weight: 700;
            color: #10B981;
            background: rgba(16, 185, 129, 0.1);
            padding: 1px 4px;
            border-radius: 4px;
            margin-top: 2px;
          }
          .optimize-vis .arrow-down {
            font-size: 14px;
            color: var(--color-text-muted);
            transform: rotate(-90deg);
          }

          .execute-vis {
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 4px;
          }
          .execute-vis .check-item {
            font-size: 9px;
            font-weight: 600;
            color: var(--color-text-primary);
            display: flex;
            align-items: center;
            gap: 6px;
            opacity: 0;
            transform: translateX(-4px);
            transition: opacity 400ms ease, transform 400ms ease;
          }
          .animate .execute-vis .check-item {
            opacity: 1;
            transform: translateX(0);
          }
          .animate .execute-vis .check-item:nth-child(1) { transition-delay: 0.3s; }
          .animate .execute-vis .check-item:nth-child(2) { transition-delay: 0.6s; }
          .animate .execute-vis .check-item:nth-child(3) { transition-delay: 0.9s; }
          .animate .execute-vis .check-item:nth-child(4) { transition-delay: 1.2s; }
          .execute-vis .check-icon {
            color: #10B981;
            font-weight: 800;
          }

          .pipeline-line-container {
            position: absolute;
            top: 48px;
            left: 0;
            right: 0;
            height: 2px;
            z-index: 0;
            padding: 0 8%;
            display: block;
          }
          .pipeline-svg-line {
            width: 100%;
            height: 2px;
            overflow: visible;
          }
          .pipeline-svg-line .active-path {
            stroke-dasharray: 900;
            stroke-dashoffset: 900;
            transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .animate .active-path {
            stroke-dashoffset: 0;
          }

          @media (max-width: 1024px) {
            .pipeline-line-container {
              display: none;
            }
            .pipeline-row {
              display: grid;
              grid-template-columns: repeat(6, 1fr);
              gap: 16px;
            }
            .pipeline-card {
              flex: none;
            }
            .pipeline-card:nth-child(1) { grid-column: span 2; }
            .pipeline-card:nth-child(2) { grid-column: span 2; }
            .pipeline-card:nth-child(3) { grid-column: span 2; }
            .pipeline-card:nth-child(4) { grid-column: 2 / span 2; }
            .pipeline-card:nth-child(5) { grid-column: 4 / span 2; }
          }

          @media (max-width: 768px) {
            .pipeline-row {
              display: flex;
              flex-direction: column;
              gap: 20px;
            }
            .pipeline-card {
              width: 100%;
              transform: translateX(-16px);
            }
            .animate .pipeline-card {
              transform: translateX(0);
            }
            .pipeline-card:nth-child(4), .pipeline-card:nth-child(5) {
              grid-column: auto;
            }
          }
        `}</style>

        <div className="container">
          <div className="section-header" style={{ marginBottom: '48px' }}>
            <span className="section-badge">How It Works</span>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '32px', lineHeight: 1.2 }}>
              From AI spend to optimized savings<br />in five intelligent steps.
            </h2>
            <p style={{ maxWidth: '600px', margin: '16px auto 0 auto', color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
              Audex AI analyzes your AI stack, benchmarks every decision,<br />and delivers a prioritized optimization plan in under 60 seconds.
            </p>
          </div>

          <div className="pipeline-wrapper">
            {/* Animated Connector Line */}
            <div className="pipeline-line-container">
              <svg className="pipeline-svg-line" viewBox="0 0 1000 2" fill="none" preserveAspectRatio="none">
                <path d="M 50,1 L 950,1" stroke="var(--color-border)" strokeWidth="2" />
                <path className="active-path" d="M 50,1 L 950,1" stroke="var(--color-green-primary)" strokeWidth="2" />
              </svg>
            </div>

            <div className="pipeline-row">
              {/* Step 1: Inventory */}
              <div className="pipeline-card">
                <div className="pipeline-icon-container" style={{ backgroundColor: 'rgba(59, 130, 246, 0.06)', color: '#3B82F6' }}>
                  <Layers size={22} />
                </div>
                <span className="pipeline-step-num">Step 01</span>
                <h3 className="pipeline-card-title">Inventory</h3>
                <span className="pipeline-card-subtitle">Map your AI stack</span>
                <p className="pipeline-card-desc">
                  Import subscriptions, APIs, seat allocations and workloads in under 60 seconds.
                </p>
                <div className="mini-vis inventory-vis">
                  <span className="chip">ChatGPT</span>
                  <span className="chip">Claude</span>
                  <span className="chip">Cursor</span>
                  <span className="chip">Copilot</span>
                  <span className="chip">Gemini</span>
                </div>
              </div>

              {/* Step 2: Normalize */}
              <div className="pipeline-card">
                <div className="pipeline-icon-container" style={{ backgroundColor: 'rgba(139, 92, 246, 0.06)', color: '#8B5CF6' }}>
                  <Sliders size={22} />
                </div>
                <span className="pipeline-step-num">Step 02</span>
                <h3 className="pipeline-card-title">Normalize</h3>
                <span className="pipeline-card-subtitle">Analyze real usage</span>
                <p className="pipeline-card-desc">
                  Audex converts seats, tokens and workloads into a comparable AI cost baseline.
                </p>
                <div className="mini-vis normalize-vis">
                  <div className="slider-row">
                    <span className="label">Seats</span>
                    <div className="slider-track"><div className="slider-fill seats-fill"></div></div>
                  </div>
                  <div className="slider-row">
                    <span className="label">Tokens</span>
                    <div className="slider-track"><div className="slider-fill tokens-fill"></div></div>
                  </div>
                  <div className="slider-row">
                    <span className="label">APIs</span>
                    <div className="slider-track"><div className="slider-fill apis-fill"></div></div>
                  </div>
                </div>
              </div>

              {/* Step 3: Benchmark */}
              <div className="pipeline-card">
                <div className="pipeline-icon-container" style={{ backgroundColor: 'rgba(236, 72, 153, 0.06)', color: '#EC4899' }}>
                  <BarChart3 size={22} />
                </div>
                <span className="pipeline-step-num">Step 03</span>
                <h3 className="pipeline-card-title">Benchmark</h3>
                <span className="pipeline-card-subtitle">Validate every decision</span>
                <p className="pipeline-card-desc">
                  Every recommendation is verified using live capability benchmarks and task-specific scores.
                </p>
                <div className="mini-vis benchmark-vis">
                  <svg width="70" height="70" viewBox="0 0 100 100" className="radar-svg">
                    <polygon points="50,10 88,38 73,82 27,82 12,38" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                    <polygon points="50,30 75,48 66,71 34,71 25,48" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                    <polygon points="50,50 63,59 58,71 42,71 37,59" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                    <line x1="50" y1="50" x2="50" y2="10" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                    <line x1="50" y1="50" x2="88" y2="38" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                    <line x1="50" y1="50" x2="73" y2="82" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                    <line x1="50" y1="50" x2="27" y2="82" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                    <line x1="50" y1="50" x2="12" y2="38" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                    <polygon points="50,22 81,42 66,74 38,65 20,41" fill="rgba(236, 72, 153, 0.1)" stroke="#EC4899" strokeWidth="1.5" />
                    <circle cx="50" cy="22" r="2.5" fill="#EC4899" />
                    <circle cx="81" cy="42" r="2.5" fill="#EC4899" />
                    <circle cx="66" cy="74" r="2.5" fill="#EC4899" />
                    <circle cx="38" cy="65" r="2.5" fill="#EC4899" />
                    <circle cx="20" cy="41" r="2.5" fill="#EC4899" />
                  </svg>
                  <div className="radar-labels-grid">
                    <span>Code</span>
                    <span>Math</span>
                    <span>Write</span>
                  </div>
                </div>
              </div>

              {/* Step 4: Optimize */}
              <div className="pipeline-card">
                <div className="pipeline-icon-container" style={{ backgroundColor: 'rgba(245, 158, 11, 0.06)', color: '#F59E0B' }}>
                  <Target size={22} />
                </div>
                <span className="pipeline-step-num">Step 04</span>
                <h3 className="pipeline-card-title">Optimize</h3>
                <span className="pipeline-card-subtitle">Find the best path</span>
                <p className="pipeline-card-desc">
                  Our optimization engine compares subscriptions, APIs and pricing to maximize savings.
                </p>
                <div className="mini-vis optimize-vis">
                  <div className="cost-box current">
                    <span className="title">Current</span>
                    <span className="val">$10.4k</span>
                  </div>
                  <div className="arrow-down">↓</div>
                  <div className="cost-box optimized">
                    <span className="title">Optimal</span>
                    <span className="val" style={{ color: '#10B981' }}>$4.2k</span>
                    <span className="savings">-59%</span>
                  </div>
                </div>
              </div>

              {/* Step 5: Execute */}
              <div className="pipeline-card">
                <div className="pipeline-icon-container" style={{ backgroundColor: 'rgba(16, 185, 129, 0.06)', color: '#10B981' }}>
                  <ClipboardCheck size={22} />
                </div>
                <span className="pipeline-step-num">Step 05</span>
                <h3 className="pipeline-card-title">Execute</h3>
                <span className="pipeline-card-subtitle">Act with confidence</span>
                <p className="pipeline-card-desc">
                  Receive a prioritized action plan with projected monthly and annual savings.
                </p>
                <div className="mini-vis execute-vis">
                  <div className="check-item"><span className="check-icon">✓</span> Cancel duplicate seats</div>
                  <div className="check-item"><span className="check-icon">✓</span> Consolidate vendors</div>
                  <div className="check-item"><span className="check-icon">✓</span> Switch APIs</div>
                  <div className="check-item"><span className="check-icon">✓</span> Save budget</div>
                </div>
              </div>
            </div>
          </div>

          <div className="steps-cta" style={{ marginTop: '56px' }}>
            <button onClick={onNavigateToStep1} className="btn btn-black" style={{ padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Start your audit — free <ArrowRight size={18} />
            </button>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '12px' }}>
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
                    <Check size={16} color="#22C55E" strokeWidth={3} /> 1 credit = 1 report audit
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Up to 4 active AI models
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Basic AI insights
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Community support
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
                    <Check size={16} color="#22C55E" strokeWidth={3} /> 10 credits included per month
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> All AI models available
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Advanced logic reports
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Priority email support
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
                    <Check size={16} color="#22C55E" strokeWidth={3} /> 20 credits added to account
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> All AI models available
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Real-time expertise consultant
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> 24/7 priority Slack support
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
                <span><Coins size={24} /></span> Credex Credits
              </div>
              <h3 style={{ fontSize: '32px', marginBottom: '16px' }}>Turn AI optimization into tangible savings</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                Earn credits by successfully implementing our AI audit recommendations, directly reducing your operational costs. Use accumulated credits to subsidize future AI subscriptions.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-bg-accent)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-text)' }}><Search size={20} /></div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Analyze & Identify</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Run audits to uncover inefficiencies in your AI toolstack.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-bg-accent)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-text)' }}><TrendingUp size={20} /></div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Optimize & Earn</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Apply recommendations to earn up to 25% back in credits.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-bg-accent)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--color-text)' }}><CreditCard size={20} /></div>
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
                <CreditCard size={32} color="var(--color-green-primary)" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
