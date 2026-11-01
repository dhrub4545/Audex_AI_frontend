import React, { useState, useEffect, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LoadingIndicator, PurchaseSuccessModal, CheckoutModal } from './components/CommonComponents';
import { ShieldCheck, Sparkles, Zap, Lock } from 'lucide-react';
import { API_BASE_URL } from './config';
import { getCachedSubscriptionTiers, preloadCoreData } from './utils/dataCache';
import { SAMPLE_AUDIT_DATA } from './utils/sampleReportData';

const LandingView = lazy(() => import('./components/LandingView'));
const WizardFlow = lazy(() => import('./components/WizardFlow'));
const ResultsView = lazy(() => import('./components/ResultsView'));
const HistoryView = lazy(() => import('./components/HistoryView'));
const ModelAuditorView = lazy(() => import('./components/ModelAuditorView'));
const MarketIntelView = lazy(() => import('./components/MarketIntelView'));
const ComparisonView = lazy(() => import('./components/ComparisonView'));
const ActionPlanView = lazy(() => import('./components/ActionPlanView'));
const ProfileView = lazy(() => import('./components/ProfileView'));
const SignInView = lazy(() => import('./components/AuthViews').then(m => ({ default: m.SignInView })));
const SignUpView = lazy(() => import('./components/AuthViews').then(m => ({ default: m.SignUpView })));

