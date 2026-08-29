// Hardcoded Canonical Sample Audit Report
// Matches exact user specifications: 21 July 2026, 11:13 pm, +$140.74/mo savings, 11 seats, Performance Preservation Mode, 7 tools.

export const SAMPLE_AUDIT_DATA = {
  _id: 'sample_audit_2026',
  userId: 'sample_enterprise_user',
  createdAt: '2026-07-21T23:13:00.000Z',
  teamSize: 11,
  useCase: 'Coding & Mixed Workloads',
  optimizationGoal: 'performance',
  costCutPercentage: 50,
  isUnlocked: true,
  totalCurrentCost: 319.97,
  tierUsed: 'pro',
  selectedOptions: {
    '0': 'api',
    '1': 'api',
    '2': 'api',
    '3': 'api',
    '4': 'subscription',
    '5': 'subscription',
    '6': 'subscription'
  },
  allocations: [
    {
      _id: 'alloc_openai',
      type: 'subscription',
      toolName: 'OpenAI',
      plan: 'ChatGPT Plus',
      seats: 1,
      purpose: 'Mixed',
      pricePerSeat: 20.00,
      currentCost: 20.00,
      baselineModels: ['GPT-5.6 Sol (high)', 'GPT-5.5 (medium)', 'GPT-4o mini'],
      baselineModelId: 'openai/gpt-5-6-sol-high'
    },
    {
      _id: 'alloc_anthropic',
      type: 'subscription',
      toolName: 'Anthropic',
      plan: 'Claude Pro',
      seats: 5,
      purpose: 'Mixed',
      pricePerSeat: 25.00,
      currentCost: 125.00,
      baselineModels: ['Claude Opus 5', 'Claude Sonnet 3.7', 'Claude Haiku 3.5'],
      baselineModelId: 'anthropic/claude-opus-5'
    },
    {
      _id: 'alloc_google',
      type: 'subscription',
      toolName: 'Google',
      plan: 'Gemini Advanced',
      seats: 1,
      purpose: 'Mixed',
      pricePerSeat: 19.99,
      currentCost: 19.99,
      baselineModels: ['Gemini 3.5 Flash', 'Gemini 3.0 Pro'],
      baselineModelId: 'google/gemini-3-5-flash'
    },
    {
      _id: 'alloc_claude_fable',
      type: 'api',
      toolName: 'Anthropic: Claude Fable 5',
      modelId: 'anthropic/claude-fable-5',
      seats: 1,
      purpose: 'Coding',
      inputTokens: 10000000,
      outputTokens: 2500000,
      currentCost: 124.99,
      baselineModels: ['Claude Fable 5 (Adaptive Reasoning, Max Effort)'],
      baselineModelId: 'anthropic/claude-fable-5'
    },
    {
      _id: 'alloc_mistral',
      type: 'subscription',
      toolName: 'Mistral',
      plan: 'Le Chat Pro',
      seats: 2,
      purpose: 'Coding',
      pricePerSeat: 14.99,
      currentCost: 29.98,
      baselineModels: ['Mistral Large', 'Codestral 25.01'],
      baselineModelId: 'mistralai/mistral-large'
    },
    {
      _id: 'alloc_meta',
      type: 'subscription',
      toolName: 'Meta',
      plan: 'Meta One',
      seats: 1,
      purpose: 'Research',
      pricePerSeat: 0.00,
      currentCost: 0.00,
      baselineModels: ['Llama 4 Maverick', 'Llama 3.3 70B'],
      baselineModelId: 'meta-llama/llama-4-maverick'
    },
    {
      _id: 'alloc_deepseek',
      type: 'subscription',
      toolName: 'DeepSeek',
      plan: 'Consumer',
      seats: 1,
      purpose: 'Data',
      pricePerSeat: 0.00,
      currentCost: 0.00,
      baselineModels: ['DeepSeek V4 Pro', 'DeepSeek V3.2'],
      baselineModelId: 'deepseek/deepseek-v4-pro'
    }
  ],
  savings: {
    totalMonthly: 140.74,
    totalAnnual: 1688.88,
    totalOptimizedSpend: 179.23,
    percentageSavings: 44.0,
    recommendations: [
      {
        _id: 'rec_openai',
        tool: 'OpenAI (1 seat for Mixed)',
        issue: 'Paying $20.00/mo for 1 ChatGPT Plus subscription license',
        action: 'Transition active users to direct API keys using DeepSeek V4 Flash (Reasoning).',
        monthlySavings: 12.50,
        originalAlloc: {
          type: 'subscription',
          toolName: 'OpenAI',
          plan: 'ChatGPT Plus',
          seats: 1,
          purpose: 'Mixed',
          currentCost: 20.00,
          provider: 'OpenAI',
          modelName: 'ChatGPT Plus'
        },
        apiOption: {
          name: 'DeepSeek V4 Flash (Reasoning, Max Effort)',
          modelId: 'deepseek/deepseek-v4-flash',
          cost: 7.50,
          savings: 12.50,
          action: 'Transition active users to direct API keys using DeepSeek V4 Flash.',
          limits: 'Pay-as-you-go rates: $0.14/1M input, $0.28/1M output. Context: 1M tokens.',
          recommendedModel: 'DeepSeek V4 Flash',
          recommendedProvider: 'DeepSeek',
          inputCostPerM: 0.14,
          outputCostPerM: 0.28,
          defaultInputTokens: 10000000,
          defaultOutputTokens: 2500000
        },
        subscriptionOption: {
          planName: 'ChatGPT Plus',
          cost: 20.00,
          savings: 0.00,
          action: 'Maintain current ChatGPT Plus subscription.',
          limits: 'Standard Plus rate limits apply.',
          recommendedModel: 'ChatGPT Plus',
          recommendedProvider: 'OpenAI'
        }
      },
      {
        _id: 'rec_anthropic',
        tool: 'Anthropic (5 seats for Mixed)',
        issue: 'Paying $125.00/mo across 5 Claude Pro subscription seats',
        action: 'Transition active developers to Claude 3.7 Sonnet direct API with prompt caching.',
        monthlySavings: 68.50,
        originalAlloc: {
          type: 'subscription',
          toolName: 'Anthropic',
          plan: 'Claude Pro',
          seats: 5,
          purpose: 'Mixed',
          currentCost: 125.00,
          provider: 'Anthropic',
          modelName: 'Claude Pro'
        },
        apiOption: {
          name: 'Claude 3.7 Sonnet (Hybrid Reasoning)',
          modelId: 'anthropic/claude-3-7-sonnet',
          cost: 56.50,
          savings: 68.50,
          action: 'Transition to Claude 3.7 Sonnet API with prompt caching.',
          limits: 'Pay-as-you-go rates: $3.00/1M input, $15.00/1M output. Prompt caching saves up to 90%.',
          recommendedModel: 'Claude 3.7 Sonnet',
          recommendedProvider: 'Anthropic',
          inputCostPerM: 3.00,
          outputCostPerM: 15.00,
          defaultInputTokens: 10000000,
          defaultOutputTokens: 2500000
        },
        subscriptionOption: {
          planName: 'Claude Team',
          cost: 125.00,
          savings: 0.00,
          action: 'Maintain Anthropic subscription seats.',
          limits: 'Standard Team seats.',
          recommendedModel: 'Claude Team',
          recommendedProvider: 'Anthropic'
        }
      },
      {
        _id: 'rec_google',
        tool: 'Google (1 seat for Mixed)',
        issue: 'Paying $19.99/mo for Gemini Advanced subscription',
        action: 'Transition to Gemini 3.5 Flash API with 1M context cache.',
        monthlySavings: 14.20,
        originalAlloc: {
          type: 'subscription',
          toolName: 'Google',
          plan: 'Gemini Advanced',
          seats: 1,
          purpose: 'Mixed',
          currentCost: 19.99,
          provider: 'Google',
          modelName: 'Gemini Advanced'
        },
        apiOption: {
          name: 'Gemini 3.5 Flash (Thinking)',
          modelId: 'google/gemini-3-5-flash',
          cost: 5.79,
          savings: 14.20,
          action: 'Transition to Gemini 3.5 Flash direct API.',
          limits: 'Pay-as-you-go rates: $0.10/1M input, $0.40/1M output. Context: 1M tokens.',
          recommendedModel: 'Gemini 3.5 Flash',
          recommendedProvider: 'Google',
          inputCostPerM: 0.10,
          outputCostPerM: 0.40,
          defaultInputTokens: 10000000,
          defaultOutputTokens: 2500000
        },
        subscriptionOption: {
          planName: 'Gemini Advanced',
          cost: 19.99,
          savings: 0.00,
          action: 'Maintain Gemini Advanced subscription.',
          limits: 'Standard limits.',
          recommendedModel: 'Gemini Advanced',
          recommendedProvider: 'Google'
        }
      },
      {
        _id: 'rec_claude_fable',
        tool: 'Anthropic: Claude Fable 5 API (12.5M tokens for Coding)',
        issue: 'Paying $124.99/mo for direct Claude Fable 5 API tokens',
        action: 'Route routine code queries to Claude 3.7 Sonnet API and reserve Fable for complex architecture.',
        monthlySavings: 45.54,
        originalAlloc: {
          type: 'api',
          toolName: 'Anthropic: Claude Fable 5',
          modelId: 'anthropic/claude-fable-5',
          seats: 1,
          purpose: 'Coding',
          currentCost: 124.99,
          provider: 'Anthropic',
          modelName: 'Claude Fable 5'
        },
        apiOption: {
          name: 'Claude 3.7 Sonnet (Hybrid Reasoning)',
          modelId: 'anthropic/claude-3-7-sonnet',
          cost: 79.45,
          savings: 45.54,
          action: 'Route routine code queries to Claude 3.7 Sonnet API.',
          limits: 'Pay-as-you-go rates: $3.00/1M input, $15.00/1M output.',
          recommendedModel: 'Claude 3.7 Sonnet',
          recommendedProvider: 'Anthropic',
          inputCostPerM: 3.00,
          outputCostPerM: 15.00,
          defaultInputTokens: 10000000,
          defaultOutputTokens: 2500000
        },
        subscriptionOption: {
          planName: 'Claude Pro',
          cost: 20.00,
          savings: 104.99,
          action: 'Migrate to Claude Pro subscription.',
          limits: 'Standard rate limits.',
          recommendedModel: 'Claude Pro',
          recommendedProvider: 'Anthropic'
        }
      },
      {
        _id: 'rec_mistral',
        tool: 'Mistral (2 seats for Coding)',
        issue: 'Paying $29.98/mo for 2 Le Chat Pro seats',
        action: 'Current deployment is optimal for multilingual code assistance.',
        monthlySavings: 0.00,
        originalAlloc: {
          type: 'subscription',
          toolName: 'Mistral',
          plan: 'Le Chat Pro',
          seats: 2,
          purpose: 'Coding',
          currentCost: 29.98,
          provider: 'Mistral',
          modelName: 'Le Chat Pro'
        },
        apiOption: {
          name: 'Codestral 25.01 (Coding Specialist)',
          modelId: 'mistralai/codestral-2501',
          cost: 29.98,
          savings: 0.00,
          statusText: 'Optimized',
          action: 'Current deployment is cost-optimal.',
          limits: 'Standard API rates.',
          recommendedModel: 'Codestral 25.01',
          recommendedProvider: 'Mistral',
          inputCostPerM: 0.30,
          outputCostPerM: 0.90,
          defaultInputTokens: 10000000,
          defaultOutputTokens: 2500000
        },
        subscriptionOption: {
          planName: 'Le Chat Pro',
          cost: 29.98,
          savings: 0.00,
          action: 'Keep active Le Chat Pro seats.',
          limits: 'Standard limits.',
          recommendedModel: 'Le Chat Pro',
          recommendedProvider: 'Mistral'
        }
      },
      {
        _id: 'rec_meta',
        tool: 'Meta (1 seat for Research)',
        issue: 'Using Meta AI free tier (0/mo spend)',
        action: 'Current setup is free and optimized.',
        monthlySavings: 0.00,
        originalAlloc: {
          type: 'subscription',
          toolName: 'Meta',
          plan: 'Meta One',
          seats: 1,
          purpose: 'Research',
          currentCost: 0.00,
          provider: 'Meta',
          modelName: 'Meta One'
        },
        apiOption: {
          name: 'Llama 4 Maverick (Open Source)',
          modelId: 'meta-llama/llama-4-maverick',
          cost: 0.00,
          savings: 0.00,
          statusText: 'Optimized',
          action: 'Current open model access is fully optimal.',
          limits: 'Free / self-hosted.',
          recommendedModel: 'Llama 4 Maverick',
          recommendedProvider: 'Meta'
        },
        subscriptionOption: {
          planName: 'Meta One',
          cost: 0.00,
          savings: 0.00,
          action: 'Continue free tier.',
          limits: 'Standard limits.',
          recommendedModel: 'Meta One',
          recommendedProvider: 'Meta'
        }
      },
      {
        _id: 'rec_deepseek',
        tool: 'DeepSeek (1 seat for Data)',
        issue: 'Using DeepSeek free access tier (0/mo spend)',
        action: 'Current data analysis setup is free and optimized.',
        monthlySavings: 0.00,
        originalAlloc: {
          type: 'subscription',
          toolName: 'DeepSeek',
          plan: 'Consumer',
          seats: 1,
          purpose: 'Data',
          currentCost: 0.00,
          provider: 'DeepSeek',
          modelName: 'Consumer'
        },
        apiOption: {
          name: 'DeepSeek V4 Pro (Reasoning)',
          modelId: 'deepseek/deepseek-v4-pro',
          cost: 0.00,
          savings: 0.00,
          statusText: 'Optimized',
          action: 'Keep using DeepSeek V4.',
          limits: 'Standard access.',
          recommendedModel: 'DeepSeek V4 Pro',
          recommendedProvider: 'DeepSeek'
        },
        subscriptionOption: {
          planName: 'Consumer',
          cost: 0.00,
          savings: 0.00,
          action: 'Continue free tier.',
          limits: 'Standard limits.',
          recommendedModel: 'Consumer',
          recommendedProvider: 'DeepSeek'
        }
      }
    ]
  }
};
