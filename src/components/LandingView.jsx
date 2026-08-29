import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, Rocket, Eye, Search, Square, Triangle, Circle, Target, Download,
  BarChart2, ArrowRight, Check, Coins, TrendingUp, CreditCard, AlertTriangle,
  Cpu, Users, Copy, GitMerge, EyeOff, BarChart3, LineChart, Key, Binary,
  FileCheck, Scale, ShieldCheck, Recycle, Sparkles, Bot, Video, Volume2,
  Music, Presentation, Layers, Sliders, ClipboardCheck, Shield, Lock, Database, FileText,
  AlertCircle, CheckCircle, BadgeCheck, Percent, RotateCcw
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
  const pipelineRef = useRef(null);
  const [isPipelineAnimated, setIsPipelineAnimated] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

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
    'AI Spend Visibility', 'Cost Inefficiencies', 'Optimize Seat Licenses', 'Stop Paying Twice',
    'Reduce AI Vendors', 'Shadow AI', 'Usage Analytics', 'ROI Tracking',
    'API Optimization', 'Token Analysis', 'License Audit',
    'Capability Benchmarking', 'AI Governance', 'Waste Recovery'
  ];

  // Missing official logo in @lobehub/icons:
  // - Gamma (using custom premium gradient SVG fallback)
  const providerIcons = {
    openai: <OpenAI size={20} style={{ color: '#19C37D' }} />,
    anthropic: Claude.Color ? <Claude.Color size={20} /> : <Claude size={20} style={{ color: '#D97754' }} />,
    google: Gemini.Color ? <Gemini.Color size={20} /> : <Gemini size={20} />,
    meta: Meta.Color ? <Meta.Color size={20} /> : <Meta size={20} style={{ color: '#044E95' }} />,
    xai: XAI.Color ? <XAI.Color size={20} /> : <XAI size={20} style={{ color: '#0F172A' }} />,
    perplexity: Perplexity.Color ? <Perplexity.Color size={20} /> : <Perplexity size={20} style={{ color: '#13B5B1' }} />,
    deepseek: DeepSeek.Color ? <DeepSeek.Color size={20} /> : <DeepSeek size={20} style={{ color: '#4D6BFE' }} />,
    mistral: Mistral.Color ? <Mistral.Color size={20} /> : <Mistral size={20} style={{ color: '#FD7E14' }} />,
    github: GithubCopilot.Color ? <GithubCopilot.Color size={20} /> : <GithubCopilot size={20} />,
    cursor: Cursor.Color ? <Cursor.Color size={20} /> : <Cursor size={20} />,
    vercel: Vercel.Color ? <Vercel.Color size={20} /> : <Vercel size={20} />,
    runway: Runway.Color ? <Runway.Color size={20} /> : <Runway size={20} />,
    midjourney: Midjourney.Color ? <Midjourney.Color size={20} /> : <Midjourney size={20} />,
    elevenlabs: ElevenLabs.Color ? <ElevenLabs.Color size={20} /> : <ElevenLabs size={20} />,
    suno: Suno.Color ? <Suno.Color size={20} /> : <Suno size={20} />,
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
    if (n.includes('spend')) return <Coins size={16} />;
    if (n.includes('cost') || n.includes('inefficiencies')) return <TrendingUp size={16} />;
    if (n.includes('seat') || n.includes('license')) return <Users size={16} />;
    if (n.includes('duplicate') || n.includes('twice')) return <Copy size={16} />;
    if (n.includes('consolidation') || n.includes('vendors') || n.includes('reduce')) return <GitMerge size={16} style={{ transform: 'rotate(90deg)' }} />;
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
    // Purple/Indigo themed (Shadow, Duplicate, API, Token, Analytics, twice, reduce)
    else if (n.includes('shadow') || n.includes('duplicate') || n.includes('twice') || n.includes('reduce') || n.includes('vendors') || n.includes('api') || n.includes('token') || n.includes('analytics')) {
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
          <div className="hero-content">
            <div>
              <span className="badge badge-green" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} strokeWidth={2.2} /> Algorithmic AI Spend Auditing · Free to Start
              </span>
              <h1 className="hero-title">
                Stop burning cash <br />
                <span>on AI tools.</span>
              </h1>
            </div>
            <p className="hero-description">
              Audex AI audits your enterprise subscriptions, detects duplicate licenses, and maps workload optimization paths in under 60 seconds.
            </p>

            <div className="hero-cta">
              <button onClick={onNavigateToStep1} className="btn btn-black" style={{ padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Rocket size={18} /> Audit My AI Stack <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E', marginLeft: '2px' }}></span>
              </button>
              <button onClick={onViewSample} className="btn btn-outline" style={{ padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} /> See Sample Report
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
          <div className="hero-card-wrapper" style={{ position: 'relative', zIndex: 1 }}>
            <style>{`
              @media (min-width: 992px) {
                .hero-content {
                  transform: translateY(-50px);
                }
                .hero-card-wrapper {
                  transform: translateY(-30px);
                }
              }
              .hero-turtle {
                position: absolute;
                top: 50%;
                right: 62%;
                transform: translateY(-50%);
                height: auto;
                width: 390px;
                z-index: -1;
                pointer-events: none;
              }
              @media (max-width: 1280px) {
                .hero-turtle {
                  display: none !important;
                }
              }
              @media (max-width: 991px) {
                .hero-content {
                  transform: none !important;
                }
                .hero-card-wrapper {
                  transform: none !important;
                  width: 100% !important;
                  margin: 0 auto !important;
                }
                .savings-preview-card {
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 auto !important;
                  padding: 20px 16px !important;
                  border-radius: 16px !important;
                }
              }
              .savings-preview-card {
                background-color: white;
                border-radius: 20px;
                border: 1px solid var(--color-border);
                box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02);
                padding: 24px 30px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                width: 100%;
                max-width: 530px;
                margin-left: auto;
                box-sizing: border-box;
                transition: all 0.2s ease;
              }
              .savings-preview-card:hover {
                box-shadow: 0 24px 48px -10px rgba(0,0,0,0.1);
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
              {/* Header: Unlocked Badge + Date + Monthly Savings */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '850', border: '1px solid #A7F3D0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    <ShieldCheck size={13} strokeWidth={2.5} /> UNLOCKED
                  </span>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155' }}>
                    21 July 2026 at 11:13 pm
                  </span>
                </div>
                <span style={{ fontSize: '24px', fontWeight: '850', color: '#059669', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  +$140.74/mo
                </span>
              </div>

              {/* Meta Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginTop: '16px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    <Users size={15} strokeWidth={2} style={{ color: '#64748B' }} /> Team Size:
                  </span>
                  <strong style={{ fontSize: '13px', color: '#0F172A', fontWeight: '750' }}>11 seats</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    <Target size={15} strokeWidth={2} style={{ color: '#64748B' }} /> Audit Mode:
                  </span>
                  <span style={{ fontSize: '10.5px', fontWeight: '850', color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #A7F3D0', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    PERFORMANCE PRESERVATION MODE
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    <Bot size={15} strokeWidth={2} style={{ color: '#64748B' }} /> Active Tools:
                  </span>
                  <strong style={{ fontSize: '13px', color: '#0F172A', fontWeight: '750' }}>7 tools</strong>
                </div>
              </div>

              {/* Audited Tools Compact Table */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                <div style={{ fontSize: '9.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '8px' }}>
                  AUDITED TOOLS
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '9.5px', fontWeight: '800', textTransform: 'uppercase' }}>
                      <th style={{ padding: '4px 0', textAlign: 'left' }}>TOOL</th>
                      <th style={{ padding: '4px 0', textAlign: 'center' }}>TYPE</th>
                      <th style={{ padding: '4px 0', textAlign: 'center' }}>SEATS</th>
                      <th style={{ padding: '4px 0', textAlign: 'right' }}>USE CASE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '6.5px 0', fontWeight: '750', color: '#0F172A' }}>OpenAI</td>
                      <td style={{ padding: '6.5px 0', textAlign: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: '850', color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>SUB</span>
                      </td>
                      <td style={{ padding: '6.5px 0', textAlign: 'center', fontWeight: '700', color: '#334155' }}>1</td>
                      <td style={{ padding: '6.5px 0', textAlign: 'right', fontWeight: '600', color: '#475569' }}>Mixed</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '6.5px 0', fontWeight: '750', color: '#0F172A' }}>Anthropic</td>
                      <td style={{ padding: '6.5px 0', textAlign: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: '850', color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>SUB</span>
                      </td>
                      <td style={{ padding: '6.5px 0', textAlign: 'center', fontWeight: '700', color: '#334155' }}>5</td>
                      <td style={{ padding: '6.5px 0', textAlign: 'right', fontWeight: '600', color: '#475569' }}>Mixed</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '6.5px 0', fontWeight: '750', color: '#0F172A' }}>Google</td>
                      <td style={{ padding: '6.5px 0', textAlign: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: '850', color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>SUB</span>
                      </td>
                      <td style={{ padding: '6.5px 0', textAlign: 'center', fontWeight: '700', color: '#334155' }}>1</td>
                      <td style={{ padding: '6.5px 0', textAlign: 'right', fontWeight: '600', color: '#475569' }}>Mixed</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '6.5px 0', fontWeight: '750', color: '#0F172A' }}>Anthropic: Claude Fable 5</td>
                      <td style={{ padding: '6.5px 0', textAlign: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: '850', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>API</span>
                      </td>
                      <td style={{ padding: '6.5px 0', textAlign: 'center', fontWeight: '700', color: '#334155' }}>1</td>
                      <td style={{ padding: '6.5px 0', textAlign: 'right', fontWeight: '600', color: '#475569' }}>Coding</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => onViewSample('plan')}
                    className="btn btn-outline"
                    style={{
                      fontSize: '12px',
                      padding: '10px 12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--color-border)',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--color-text-primary)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <ClipboardCheck size={14} style={{ color: '#2563EB' }} /> Final Plan
                  </button>
                  <button
                    onClick={() => onViewSample('report')}
                    className="btn btn-outline"
                    style={{
                      fontSize: '12px',
                      padding: '10px 12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--color-border)',
                      backgroundColor: '#FFFFFF',
                      color: 'var(--color-text-primary)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <BarChart3 size={14} style={{ color: '#059669' }} /> Detailed Report
                  </button>
                </div>

                <button
                  onClick={() => onViewSample('report')}
                  className="btn btn-green"
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    fontSize: '13px',
                    fontWeight: '800',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#065F46',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(6, 95, 70, 0.2)'
                  }}
                >
                  <Sparkles size={15} /> Consult AI Spend Specialist
                </button>

                <div style={{ textAlign: 'center', marginTop: '2px' }}>
                  <button
                    onClick={onNavigateToStep1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      padding: '2px 6px'
                    }}
                  >
                    <RotateCcw size={11} /> Run New Custom Audit
                  </button>
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
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px', marginTop: '-12px', fontFamily: 'var(--font-body)' }}>
          Supporting 40+ AI providers and hundreds of AI models.
        </p>

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

      {/* Why Audex AI Section */}
      <section className="steps-section" style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid var(--color-border)', padding: '60px 0' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '48px', textAlign: 'center' }}>
            <span className="section-badge" style={{
              backgroundColor: 'rgba(15, 138, 95, 0.08)',
              color: '#0F8A5F',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '750',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'inline-block'
            }}>Cost Optimization</span>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '32px', marginTop: '12px' }}>Recover Hidden AI Spending</h2>
            <p style={{ maxWidth: '600px', margin: '12px auto 0 auto', color: 'var(--color-text-muted)', fontSize: '15px' }}>Eliminate manual billing auditing. Audex AI cross-references provider billing baselines against real capability metrics.</p>
          </div>
          <div className="why-audex-grid">
            <style>{`
              .why-audex-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 24px;
              }
              @media (min-width: 640px) {
                .why-audex-grid {
                  grid-template-columns: repeat(2, 1fr);
                }
              }
              @media (min-width: 1024px) {
                .why-audex-grid {
                  grid-template-columns: repeat(4, 1fr);
                }
              }
              .why-audex-card {
                background-color: #FFFFFF;
                border-radius: 16px;
                border: 1px solid var(--color-border);
                box-shadow: var(--shadow-sm);
                padding: 24px;
                transition: all 250ms ease;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                text-align: left;
              }
              .why-audex-card:hover {
                transform: translateY(-3px);
                box-shadow: var(--shadow-md);
              }
              .why-audex-card.highlight {
                border-color: var(--color-green-primary);
                box-shadow: 0 10px 25px -10px rgba(0, 102, 68, 0.08);
              }
              .why-audex-card.highlight:hover {
                box-shadow: 0 12px 30px -10px rgba(0, 102, 68, 0.15);
              }
            `}</style>

            {/* Column 1: Without Audex */}
            <div className="why-audex-card">
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
                  <AlertCircle size={20} /> Without Audex AI
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '14px', lineHeight: 1 }}>✕</span>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '750', marginBottom: '2px', color: 'var(--color-text-primary)' }}>Unchecked Duplicate Tools</h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: '1.45', margin: 0 }}>Departmental teams purchasing overlapping licenses in silos.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '14px', lineHeight: 1 }}>✕</span>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '750', marginBottom: '2px', color: 'var(--color-text-primary)' }}>Manual Billing Auditing</h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: '1.45', margin: 0 }}>Wasting engineering hours parsing complex, changing API billing catalogs.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '14px', lineHeight: 1 }}>✕</span>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '750', marginBottom: '2px', color: 'var(--color-text-primary)' }}>Orphaned Developer Seats</h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: '1.45', margin: 0 }}>Paying for inactive developer seats and forgotten endpoints.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Graph Goes Down (AI Waste/Spend Trend) */}
            <div className="why-audex-card">
              <div>
                <span style={{ fontSize: '9.5px', fontWeight: '750', textTransform: 'uppercase', color: '#EF4444', letterSpacing: '0.05em' }}>Cost Optimization</span>
                
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '4px 0 2px 0', fontFamily: 'var(--font-title)' }}>Avoidable Spend</h3>
                <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>AI waste trend over time</p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '850', color: 'var(--color-text-primary)', fontFamily: 'var(--font-title)' }}>-71%</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>$12.4k to $3.6k</span>
                </div>
              </div>

              <div style={{ width: '100%', height: '90px', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="red-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <line x1="0" y1="20" x2="200" y2="20" stroke="#F1F5F9" strokeDasharray="3,3" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#F1F5F9" strokeDasharray="3,3" />
                  <line x1="0" y1="80" x2="200" y2="80" stroke="#F1F5F9" strokeDasharray="3,3" />

                  <path d="M 0 20 Q 50 25 100 65 T 200 85 L 200 100 L 0 100 Z" fill="url(#red-grad)" />
                  <path d="M 0 20 Q 50 25 100 65 T 200 85" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />

                  <circle cx="200" cy="85" r="3.5" fill="#EF4444" />
                  <circle cx="200" cy="85" r="7" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0.5">
                    <animate attributeName="r" values="3.5;9;3.5" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </div>

            {/* Column 3: With Audex */}
            <div className="why-audex-card highlight">
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '20px', color: 'var(--color-green-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-title)' }}>
                  <BadgeCheck size={20} color="var(--color-green-primary)" /> With Audex AI
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold', fontSize: '14px', lineHeight: 1 }}>✓</span>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '750', marginBottom: '2px', color: 'var(--color-text-primary)' }}>Consolidated License Allocation</h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: '1.45', margin: 0 }}>Automatically reallocate seats onto unified, high-efficiency tiers.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold', fontSize: '14px', lineHeight: 1 }}>✓</span>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '750', marginBottom: '2px', color: 'var(--color-text-primary)' }}>Choose the Right AI with Confidence</h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: '1.45', margin: 0 }}>Identify cost-effective provider models without degrading response quality.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#22C55E', fontWeight: 'bold', fontSize: '14px', lineHeight: 1 }}>✓</span>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '750', marginBottom: '2px', color: 'var(--color-text-primary)' }}>Total Spend Auditing Visibility</h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: '1.45', margin: 0 }}>Trace orphaned endpoints and unused developer seats in 60 seconds.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4: Graph Goes Up (AI Stack Efficiency) */}
            <div className="why-audex-card">
              <div>
                <span style={{ fontSize: '9.5px', fontWeight: '750', textTransform: 'uppercase', color: 'var(--color-green-primary)', letterSpacing: '0.05em' }}>Performance Lift</span>
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '4px 0 2px 0', fontFamily: 'var(--font-title)' }}>Stack Efficiency</h3>
                <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>Resource utilization curve</p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '850', color: 'var(--color-text-primary)', fontFamily: 'var(--font-title)' }}>+300%</span>
                  <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>24% to 96% audit baseline</span>
                </div>
              </div>

              <div style={{ width: '100%', height: '90px', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <line x1="0" y1="20" x2="200" y2="20" stroke="#F1F5F9" strokeDasharray="3,3" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#F1F5F9" strokeDasharray="3,3" />
                  <line x1="0" y1="80" x2="200" y2="80" stroke="#F1F5F9" strokeDasharray="3,3" />

                  <path d="M 0 85 Q 50 80 100 45 T 200 15 L 200 100 L 0 100 Z" fill="url(#green-grad)" />
                  <path d="M 0 85 Q 50 80 100 45 T 200 15" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

                  <circle cx="200" cy="15" r="3.5" fill="#10B981" />
                  <circle cx="200" cy="15" r="7" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.5">
                    <animate attributeName="r" values="3.5;9;3.5" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Audex Intelligence Engine Section */}
      <section className="steps-section intel-engine-section" style={{ padding: '40px 0', position: 'relative', overflow: 'hidden', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--color-border)' }}>
        {/* Background Accents (Grid and radial glow) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(rgba(15, 138, 95, 0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.8,
          pointerEvents: 'none',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 163, 74, 0.04) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          right: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15, 138, 95, 0.04) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: 0
        }}></div>

        <div className="container" style={{ maxWidth: '1280px', position: 'relative', zIndex: 1 }}>
          <div className="section-header" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <span className="section-badge" style={{
              backgroundColor: 'rgba(15, 138, 95, 0.08)',
              color: '#0F8A5F',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '750',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'inline-block'
            }}>
              METHODOLOGY
            </span>
            <h2 className="section-title" style={{
              fontFamily: 'var(--font-title)',
              fontWeight: 800,
              fontSize: '48px',
              marginTop: '16px',
              letterSpacing: '-0.02em',
              color: '#111827',
              lineHeight: '1.15'
            }}>
              The Audex <span style={{
                background: 'linear-gradient(90deg, #0F8A5F 0%, #16A34A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline'
              }}>Decision Engine</span>
            </h2>
            <p style={{
              maxWidth: '700px',
              margin: '12px auto 0 auto',
              color: '#6B7280',
              fontSize: '15.5px',
              lineHeight: '1.6'
            }}>
              Our deterministic rules engine parses your AI tool configuration, benchmarks provider capability ratings, and outputs verifiable savings recommendations.
            </p>
          </div>

          <style>{`
            .intel-pipeline-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 20px;
              width: 100%;
              margin-bottom: 32px;
            }
            .intel-pipeline-row {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0px;
              width: 100%;
              flex-wrap: wrap;
            }
            .intel-step-card {
              background-color: #FCFCFD;
              border-radius: 16px;
              border: 1px solid #E8EDF2;
              box-shadow: 0 4px 10px rgba(15, 23, 42, 0.02);
              padding: 16px 14px;
              width: 185px;
              height: 140px;
              text-align: center;
              transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              position: relative;
              box-sizing: border-box;
            }
            .intel-step-card:hover {
              transform: translateY(-2px);
              border-color: rgba(15, 138, 95, 0.4);
              box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
            }
            .intel-step-num-badge {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              font-size: 10px;
              font-weight: 800;
              display: flex;
              align-items: center;
              justify-content: center;
              position: absolute;
              top: 8px;
              left: 8px;
            }
            .intel-step-icon-wrapper {
              width: 38px;
              height: 38px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 10px;
              transition: transform 250ms ease;
            }
            .intel-step-card:hover .intel-step-icon-wrapper {
              transform: scale(1.08);
            }
            .intel-arrow-connector {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 20px;
              color: #E8EDF2;
              transition: color 250ms ease;
            }
            .intel-step-card:hover + .intel-arrow-connector {
              color: #0F8A5F;
            }
            .animated-flow-line {
              stroke: currentColor;
              stroke-dasharray: 4, 4;
              animation: flow-stroke 1.2s linear infinite;
            }
            @keyframes flow-stroke {
              to {
                stroke-dashoffset: -20;
              }
            }
            
            .trust-strip-container {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              background-color: #FFFFFF;
              border: 1px solid #E8EDF2;
              border-radius: 16px;
              padding: 14px 24px;
              box-shadow: 0 12px 40px rgba(15, 23, 42, 0.04);
              margin-top: 24px;
              width: 100%;
              box-sizing: border-box;
            }
            .trust-strip-item {
              display: flex;
              align-items: center;
              gap: 12px;
              text-align: left;
            }
            
            @media (max-width: 1024px) {
              .intel-pipeline-row {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
              }
              .intel-step-card {
                width: 100%;
                height: 140px;
              }
              .intel-arrow-connector {
                display: none;
              }
              .trust-strip-container {
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                padding: 20px;
              }
            }
            @media (max-width: 640px) {
              .intel-pipeline-row {
                grid-template-columns: 1fr;
              }
              .trust-strip-container {
                grid-template-columns: 1fr;
              }
            }
          `}</style>

          <div className="intel-pipeline-wrapper">
            {/* Row 1: Steps 1 to 5 */}
            <div className="intel-pipeline-row">
              {[
                { num: '01', title: 'Billing Inventory', desc: 'Map all active licenses and API configurations.', bg: 'rgba(59, 130, 246, 0.05)', color: '#3B82F6', icon: <Layers size={18} /> },
                { num: '02', title: 'Billing Normalization', desc: 'Standardize seats, token pricing, and access logs.', bg: 'rgba(139, 92, 246, 0.05)', color: '#8B5CF6', icon: <Binary size={18} /> },
                { num: '03', title: 'Capability Benchmarking', desc: 'Compare model execution scores across benchmarks.', bg: 'rgba(236, 72, 153, 0.05)', color: '#EC4899', icon: <LineChart size={18} /> },
                { num: '04', title: 'Structured Cost Analysis', desc: 'Identify unassigned seats and idle endpoints.', bg: 'rgba(245, 158, 11, 0.05)', color: '#F59E0B', icon: <Coins size={18} /> },
                { num: '05', title: 'Rule-Based Optimization', desc: 'Reallocate workloads using cost rules.', bg: 'rgba(16, 185, 129, 0.05)', color: '#10B981', icon: <Cpu size={18} /> }
              ].map((step, idx, arr) => (
                <React.Fragment key={step.num}>
                  <div className="intel-step-card">
                    <div className="intel-step-num-badge" style={{ backgroundColor: step.bg, color: step.color }}>
                      {step.num}
                    </div>
                    <div className="intel-step-icon-wrapper" style={{ backgroundColor: step.bg, color: step.color }}>
                      {step.icon}
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '850', margin: '0 0 6px 0', color: '#111827', fontFamily: 'var(--font-title)', lineHeight: '1.2' }}>{step.title}</h4>
                    <p style={{ fontSize: '11.5px', color: '#6B7280', lineHeight: '1.45', margin: 0 }}>{step.desc}</p>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="intel-arrow-connector">
                      <svg width="40" height="20" viewBox="0 0 40 20" style={{ overflow: 'visible' }}>
                        <path d="M 0 10 L 40 10" fill="none" className="animated-flow-line" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="20" cy="10" r="3" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Connecting line / transition curve on Desktop */}
            <div className="intel-arrow-connector" style={{ transform: 'rotate(90deg)', margin: '2px 0', height: '20px', width: '20px' }}>
              <svg width="40" height="20" viewBox="0 0 40 20" style={{ overflow: 'visible' }}>
                <path d="M 0 10 L 40 10" fill="none" className="animated-flow-line" strokeWidth="2" strokeLinecap="round" />
                <circle cx="20" cy="10" r="3" fill="currentColor" />
              </svg>
            </div>

            {/* Row 2: Steps 6 to 7 */}
            <div className="intel-pipeline-row">
              {[
                { num: '06', title: 'Action Checklist', desc: 'Generate step-by-step seat migration checklists.', bg: 'rgba(71, 85, 105, 0.05)', color: '#475569', icon: <GitMerge size={18} /> },
                { num: '07', title: 'Savings Report', desc: 'Download the complete verifiable cost audit.', bg: 'rgba(6, 182, 212, 0.05)', color: '#06B6D4', icon: <FileText size={18} /> }
              ].map((step, idx, arr) => (
                <React.Fragment key={step.num}>
                  <div className="intel-step-card">
                    <div className="intel-step-num-badge" style={{ backgroundColor: step.bg, color: step.color }}>
                      {step.num}
                    </div>
                    <div className="intel-step-icon-wrapper" style={{ backgroundColor: step.bg, color: step.color }}>
                      {step.icon}
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '850', margin: '0 0 6px 0', color: '#111827', fontFamily: 'var(--font-title)', lineHeight: '1.2' }}>{step.title}</h4>
                    <p style={{ fontSize: '11.5px', color: '#6B7280', lineHeight: '1.45', margin: 0 }}>{step.desc}</p>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="intel-arrow-connector">
                      <svg width="40" height="20" viewBox="0 0 40 20" style={{ overflow: 'visible' }}>
                        <path d="M 0 10 L 40 10" fill="none" className="animated-flow-line" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="20" cy="10" r="3" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Bottom Trust Bar */}
          <div className="trust-strip-container">
            <div className="trust-strip-item">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(15, 138, 95, 0.08)', color: '#0F8A5F', flexShrink: 0 }}>
                <Shield size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '12.5px', fontWeight: '750', color: '#111827', margin: 0 }}>Enterprise-grade Security</h4>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>Secure processing</p>
              </div>
            </div>
            <div className="trust-strip-item">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(15, 138, 95, 0.08)', color: '#0F8A5F', flexShrink: 0 }}>
                <Zap size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '12.5px', fontWeight: '750', color: '#111827', margin: 0 }}>Results in Under 60 Seconds</h4>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>Instant answers</p>
              </div>
            </div>
            <div className="trust-strip-item">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(15, 138, 95, 0.08)', color: '#0F8A5F', flexShrink: 0 }}>
                <Target size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '12.5px', fontWeight: '750', color: '#111827', margin: 0 }}>Verified Recommendations</h4>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>No guesswork</p>
              </div>
            </div>
            <div className="trust-strip-item">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(15, 138, 95, 0.08)', color: '#0F8A5F', flexShrink: 0 }}>
                <CheckCircle size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '12.5px', fontWeight: '750', color: '#111827', margin: 0 }}>No Consultants Required</h4>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>Self-serve pipeline</p>
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
            <span className="section-badge" style={{
              backgroundColor: 'rgba(15, 138, 95, 0.08)',
              color: '#0F8A5F',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '750',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'inline-block'
            }}>How It Works</span>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '32px', lineHeight: 1.2 }}>
              Recover Hidden AI Spending in Five Reproducible Steps.
            </h2>
            <p style={{ maxWidth: '600px', margin: '16px auto 0 auto', color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
              Eliminate billing waste. Map subscriptions, normalize usage baselines, and execute deterministic cost optimization plans.
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
                  <Database size={22} />
                </div>
                <span className="pipeline-step-num">Step 01</span>
                <h3 className="pipeline-card-title">Map Subscriptions</h3>
                <span className="pipeline-card-subtitle">Build your active inventory</span>
                <p className="pipeline-card-desc">
                  Import team seat counts, API configurations, and vendor directories in under 60 seconds.
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
                  <Scale size={22} />
                </div>
                <span className="pipeline-step-num">Step 02</span>
                <h3 className="pipeline-card-title">Normalize Usage</h3>
                <span className="pipeline-card-subtitle">Establish a structured cost baseline</span>
                <p className="pipeline-card-desc">
                  Convert varying monthly subscriptions, tokens-per-dollar rates, and API keys into a comparable metric.
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
                  <TrendingUp size={22} />
                </div>
                <span className="pipeline-step-num">Step 03</span>
                <h3 className="pipeline-card-title">Compare Capabilities</h3>
                <span className="pipeline-card-subtitle">Choose the right model with confidence</span>
                <p className="pipeline-card-desc">
                  Cross-reference every model recommendation against standard benchmarks (coding, math, reasoning) to preserve response quality.
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
                  <Percent size={22} />
                </div>
                <span className="pipeline-step-num">Step 04</span>
                <h3 className="pipeline-card-title">Detect Waste</h3>
                <span className="pipeline-card-subtitle">Stop paying for duplicate tools</span>
                <p className="pipeline-card-desc">
                  Reveal parallel seat subscriptions, idle seats, and over-provisioned developer tiers using cost rules.
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
                  <CheckCircle size={22} />
                </div>
                <span className="pipeline-step-num">Step 05</span>
                <h3 className="pipeline-card-title">Execute Placements</h3>
                <span className="pipeline-card-subtitle">Recover your IT budget immediately</span>
                <p className="pipeline-card-desc">
                  Apply step-by-step seat downgrades, license reallocations, and workload switch guides.
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

      {/* Why Trust Our Recommendations Section */}
      <section className="steps-section trust-section-redesign" style={{ backgroundColor: '#FAFCFB', padding: '40px 0', borderTop: '1px solid #E8EDF2', position: 'relative', overflow: 'hidden' }}>
        {/* Background Decorative Accents */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(rgba(15, 138, 95, 0.02) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          opacity: 0.8,
          pointerEvents: 'none',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 163, 74, 0.03) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15, 138, 95, 0.03) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0
        }}></div>

        <div className="container" style={{ maxWidth: '1280px', position: 'relative', zIndex: 1 }}>
          <div className="section-header" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <span className="section-badge" style={{
              backgroundColor: 'rgba(15, 138, 95, 0.08)',
              color: '#0F8A5F',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '750',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Shield size={12} /> DATA INTEGRITY
            </span>
            <h2 className="section-title" style={{
              fontFamily: 'var(--font-title)',
              fontWeight: 800,
              fontSize: '48px',
              marginTop: '16px',
              letterSpacing: '-0.02em',
              color: '#111827',
              lineHeight: '1.15'
            }}>
              Every <span style={{
                background: 'linear-gradient(90deg, #0F8A5F 0%, #16A34A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline'
              }}>Recommendation Explained</span>
            </h2>
            <p style={{
              maxWidth: '700px',
              margin: '12px auto 0 auto',
              color: '#6B7280',
              fontSize: '16px',
              lineHeight: '1.6'
            }}>
              We audit subscriptions using verified capability ratings and deterministic cost rules. Every recommendation is transparent, reproducible, and explainable.
            </p>
          </div>

          <style>{`
            .trust-two-col-layout {
              display: grid;
              grid-template-columns: 1fr;
              gap: 20px;
              align-items: start;
              margin-bottom: 24px;
            }
            @media (min-width: 1024px) {
              .trust-two-col-layout {
                grid-template-columns: 380px 1fr;
              }
            }
            
            .trust-left-evidence-card {
              background-color: #FFFFFF;
              border-radius: 24px;
              border: 1px solid #E8EDF2;
              box-shadow: 0 12px 40px rgba(15, 23, 42, 0.04);
              padding: 24px 20px;
              display: flex;
              flex-direction: column;
              transition: all 250ms ease;
              text-align: left;
            }
            .trust-left-evidence-card:hover {
              transform: translateY(-3px);
              border-color: rgba(15, 138, 95, 0.35);
              box-shadow: 0 16px 48px rgba(15, 23, 42, 0.07);
            }
            
            .trust-checklist-item {
              display: flex;
              align-items: flex-start;
              gap: 14px;
              padding: 10px 0;
              border-bottom: 1px dashed #E8EDF2;
            }
            .trust-checklist-item:last-child {
              border-bottom: none;
              padding-bottom: 0;
            }
            
            .trust-right-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 12px;
            }
            @media (min-width: 640px) {
              .trust-right-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }
            
            .trust-feature-card {
              background-color: #FFFFFF;
              border-radius: 16px;
              border: 1px solid #E8EDF2;
              box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02);
              padding: 16px 16px;
              position: relative;
              transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              text-align: left;
            }
            .trust-feature-card:hover {
              transform: translateY(-3px);
              border-color: rgba(15, 138, 95, 0.4);
              box-shadow: 0 12px 40px rgba(15, 23, 42, 0.06);
            }
            .trust-feature-icon-wrapper {
              width: 44px;
              height: 44px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 12px;
              transition: transform 250ms ease;
            }
            .trust-feature-card:hover .trust-feature-icon-wrapper {
              transform: scale(1.08);
            }
            
            .trust-security-card {
              background-color: #FFFFFF;
              border-radius: 16px;
              border: 1px solid #E8EDF2;
              box-shadow: 0 6px 20px rgba(15, 23, 42, 0.03);
              padding: 12px 20px;
              display: flex;
              align-items: center;
              gap: 16px;
              transition: all 250ms ease;
              text-align: left;
              margin-top: 8px;
            }
            .trust-security-card:hover {
              border-color: rgba(15, 138, 95, 0.3);
              box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
            }
            
            .trust-stats-strip {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              background-color: #FFFFFF;
              border: 1px solid #E8EDF2;
              border-radius: 28px;
              padding: 14px 24px;
              box-shadow: 0 20px 50px rgba(15, 23, 42, 0.05);
              margin-top: 24px;
              width: 100%;
              box-sizing: border-box;
            }
            .trust-stats-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              gap: 6px;
              transition: transform 250ms ease;
              position: relative;
            }
            .trust-stats-item:hover {
              transform: translateY(-2px);
            }
            .trust-stats-underline {
              width: 16px;
              height: 2px;
              background-color: #0F8A5F;
              transition: width 250ms ease;
              margin-top: 4px;
            }
            .trust-stats-item:hover .trust-stats-underline {
              width: 32px;
            }
            
            @media (max-width: 1024px) {
              .trust-stats-strip {
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                padding: 16px;
              }
            }
            @media (max-width: 640px) {
              .trust-two-col-layout {
                grid-template-columns: 1fr;
              }
              .trust-stats-strip {
                grid-template-columns: 1fr;
              }
            }
          `}</style>

          <div className="trust-two-col-layout">
            {/* Left Column: Verified Methodology */}
            <div className="trust-left-evidence-card">
              <span style={{ fontSize: '11px', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0F8A5F', marginBottom: '12px', display: 'block' }}>Verified Methodology</span>
              <h3 style={{ fontSize: '24px', fontWeight: '850', fontFamily: 'var(--font-title)', marginBottom: '14px', color: '#111827', lineHeight: '1.25' }}>
                Every Cost Audit Is Built on Verifiable <span style={{ color: '#0F8A5F' }}>Evidence</span>
              </h3>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.65', marginBottom: '24px' }}>
                We calculate optimizations using current vendor contract pricing, standard model benchmarks, and open-source models.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', borderTop: '1px solid #E8EDF2', paddingTop: '8px' }}>
                {[
                  { title: 'Explainable Decision Logic', desc: 'Every recommendation includes step-by-step cost formulas and performance data.' },
                  { title: 'Capability Benchmarking', desc: "Alternate models are benchmarked on math and code to guarantee execution quality." },
                  { title: 'Verified Pricing Data', desc: 'Recommendations are calculated against current, public provider billing catalogs.' },
                  { title: 'Reproducible Cost Formulas', desc: "See exactly how much you save per seat, per token, and per department." },
                ].map((pt, i) => (
                  <div key={i} className="trust-checklist-item">
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(15, 138, 95, 0.08)', color: '#0F8A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '750', color: '#111827', margin: '0 0 2px 0' }}>{pt.title}</h4>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: '1.45' }}>{pt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Grid and Banner */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="trust-right-grid">
                {[
                  { num: '01', title: 'Choose the Right AI with Confidence', desc: 'Evaluating model capability levels across coding, reasoning, and math benchmarks to ensure alternate options do not degrade quality.', icon: <BarChart2 size={18} />, bg: 'rgba(59, 130, 246, 0.05)', color: '#3B82F6' },
                  { num: '02', title: 'Compare Real AI Pricing', desc: 'Live, data-backed indexing of seat licenses and api tokens-per-dollar values across 40+ providers.', icon: <Coins size={18} />, bg: 'rgba(245, 158, 11, 0.05)', color: '#F59E0B' },
                  { num: '03', title: 'Stop Paying for Duplicate AI Tools', desc: 'Structured analysis of active subscriptions to detect duplicate parallel seats and capabilities.', icon: <Copy size={18} />, bg: 'rgba(139, 92, 246, 0.05)', color: '#8B5CF6' },
                  { num: '04', title: 'Rule-Based Optimization', desc: 'Structured mathematical modeling of seat allocations and token rates rather than arbitrary AI guesses.', icon: <Sliders size={18} />, bg: 'rgba(236, 72, 153, 0.05)', color: '#EC4899' },
                  { num: '05', title: 'Compare Providers Before You Pay More', desc: 'Transparent mapping of proprietary models (GPT, Claude, Gemini) against equivalent open workloads.', icon: <Zap size={18} />, bg: 'rgba(16, 185, 129, 0.05)', color: '#10B981' },
                  { num: '06', title: 'Every Recommendation Explained', desc: 'Every suggestion includes clear reasoning, quality match scores, and the underlying savings calculations.', icon: <FileCheck size={18} />, bg: 'rgba(6, 182, 212, 0.05)', color: '#06B6D4' }
                ].map((item, idx) => (
                  <div key={idx} className="trust-feature-card">
                    <div className="trust-feature-icon-wrapper" style={{ backgroundColor: item.bg, color: item.color }}>
                      {item.icon}
                    </div>
                    <h3 style={{ fontSize: '14.5px', fontWeight: '750', margin: '0 0 6px 0', fontFamily: 'var(--font-title)', color: '#111827' }}>{item.title}</h3>
                    <p style={{ fontSize: '11.5px', color: '#6B7280', lineHeight: '1.5', margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Bottom Security Card */}
              <div className="trust-security-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(15, 138, 95, 0.08)', color: '#0F8A5F', flexShrink: 0 }}>
                  <Shield size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '750', color: '#111827', margin: '0 0 2px 0' }}>Secure by Design</h4>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>
                    Audex AI analyzes your stack using encrypted benchmark data. Pricing intelligence and API token rates remain encrypted both in transit and at rest.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Strip */}
          <div className="trust-stats-strip">
            {[
              { stat: '40+', label: 'Providers Supported', icon: <Cpu size={20} />, bg: 'rgba(59, 130, 246, 0.05)', color: '#3B82F6' },
              { stat: '100+', label: 'Models Indexed', icon: <Layers size={20} />, bg: 'rgba(139, 92, 246, 0.05)', color: '#8B5CF6' },
              { stat: '25+', label: 'Benchmark Categories', icon: <Scale size={20} />, bg: 'rgba(236, 72, 153, 0.05)', color: '#EC4899' },
              { stat: 'Daily', label: 'Pricing Catalog Updates', icon: <Zap size={20} />, bg: 'rgba(16, 185, 129, 0.05)', color: '#10B981' }
            ].map((item, idx) => (
              <div key={idx} className="trust-stats-item">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: item.bg, color: item.color, marginBottom: '8px' }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '28px', fontWeight: '850', color: '#111827', fontFamily: 'var(--font-title)', lineHeight: 1 }}>{item.stat}</div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginTop: '2px' }}>{item.label}</div>
                <div className="trust-stats-underline" style={{ backgroundColor: item.color }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Audit Preview Section */}
      <section className="steps-section" style={{ backgroundColor: '#FFFFFF', padding: '56px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '48px', textAlign: 'center' }}>
            <span className="section-badge" style={{
              backgroundColor: 'rgba(15, 138, 95, 0.08)',
              color: '#0F8A5F',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '750',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'inline-block'
            }}>Audit Preview</span>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '32px', marginTop: '12px' }}>See What a Spend Audit Looks Like</h2>
            <p style={{ maxWidth: '600px', margin: '12px auto 0 auto', color: 'var(--color-text-muted)', fontSize: '15px' }}>Preview the exact report structure, seat metrics, and cost checklist generated for your team.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', alignItems: 'center' }} className="preview-two-col-layout">
            <style>{`
              @media (min-width: 1024px) {
                .preview-two-col-layout {
                  grid-template-columns: 35% 65% !important;
                }
              }
            `}</style>

            {/* Left Column: Info Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-green-primary)', marginBottom: '8px', display: 'block' }}>
                  Spend Audit Capabilities
                </span>
                <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: '1.55', margin: 0 }}>
                  Every spend audit maps active license counts, model execution rates, and subscription terms into a verifiable cost checklist:
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Algorithmic seat & usage analysis', icon: <BarChart3 size={14} color="var(--color-green-primary)" /> },
                  { label: 'Duplicate seat detection', icon: <Copy size={14} color="var(--color-green-primary)" /> },
                  { label: 'Optimization recommendations', icon: <TrendingUp size={14} color="var(--color-green-primary)" /> },
                  { label: 'Capability benchmarking', icon: <Scale size={14} color="var(--color-green-primary)" /> },
                  { label: 'Migration checklists', icon: <ClipboardCheck size={14} color="var(--color-green-primary)" /> },
                  { label: 'PDF export options', icon: <Download size={14} color="var(--color-green-primary)" /> }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-green-light)', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '4px' }}>
                <button
                  onClick={onNavigateToStep1}
                  className="btn btn-green"
                  style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '700', borderRadius: '8px', fontSize: '13.5px' }}
                >
                  Find Hidden AI Waste <ArrowRight size={16} />
                </button>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px', margin: '8px 0 0 0' }}>
                  No credit card required • Results in under 60 seconds
                </p>
              </div>
            </div>

            {/* Right Column: Premium Report Mockup */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '18px 20px', boxShadow: 'var(--shadow-lg)' }}>
              {/* Report Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Audex Cost Audit & Savings Report</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '2px 0 0 0', fontFamily: 'var(--font-title)' }}>Acme Corp Audit</h3>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontWeight: '750', textTransform: 'uppercase' }}>EST. ANNUAL SAVINGS</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#10B981', fontFamily: 'var(--font-title)' }}>$18,400 / yr</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontWeight: '750', textTransform: 'uppercase' }}>EST. MONTHLY SAVINGS</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-green-primary)', fontFamily: 'var(--font-title)' }}>$1,533 / mo</div>
                  </div>
                </div>
              </div>

              {/* Audit Findings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {[
                  {
                    title: 'Over-provisioned ChatGPT seats',
                    desc: 'Detected 12 active seats with under 5% daily prompt activity. Recommend converting to standard tier.',
                    savings: '-$360/mo',
                    status: 'Action Required',
                    statusColor: '#EF4444',
                    statusBg: 'rgba(239, 68, 68, 0.05)',
                    provider: 'openai'
                  },
                  {
                    title: 'Inactive Cursor developer seats',
                    desc: 'Detected 21 active developer seats with no interactions for over 14 business days.',
                    savings: '-$420/mo',
                    status: 'Action Required',
                    statusColor: '#EF4444',
                    statusBg: 'rgba(239, 68, 68, 0.05)',
                    provider: 'cursor'
                  },
                  {
                    title: 'Overlapping Copywriting tools',
                    desc: 'Parallel active seat subscriptions found across multiple overlapping copywriting tools.',
                    savings: '-$180/mo',
                    status: 'Overlapping Stack',
                    statusColor: '#8B5CF6',
                    statusBg: 'rgba(139, 92, 246, 0.05)',
                    provider: 'anthropic'
                  },
                  {
                    title: 'Unused GitHub Copilot seats',
                    desc: 'Identified 37 developer seats with obsolete configuration routes and duplicate API key accesses.',
                    savings: '-$1,110/mo',
                    status: 'Potential Optimization',
                    statusColor: '#F59E0B',
                    statusBg: 'rgba(245, 158, 11, 0.05)',
                    provider: 'github'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', flexShrink: 0, transform: 'scale(0.85)' }}>
                        {getProviderIcon(item.provider)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontWeight: '700', fontSize: '12px', color: 'var(--color-text-primary)', margin: '0 0 1px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                        <p style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span style={{ fontSize: '9px', fontWeight: '750', padding: '1.5px 5px', borderRadius: '4px', color: item.statusColor, backgroundColor: item.statusBg, textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                        {item.status}
                      </span>
                      <span style={{ fontWeight: '800', color: '#EF4444', fontSize: '12px' }}>{item.savings}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Migration Action Checklist */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '10.5px', fontWeight: '750', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>Migration Action Checklist</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
                  {[
                    'Remove unused licenses',
                    'Consolidate overlapping providers',
                    'Switch selected workloads',
                    'Optimize subscription allocation',
                    'Downgrade idle premium tiers',
                    'Configure cost allocation tags'
                  ].map((text, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-primary)' }}>
                      <Check size={12} color="#22C55E" strokeWidth={3} />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Summary trust strip */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '9.5px', color: 'var(--color-text-muted)', margin: 0, lineHeight: '1.4' }}>
                  Report generated using deterministic optimization rules, public pricing indexes, and capability scores.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="steps-section" style={{ backgroundColor: '#F8FAFC', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge" style={{
              backgroundColor: 'rgba(15, 138, 95, 0.08)',
              color: '#0F8A5F',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '750',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'inline-block'
            }}>Pricing Plans</span>
            <h2 className="section-title">Redesigned Optimization Tiers</h2>
            <p>Audit small setups for free, unlock single reports, or subscribe for full enterprise optimization.</p>
          </div>

          <div className="steps-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {/* Free Plan */}
            <div className="step-card" style={{ backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <span className="step-number" style={{ top: '24px', right: '24px' }}>Free Tier</span>
                <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>Free</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>For individuals with basic setups.</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>$0</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>/ month</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Audit up to 2 tools
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Fully unlocked reports
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Option A vs B comparison
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--color-text-muted)' }}>
                    ✕ No saving to user history
                  </div>
                </div>
              </div>

              <a
                href="#wizard"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('wizard');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-outline"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '700', textAlign: 'center', textDecoration: 'none', display: 'block', boxSizing: 'border-box' }}
              >
                Start Free Audit
              </a>
            </div>

            {/* Pro Plan */}
            <div className="step-card" style={{ backgroundColor: '#FFFFFF', border: '2px solid var(--color-green-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-green-primary)', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Most Popular
              </div>
              <div>
                <span className="step-number" style={{ top: '24px', right: '24px' }}>Professional</span>
                <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>Pro</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>For scaling teams and growing saving targets.</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>$29</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>/ month</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Audit up to 15 tools
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Detailed report &amp; migration checklists
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Saves last 10 audits to history
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> PDF exports and downloads
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    * Or unlock individual reports for $19 one-time.
                  </div>
                </div>
              </div>

              <button
                onClick={() => onPurchase('pro', 29)}
                className="btn btn-green"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                Upgrade to Pro ($29/mo)
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="step-card" style={{ backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <span className="step-number" style={{ top: '24px', right: '24px' }}>Enterprise</span>
                <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', fontFamily: 'var(--font-title)' }}>Enterprise</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>For large teams requiring continuous auditing.</div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-title)' }}>$99</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>/ month</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: '700', color: '#0F172A' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Live AI Model Auditor Access
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Unlimited tools audited
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Continuous monitoring dashboard
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> API integrations enabled
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                    <Check size={16} color="#22C55E" strokeWidth={3} /> Team user seat controls
                  </div>
                </div>
              </div>

              <button
                onClick={() => onPurchase('enterprise', 99)}
                className="btn btn-black"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                Upgrade to Enterprise ($99/mo)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Compact FAQ Section */}
      <section id="faq" className="steps-section" style={{ backgroundColor: '#FFFFFF', padding: '40px 0', borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="section-header" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <span className="section-badge" style={{
              backgroundColor: 'rgba(15, 138, 95, 0.08)',
              color: '#0F8A5F',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '750',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'inline-block'
            }}>FAQ</span>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '28px', marginTop: '12px' }}>Frequently Asked Questions</h2>
          </div>

          <style>{`
            .faq-item-card {
              padding: 16px 20px;
              border-radius: 12px;
              border: 1px solid var(--color-border);
              background-color: #FFFFFF;
              box-shadow: var(--shadow-sm);
              cursor: pointer;
              transition: all 250ms ease;
              text-align: left;
            }
            .faq-item-card:hover {
              border-color: rgba(15, 138, 95, 0.35);
              box-shadow: var(--shadow-md);
            }
            .faq-item-card.open-card {
              border-color: var(--color-green-primary);
              box-shadow: 0 4px 12px rgba(15, 138, 95, 0.04);
              background-color: #FCFCFD;
            }
            .faq-chevron {
              transition: transform 250ms ease;
              color: var(--color-text-muted);
              flex-shrink: 0;
            }
            .faq-item-card.open-card .faq-chevron {
              transform: rotate(90deg);
              color: var(--color-green-primary);
            }
            .faq-answer-wrapper {
              max-height: 0;
              opacity: 0;
              overflow: hidden;
              transition: max-height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), margin-top 300ms ease;
              margin-top: 0;
            }
            .faq-answer-wrapper.open {
              max-height: 120px;
              opacity: 1;
              margin-top: 10px;
            }
          `}</style>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: "How long does an audit take?", a: "Our algorithms process your configuration instantly, generating a complete PDF audit in under 60 seconds." },
              { q: "Do I need to connect my production accounts?", a: "No. Audex AI does not connect to your production keys. You upload standard CSV logs or input seat allocations manually, maintaining total account security." },
              { q: "How are recommendations generated?", a: "We run deterministic cost rules against your inputs, matching them with current provider pricing tables and open capability benchmarks." },
              { q: "Can I export my report?", a: "Yes. All spend reports can be downloaded instantly as print-ready PDF files with action checklists." },
              { q: "Is my data stored?", a: "We store reports on encrypted databases. Your input CSVs are deleted immediately after the audit runs and are never sold or used for model training." },
              { q: "What happens after the audit?", a: "You receive a step-by-step seat migration checklist. Basic audits (up to 2 tools) are free. Larger audits require a Pro subscription or a one-time unlock fee." }
            ].map((faq, idx) => {
              const isOpen = activeFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`faq-item-card ${isOpen ? 'open-card' : ''}`}
                  onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <h3 style={{ fontSize: '14.5px', fontWeight: '750', color: 'var(--color-text-primary)', margin: 0 }}>{faq.q}</h3>
                    <ArrowRight size={14} className="faq-chevron" />
                  </div>
                  <div className={`faq-answer-wrapper ${isOpen ? 'open' : ''}`}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Privacy & Security Strip */}
      <div style={{ backgroundColor: '#FAFAFA', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '24px 0', textAlign: 'center' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', flexWrap: 'wrap', fontSize: '11px', fontWeight: '750', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Shield size={14} color="var(--color-green-primary)" /> Zero-Trust Privacy</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Key size={14} color="var(--color-green-primary)" /> Secure Authentication</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Lock size={14} color="var(--color-green-primary)" /> TLS 1.3 Encryption</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Database size={14} color="var(--color-green-primary)" /> Zero Data Persistence Option</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FileText size={14} color="var(--color-green-primary)" /> Secure PDF Generation</span>
        </div>
      </div>
    </main>
  );
}