const INITIAL_TOOLS = [
  {
    "id": "ChatGPT",
    "name": "ChatGPT",
    "provider": "OpenAI",
    "desc": "OpenAI ChatGPT",
    "icon": "🟢",
    "type": "subscription",
    "plans": [
      "Free",
      "ChatGPT Go",
      "ChatGPT Plus",
      "ChatGPT Pro",
      "Business"
    ],
    "defaultPlan": "ChatGPT Go",
    "defaultSeats": 1,
    "planModels": {
      "Free": [
        "GPT-5.5 Instant (June 2026)",
        "GPT-5.4 nano (Xhigh)",
        "GPT-5.4 mini (Xhigh)",
        "GPT-5.1 Codex mini (High)"
      ],
      "ChatGPT Go": [
        "GPT-5.5 Instant (June 2026)",
        "GPT-5.4 nano (Xhigh)",
        "GPT-5.4 mini (Xhigh)",
        "GPT-5.1 Codex mini (High)"
      ],
      "ChatGPT Plus": [
        "GPT-6.1 Sol (Xhigh)",
        "GPT-6 Sol (Xhigh)",
        "GPT-6 Luna (Medium)",
        "GPT-6 Astra (Medium)",
        "GPT-5.6 Sol (Xhigh)"
      ],
      "ChatGPT Pro": [
        "GPT-6.1 Terra (Max)",
        "GPT-6.1 Sol (Max)",
        "GPT-6 Sol (Max)",
        "GPT-5.6 Terra (Max)",
        "GPT-5.6 Sol (Max)"
      ],
      "Business": [
        "GPT-6.1 Terra (Max)",
        "GPT-6.1 Sol (Max)",
        "GPT-6 Sol (Max)",
        "GPT-5.6 Terra (Max)",
        "GPT-5.6 Sol (Max)"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Limited usage. Dynamic rate limits apply. GPT-5.5 Mini serves as fallback when limits are reached."
      },
      "ChatGPT Go": {
        "monthlyPrice": 8,
        "annualPrice": 96,
        "isPerSeat": false,
        "limits": "160 messages every 3 hours; basic image generation; 32K context window."
      },
      "ChatGPT Plus": {
        "monthlyPrice": 20,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Includes GPT-5.5 Thinking with 'Medium' and 'High' reasoning levels. Canvas is not available with GPT-5.5 models."
      },
      "ChatGPT Pro": {
        "monthlyPrice": 200,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Highest level of access. Includes 'Ultra' reasoning for Thinking and full access to GPT-5.5 Pro."
      },
      "Business": {
        "monthlyPrice": 25,
        "annualPrice": 300,
        "isPerSeat": false,
        "limits": "Per-user pricing. $25/user/month billed annually ($300/user/year). Includes 'Ultra' reasoning for Thinking. GPT-5.5 Pro available as add-on."
      }
    },
    "allModels": [
      "GPT-5.5 Instant (June 2026)",
      "GPT-5.4 nano (Xhigh)",
      "GPT-5.4 mini (Xhigh)",
      "GPT-5.1 Codex mini (High)",
      "GPT-6.1 Sol (Xhigh)",
      "GPT-6 Sol (Xhigh)",
      "GPT-6 Luna (Medium)",
      "GPT-6 Astra (Medium)",
      "GPT-5.6 Sol (Xhigh)",
      "GPT-6.1 Terra (Max)",
      "GPT-6.1 Sol (Max)",
      "GPT-6 Sol (Max)",
      "GPT-5.6 Terra (Max)",
      "GPT-5.6 Sol (Max)"
    ],
    "tiers": [
      {
        "category": "Chat & Reasoning",
        "provider": "OpenAI",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "openai/gpt-5-5-instant-06-26",
          "openai/gpt-5-4-nano",
          "openai/gpt-5-4-mini",
          "openai/gpt-5-1-codex-mini"
        ],
        "rawModels": [
          "GPT-5.5 Instant (June 2026)",
          "GPT-5.4 nano (Xhigh)",
          "GPT-5.4 mini (Xhigh)",
          "GPT-5.1 Codex mini (High)"
        ],
        "limits": "Limited usage. Dynamic rate limits apply. GPT-5.5 Mini serves as fallback when limits are reached.",
        "last_synced_at": "2026-11-01T12:04:32.837Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "OpenAI",
        "plan": "ChatGPT Go",
        "monthlyPrice": 8,
        "annualPrice": 96,
        "annualPriceEquiv": 8,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "openai/gpt-5-5-instant-06-26",
          "openai/gpt-5-4-nano",
          "openai/gpt-5-4-mini",
          "openai/gpt-5-1-codex-mini"
        ],
        "rawModels": [
          "GPT-5.5 Instant (June 2026)",
          "GPT-5.4 nano (Xhigh)",
          "GPT-5.4 mini (Xhigh)",
          "GPT-5.1 Codex mini (High)"
        ],
        "limits": "160 messages every 3 hours; basic image generation; 32K context window.",
        "last_synced_at": "2026-11-01T12:04:32.847Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "OpenAI",
        "plan": "ChatGPT Plus",
        "monthlyPrice": 20,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "openai/gpt-6-1-sol-xhigh",
          "openai/gpt-6-sol-xhigh",
          "openai/gpt-6-luna-medium",
          "openai/gpt-6-astra-medium",
          "openai/gpt-5-6-sol-xhigh"
        ],
        "rawModels": [
          "GPT-6.1 Sol (Xhigh)",
          "GPT-6 Sol (Xhigh)",
          "GPT-6 Luna (Medium)",
          "GPT-6 Astra (Medium)",
          "GPT-5.6 Sol (Xhigh)"
        ],
        "limits": "Includes GPT-5.5 Thinking with 'Medium' and 'High' reasoning levels. Canvas is not available with GPT-5.5 models.",
        "last_synced_at": "2026-11-01T12:04:32.848Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "OpenAI",
        "plan": "ChatGPT Pro",
        "monthlyPrice": 200,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "openai/gpt-6-1-terra",
          "openai/gpt-6-1-sol",
          "openai/gpt-6-sol",
          "openai/gpt-5-6-terra",
          "openai/gpt-5-6-sol"
        ],
        "rawModels": [
          "GPT-6.1 Terra (Max)",
          "GPT-6.1 Sol (Max)",
          "GPT-6 Sol (Max)",
          "GPT-5.6 Terra (Max)",
          "GPT-5.6 Sol (Max)"
        ],
        "limits": "Highest level of access. Includes 'Ultra' reasoning for Thinking and full access to GPT-5.5 Pro.",
        "last_synced_at": "2026-11-01T12:04:32.848Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "OpenAI",
        "plan": "Business",
        "monthlyPrice": 25,
        "annualPrice": 300,
        "annualPriceEquiv": 25,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "openai/gpt-6-1-terra",
          "openai/gpt-6-1-sol",
          "openai/gpt-6-sol",
          "openai/gpt-5-6-terra",
          "openai/gpt-5-6-sol"
        ],
        "rawModels": [
          "GPT-6.1 Terra (Max)",
          "GPT-6.1 Sol (Max)",
          "GPT-6 Sol (Max)",
          "GPT-5.6 Terra (Max)",
          "GPT-5.6 Sol (Max)"
        ],
        "limits": "Per-user pricing. $25/user/month billed annually ($300/user/year). Includes 'Ultra' reasoning for Thinking. GPT-5.5 Pro available as add-on.",
        "last_synced_at": "2026-11-01T12:04:32.849Z"
      }
    ]
  },
  {
    "id": "Claude",
    "name": "Claude",
    "provider": "Anthropic",
    "desc": "Anthropic assistant",
    "icon": "🟧",
    "type": "subscription",
    "plans": [
      "Free",
      "Claude Pro",
      "Claude Max 5x",
      "Claude Max 20x",
      "Team Standard",
      "Team Premium",
      "Enterprise"
    ],
    "defaultPlan": "Claude Pro",
    "defaultSeats": 5,
    "planModels": {
      "Free": [
        "Claude Haiku 5.5 (Max)",
        "Claude 4.5 Haiku (Reasoning)",
        "Claude 3.5 Haiku"
      ],
      "Claude Pro": [
        "Claude Sonnet 5.5 (Max, Default Fallback)",
        "Claude Fable 5.1 (Medium, Default Fallback)",
        "Claude Sonnet 5 (Max)",
        "Claude Sonnet 4.6 (Max)"
      ],
      "Claude Max 5x": [
        "Claude Sonnet 5.5 (Max, Default Fallback)",
        "Claude Opus 5.5 (Max, Default Fallback)",
        "Claude Fable 5.1 (Medium, Default Fallback)",
        "Claude Opus 5 (Max)"
      ],
      "Claude Max 20x": [
        "Claude Sonnet 5.5 (Max, Default Fallback)",
        "Claude Opus 5.5 (Max, Default Fallback)",
        "Claude Fable 5.1 (Medium, Default Fallback)",
        "Claude Opus 5 (Max)"
      ],
      "Team Standard": [
        "Claude Sonnet 5.5 (Max, Default Fallback)",
        "Claude Fable 5.1 (Medium, Default Fallback)",
        "Claude Sonnet 5 (Max)",
        "Claude Sonnet 4.6 (Max)"
      ],
      "Team Premium": [
        "Claude Sonnet 5.5 (Max, Default Fallback)",
        "Claude Opus 5.5 (Max, Default Fallback)",
        "Claude Fable 5.1 (Medium, Default Fallback)",
        "Claude Opus 5 (Max)"
      ],
      "Enterprise": [
        "Claude Sonnet 5.5 (Max, Default Fallback)",
        "Claude Opus 5.5 (Max, Default Fallback)",
        "Claude Fable 5.1 (Medium, Default Fallback)",
        "Claude Opus 5 (Max)"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Limited daily usage. Free for everyone."
      },
      "Claude Pro": {
        "monthlyPrice": 20,
        "annualPrice": 200,
        "isPerSeat": false,
        "limits": "More usage than Free plan. Access to unlimited projects."
      },
      "Claude Max 5x": {
        "monthlyPrice": 100,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Approximately 5× higher usage limits than Pro. Early access to advanced features."
      },
      "Claude Max 20x": {
        "monthlyPrice": 200,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Approximately 20× higher usage limits than Pro. Highest usage limits available."
      },
      "Team Standard": {
        "monthlyPrice": 25,
        "annualPrice": 240,
        "isPerSeat": true,
        "limits": "For teams of 5 to 150. Standard seat: All Claude features, plus more usage than Pro. $20/seat/month billed annually, $25 billed monthly. Mix and match seat types. Model training is off by default."
      },
      "Team Premium": {
        "monthlyPrice": 125,
        "annualPrice": 1200,
        "isPerSeat": true,
        "limits": "For teams of 5 to 150. Premium seat: 5x more usage than standard seats. $100/seat/month billed annually, $125 billed monthly. Mix and match seat types. Model training is off by default."
      },
      "Enterprise": {
        "monthlyPrice": 20,
        "annualPrice": 240,
        "isPerSeat": true,
        "limits": "For large businesses operating at scale. Seat price + usage at API rates. $20/seat. Usage cost scales with model and task. Includes admin spend limits, role-based access control, SCIM, audit logs, compliance API, network-level access control, and HIPAA compliance."
      }
    },
    "allModels": [
      "Claude Haiku 5.5 (Max)",
      "Claude 4.5 Haiku (Reasoning)",
      "Claude 3.5 Haiku",
      "Claude Sonnet 5.5 (Max, Default Fallback)",
      "Claude Fable 5.1 (Medium, Default Fallback)",
      "Claude Sonnet 5 (Max)",
      "Claude Sonnet 4.6 (Max)",
      "Claude Opus 5.5 (Max, Default Fallback)",
      "Claude Opus 5 (Max)"
    ],
    "tiers": [
      {
        "category": "Chat & Reasoning",
        "provider": "Anthropic",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "anthropic/claude-haiku-5-5",
          "anthropic/claude-4-5-haiku-reasoning",
          "anthropic/claude-3-5-haiku"
        ],
        "rawModels": [
          "Claude Haiku 5.5 (Max)",
          "Claude 4.5 Haiku (Reasoning)",
          "Claude 3.5 Haiku"
        ],
        "limits": "Limited daily usage. Free for everyone.",
        "last_synced_at": "2026-11-01T12:04:32.849Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Anthropic",
        "plan": "Claude Pro",
        "monthlyPrice": 20,
        "annualPrice": 200,
        "annualPriceEquiv": 16.67,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "anthropic/claude-sonnet-5-5",
          "anthropic/claude-fable-5-1-medium",
          "anthropic/claude-sonnet-5",
          "anthropic/claude-sonnet-4-6-adaptive"
        ],
        "rawModels": [
          "Claude Sonnet 5.5 (Max, Default Fallback)",
          "Claude Fable 5.1 (Medium, Default Fallback)",
          "Claude Sonnet 5 (Max)",
          "Claude Sonnet 4.6 (Max)"
        ],
        "limits": "More usage than Free plan. Access to unlimited projects.",
        "last_synced_at": "2026-11-01T12:04:32.850Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Anthropic",
        "plan": "Claude Max 5x",
        "monthlyPrice": 100,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "anthropic/claude-sonnet-5-5",
          "anthropic/claude-opus-5-5",
          "anthropic/claude-fable-5-1-medium",
          "anthropic/claude-opus-5"
        ],
        "rawModels": [
          "Claude Sonnet 5.5 (Max, Default Fallback)",
          "Claude Opus 5.5 (Max, Default Fallback)",
          "Claude Fable 5.1 (Medium, Default Fallback)",
          "Claude Opus 5 (Max)"
        ],
        "limits": "Approximately 5× higher usage limits than Pro. Early access to advanced features.",
        "last_synced_at": "2026-11-01T12:04:32.850Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Anthropic",
        "plan": "Claude Max 20x",
        "monthlyPrice": 200,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "anthropic/claude-sonnet-5-5",
          "anthropic/claude-opus-5-5",
          "anthropic/claude-fable-5-1-medium",
          "anthropic/claude-opus-5"
        ],
        "rawModels": [
          "Claude Sonnet 5.5 (Max, Default Fallback)",
          "Claude Opus 5.5 (Max, Default Fallback)",
          "Claude Fable 5.1 (Medium, Default Fallback)",
          "Claude Opus 5 (Max)"
        ],
        "limits": "Approximately 20× higher usage limits than Pro. Highest usage limits available.",
        "last_synced_at": "2026-11-01T12:04:32.851Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Anthropic",
        "plan": "Team Standard",
        "monthlyPrice": 25,
        "annualPrice": 240,
        "annualPriceEquiv": 20,
        "annualDiscount": true,
        "isPerSeat": true,
        "models": [
          "anthropic/claude-sonnet-5-5",
          "anthropic/claude-fable-5-1-medium",
          "anthropic/claude-sonnet-5",
          "anthropic/claude-sonnet-4-6-adaptive"
        ],
        "rawModels": [
          "Claude Sonnet 5.5 (Max, Default Fallback)",
          "Claude Fable 5.1 (Medium, Default Fallback)",
          "Claude Sonnet 5 (Max)",
          "Claude Sonnet 4.6 (Max)"
        ],
        "limits": "For teams of 5 to 150. Standard seat: All Claude features, plus more usage than Pro. $20/seat/month billed annually, $25 billed monthly. Mix and match seat types. Model training is off by default.",
        "last_synced_at": "2026-11-01T12:04:32.851Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Anthropic",
        "plan": "Team Premium",
        "monthlyPrice": 125,
        "annualPrice": 1200,
        "annualPriceEquiv": 100,
        "annualDiscount": true,
        "isPerSeat": true,
        "models": [
          "anthropic/claude-sonnet-5-5",
          "anthropic/claude-opus-5-5",
          "anthropic/claude-fable-5-1-medium",
          "anthropic/claude-opus-5"
        ],
        "rawModels": [
          "Claude Sonnet 5.5 (Max, Default Fallback)",
          "Claude Opus 5.5 (Max, Default Fallback)",
          "Claude Fable 5.1 (Medium, Default Fallback)",
          "Claude Opus 5 (Max)"
        ],
        "limits": "For teams of 5 to 150. Premium seat: 5x more usage than standard seats. $100/seat/month billed annually, $125 billed monthly. Mix and match seat types. Model training is off by default.",
        "last_synced_at": "2026-11-01T12:04:32.852Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Anthropic",
        "plan": "Enterprise",
        "monthlyPrice": 20,
        "annualPrice": 240,
        "annualPriceEquiv": 20,
        "annualDiscount": false,
        "isPerSeat": true,
        "models": [
          "anthropic/claude-sonnet-5-5",
          "anthropic/claude-opus-5-5",
          "anthropic/claude-fable-5-1-medium",
          "anthropic/claude-opus-5"
        ],
        "rawModels": [
          "Claude Sonnet 5.5 (Max, Default Fallback)",
          "Claude Opus 5.5 (Max, Default Fallback)",
          "Claude Fable 5.1 (Medium, Default Fallback)",
          "Claude Opus 5 (Max)"
        ],
        "limits": "For large businesses operating at scale. Seat price + usage at API rates. $20/seat. Usage cost scales with model and task. Includes admin spend limits, role-based access control, SCIM, audit logs, compliance API, network-level access control, and HIPAA compliance.",
        "last_synced_at": "2026-11-01T12:04:32.852Z"
      }
    ]
  },
  {
    "id": "Gemini",
    "name": "Gemini",
    "provider": "Google",
    "desc": "Google's AI model",
    "icon": "🔷",
    "type": "subscription",
    "plans": [
      "Free",
      "AI Plus",
      "AI Pro",
      "AI Ultra (100)",
      "AI Ultra (200)"
    ],
    "defaultPlan": "AI Plus",
    "defaultSeats": 1,
    "planModels": {
      "Free": [
        "Gemini 3.8 Flash (High)",
        "Gemini 3.7 Flash (High)",
        "Gemini 3.6 Flash (High)"
      ],
      "AI Plus": [
        "Gemini 3.8 Flash (High)",
        "Gemini 3.7 Flash (High)",
        "DiffusionGemma 26B A4B",
        "Gemma 4 31B (Reasoning)"
      ],
      "AI Pro": [
        "Gemini 4 Argon (High)",
        "Gemini 3.8 Flash (High)",
        "Gemini 3.1 Pro Preview",
        "Gemini 3 Pro Preview (High)"
      ],
      "AI Ultra (100)": [
        "Gemini 4 Carbon (High)",
        "Gemini 4 Argon (High)",
        "Gemini 3.1 Pro Preview",
        "Gemini 3 Deep Think"
      ],
      "AI Ultra (200)": [
        "Gemini 4 Carbon (High)",
        "Gemini 4 Argon (High)",
        "Gemini 3.1 Pro Preview",
        "Gemini 3 Deep Think"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "32K token context window. Standard usage limits. US users have access to Pro for advanced thinking with daily limits."
      },
      "AI Plus": {
        "monthlyPrice": 4.99,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "2x higher usage limits than Free. 128K token context window. 400GB cloud storage. Daily Brief feature. Redo images with Nano Banana Pro. Video generation with Omni Flash."
      },
      "AI Pro": {
        "monthlyPrice": 19.99,
        "annualPrice": 199.99,
        "isPerSeat": false,
        "limits": "4x higher usage limits than Free. 1M token context window (1,500 pages of text or 30,000 lines of code). 5TB cloud storage. YouTube Premium Lite included. Google Home Premium and Health Premium included. Higher AI Studio limits."
      },
      "AI Ultra (100)": {
        "monthlyPrice": 100,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "5x higher usage limit than Pro. 20TB cloud storage. YouTube Premium individual plan. Priority access to Google Antigravity. Access to Gemini Spark. Introduced at Google I/O 2026 for developers and power users."
      },
      "AI Ultra (200)": {
        "monthlyPrice": 200,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "20x higher usage limit than Pro. 30TB cloud storage. All features of the $100 Ultra plan plus Project Genie (experimental world-building with Street View-powered capabilities). Previously $250/month, reduced to $200 at I/O 2026."
      }
    },
    "allModels": [
      "Gemini 3.8 Flash (High)",
      "Gemini 3.7 Flash (High)",
      "Gemini 3.6 Flash (High)",
      "DiffusionGemma 26B A4B",
      "Gemma 4 31B (Reasoning)",
      "Gemini 4 Argon (High)",
      "Gemini 3.1 Pro Preview",
      "Gemini 3 Pro Preview (High)",
      "Gemini 4 Carbon (High)",
      "Gemini 3 Deep Think"
    ],
    "tiers": [
      {
        "category": "Chat & Reasoning",
        "provider": "Google",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "google/gemini-3-8-flash",
          "google/gemini-3-7-flash",
          "google/gemini-3-6-flash"
        ],
        "rawModels": [
          "Gemini 3.8 Flash (High)",
          "Gemini 3.7 Flash (High)",
          "Gemini 3.6 Flash (High)"
        ],
        "limits": "32K token context window. Standard usage limits. US users have access to Pro for advanced thinking with daily limits.",
        "last_synced_at": "2026-11-01T12:04:32.852Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Google",
        "plan": "AI Plus",
        "monthlyPrice": 4.99,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "google/gemini-3-8-flash",
          "google/gemini-3-7-flash",
          "google/diffusiongemma-26b-a4b",
          "google/gemma-4-31b"
        ],
        "rawModels": [
          "Gemini 3.8 Flash (High)",
          "Gemini 3.7 Flash (High)",
          "DiffusionGemma 26B A4B",
          "Gemma 4 31B (Reasoning)"
        ],
        "limits": "2x higher usage limits than Free. 128K token context window. 400GB cloud storage. Daily Brief feature. Redo images with Nano Banana Pro. Video generation with Omni Flash.",
        "last_synced_at": "2026-11-01T12:04:32.852Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Google",
        "plan": "AI Pro",
        "monthlyPrice": 19.99,
        "annualPrice": 199.99,
        "annualPriceEquiv": 16.67,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "google/gemini-4-argon",
          "google/gemini-3-8-flash",
          "google/gemini-3-1-pro-preview",
          "google/gemini-3-pro"
        ],
        "rawModels": [
          "Gemini 4 Argon (High)",
          "Gemini 3.8 Flash (High)",
          "Gemini 3.1 Pro Preview",
          "Gemini 3 Pro Preview (High)"
        ],
        "limits": "4x higher usage limits than Free. 1M token context window (1,500 pages of text or 30,000 lines of code). 5TB cloud storage. YouTube Premium Lite included. Google Home Premium and Health Premium included. Higher AI Studio limits.",
        "last_synced_at": "2026-11-01T12:04:32.853Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Google",
        "plan": "AI Ultra (100)",
        "monthlyPrice": 100,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "google/gemini-4-carbon",
          "google/gemini-4-argon",
          "google/gemini-3-1-pro-preview",
          "google/gemini-3-deep-think"
        ],
        "rawModels": [
          "Gemini 4 Carbon (High)",
          "Gemini 4 Argon (High)",
          "Gemini 3.1 Pro Preview",
          "Gemini 3 Deep Think"
        ],
        "limits": "5x higher usage limit than Pro. 20TB cloud storage. YouTube Premium individual plan. Priority access to Google Antigravity. Access to Gemini Spark. Introduced at Google I/O 2026 for developers and power users.",
        "last_synced_at": "2026-11-01T12:04:32.853Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Google",
        "plan": "AI Ultra (200)",
        "monthlyPrice": 200,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "google/gemini-4-carbon",
          "google/gemini-4-argon",
          "google/gemini-3-1-pro-preview",
          "google/gemini-3-deep-think"
        ],
        "rawModels": [
          "Gemini 4 Carbon (High)",
          "Gemini 4 Argon (High)",
          "Gemini 3.1 Pro Preview",
          "Gemini 3 Deep Think"
        ],
        "limits": "20x higher usage limit than Pro. 30TB cloud storage. All features of the $100 Ultra plan plus Project Genie (experimental world-building with Street View-powered capabilities). Previously $250/month, reduced to $200 at I/O 2026.",
        "last_synced_at": "2026-11-01T12:04:32.853Z"
      }
    ]
  },
  {
    "id": "DeepSeek",
    "name": "DeepSeek",
    "provider": "DeepSeek",
    "desc": "DeepSeek assistant",
    "icon": "🐳",
    "type": "subscription",
    "plans": [
      "Consumer"
    ],
    "defaultPlan": "Consumer",
    "defaultSeats": 1,
    "planModels": {
      "Consumer": [
        "DeepSeek V4.1 Flash 1017 (Max)",
        "DeepSeek V4.1 Flash (Max)",
        "DeepSeek V4 Flash Vision (Max)",
        "DeepSeek V4 Pro 0813 (Max)",
        "DeepSeek V4 Flash 0731 (Max)"
      ]
    },
    "planDetails": {
      "Consumer": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Completely free on web and app with no ads. No paid consumer plans available."
      }
    },
    "allModels": [
      "DeepSeek V4.1 Flash 1017 (Max)",
      "DeepSeek V4.1 Flash (Max)",
      "DeepSeek V4 Flash Vision (Max)",
      "DeepSeek V4 Pro 0813 (Max)",
      "DeepSeek V4 Flash 0731 (Max)"
    ],
    "tiers": [
      {
        "category": "Chat & Reasoning",
        "provider": "DeepSeek",
        "plan": "Consumer",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "deepseek/deepseek-v4-1-flash-1017",
          "deepseek/deepseek-v4-1-flash",
          "deepseek/deepseek-v4-flash-vision",
          "deepseek/deepseek-v4-pro",
          "deepseek/deepseek-v4-flash"
        ],
        "rawModels": [
          "DeepSeek V4.1 Flash 1017 (Max)",
          "DeepSeek V4.1 Flash (Max)",
          "DeepSeek V4 Flash Vision (Max)",
          "DeepSeek V4 Pro 0813 (Max)",
          "DeepSeek V4 Flash 0731 (Max)"
        ],
        "limits": "Completely free on web and app with no ads. No paid consumer plans available.",
        "last_synced_at": "2026-11-01T12:04:32.853Z"
      }
    ]
  },
  {
    "id": "Mistral",
    "name": "Mistral",
    "provider": "Mistral",
    "desc": "Mistral Le Chat",
    "icon": "🍊",
    "type": "subscription",
    "plans": [
      "Free",
      "Le Chat Pro"
    ],
    "defaultPlan": "Le Chat Pro",
    "defaultSeats": 1,
    "planModels": {
      "Free": [
        "Mistral Small 4 (Non-reasoning)",
        "Devstral Small 2",
        "Ministral 3 14B"
      ],
      "Le Chat Pro": [
        "Mistral Large 4 (High)",
        "Mistral Large 4 Preview",
        "Mistral Medium 3.5",
        "Devstral 2"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Limited access to Vibe, latest models, chat, search, creation. Limited image generations."
      },
      "Le Chat Pro": {
        "monthlyPrice": 14.99,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Higher limits across chat, more messages and web searches, more extended thinking and deep research reports, expanded Mistral Vibe capacity, chat and email support. Student discount available."
      }
    },
    "allModels": [
      "Mistral Small 4 (Non-reasoning)",
      "Devstral Small 2",
      "Ministral 3 14B",
      "Mistral Large 4 (High)",
      "Mistral Large 4 Preview",
      "Mistral Medium 3.5",
      "Devstral 2"
    ],
    "tiers": [
      {
        "category": "Chat & Reasoning",
        "provider": "Mistral",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "mistralai/mistral-small-4-non-reasoning",
          "mistralai/devstral-small-2",
          "mistralai/ministral-3-14b"
        ],
        "rawModels": [
          "Mistral Small 4 (Non-reasoning)",
          "Devstral Small 2",
          "Ministral 3 14B"
        ],
        "limits": "Limited access to Vibe, latest models, chat, search, creation. Limited image generations.",
        "last_synced_at": "2026-11-01T12:04:32.854Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Mistral",
        "plan": "Le Chat Pro",
        "monthlyPrice": 14.99,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "mistralai/mistral-large-4",
          "mistralai/mistral-large-4-preview",
          "mistralai/mistral-medium-3-5",
          "mistralai/devstral-2"
        ],
        "rawModels": [
          "Mistral Large 4 (High)",
          "Mistral Large 4 Preview",
          "Mistral Medium 3.5",
          "Devstral 2"
        ],
        "limits": "Higher limits across chat, more messages and web searches, more extended thinking and deep research reports, expanded Mistral Vibe capacity, chat and email support. Student discount available.",
        "last_synced_at": "2026-11-01T12:04:32.854Z"
      }
    ]
  },
  {
    "id": "Meta",
    "name": "Meta",
    "provider": "Meta",
    "desc": "Meta AI assistant",
    "icon": "♾️",
    "type": "subscription",
    "plans": [
      "Free",
      "Meta One Plus"
    ],
    "defaultPlan": "Meta One Plus",
    "defaultSeats": 1,
    "planModels": {
      "Free": [
        "Muse Spark Open (Xhigh)",
        "Muse Spark 1.3 (Xhigh)",
        "Muse Spark 1.2 (Xhigh)"
      ],
      "Meta One Plus": [
        "Muse Wonder Full (Max)",
        "Muse Wonder (Max)",
        "Hermes 4 - Llama-3.1 405B (Reasoning)",
        "Llama 3.1 Nemotron Ultra 253B v1 (Reasoning)"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Meta AI is free across all Meta apps with unlimited conversational chat. Image generation, video creation, and Thinking mode are capped for free users. Available in 200+ countries with multi-language support."
      },
      "Meta One Plus": {
        "monthlyPrice": 7.99,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Includes Facebook Plus, Instagram Plus, and WhatsApp Plus benefits at a discounted price[reference:8]. More monthly AI usage allowance for eligible AI features[reference:9]. More advanced reasoning with Thinking mode[reference:10]. Currently in limited testing in select locations[reference:11][reference:12]."
      }
    },
    "allModels": [
      "Muse Spark Open (Xhigh)",
      "Muse Spark 1.3 (Xhigh)",
      "Muse Spark 1.2 (Xhigh)",
      "Muse Wonder Full (Max)",
      "Muse Wonder (Max)",
      "Hermes 4 - Llama-3.1 405B (Reasoning)",
      "Llama 3.1 Nemotron Ultra 253B v1 (Reasoning)"
    ],
    "tiers": [
      {
        "category": "Chat & Reasoning",
        "provider": "Meta",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "meta-llama/muse-spark-open",
          "meta-llama/muse-spark-1-3-xhigh",
          "meta-llama/muse-spark-1-2"
        ],
        "rawModels": [
          "Muse Spark Open (Xhigh)",
          "Muse Spark 1.3 (Xhigh)",
          "Muse Spark 1.2 (Xhigh)"
        ],
        "limits": "Meta AI is free across all Meta apps with unlimited conversational chat. Image generation, video creation, and Thinking mode are capped for free users. Available in 200+ countries with multi-language support.",
        "last_synced_at": "2026-11-01T12:04:32.854Z"
      },
      {
        "category": "Chat & Reasoning",
        "provider": "Meta",
        "plan": "Meta One Plus",
        "monthlyPrice": 7.99,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "meta-llama/muse-wonder-full",
          "meta-llama/muse-wonder",
          "nous-research/hermes-4-llama-3-1-405b-reasoning",
          "nvidia/llama-3-1-nemotron-ultra-253b-v1-reasoning"
        ],
        "rawModels": [
          "Muse Wonder Full (Max)",
          "Muse Wonder (Max)",
          "Hermes 4 - Llama-3.1 405B (Reasoning)",
          "Llama 3.1 Nemotron Ultra 253B v1 (Reasoning)"
        ],
        "limits": "Includes Facebook Plus, Instagram Plus, and WhatsApp Plus benefits at a discounted price[reference:8]. More monthly AI usage allowance for eligible AI features[reference:9]. More advanced reasoning with Thinking mode[reference:10]. Currently in limited testing in select locations[reference:11][reference:12].",
        "last_synced_at": "2026-11-01T12:04:32.854Z"
      }
    ]
  },
  {
    "id": "xAI",
    "name": "xAI",
    "provider": "xAI",
    "desc": "xAI Grok search",
    "icon": "🐦",
    "type": "subscription",
    "plans": [
      "Grok Free",
      "X Premium",
      "SuperGrok Lite",
      "SuperGrok",
      "SuperGrok Heavy"
    ],
    "defaultPlan": "X Premium",
    "defaultSeats": 1,
    "planModels": {
      "Grok Free": [
        "Grok 4.1 Fast (Reasoning)",
        "Grok 4 Fast (Reasoning)"
      ],
      "X Premium": [
        "Grok 4.6 (High)",
        "Grok 4.6 (Xhigh)",
        "Grok 4.3 (Medium)"
      ],
      "SuperGrok Lite": [
        "Grok 4.6 (High)",
        "Grok 4.6 (Xhigh)",
        "Grok 4.3 (Medium)"
      ],
      "SuperGrok": [
        "Grok 4.7 (High)",
        "Grok 4.7 (Xhigh)",
        "Grok 4.6 (High)",
        "Grok 4.3 (Medium)"
      ],
      "SuperGrok Heavy": [
        "Grok 4.7 (High)",
        "Grok 4.7 (Xhigh)",
        "Grok 4.6 (High)",
        "Grok 4.3 (Medium)"
      ]
    },
    "planDetails": {
      "Grok Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Limited daily usage with access to Grok and basic multimodal features."
      },
      "X Premium": {
        "monthlyPrice": 8,
        "annualPrice": 84,
        "isPerSeat": false,
        "limits": "Basic Grok access inside X app."
      },
      "SuperGrok Lite": {
        "monthlyPrice": 10,
        "annualPrice": 120,
        "isPerSeat": false,
        "limits": "2x longer context window; basic image/video generation; 1 AI agent in Expert mode."
      },
      "SuperGrok": {
        "monthlyPrice": 30,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Higher rate limits, Grok 4 access, frontier models, image/video generation, connectors, and Expert mode.[reference:27]"
      },
      "SuperGrok Heavy": {
        "monthlyPrice": 300,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Highest consumer/business tier with maximum rate limits and access to advanced Grok capabilities.[reference:28]"
      }
    },
    "allModels": [
      "Grok 4.1 Fast (Reasoning)",
      "Grok 4 Fast (Reasoning)",
      "Grok 4.6 (High)",
      "Grok 4.6 (Xhigh)",
      "Grok 4.3 (Medium)",
      "Grok 4.7 (High)",
      "Grok 4.7 (Xhigh)"
    ],
    "tiers": [
      {
        "category": "Search & Research",
        "provider": "xAI",
        "plan": "Grok Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "x-ai/grok-4-1-fast-reasoning",
          "x-ai/grok-4-fast-reasoning"
        ],
        "rawModels": [
          "Grok 4.1 Fast (Reasoning)",
          "Grok 4 Fast (Reasoning)"
        ],
        "limits": "Limited daily usage with access to Grok and basic multimodal features.",
        "last_synced_at": "2026-11-01T12:04:32.854Z"
      },
      {
        "category": "Search & Research",
        "provider": "xAI",
        "plan": "X Premium",
        "monthlyPrice": 8,
        "annualPrice": 84,
        "annualPriceEquiv": 7,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "x-ai/grok-4-6",
          "x-ai/grok-4-6-xhigh",
          "x-ai/grok-4-3-medium"
        ],
        "rawModels": [
          "Grok 4.6 (High)",
          "Grok 4.6 (Xhigh)",
          "Grok 4.3 (Medium)"
        ],
        "limits": "Basic Grok access inside X app.",
        "last_synced_at": "2026-11-01T12:04:32.854Z"
      },
      {
        "category": "Search & Research",
        "provider": "xAI",
        "plan": "SuperGrok Lite",
        "monthlyPrice": 10,
        "annualPrice": 120,
        "annualPriceEquiv": 10,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "x-ai/grok-4-6",
          "x-ai/grok-4-6-xhigh",
          "x-ai/grok-4-3-medium"
        ],
        "rawModels": [
          "Grok 4.6 (High)",
          "Grok 4.6 (Xhigh)",
          "Grok 4.3 (Medium)"
        ],
        "limits": "2x longer context window; basic image/video generation; 1 AI agent in Expert mode.",
        "last_synced_at": "2026-11-01T12:04:32.854Z"
      },
      {
        "category": "Search & Research",
        "provider": "xAI",
        "plan": "SuperGrok",
        "monthlyPrice": 30,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "x-ai/grok-4-7-high",
          "x-ai/grok-4-7",
          "x-ai/grok-4-6",
          "x-ai/grok-4-3-medium"
        ],
        "rawModels": [
          "Grok 4.7 (High)",
          "Grok 4.7 (Xhigh)",
          "Grok 4.6 (High)",
          "Grok 4.3 (Medium)"
        ],
        "limits": "Higher rate limits, Grok 4 access, frontier models, image/video generation, connectors, and Expert mode.[reference:27]",
        "last_synced_at": "2026-11-01T12:04:32.855Z"
      },
      {
        "category": "Search & Research",
        "provider": "xAI",
        "plan": "SuperGrok Heavy",
        "monthlyPrice": 300,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "x-ai/grok-4-7-high",
          "x-ai/grok-4-7",
          "x-ai/grok-4-6",
          "x-ai/grok-4-3-medium"
        ],
        "rawModels": [
          "Grok 4.7 (High)",
          "Grok 4.7 (Xhigh)",
          "Grok 4.6 (High)",
          "Grok 4.3 (Medium)"
        ],
        "limits": "Highest consumer/business tier with maximum rate limits and access to advanced Grok capabilities.[reference:28]",
        "last_synced_at": "2026-11-01T12:04:32.855Z"
      }
    ]
  },
  {
    "id": "Perplexity",
    "name": "Perplexity",
    "provider": "Perplexity",
    "desc": "AI search companion",
    "icon": "🔍",
    "type": "subscription",
    "plans": [
      "Free",
      "Pro",
      "Max"
    ],
    "defaultPlan": "Pro",
    "defaultSeats": 1,
    "planModels": {
      "Free": [
        "Claude Haiku 5.5 (Max)",
        "Gemini 3.8 Flash (High)",
        "Sonar Reasoning"
      ],
      "Pro": [
        "Gemini 4 Argon (High)",
        "GPT-6.1 Sol (Xhigh)",
        "Claude Sonnet 5.5 (Max, Default Fallback)",
        "Sonar Reasoning"
      ],
      "Max": [
        "Gemini 4 Carbon (High)",
        "GPT-6.1 Terra (Max)",
        "Claude Opus 5.5 (Max, Default Fallback)",
        "Sonar Reasoning"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Free AI search with limited Pro searches per day."
      },
      "Pro": {
        "monthlyPrice": 20,
        "annualPrice": 200,
        "isPerSeat": false,
        "limits": "Includes unlimited Quick searches, daily Pro searches, Labs, Deep Research, and access to premium AI models. Annual billing: $200/year (save ~17%)."
      },
      "Max": {
        "monthlyPrice": 200,
        "annualPrice": 2000,
        "isPerSeat": false,
        "limits": "Highest consumer tier with significantly increased usage limits and priority access. Includes Computer access, 10,000 monthly credits."
      }
    },
    "allModels": [
      "Claude Haiku 5.5 (Max)",
      "Gemini 3.8 Flash (High)",
      "Sonar Reasoning",
      "Gemini 4 Argon (High)",
      "GPT-6.1 Sol (Xhigh)",
      "Claude Sonnet 5.5 (Max, Default Fallback)",
      "Gemini 4 Carbon (High)",
      "GPT-6.1 Terra (Max)",
      "Claude Opus 5.5 (Max, Default Fallback)"
    ],
    "tiers": [
      {
        "category": "Search & Research",
        "provider": "Perplexity",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "anthropic/claude-haiku-5-5",
          "google/gemini-3-8-flash",
          "perplexity/sonar-reasoning"
        ],
        "rawModels": [
          "Claude Haiku 5.5 (Max)",
          "Gemini 3.8 Flash (High)",
          "Sonar Reasoning"
        ],
        "limits": "Free AI search with limited Pro searches per day.",
        "last_synced_at": "2026-11-01T12:04:32.855Z"
      },
      {
        "category": "Search & Research",
        "provider": "Perplexity",
        "plan": "Pro",
        "monthlyPrice": 20,
        "annualPrice": 200,
        "annualPriceEquiv": 16.67,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "google/gemini-4-argon",
          "openai/gpt-6-1-sol-xhigh",
          "anthropic/claude-sonnet-5-5",
          "perplexity/sonar-reasoning"
        ],
        "rawModels": [
          "Gemini 4 Argon (High)",
          "GPT-6.1 Sol (Xhigh)",
          "Claude Sonnet 5.5 (Max, Default Fallback)",
          "Sonar Reasoning"
        ],
        "limits": "Includes unlimited Quick searches, daily Pro searches, Labs, Deep Research, and access to premium AI models. Annual billing: $200/year (save ~17%).",
        "last_synced_at": "2026-11-01T12:04:32.857Z"
      },
      {
        "category": "Search & Research",
        "provider": "Perplexity",
        "plan": "Max",
        "monthlyPrice": 200,
        "annualPrice": 2000,
        "annualPriceEquiv": 166.67,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "google/gemini-4-carbon",
          "openai/gpt-6-1-terra",
          "anthropic/claude-opus-5-5",
          "perplexity/sonar-reasoning"
        ],
        "rawModels": [
          "Gemini 4 Carbon (High)",
          "GPT-6.1 Terra (Max)",
          "Claude Opus 5.5 (Max, Default Fallback)",
          "Sonar Reasoning"
        ],
        "limits": "Highest consumer tier with significantly increased usage limits and priority access. Includes Computer access, 10,000 monthly credits.",
        "last_synced_at": "2026-11-01T12:04:32.857Z"
      }
    ]
  },
  {
    "id": "GitHub Copilot",
    "name": "GitHub Copilot",
    "provider": "GitHub",
    "desc": "GitHub AI assistant",
    "icon": "🤖",
    "type": "subscription",
    "plans": [
      "Copilot Free",
      "Copilot Pro",
      "Copilot Pro+"
    ],
    "defaultPlan": "Copilot Pro",
    "defaultSeats": 5,
    "planModels": {
      "Copilot Free": [
        "Claude Haiku 5.5 (Max)",
        "Gemini 3.8 Flash (High)",
        "GPT-5.5 Instant (June 2026)"
      ],
      "Copilot Pro": [
        "Gemini 4 Argon (High)",
        "GPT-6.1 Sol (Xhigh)",
        "Claude Sonnet 5.5 (Max, Default Fallback)"
      ],
      "Copilot Pro+": [
        "Gemini 4 Carbon (High)",
        "GPT-6.1 Terra (Max)",
        "Claude Sonnet 5.5 (Max, Default Fallback)",
        "Claude Opus 5.5 (Max, Default Fallback)"
      ]
    },
    "planDetails": {
      "Copilot Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "2,000 code completions/month.[reference:14] 50 chat/agent messages/month.[reference:15][reference:16] Limited access to select models.[reference:17]"
      },
      "Copilot Pro": {
        "monthlyPrice": 10,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "$10/month. Includes $10 base credits + $5 flex allotment = $15 total included usage.[reference:18][reference:19] Code completions and next-edit suggestions unlimited and do not consume credits.[reference:20]"
      },
      "Copilot Pro+": {
        "monthlyPrice": 39,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "$39/month. Includes $39 base credits + $31 flex allotment = $70 total included usage.[reference:21][reference:22] Access to premium models.[reference:23]"
      }
    },
    "allModels": [
      "Claude Haiku 5.5 (Max)",
      "Gemini 3.8 Flash (High)",
      "GPT-5.5 Instant (June 2026)",
      "Gemini 4 Argon (High)",
      "GPT-6.1 Sol (Xhigh)",
      "Claude Sonnet 5.5 (Max, Default Fallback)",
      "Gemini 4 Carbon (High)",
      "GPT-6.1 Terra (Max)",
      "Claude Opus 5.5 (Max, Default Fallback)"
    ],
    "tiers": [
      {
        "category": "Code & Agents",
        "provider": "GitHub",
        "plan": "Copilot Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "anthropic/claude-haiku-5-5",
          "google/gemini-3-8-flash",
          "openai/gpt-5-5-instant-06-26"
        ],
        "rawModels": [
          "Claude Haiku 5.5 (Max)",
          "Gemini 3.8 Flash (High)",
          "GPT-5.5 Instant (June 2026)"
        ],
        "limits": "2,000 code completions/month.[reference:14] 50 chat/agent messages/month.[reference:15][reference:16] Limited access to select models.[reference:17]",
        "last_synced_at": "2026-11-01T12:04:32.858Z"
      },
      {
        "category": "Code & Agents",
        "provider": "GitHub",
        "plan": "Copilot Pro",
        "monthlyPrice": 10,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "google/gemini-4-argon",
          "openai/gpt-6-1-sol-xhigh",
          "anthropic/claude-sonnet-5-5"
        ],
        "rawModels": [
          "Gemini 4 Argon (High)",
          "GPT-6.1 Sol (Xhigh)",
          "Claude Sonnet 5.5 (Max, Default Fallback)"
        ],
        "limits": "$10/month. Includes $10 base credits + $5 flex allotment = $15 total included usage.[reference:18][reference:19] Code completions and next-edit suggestions unlimited and do not consume credits.[reference:20]",
        "last_synced_at": "2026-11-01T12:04:32.859Z"
      },
      {
        "category": "Code & Agents",
        "provider": "GitHub",
        "plan": "Copilot Pro+",
        "monthlyPrice": 39,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "google/gemini-4-carbon",
          "openai/gpt-6-1-terra",
          "anthropic/claude-sonnet-5-5",
          "anthropic/claude-opus-5-5"
        ],
        "rawModels": [
          "Gemini 4 Carbon (High)",
          "GPT-6.1 Terra (Max)",
          "Claude Sonnet 5.5 (Max, Default Fallback)",
          "Claude Opus 5.5 (Max, Default Fallback)"
        ],
        "limits": "$39/month. Includes $39 base credits + $31 flex allotment = $70 total included usage.[reference:21][reference:22] Access to premium models.[reference:23]",
        "last_synced_at": "2026-11-01T12:04:32.860Z"
      }
    ]
  },
  {
    "id": "Windsurf",
    "name": "Windsurf",
    "provider": "Windsurf",
    "desc": "AI-powered IDE",
    "icon": "⛵",
    "type": "subscription",
    "plans": [
      "Free",
      "Pro"
    ],
    "defaultPlan": "Pro",
    "defaultSeats": 1,
    "planModels": {
      "Free": [
        "Claude Haiku 5.5 (Max)",
        "Gemini 3.8 Flash (High)",
        "GPT-5.5 Instant (June 2026)"
      ],
      "Pro": [
        "Gemini 4 Argon (High)",
        "GPT-6.1 Sol (Xhigh)",
        "Claude Sonnet 5.5 (Max, Default Fallback)"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "25 prompt credits/month. Light daily and weekly quota. Unlimited Tab autocomplete. Unlimited previews. Basic models only."
      },
      "Pro": {
        "monthlyPrice": 20,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "500 prompt credits/month. Standard daily and weekly quota. Unlimited Tab autocomplete. Access to all premium models including SWE-1.5, Claude Sonnet 4.6, and GPT-5.4. Additional credits available for purchase."
      }
    },
    "allModels": [
      "Claude Haiku 5.5 (Max)",
      "Gemini 3.8 Flash (High)",
      "GPT-5.5 Instant (June 2026)",
      "Gemini 4 Argon (High)",
      "GPT-6.1 Sol (Xhigh)",
      "Claude Sonnet 5.5 (Max, Default Fallback)"
    ],
    "tiers": [
      {
        "category": "Code & Agents",
        "provider": "Windsurf",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "anthropic/claude-haiku-5-5",
          "google/gemini-3-8-flash",
          "openai/gpt-5-5-instant-06-26"
        ],
        "rawModels": [
          "Claude Haiku 5.5 (Max)",
          "Gemini 3.8 Flash (High)",
          "GPT-5.5 Instant (June 2026)"
        ],
        "limits": "25 prompt credits/month. Light daily and weekly quota. Unlimited Tab autocomplete. Unlimited previews. Basic models only.",
        "last_synced_at": "2026-11-01T12:04:32.861Z"
      },
      {
        "category": "Code & Agents",
        "provider": "Windsurf",
        "plan": "Pro",
        "monthlyPrice": 20,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "google/gemini-4-argon",
          "openai/gpt-6-1-sol-xhigh",
          "anthropic/claude-sonnet-5-5"
        ],
        "rawModels": [
          "Gemini 4 Argon (High)",
          "GPT-6.1 Sol (Xhigh)",
          "Claude Sonnet 5.5 (Max, Default Fallback)"
        ],
        "limits": "500 prompt credits/month. Standard daily and weekly quota. Unlimited Tab autocomplete. Access to all premium models including SWE-1.5, Claude Sonnet 4.6, and GPT-5.4. Additional credits available for purchase.",
        "last_synced_at": "2026-11-01T12:04:32.862Z"
      }
    ]
  },
  {
    "id": "Cursor",
    "name": "Cursor",
    "provider": "Cursor",
    "desc": "AI code editor",
    "icon": "💻",
    "type": "subscription",
    "plans": [
      "Free",
      "Pro",
      "Business"
    ],
    "defaultPlan": "Pro",
    "defaultSeats": 5,
    "planModels": {
      "Free": [
        "Claude Haiku 5.5 (Max)",
        "Gemini 3.8 Flash (High)",
        "GPT-5.5 Instant (June 2026)"
      ],
      "Pro": [
        "Gemini 4 Argon (High)",
        "GPT-6.1 Sol (Xhigh)",
        "Claude Sonnet 5.5 (Max, Default Fallback)"
      ],
      "Business": [
        "Gemini 4 Carbon (High)",
        "GPT-6.1 Terra (Max)",
        "Claude Sonnet 5.5 (Max, Default Fallback)",
        "Claude Opus 5.5 (Max, Default Fallback)"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "Two-week Pro trial, then 50 slow requests/month with basic completions."
      },
      "Pro": {
        "monthlyPrice": 20,
        "annualPrice": 240,
        "isPerSeat": false,
        "limits": "Unlimited fast completions, 500 fast premium requests per month, and unlimited slow requests."
      },
      "Business": {
        "monthlyPrice": 40,
        "annualPrice": 480,
        "isPerSeat": true,
        "limits": "Centralized billing, admin dashboard, privacy mode enforced, and SAML/SSO."
      }
    },
    "allModels": [
      "Claude Haiku 5.5 (Max)",
      "Gemini 3.8 Flash (High)",
      "GPT-5.5 Instant (June 2026)",
      "Gemini 4 Argon (High)",
      "GPT-6.1 Sol (Xhigh)",
      "Claude Sonnet 5.5 (Max, Default Fallback)",
      "Gemini 4 Carbon (High)",
      "GPT-6.1 Terra (Max)",
      "Claude Opus 5.5 (Max, Default Fallback)"
    ],
    "tiers": [
      {
        "category": "Code & Dev",
        "provider": "Cursor",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "anthropic/claude-haiku-5-5",
          "google/gemini-3-8-flash",
          "openai/gpt-5-5-instant-06-26"
        ],
        "rawModels": [
          "Claude Haiku 5.5 (Max)",
          "Gemini 3.8 Flash (High)",
          "GPT-5.5 Instant (June 2026)"
        ],
        "limits": "Two-week Pro trial, then 50 slow requests/month with basic completions.",
        "last_synced_at": "2026-11-01T12:04:32.862Z"
      },
      {
        "category": "Code & Dev",
        "provider": "Cursor",
        "plan": "Pro",
        "monthlyPrice": 20,
        "annualPrice": 240,
        "annualPriceEquiv": 20,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "google/gemini-4-argon",
          "openai/gpt-6-1-sol-xhigh",
          "anthropic/claude-sonnet-5-5"
        ],
        "rawModels": [
          "Gemini 4 Argon (High)",
          "GPT-6.1 Sol (Xhigh)",
          "Claude Sonnet 5.5 (Max, Default Fallback)"
        ],
        "limits": "Unlimited fast completions, 500 fast premium requests per month, and unlimited slow requests.",
        "last_synced_at": "2026-11-01T12:04:32.863Z"
      },
      {
        "category": "Code & Dev",
        "provider": "Cursor",
        "plan": "Business",
        "monthlyPrice": 40,
        "annualPrice": 480,
        "annualPriceEquiv": 40,
        "annualDiscount": false,
        "isPerSeat": true,
        "models": [
          "google/gemini-4-carbon",
          "openai/gpt-6-1-terra",
          "anthropic/claude-sonnet-5-5",
          "anthropic/claude-opus-5-5"
        ],
        "rawModels": [
          "Gemini 4 Carbon (High)",
          "GPT-6.1 Terra (Max)",
          "Claude Sonnet 5.5 (Max, Default Fallback)",
          "Claude Opus 5.5 (Max, Default Fallback)"
        ],
        "limits": "Centralized billing, admin dashboard, privacy mode enforced, and SAML/SSO.",
        "last_synced_at": "2026-11-01T12:04:32.864Z"
      }
    ]
  },
  {
    "id": "Verdent AI",
    "name": "Verdent AI",
    "provider": "Verdent AI",
    "desc": "Verdent AI AI integration",
    "icon": "🔧",
    "type": "subscription",
    "plans": [
      "Starter"
    ],
    "defaultPlan": "Starter",
    "defaultSeats": 1,
    "planModels": {
      "Starter": [
        "GPT-5.5 (xhigh)",
        "GLM-5.1 (Reasoning)",
        "Gemini 3.1 Pro",
        "Claude Opus 4.8 (Adaptive Reasoning, Max Effort)",
        "Claude Sonnet 4.6 (Non-reasoning, High Effort)",
        "Kimi K2.6"
      ]
    },
    "planDetails": {
      "Starter": {
        "monthlyPrice": 19,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "480 credits/month (320 base + 160 current promotional bonus). Eco Mode for light usage. Access to all models. Suitable for occasional use and small tasks."
      }
    },
    "allModels": [
      "GPT-5.5 (xhigh)",
      "GLM-5.1 (Reasoning)",
      "Gemini 3.1 Pro",
      "Claude Opus 4.8 (Adaptive Reasoning, Max Effort)",
      "Claude Sonnet 4.6 (Non-reasoning, High Effort)",
      "Kimi K2.6"
    ],
    "tiers": [
      {
        "category": "Code & Agents",
        "provider": "Verdent AI",
        "plan": "Starter",
        "monthlyPrice": 19,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "openai/gpt-5.5",
          "google/gemini-3.1-pro",
          "anthropic/claude-opus-4.8",
          "anthropic/claude-sonnet-4.6",
          "zhipu/glm-5.1",
          "moonshot/kimi-k2.6"
        ],
        "rawModels": [
          "GPT-5.5 (xhigh)",
          "GLM-5.1 (Reasoning)",
          "Gemini 3.1 Pro",
          "Claude Opus 4.8 (Adaptive Reasoning, Max Effort)",
          "Claude Sonnet 4.6 (Non-reasoning, High Effort)",
          "Kimi K2.6"
        ],
        "limits": "480 credits/month (320 base + 160 current promotional bonus). Eco Mode for light usage. Access to all models. Suitable for occasional use and small tasks.",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      }
    ]
  },
  {
    "id": "Midjourney",
    "name": "Midjourney",
    "provider": "Midjourney",
    "desc": "AI image generator",
    "icon": "🎨",
    "type": "subscription",
    "plans": [
      "Basic",
      "Standard",
      "Pro"
    ],
    "defaultPlan": "Basic",
    "defaultSeats": 1,
    "planModels": {
      "Basic": [
        "Midjourney V8.1",
        "Midjourney V8",
        "Midjourney V7",
        "Niji 7"
      ],
      "Standard": [
        "Midjourney V8.1",
        "Midjourney V8",
        "Midjourney V7",
        "Niji 7"
      ],
      "Pro": [
        "Midjourney V8.1",
        "Midjourney V8",
        "Midjourney V7",
        "Niji 7"
      ]
    },
    "planDetails": {
      "Basic": {
        "monthlyPrice": 10,
        "annualPrice": 96,
        "isPerSeat": false,
        "limits": "Approximately 3.3 Fast GPU hours/month. No Relax Mode. No Turbo Mode. Annual billing saves approximately 17% (effective $8/month)."
      },
      "Standard": {
        "monthlyPrice": 30,
        "annualPrice": 288,
        "isPerSeat": false,
        "limits": "Approximately 15 Fast GPU hours/month. Unlimited Relax Mode. Annual billing saves approximately 20% (effective $24/month)."
      },
      "Pro": {
        "monthlyPrice": 60,
        "annualPrice": 576,
        "isPerSeat": false,
        "limits": "Increased Fast GPU hours. Includes Stealth Mode and Turbo Mode. Video generation available. Annual billing saves approximately 20% (effective $48/month)."
      }
    },
    "allModels": [
      "Midjourney V8.1",
      "Midjourney V8",
      "Midjourney V7",
      "Niji 7"
    ],
    "tiers": [
      {
        "category": "Media (Image)",
        "provider": "Midjourney",
        "plan": "Basic",
        "monthlyPrice": 10,
        "annualPrice": 96,
        "annualPriceEquiv": 8,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "midjourney/v8.1",
          "midjourney/v8",
          "midjourney/v7",
          "midjourney/v6.1",
          "midjourney/niji-7",
          "midjourney/niji-6"
        ],
        "rawModels": [
          "Midjourney V8.1",
          "Midjourney V8",
          "Midjourney V7",
          "Niji 7"
        ],
        "limits": "Approximately 3.3 Fast GPU hours/month. No Relax Mode. No Turbo Mode. Annual billing saves approximately 17% (effective $8/month).",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      },
      {
        "category": "Media (Image)",
        "provider": "Midjourney",
        "plan": "Standard",
        "monthlyPrice": 30,
        "annualPrice": 288,
        "annualPriceEquiv": 24,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "midjourney/v8.1",
          "midjourney/v8",
          "midjourney/v7",
          "midjourney/v6.1",
          "midjourney/niji-7",
          "midjourney/niji-6"
        ],
        "rawModels": [
          "Midjourney V8.1",
          "Midjourney V8",
          "Midjourney V7",
          "Niji 7"
        ],
        "limits": "Approximately 15 Fast GPU hours/month. Unlimited Relax Mode. Annual billing saves approximately 20% (effective $24/month).",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      },
      {
        "category": "Media (Image)",
        "provider": "Midjourney",
        "plan": "Pro",
        "monthlyPrice": 60,
        "annualPrice": 576,
        "annualPriceEquiv": 48,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "midjourney/v8.1",
          "midjourney/v8",
          "midjourney/v7",
          "midjourney/v6.1",
          "midjourney/niji-7",
          "midjourney/niji-6"
        ],
        "rawModels": [
          "Midjourney V8.1",
          "Midjourney V8",
          "Midjourney V7",
          "Niji 7"
        ],
        "limits": "Increased Fast GPU hours. Includes Stealth Mode and Turbo Mode. Video generation available. Annual billing saves approximately 20% (effective $48/month).",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      }
    ]
  },
  {
    "id": "Runway",
    "name": "Runway",
    "provider": "Runway",
    "desc": "AI video generator",
    "icon": "🎬",
    "type": "subscription",
    "plans": [
      "Free",
      "Standard",
      "Pro",
      "Unlimited"
    ],
    "defaultPlan": "Standard",
    "defaultSeats": 1,
    "planModels": {
      "Free": [
        "Gen-4 Turbo",
        "Gen-4 Image"
      ],
      "Standard": [
        "Gen-4.5",
        "Gen-4 Turbo",
        "Gen-4 Image",
        "Gen-4 Image Turbo",
        "Aleph 2.0",
        "Nano Banana 2"
      ],
      "Pro": [
        "Gen-4.5",
        "Gen-4 Turbo",
        "Gen-4 Image",
        "Gen-4 Image Turbo",
        "Aleph 2.0",
        "Act-One",
        "Nano Banana 2"
      ],
      "Unlimited": [
        "Gen-4.5",
        "Gen-4 Turbo",
        "Gen-4 Image",
        "Gen-4 Image Turbo",
        "Aleph 2.0",
        "Act-One",
        "Seedance 2.0",
        "Nano Banana 2"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "125 one-time credits. Includes Gen-4 Turbo (Image to Video), Gen-4 Image (Text to Image, References), Gemini 3 Pro, Gemini 2.5, Image Apps, Generative Audio, Text to Speech, Audio Apps. 3 video editor projects, 5GB asset storage."
      },
      "Standard": {
        "monthlyPrice": 15,
        "annualPrice": 144,
        "isPerSeat": false,
        "limits": "625 credits/month = 52s of Gen-4.5, 104s of Gen-4 Turbo, or 78 Gen-4 Images (1080p). No watermarks. 4K upscaling. Access to all AI images and video models (Gen-4.5, Nano Banana Pro, Aleph, Veo 3.1, and more). Annual billing: $12/month (save $36/year)."
      },
      "Pro": {
        "monthlyPrice": 35,
        "annualPrice": 336,
        "isPerSeat": false,
        "limits": "2250 credits/month = 187s of Gen-4.5, 375s of Gen-4 Turbo, or 281 Gen-4 Images (1080p). Create Custom Voices for Lip Sync and Text to Speech. 500GB asset storage. Access to best models (Gen-4.5, Seedance 2.0, Kling 3.0, Nano Banana Pro, and more). Annual billing: $28/month (save $84/year)."
      },
      "Unlimited": {
        "monthlyPrice": 95,
        "annualPrice": 912,
        "isPerSeat": false,
        "limits": "Replaces Unlimited plan as of June 1, 2026. 9500 credits/month = 791s of Gen-4.5, 1900s of Gen-4 Turbo, or 1187 Gen-4 Images (1080p). Roll over unused credits for 1 month. First access to newest models. Highest generation volume. Annual billing: $76/month (save $228/year). Existing Unlimited subscribers automatically move to Max on September 1, 2026 at the same price."
      }
    },
    "allModels": [
      "Gen-4 Turbo",
      "Gen-4 Image",
      "Gen-4.5",
      "Gen-4 Image Turbo",
      "Aleph 2.0",
      "Nano Banana 2",
      "Act-One",
      "Seedance 2.0"
    ],
    "tiers": [
      {
        "category": "Media (Video)",
        "provider": "Runway",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "runway/gen-4-turbo",
          "runway/gen-4-image"
        ],
        "rawModels": [
          "Gen-4 Turbo",
          "Gen-4 Image"
        ],
        "limits": "125 one-time credits. Includes Gen-4 Turbo (Image to Video), Gen-4 Image (Text to Image, References), Gemini 3 Pro, Gemini 2.5, Image Apps, Generative Audio, Text to Speech, Audio Apps. 3 video editor projects, 5GB asset storage.",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      },
      {
        "category": "Media (Video)",
        "provider": "Runway",
        "plan": "Standard",
        "monthlyPrice": 15,
        "annualPrice": 144,
        "annualPriceEquiv": 12,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "runway/gen-4.5",
          "runway/gen-4",
          "runway/gen-4-turbo",
          "runway/gen-4-image",
          "runway/gen-4-image-turbo",
          "runway/aleph-2.0",
          "runway/nano-banana-2"
        ],
        "rawModels": [
          "Gen-4.5",
          "Gen-4 Turbo",
          "Gen-4 Image",
          "Gen-4 Image Turbo",
          "Aleph 2.0",
          "Nano Banana 2"
        ],
        "limits": "625 credits/month = 52s of Gen-4.5, 104s of Gen-4 Turbo, or 78 Gen-4 Images (1080p). No watermarks. 4K upscaling. Access to all AI images and video models (Gen-4.5, Nano Banana Pro, Aleph, Veo 3.1, and more). Annual billing: $12/month (save $36/year).",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      },
      {
        "category": "Media (Video)",
        "provider": "Runway",
        "plan": "Pro",
        "monthlyPrice": 35,
        "annualPrice": 336,
        "annualPriceEquiv": 28,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "runway/gen-4.5",
          "runway/gen-4",
          "runway/gen-4-turbo",
          "runway/gen-4-image",
          "runway/gen-4-image-turbo",
          "runway/aleph-2.0",
          "runway/act-one",
          "runway/nano-banana-2"
        ],
        "rawModels": [
          "Gen-4.5",
          "Gen-4 Turbo",
          "Gen-4 Image",
          "Gen-4 Image Turbo",
          "Aleph 2.0",
          "Act-One",
          "Nano Banana 2"
        ],
        "limits": "2250 credits/month = 187s of Gen-4.5, 375s of Gen-4 Turbo, or 281 Gen-4 Images (1080p). Create Custom Voices for Lip Sync and Text to Speech. 500GB asset storage. Access to best models (Gen-4.5, Seedance 2.0, Kling 3.0, Nano Banana Pro, and more). Annual billing: $28/month (save $84/year).",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      },
      {
        "category": "Media (Video)",
        "provider": "Runway",
        "plan": "Unlimited",
        "monthlyPrice": 95,
        "annualPrice": 912,
        "annualPriceEquiv": 76,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "runway/gen-4.5",
          "runway/gen-4",
          "runway/gen-4-turbo",
          "runway/gen-4-image",
          "runway/gen-4-image-turbo",
          "runway/aleph-2.0",
          "runway/act-one",
          "runway/seedance-2.0",
          "runway/nano-banana-2"
        ],
        "rawModels": [
          "Gen-4.5",
          "Gen-4 Turbo",
          "Gen-4 Image",
          "Gen-4 Image Turbo",
          "Aleph 2.0",
          "Act-One",
          "Seedance 2.0",
          "Nano Banana 2"
        ],
        "limits": "Replaces Unlimited plan as of June 1, 2026. 9500 credits/month = 791s of Gen-4.5, 1900s of Gen-4 Turbo, or 1187 Gen-4 Images (1080p). Roll over unused credits for 1 month. First access to newest models. Highest generation volume. Annual billing: $76/month (save $228/year). Existing Unlimited subscribers automatically move to Max on September 1, 2026 at the same price.",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      }
    ]
  },
  {
    "id": "ElevenLabs",
    "name": "ElevenLabs",
    "provider": "ElevenLabs",
    "desc": "AI voice generator",
    "icon": "🗣️",
    "type": "subscription",
    "plans": [
      "Free",
      "Starter",
      "Creator"
    ],
    "defaultPlan": "Starter",
    "defaultSeats": 1,
    "planModels": {
      "Free": [
        "Eleven v3",
        "Flash v2.5",
        "Eleven Multilingual v2",
        "Scribe v2"
      ],
      "Starter": [
        "Eleven v3",
        "Flash v2.5",
        "Eleven Multilingual v2",
        "Scribe v2"
      ],
      "Creator": [
        "Eleven v3",
        "Flash v2.5",
        "Eleven Multilingual v2",
        "Scribe v2"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "10,000 credits/month. Non-commercial use only with attribution. 3 custom voice slots. No instant voice cloning."
      },
      "Starter": {
        "monthlyPrice": 5,
        "annualPrice": 50,
        "isPerSeat": false,
        "limits": "30,000 credits/month. Commercial license included. Instant voice cloning. 20 Studio projects."
      },
      "Creator": {
        "monthlyPrice": 22,
        "annualPrice": 220,
        "isPerSeat": false,
        "limits": "100,000 credits/month. 192kbps audio quality. Professional Voice Cloning. First month 50% off ($11). Overage ~$0.30/min (TTS) and ~$0.22/min (STT)."
      }
    },
    "allModels": [
      "Eleven v3",
      "Flash v2.5",
      "Eleven Multilingual v2",
      "Scribe v2"
    ],
    "tiers": [
      {
        "category": "Media (Audio)",
        "provider": "ElevenLabs",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "elevenlabs/eleven_v3",
          "elevenlabs/eleven_multilingual_v2",
          "elevenlabs/scribe_v2",
          "elevenlabs/eleven_flash_v2_5"
        ],
        "rawModels": [
          "Eleven v3",
          "Flash v2.5",
          "Eleven Multilingual v2",
          "Scribe v2"
        ],
        "limits": "10,000 credits/month. Non-commercial use only with attribution. 3 custom voice slots. No instant voice cloning.",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      },
      {
        "category": "Media (Audio)",
        "provider": "ElevenLabs",
        "plan": "Starter",
        "monthlyPrice": 5,
        "annualPrice": 50,
        "annualPriceEquiv": 4.17,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "elevenlabs/eleven_v3",
          "elevenlabs/eleven_multilingual_v2",
          "elevenlabs/scribe_v2",
          "elevenlabs/eleven_flash_v2_5"
        ],
        "rawModels": [
          "Eleven v3",
          "Flash v2.5",
          "Eleven Multilingual v2",
          "Scribe v2"
        ],
        "limits": "30,000 credits/month. Commercial license included. Instant voice cloning. 20 Studio projects.",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      },
      {
        "category": "Media (Audio)",
        "provider": "ElevenLabs",
        "plan": "Creator",
        "monthlyPrice": 22,
        "annualPrice": 220,
        "annualPriceEquiv": 18.33,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "elevenlabs/eleven_v3",
          "elevenlabs/eleven_multilingual_v2",
          "elevenlabs/scribe_v2",
          "elevenlabs/eleven_flash_v2_5"
        ],
        "rawModels": [
          "Eleven v3",
          "Flash v2.5",
          "Eleven Multilingual v2",
          "Scribe v2"
        ],
        "limits": "100,000 credits/month. 192kbps audio quality. Professional Voice Cloning. First month 50% off ($11). Overage ~$0.30/min (TTS) and ~$0.22/min (STT).",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      }
    ]
  },
  {
    "id": "Suno",
    "name": "Suno",
    "provider": "Suno",
    "desc": "AI music generator",
    "icon": "🎵",
    "type": "subscription",
    "plans": [
      "Free",
      "Pro",
      "Premier"
    ],
    "defaultPlan": "Pro",
    "defaultSeats": 1,
    "planModels": {
      "Free": [
        "Suno v4.5-all"
      ],
      "Pro": [
        "Suno v5.5",
        "Suno v5",
        "Personas"
      ],
      "Premier": [
        "Suno v5.5",
        "Suno v5",
        "Personas"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "50 credits renew daily. No commercial use. Standard features only. Upload up to 8 min of audio. Shared creation queue. No add-on credit purchases. No stem separation."
      },
      "Pro": {
        "monthlyPrice": 10,
        "annualPrice": 96,
        "isPerSeat": false,
        "limits": "2,500 credits/month. Commercial use rights. Standard stem separation. Upload up to 30 min of audio. Priority queue. Early access to new features. Ability to purchase add-on credits. Annual billing: $96/year (save $24)."
      },
      "Premier": {
        "monthlyPrice": 30,
        "annualPrice": 288,
        "isPerSeat": false,
        "limits": "10,000 credits/month. Includes Suno Studio. Advanced stem separation (more stem types). All Pro features plus highest generation limits. Annual billing: $288/year (save $72)."
      }
    },
    "allModels": [
      "Suno v4.5-all",
      "Suno v5.5",
      "Suno v5",
      "Personas"
    ],
    "tiers": [
      {
        "category": "Media (Audio)",
        "provider": "Suno",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "suno/v4.5-all"
        ],
        "rawModels": [
          "Suno v4.5-all"
        ],
        "limits": "50 credits renew daily. No commercial use. Standard features only. Upload up to 8 min of audio. Shared creation queue. No add-on credit purchases. No stem separation.",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      },
      {
        "category": "Media (Audio)",
        "provider": "Suno",
        "plan": "Pro",
        "monthlyPrice": 10,
        "annualPrice": 96,
        "annualPriceEquiv": 8,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "suno/v5.5",
          "suno/v5",
          "suno/v4.5-plus",
          "suno/v4.5",
          "suno/personas"
        ],
        "rawModels": [
          "Suno v5.5",
          "Suno v5",
          "Personas"
        ],
        "limits": "2,500 credits/month. Commercial use rights. Standard stem separation. Upload up to 30 min of audio. Priority queue. Early access to new features. Ability to purchase add-on credits. Annual billing: $96/year (save $24).",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      },
      {
        "category": "Media (Audio)",
        "provider": "Suno",
        "plan": "Premier",
        "monthlyPrice": 30,
        "annualPrice": 288,
        "annualPriceEquiv": 24,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "suno/v5.5",
          "suno/v5",
          "suno/v4.5-plus",
          "suno/v4.5",
          "suno/personas"
        ],
        "rawModels": [
          "Suno v5.5",
          "Suno v5",
          "Personas"
        ],
        "limits": "10,000 credits/month. Includes Suno Studio. Advanced stem separation (more stem types). All Pro features plus highest generation limits. Annual billing: $288/year (save $72).",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      }
    ]
  },
  {
    "id": "v0 (Vercel)",
    "name": "v0 (Vercel)",
    "provider": "v0 (Vercel)",
    "desc": "Vercel UI generator",
    "icon": "▲",
    "type": "subscription",
    "plans": [
      "Free",
      "Premium"
    ],
    "defaultPlan": "Premium",
    "defaultSeats": 1,
    "planModels": {
      "Free": [
        "v0 Mini"
      ],
      "Premium": [
        "v0 Pro",
        "v0 Mini"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "$5 in included monthly credits. Deploy to Vercel. Visual editing with Design Mode. GitHub sync. 7 messages/day limit. Credit expires at end of month."
      },
      "Premium": {
        "monthlyPrice": 20,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "$20 in included monthly credits. $2 of free daily credits on login. Purchase additional credits. Larger uploads. No API access. Premium is being sunset for new users but remains for existing subscribers."
      }
    },
    "allModels": [
      "v0 Mini",
      "v0 Pro"
    ],
    "tiers": [
      {
        "category": "UI & Layouts",
        "provider": "v0 (Vercel)",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "vercel/v0-mini"
        ],
        "rawModels": [
          "v0 Mini"
        ],
        "limits": "$5 in included monthly credits. Deploy to Vercel. Visual editing with Design Mode. GitHub sync. 7 messages/day limit. Credit expires at end of month.",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      },
      {
        "category": "UI & Layouts",
        "provider": "v0 (Vercel)",
        "plan": "Premium",
        "monthlyPrice": 20,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "vercel/v0-pro",
          "vercel/v0-mini"
        ],
        "rawModels": [
          "v0 Pro",
          "v0 Mini"
        ],
        "limits": "$20 in included monthly credits. $2 of free daily credits on login. Purchase additional credits. Larger uploads. No API access. Premium is being sunset for new users but remains for existing subscribers.",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      }
    ]
  },
  {
    "id": "Gamma AI",
    "name": "Gamma AI",
    "provider": "Gamma AI",
    "desc": "AI presentation generator",
    "icon": "✨",
    "type": "subscription",
    "plans": [
      "Free",
      "Plus"
    ],
    "defaultPlan": "Plus",
    "defaultSeats": 1,
    "planModels": {
      "Free": [
        "Gamma AI Agent",
        "Basic Image Models"
      ],
      "Plus": [
        "Gamma AI Agent",
        "Basic Image Models",
        "Advanced Image Models"
      ]
    },
    "planDetails": {
      "Free": {
        "monthlyPrice": 0,
        "annualPrice": 0,
        "isPerSeat": false,
        "limits": "400 one-time AI credits (no monthly refresh). Up to 10 cards per prompt. Gamma branding included. Import from PDF and PPTX. Export to PDF, PPTX, PNG, and Google Slides."
      },
      "Plus": {
        "monthlyPrice": 12,
        "annualPrice": 108,
        "isPerSeat": false,
        "limits": "1,000 monthly AI credits. Up to 20 cards per prompt. Gamma branding removed. Advanced image models. Annual pricing: $9/month."
      }
    },
    "allModels": [
      "Gamma AI Agent",
      "Basic Image Models",
      "Advanced Image Models"
    ],
    "tiers": [
      {
        "category": "UI & Layouts",
        "provider": "Gamma AI",
        "plan": "Free",
        "monthlyPrice": 0,
        "annualPrice": 0,
        "annualPriceEquiv": 0,
        "annualDiscount": false,
        "isPerSeat": false,
        "models": [
          "gamma/ai-agent",
          "gamma/basic-image-models"
        ],
        "rawModels": [
          "Gamma AI Agent",
          "Basic Image Models"
        ],
        "limits": "400 one-time AI credits (no monthly refresh). Up to 10 cards per prompt. Gamma branding included. Import from PDF and PPTX. Export to PDF, PPTX, PNG, and Google Slides.",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      },
      {
        "category": "UI & Layouts",
        "provider": "Gamma AI",
        "plan": "Plus",
        "monthlyPrice": 12,
        "annualPrice": 108,
        "annualPriceEquiv": 9,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "gamma/ai-agent",
          "gamma/basic-image-models",
          "gamma/advanced-image-models"
        ],
        "rawModels": [
          "Gamma AI Agent",
          "Basic Image Models",
          "Advanced Image Models"
        ],
        "limits": "1,000 monthly AI credits. Up to 20 cards per prompt. Gamma branding removed. Advanced image models. Annual pricing: $9/month.",
        "last_synced_at": "2026-08-28T16:00:05.521Z"
      }
    ]
  },
  {
    "id": "Alibaba (Qwen)",
    "name": "Alibaba (Qwen)",
    "provider": "Alibaba (Qwen)",
    "desc": "Alibaba Qwen Chat",
    "icon": "☁️",
    "type": "subscription",
    "plans": [
      "Qwen Chat Pro"
    ],
    "defaultPlan": "Qwen Chat Pro",
    "defaultSeats": 1,
    "planModels": {
      "Qwen Chat Pro": [
        "Qwen3.8 Max (0902)",
        "Qwen3.8-Flash-Next",
        "Qwen3.8 27B (Xhigh)",
        "Qwen3.8 2.4T A95B"
      ]
    },
    "planDetails": {
      "Qwen Chat Pro": {
        "monthlyPrice": 15,
        "annualPrice": 150,
        "isPerSeat": false,
        "limits": "Access to flagship Qwen models with fast inference."
      }
    },
    "allModels": [
      "Qwen3.8 Max (0902)",
      "Qwen3.8-Flash-Next",
      "Qwen3.8 27B (Xhigh)",
      "Qwen3.8 2.4T A95B"
    ],
    "tiers": [
      {
        "category": "Chat & Reasoning",
        "provider": "Alibaba (Qwen)",
        "plan": "Qwen Chat Pro",
        "monthlyPrice": 15,
        "annualPrice": 150,
        "annualPriceEquiv": 12.5,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "alibaba/qwen3-8-max",
          "alibaba/qwen3-8-flash-next",
          "alibaba/qwen3-8-27b",
          "alibaba/qwen3-8-2-4t-a95b"
        ],
        "rawModels": [
          "Qwen3.8 Max (0902)",
          "Qwen3.8-Flash-Next",
          "Qwen3.8 27B (Xhigh)",
          "Qwen3.8 2.4T A95B"
        ],
        "limits": "Access to flagship Qwen models with fast inference.",
        "last_synced_at": "2026-11-01T12:04:32.865Z"
      }
    ]
  },
  {
    "id": "Cohere",
    "name": "Cohere",
    "provider": "Cohere",
    "desc": "Cohere enterprise model platform",
    "icon": "🌿",
    "type": "subscription",
    "plans": [
      "Cohere Platform"
    ],
    "defaultPlan": "Cohere Platform",
    "defaultSeats": 1,
    "planModels": {
      "Cohere Platform": [
        "North Mini Code",
        "Command A+",
        "Tiny Aya Global",
        "Command A"
      ]
    },
    "planDetails": {
      "Cohere Platform": {
        "monthlyPrice": 20,
        "annualPrice": 200,
        "isPerSeat": false,
        "limits": "Access to Command R and R+ models with enterprise grounding."
      }
    },
    "allModels": [
      "North Mini Code",
      "Command A+",
      "Tiny Aya Global",
      "Command A"
    ],
    "tiers": [
      {
        "category": "Chat & Reasoning",
        "provider": "Cohere",
        "plan": "Cohere Platform",
        "monthlyPrice": 20,
        "annualPrice": 200,
        "annualPriceEquiv": 16.6,
        "annualDiscount": true,
        "isPerSeat": false,
        "models": [
          "cohere/north-mini-code",
          "cohere/command-a-plus",
          "cohere/tiny-aya-global",
          "cohere/command-a"
        ],
        "rawModels": [
          "North Mini Code",
          "Command A+",
          "Tiny Aya Global",
          "Command A"
        ],
        "limits": "Access to Command R and R+ models with enterprise grounding.",
        "last_synced_at": "2026-11-01T12:04:32.865Z"
      }
    ]
  }
];

const BACKEND_URL = API_BASE_URL;

const getViewFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    let v = params.get('view');
    if (!v) {
      const rawPath = (window.location.pathname || '').replace(/^\/+|\/+$/g, '');
      if (rawPath && rawPath !== 'index.html') {
        v = rawPath;
      }
    }
    if (!v) {
      if (window.location.hash === '#pricing') return 'pricing_scroll';
      return 'landing';
    }
    const normalized = v.toLowerCase().replace(/[-_]/g, '');
    if (normalized === 'modelauditor' || normalized === 'models' || normalized === 'auditor' || normalized === 'model') return 'model_auditor';
    if (normalized === 'marketintel' || normalized === 'intel' || normalized === 'leaderboard') return 'market_intel';
    if (normalized === 'step1' || normalized === 'wizard' || normalized === 'audit') return 'step1';
    if (normalized === 'step2') return 'step2';
    if (normalized === 'step3') return 'step3';
    if (normalized === 'step4' || normalized === 'plan' || normalized === 'actionplan') return 'step4';
    if (normalized === 'sample' || normalized === 'samplereport') return 'sample_report';
    if (normalized === 'history') return 'history';
    if (normalized === 'signin' || normalized === 'login') return 'signin';
    if (normalized === 'signup' || normalized === 'register') return 'signup';
    if (normalized === 'profile' || normalized === 'account') return 'profile';
    if (normalized === 'pricing') return 'pricing_scroll';
    return 'landing';
  } catch {
    return 'landing';
  }
};

const getViewUrlParam = (view) => {
  switch (view) {
    case 'model_auditor': return 'model-auditor';
    case 'market_intel': return 'market-intel';
    case 'step1': return 'step1';
    case 'step2': return 'step2';
    case 'step3': return 'step3';
    case 'step4': return 'step4';
    case 'sample_report': return 'sample';
    case 'history': return 'history';
    case 'profile': return 'profile';
    case 'signin': return 'signin';
    case 'signup': return 'signup';
    default: return '';
  }
};

const getViewTitle = (view) => {
  switch (view) {
    case 'model_auditor': return 'Audex AI — Live AI Model Auditor & Benchmark Comparison';
    case 'market_intel': return 'Audex AI — Enterprise AI Market Intelligence & Leaderboard';
    case 'profile': return 'Audex AI — Account & Subscription Management';
    case 'step1': return 'Audex AI — AI Subscription Audit Wizard & Spend Calculator';
    case 'step2': return 'Audex AI — Configure AI Tool Allocations';
    case 'step3': return 'Audex AI — Set AI Optimization Goals';
    case 'step4': return 'Audex AI — Optimisation Action Plan (Step 4)';
    case 'results': return 'Audex AI — Enterprise AI Spend Audit Results';
    case 'sample_report': return 'Audex AI — Sample Enterprise AI Audit Report';
    case 'history': return 'Audex AI — Audit Reports History';
    case 'signin': return 'Audex AI — Sign In';
    case 'signup': return 'Audex AI — Create Free Account';
    default: return 'Audex AI — Enterprise AI Subscription Audit & LLM Spend Optimizer';
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('UI Crash Caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '24px' }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', marginBottom: '24px' }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering this view.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => window.location.href = '/'} className="btn btn-black" style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700' }}>
              Return to Home
            </button>
            <button onClick={() => this.setState({ hasError: false, error: null })} className="btn btn-outline" style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700' }}>
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // Navigation: 'landing', 'step1', 'step2', 'step3', 'loading', 'results', 'history', 'signin', 'signup', 'model_auditor', 'market_intel', 'sample_report'
  const [currentView, setCurrentView] = useState(() => {
    const initial = getViewFromUrl();
    return initial === 'pricing_scroll' ? 'landing' : initial;
  });

  // Authentication state
  const [token, setToken] = useState(() => localStorage.getItem('audex_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('audex_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [authError, setAuthError] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // State for search and custom tools
  const [tools, setTools] = useState(INITIAL_TOOLS);
  
  // Wizard choices
  const [selectedToolIds, setSelectedToolIds] = useState(['GitHub Copilot', 'Claude']);
  const [toolConfigs, setToolConfigs] = useState({
    'GitHub Copilot': [{ id: 'g1', plan: 'Copilot Pro', seats: 5, purpose: 'Coding' }],
    'Claude': [{ id: 'cl1', plan: 'Claude Pro', seats: 4, purpose: 'Writing' }]
  });
  const [teamSize, setTeamSize] = useState(3);
  const [useCase, setUseCase] = useState('Coding');
  const [optimizationGoal, setOptimizationGoal] = useState('performance');
  const [costCutPercentage, setCostCutPercentage] = useState(50);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [tokenAdjustments, setTokenAdjustments] = useState({});

  // Credit / Pricing State
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [purchasedPlanName, setPurchasedPlanName] = useState('');
  const [purchasedCreditsCount, setPurchasedCreditsCount] = useState(0);

  // UPI Checkout Modal States
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPlanType] = useState('pro');
  const [checkoutAuditId] = useState(null);

  const [auditResult, setAuditResult] = useState(null);
  const [pastAudits, setPastAudits] = useState([]);
  const [apiError, setApiError] = useState(null);

  // Preload market dataset quietly in background during browser idle time
  useEffect(() => {
    preloadCoreData();
  }, []);

  useEffect(() => {
    let hasInitializedSelection = false;

    const applyUpdatedTools = (dynamicTools) => {
      if (!Array.isArray(dynamicTools) || dynamicTools.length === 0) return;
      setTools(dynamicTools);

      if (!hasInitializedSelection) {
        hasInitializedSelection = true;
        setSelectedToolIds(prev => {
          if (prev && prev.length > 0) return prev;
          const initialCount = Math.min(2, 99);
          return dynamicTools.slice(0, initialCount).map(t => t.id);
        });
      }

      setToolConfigs(prevConfigs => {
        const nextConfigs = { ...prevConfigs };
        dynamicTools.forEach(t => {
          if (!nextConfigs[t.id] || nextConfigs[t.id].length === 0) {
            nextConfigs[t.id] = [{
              id: (Date.now() + Math.random()).toString(),
              plan: t.defaultPlan || 'Free',
              seats: t.defaultSeats || 1,
              purpose: (t.id === 'GitHub Copilot' || t.id === 'Cursor' || t.id === 'Windsurf') ? 'Coding' : 'Mixed'
            }];
          }
        });
        return nextConfigs;
      });
    };

    const fetchSubscriptionTiers = async (force = false) => {
      try {
        const dynamicTools = await getCachedSubscriptionTiers(force);
        if (Array.isArray(dynamicTools) && dynamicTools.length > 0) {
          applyUpdatedTools(dynamicTools);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic subscription tiers from backend:', err);
      }
    };

    fetchSubscriptionTiers();

    // Listen for automatic background updates when fresh tiers arrive
    const handleSubTiersUpdated = (e) => {
      if (Array.isArray(e.detail) && e.detail.length > 0) {
        applyUpdatedTools(e.detail);
      }
    };
    window.addEventListener('audex_sub_tiers_updated', handleSubTiersUpdated);

    // Auto-update subscription list when window regains focus or periodically every 5 minutes
    const handleFocus = () => fetchSubscriptionTiers(true);
    window.addEventListener('focus', handleFocus);
    const subInterval = setInterval(() => fetchSubscriptionTiers(true), 5 * 60 * 1000);

    return () => {
      window.removeEventListener('audex_sub_tiers_updated', handleSubTiersUpdated);
      window.removeEventListener('focus', handleFocus);
      clearInterval(subInterval);
    };
  }, [user]);

  // Google & GitHub OAuth callback detection effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Google params
    const googleToken = params.get('google_token');
    const googleUserId = params.get('google_user_id');
    const googleUserName = params.get('google_user_name');
    const googleUserEmail = params.get('google_user_email');
    const googleError = params.get('google_error');

    // GitHub params
    const githubToken = params.get('github_token');
    const githubUserId = params.get('github_user_id');
    const githubUserName = params.get('github_user_name');
    const githubUserEmail = params.get('github_user_email');
    const githubError = params.get('github_error');

    if (googleToken && googleUserId) {
      const googleUserPlan = params.get('google_user_plan') || 'free';
      const googleUserUnlockedAuditsRaw = params.get('google_user_unlocked_audits') || '';
      const googleUserUnlockedAudits = googleUserUnlockedAuditsRaw ? googleUserUnlockedAuditsRaw.split(',') : [];

      const parsedUser = {
        id: googleUserId,
        name: decodeURIComponent(googleUserName || 'Google User'),
        email: decodeURIComponent(googleUserEmail || ''),
        credits: { starter: 0, pro: 0, proMax: 0 },
        plan: googleUserPlan,
        unlockedAudits: googleUserUnlockedAudits
      };

      // Store in localStorage
      localStorage.setItem('audex_token', googleToken);
      localStorage.setItem('audex_user', JSON.stringify(parsedUser));

      // Update React state
      setToken(googleToken);
      setUser(parsedUser);
      setAuthError(null);
      setAuthMessage('Successfully logged in with Google!');
      setCurrentView('landing');

      // Clear query params from the URL address bar
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    } else if (googleError) {
      setAuthError(`Google Sign-In failed: ${decodeURIComponent(googleError)}`);
      setCurrentView('signin');

      // Clear query params from the URL address bar
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    } else if (githubToken && githubUserId) {
      const githubUserPlan = params.get('github_user_plan') || 'free';
      const githubUserUnlockedAuditsRaw = params.get('github_user_unlocked_audits') || '';
      const githubUserUnlockedAudits = githubUserUnlockedAuditsRaw ? githubUserUnlockedAuditsRaw.split(',') : [];

      const parsedUser = {
        id: githubUserId,
        name: decodeURIComponent(githubUserName || 'GitHub User'),
        email: decodeURIComponent(githubUserEmail || ''),
        credits: { starter: 0, pro: 0, proMax: 0 },
        plan: githubUserPlan,
        unlockedAudits: githubUserUnlockedAudits
      };

      // Store in localStorage
      localStorage.setItem('audex_token', githubToken);
      localStorage.setItem('audex_user', JSON.stringify(parsedUser));

      // Update React state
      setToken(githubToken);
      setUser(parsedUser);
      setAuthError(null);
      setAuthMessage('Successfully logged in with GitHub!');
      setCurrentView('landing');

      // Clear query params from the URL address bar
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    } else if (githubError) {
      setAuthError(`GitHub Sign-In failed: ${decodeURIComponent(githubError)}`);
      setCurrentView('signin');

      // Clear query params from the URL address bar
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }
  }, []);

  // Synchronize authenticated user state & subscription entitlements with authoritative backend
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            handleLogout();
          }
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem('audex_user', JSON.stringify(data.user));
        }
      })
      .catch(err => {
        console.warn('Failed to sync user entitlements with backend:', err.message);
      });
  }, [token]);

  useEffect(() => {
    if (auditResult && auditResult.savings && auditResult.savings.recommendations) {
      const initial = {};
      auditResult.savings.recommendations.forEach((rec, idx) => {
        const defaultInput = rec.apiOption?.defaultInputTokens || 5000000;
        const defaultOutput = rec.apiOption?.defaultOutputTokens || 1250000;
        initial[idx] = {
          inputMillions: defaultInput / 1000000,
          outputMillions: defaultOutput / 1000000
        };
      });
      setTokenAdjustments(initial);
    } else {
      setTokenAdjustments({});
    }
  }, [auditResult]);

  // Global scroll indicator to show scrollbar thumb only during active scrolling
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      document.documentElement.classList.add('is-scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.documentElement.classList.remove('is-scrolling');
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    // Gracefully respect users who prefer reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenisInstance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false
    });

    let rafId;
    function raf(time) {
      lenisInstance.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Save instance to window for global access
    window.lenis = lenisInstance;

    return () => {
      cancelAnimationFrame(rafId);
      lenisInstance.destroy();
      window.lenis = undefined;
    };
  }, []);

  // Scroll to top on view changes
  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentView]);

  // Spend comparison states
  const [comparisonBaseline, setComparisonBaseline] = useState(null);
  const [comparisonRecommended, setComparisonRecommended] = useState(null);

  const handlePurchase = async (planOrType, auditId = null) => {
    setApiError(null);
    const updatedUser = {
      ...(user || {}),
      plan: 'enterprise',
      subscription: {
        plan: 'enterprise',
        status: 'active',
        startedAt: new Date(),
        expiresAt: null,
        paymentMethod: 'Free Enterprise Access'
      },
      credits: { starter: 999, pro: 999, proMax: 999 },
      unlockedAudits: auditId ? [...new Set([...(user?.unlockedAudits || []), auditId])] : (user?.unlockedAudits || [])
    };
    setUser(updatedUser);
    localStorage.setItem('audex_user', JSON.stringify(updatedUser));
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/payment/verify-upi-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ planId: 'enterprise', auditId })
        });
      } catch (err) { console.warn('Free activation sync note:', err); }
    }

    setPurchasedPlanName('enterprise');
    setPurchasedCreditsCount(99);
    setShowPurchaseSuccess(true);
    if (auditId) {
      await loadPastAuditDetail(auditId, 'results');
    }
  };

  const handleCheckoutSuccess = async (updatedUser, planOrType) => {
    setShowCheckoutModal(false);
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('audex_user', JSON.stringify(updatedUser));
    }

    setPurchasedPlanName(planOrType);
    setPurchasedCreditsCount(planOrType === 'enterprise' ? 99 : (planOrType === 'pro' ? 29 : 19));
    setShowPurchaseSuccess(true);

    if (checkoutAuditId) {
      await loadPastAuditDetail(checkoutAuditId, 'results');
    } else if (currentView === 'free_results' && auditResult?._id) {
      await loadPastAuditDetail(auditResult._id, 'results');
    }
  };

  const renderCoinDropdown = () => {
    if (!user) return null;
    const plan = (user.plan || 'free').toLowerCase();
    const isEnterprise = plan === 'enterprise';
    const isPro = plan === 'pro';
    const planName = isEnterprise ? 'Enterprise Plan' : (isPro ? 'Professional Plan' : 'Free Plan');
    const shortPlanName = isEnterprise ? 'ENT' : (isPro ? 'PRO' : 'FREE');
    const badgeColor = isEnterprise ? '#8B5CF6' : (isPro ? '#10B981' : '#64748B');
    const bgColor = isEnterprise ? '#F5F3FF' : (isPro ? '#ECFDF5' : '#F1F5F9');

    return (
      <div className="coin-dropdown-container">
        <button 
          className="coin-btn" 
          onClick={() => setCurrentView('profile')}
          style={{
            backgroundColor: bgColor,
            border: `1px solid ${badgeColor}`,
            color: badgeColor,
            cursor: 'pointer'
          }}
          title={`Active Subscription: ${planName} (Click to manage)`}
        >
          <span className="coin-btn-full">✦ {planName}</span>
          <span className="coin-btn-short">✦ {shortPlanName}</span>
        </button>
      </div>
    );
  };

  // Run audit backend API post
  const triggerAudit = async () => {
    setCurrentView('loading');
    setApiError(null);

    const allocationsPayload = [];
    selectedToolIds.forEach(toolId => {
      const configs = toolConfigs[toolId] || [];
      const tool = tools.find(t => t.id === toolId);
      if (!tool) return;

      configs.forEach(config => {
        if (tool.type === 'subscription') {
          allocationsPayload.push({
            type: 'subscription',
            toolName: tool.name,
            plan: config.plan || 'Free',
            seats: parseInt(config.seats) || 1,
            purpose: config.purpose || 'Mixed'
          });
        } else if (tool.type === 'api') {
          allocationsPayload.push({
            type: 'api',
            toolName: tool.name,
            seats: 1,
            purpose: config.purpose || 'Mixed',
            modelId: config.modelId || tool.defaultModelId,
            inputTokens: parseFloat(config.inputTokens) || 10000000,
            outputTokens: parseFloat(config.outputTokens) || 2500000
          });
        }
      });
    });

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_URL}/audits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          optimizationGoal,
          costCutPercentage: parseFloat(costCutPercentage) || 50,
          allocations: allocationsPayload
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to run audit analysis on the server.');
      }

      const data = await response.json();
      setAuditResult(data);

      if (data.updatedCredits && user) {
        const updatedUser = { ...user, credits: data.updatedCredits };
        setUser(updatedUser);
        localStorage.setItem('audex_user', JSON.stringify(updatedUser));
      }

      // Pre-select options and token adjustments for Step 4
      const initialChoices = {};
      const initialTokenAdjustments = {};
      (data.savings?.recommendations || []).forEach((rec, idx) => {
        const apiSav = rec.apiOption ? rec.apiOption.savings : -Infinity;
        const subSav = rec.subscriptionOption ? rec.subscriptionOption.savings : -Infinity;
        initialChoices[idx] = apiSav >= subSav ? 'api' : 'subscription';

        const defaultInput = rec.apiOption?.defaultInputTokens || 5000000;
        const defaultOutput = rec.apiOption?.defaultOutputTokens || 1250000;
        initialTokenAdjustments[idx] = {
          inputMillions: defaultInput / 1000000,
          outputMillions: defaultOutput / 1000000
        };
      });
      setSelectedOptions(initialChoices);
      setTokenAdjustments(initialTokenAdjustments);

      // Scanner animation delay
      setTimeout(() => {
        setCurrentView('step4');
      }, 1200);
    } catch (err) {
      console.error(err);
      setApiError(err.message);
      setCurrentView('step3');
    }
  };

  // Fetch past audits
  const fetchPastAudits = async (overrideToken = null) => {
    const activeToken = overrideToken || token;
    if (!activeToken) {
      setAuthError(null);
      setAuthMessage('Please sign in to view your reports history.');
      setCurrentView('signin');
      return;
    }
    setApiError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/audits`, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (response.status === 401) {
        handleLogout();
        setAuthError('Your session has expired. Please sign in again.');
        setCurrentView('signin');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to load past audit history.');
      }
      const data = await response.json();
      setPastAudits(data);
      setCurrentView('history');
    } catch (err) {
      console.error(err);
      setApiError(err.message);
    }
  };

  // Delete an audit
  const handleDeleteAudit = async (auditId) => {
    const activeToken = token;
    if (!activeToken) {
      setAuthError(null);
      setAuthMessage('Please sign in to delete reports.');
      setCurrentView('signin');
      return;
    }
    setApiError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/audits/${auditId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (response.status === 401) {
        handleLogout();
        setAuthError('Your session has expired. Please sign in again.');
        setCurrentView('signin');
        return;
      }
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete saved report.');
      }
      // Refresh list
      await fetchPastAudits();
    } catch (err) {
      console.error(err);
      setApiError(err.message);
    }
  };

  const loadPastAuditDetail = async (id, targetView = 'results') => {
    setCurrentView('loading');
    try {
      const response = await fetch(`${BACKEND_URL}/audits/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load audit details.');
      }
      const data = await response.json();
      setAuditResult(data);
      
      const recs = data.savings?.recommendations || [];
      const initialTokens = {};
      recs.forEach((rec, idx) => {
        const defaultInput = rec.apiOption?.defaultInputTokens || 5000000;
        const defaultOutput = rec.apiOption?.defaultOutputTokens || 1250000;
        initialTokens[idx] = {
          inputMillions: defaultInput / 1000000,
          outputMillions: defaultOutput / 1000000
        };
      });
      setTokenAdjustments(initialTokens);

      if (data.selectedOptions && Object.keys(data.selectedOptions).length > 0) {
        setSelectedOptions(data.selectedOptions);
      } else {
        const initialChoices = {};
        recs.forEach((rec, idx) => {
          const apiSav = rec.apiOption ? rec.apiOption.savings : -Infinity;
          const subSav = rec.subscriptionOption ? rec.subscriptionOption.savings : -Infinity;
          initialChoices[idx] = apiSav >= subSav ? 'api' : 'subscription';
        });
        setSelectedOptions(initialChoices);
      }
      
      setCurrentView(targetView);
    } catch (err) {
      console.error(err);
      setApiError(err.message);
      setCurrentView('landing');
    }
  };

  const handleViewSample = (target = 'sample_report') => {
    try {
      setAuditResult(SAMPLE_AUDIT_DATA);
      setSelectedOptions(SAMPLE_AUDIT_DATA.selectedOptions || {});
      
      const initial = {};
      (SAMPLE_AUDIT_DATA.savings?.recommendations || []).forEach((rec, idx) => {
        const defaultInput = rec.apiOption?.defaultInputTokens || 10000000;
        const defaultOutput = rec.apiOption?.defaultOutputTokens || 2500000;
        initial[idx] = {
          inputMillions: defaultInput / 1000000,
          outputMillions: defaultOutput / 1000000
        };
      });
      setTokenAdjustments(initial);

      if (target === 'plan' || target === 'sample_plan') {
        setCurrentView('step4');
      } else {
        setCurrentView('sample_report');
      }
    } catch (err) {
      console.error('Failed to load sample audit report:', err);
      setCurrentView('landing');
    }
  };

  // URL routing synchronization & document title
  useEffect(() => {
    const viewParam = getViewUrlParam(currentView);
    const url = new URL(window.location.href);
    
    // Don't overwrite OAuth callback tokens during auth redirect handling
    const hasAuthParams = url.searchParams.has('google_token') || url.searchParams.has('github_token');
    if (!hasAuthParams) {
      if (viewParam) {
        url.searchParams.set('view', viewParam);
      } else {
        url.searchParams.delete('view');
      }
      
      const newQuery = url.searchParams.toString();
      const newUrl = url.pathname + (newQuery ? `?${newQuery}` : '') + url.hash;
      const currentQuery = window.location.search.replace(/^\?/, '');
      if (currentQuery !== newQuery) {
        window.history.pushState({ view: currentView }, '', newUrl);
      }
    }
    
    // Set dynamic document title for Google Search & tabs
    document.title = getViewTitle(currentView);
  }, [currentView]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const targetView = getViewFromUrl();
      if (targetView === 'pricing_scroll') {
        setCurrentView('landing');
        setTimeout(() => {
          const el = document.getElementById('pricing');
          if (el) {
            if (window.lenis) window.lenis.scrollTo(el);
            else el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      } else {
        setCurrentView(targetView);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial load auto-actions (e.g. loading sample report if direct link was opened)
  useEffect(() => {
    const initialView = getViewFromUrl();
    if (initialView === 'sample_report' && !auditResult) {
      handleViewSample();
    } else if (initialView === 'pricing_scroll') {
      setTimeout(() => {
        const el = document.getElementById('pricing');
        if (el) {
          if (window.lenis) window.lenis.scrollTo(el);
          else el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleAuthSubmit = async (payload, mode) => {
    setAuthLoading(true);
    setAuthError(null);

    const endpoint = mode === 'login' ? 'login' : 'register';

    try {
      const response = await fetch(`${BACKEND_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      localStorage.setItem('audex_token', data.token);
      localStorage.setItem('audex_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setAuthError(null);

      if (authMessage && authMessage.toLowerCase().includes('history')) {
        await fetchPastAudits(data.token);
      } else {
        setCurrentView('landing');
      }
      setAuthMessage(null);
    } catch (err) {
      console.error(err);
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('audex_token');
    localStorage.removeItem('audex_user');
    setToken(null);
    setUser(null);
    setCurrentView('landing');
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <div className="app-container">
            <Navbar 
              user={user} 
              onLogout={handleLogout} 
              onNavigateToHistory={() => fetchPastAudits()} 
              onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
              onNavigateToMarketIntel={() => setCurrentView('market_intel')}
              onNavigateToLanding={() => setCurrentView('landing')} 
              onNavigateToStep1={() => setCurrentView('step1')} 
              onNavigateToSignIn={() => setCurrentView('signin')}
              onNavigateToProfile={() => setCurrentView('profile')}
              activeView={currentView}
            />
            <LandingView 
              onNavigateToStep1={() => setCurrentView('step1')} 
              onViewSample={handleViewSample}
              onPurchase={handlePurchase}
              onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
              onNavigateToMarketIntel={() => setCurrentView('market_intel')}
            />
            <Footer 
              onNavigateToStep1={() => setCurrentView('step1')}
              onNavigateToLanding={() => setCurrentView('landing')}
              onViewSample={handleViewSample}
              onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
              onNavigateToMarketIntel={() => setCurrentView('market_intel')}
            />
          </div>
        );
      
      case 'step1':
      case 'step2':
      case 'step3':
        return (
          <WizardFlow 
            currentView={currentView}
            onNavigateToView={(view) => setCurrentView(view)}
            tools={tools}
            setTools={setTools}
            selectedToolIds={selectedToolIds}
            setSelectedToolIds={setSelectedToolIds}
            toolConfigs={toolConfigs}
            setToolConfigs={setToolConfigs}
            teamSize={teamSize}
            setTeamSize={setTeamSize}
            useCase={useCase}
            setUseCase={setUseCase}
            optimizationGoal={optimizationGoal}
            setOptimizationGoal={setOptimizationGoal}
            costCutPercentage={costCutPercentage}
            setCostCutPercentage={setCostCutPercentage}
            user={user}
            apiError={apiError}
            onTriggerAudit={triggerAudit}
          />
        );

      case 'loading':
        return <LoadingIndicator />;

      case 'results':
        return (
          <ResultsView 
            auditResult={auditResult}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            onNavigateToView={(view) => setCurrentView(view)}
            user={user}
            renderCoinDropdown={renderCoinDropdown}
            tokenAdjustments={tokenAdjustments}
            setTokenAdjustments={setTokenAdjustments}
            onPurchase={handlePurchase}
          />
        );

      case 'sample_report':
        return (
          <ResultsView 
            auditResult={auditResult}
            selectedOptions={selectedOptions}
            onNavigateToView={(view) => setCurrentView(view)}
            user={user}
            renderCoinDropdown={renderCoinDropdown}
            tokenAdjustments={tokenAdjustments}
            setTokenAdjustments={setTokenAdjustments}
            isSample={true}
          />
        );

      case 'step4': {
        const activeAudit = auditResult || SAMPLE_AUDIT_DATA;
        const activeSelectedOptions = Object.keys(selectedOptions).length > 0 
          ? selectedOptions 
          : (activeAudit.selectedOptions || (() => {
              const initial = {};
              (activeAudit.savings?.recommendations || []).forEach((rec, idx) => {
                const apiSav = rec.apiOption ? rec.apiOption.savings : -Infinity;
                const subSav = rec.subscriptionOption ? rec.subscriptionOption.savings : -Infinity;
                initial[idx] = apiSav >= subSav ? 'api' : 'subscription';
              });
              return initial;
            })());

        return (
          <ActionPlanView 
            auditResult={activeAudit}
            selectedOptions={activeSelectedOptions}
            setSelectedOptions={setSelectedOptions}
            tokenAdjustments={tokenAdjustments}
            setTokenAdjustments={setTokenAdjustments}
            onNavigateToView={(view) => {
              if (view === 'results' && activeAudit?._id && token) {
                // Persist choices to MongoDB
                fetch(`${BACKEND_URL}/audits/${activeAudit._id}/options`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ selectedOptions: activeSelectedOptions })
                }).catch(err => console.error('Failed to save selected options:', err));
              }
              if (view === 'results' && (activeAudit?._id === 'sample_audit_2026' || activeAudit?._id === '6a4fb719471a97ae89e88f49')) {
                setCurrentView('sample_report');
              } else {
                setCurrentView(view);
              }
            }}
          />
        );
      }

      case 'saved_plan':
      case 'saved_report':
        return (
          <ResultsView 
            auditResult={auditResult}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            onNavigateToView={(view) => {
              if (view === 'history') {
                fetchPastAudits();
              }
              setCurrentView(view);
            }}
            user={user}
            renderCoinDropdown={renderCoinDropdown}
            initialView="detailed"
            fromHistory={true}
            tokenAdjustments={tokenAdjustments}
            setTokenAdjustments={setTokenAdjustments}
            onPurchase={handlePurchase}
          />
        );

      case 'history':
        return (
          <HistoryView 
            pastAudits={pastAudits}
            user={user}
            token={token}
            backendUrl={BACKEND_URL}
            onLogout={handleLogout}
            onNavigateToView={(view) => setCurrentView(view)}
            onLoadPastAuditDetail={loadPastAuditDetail}
            onRefreshList={() => fetchPastAudits()}
            renderCoinDropdown={renderCoinDropdown}
            onDeleteAudit={handleDeleteAudit}
          />
        );

      case 'model_auditor': {
        return (
          <ModelAuditorView 
            onNavigateToView={(view) => setCurrentView(view)}
            user={user}
            token={token}
            onPurchase={handlePurchase}
            renderCoinDropdown={renderCoinDropdown}
            onCompareModels={(base, rec) => {
              setComparisonBaseline(base);
              setComparisonRecommended(rec);
              setCurrentView('comparison');
            }}
            optimizationGoal={optimizationGoal}
            setOptimizationGoal={setOptimizationGoal}
            costCutPercentage={costCutPercentage}
            setCostCutPercentage={setCostCutPercentage}
            targetUseCase={useCase}
            setTargetUseCase={setUseCase}
          />
        );
      }

      case 'comparison':
        return (
          <ComparisonView
            baseline={comparisonBaseline}
            recommended={comparisonRecommended}
            onNavigateBack={() => setCurrentView('model_auditor')}
            token={token}
            onUpdateCredits={(updatedCredits) => {
              if (user) {
                const updatedUser = { ...user, credits: updatedCredits };
                setUser(updatedUser);
                localStorage.setItem('audex_user', JSON.stringify(updatedUser));
              }
            }}
          />
        );

      case 'market_intel':
        return (
          <MarketIntelView 
            onNavigateToView={(view) => setCurrentView(view)}
            user={user}
            renderCoinDropdown={renderCoinDropdown}
          />
        );

      case 'profile':
        return (
          <ProfileView 
            user={user}
            token={token}
            onNavigateToView={(view) => setCurrentView(view)}
            onNavigateToLanding={() => setCurrentView('landing')}
            onNavigateToStep1={() => setCurrentView('step1')}
            onNavigateToHistory={() => fetchPastAudits()}
            onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
            onNavigateToMarketIntel={() => setCurrentView('market_intel')}
            onNavigateToSignIn={() => setCurrentView('signin')}
            onLogout={handleLogout}
            onPurchase={handlePurchase}
            renderCoinDropdown={renderCoinDropdown}
          />
        );

      case 'signin':
        return (
          <SignInView 
            authError={authError}
            setAuthError={setAuthError}
            authMessage={authMessage}
            setAuthMessage={setAuthMessage}
            authLoading={authLoading}
            onAuthSubmit={handleAuthSubmit}
            onNavigateToView={(view) => setCurrentView(view)}
          />
        );

      case 'signup':
        return (
          <SignUpView 
            authError={authError}
            setAuthError={setAuthError}
            authMessage={authMessage}
            setAuthMessage={setAuthMessage}
            authLoading={authLoading}
            onAuthSubmit={handleAuthSubmit}
            onNavigateToView={(view) => setCurrentView(view)}
          />
        );

      default:
        return (
          <div className="app-container">
            <Navbar 
              user={user} 
              onLogout={handleLogout} 
              onNavigateToHistory={() => fetchPastAudits()} 
              onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
              onNavigateToMarketIntel={() => setCurrentView('market_intel')}
              onNavigateToLanding={() => setCurrentView('landing')} 
              onNavigateToStep1={() => setCurrentView('step1')} 
              onNavigateToSignIn={() => setCurrentView('signin')}
              onNavigateToProfile={() => setCurrentView('profile')}
              activeView={currentView}
            />
            <LandingView 
              onNavigateToStep1={() => setCurrentView('step1')} 
              onViewSample={handleViewSample}
              onPurchase={handlePurchase}
              onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
              onNavigateToMarketIntel={() => setCurrentView('market_intel')}
            />
            <Footer 
              onNavigateToStep1={() => setCurrentView('step1')}
              onNavigateToLanding={() => setCurrentView('landing')}
              onViewSample={handleViewSample}
              onNavigateToModelAuditor={() => setCurrentView('model_auditor')}
              onNavigateToMarketIntel={() => setCurrentView('market_intel')}
            />
          </div>
        );
    }
  };

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<LoadingIndicator />}>
          {renderActiveView()}
        </Suspense>
      </ErrorBoundary>
      <CheckoutModal
        show={showCheckoutModal}
        type={checkoutPlanType}
        auditId={checkoutAuditId}
        token={token}
        onConfirm={handleCheckoutSuccess}
        onClose={() => setShowCheckoutModal(false)}
      />
      <PurchaseSuccessModal 
        show={showPurchaseSuccess} 
        planName={purchasedPlanName} 
        creditsCount={purchasedCreditsCount} 
        onClose={() => setShowPurchaseSuccess(false)} 
      />
    </>
  );
}
