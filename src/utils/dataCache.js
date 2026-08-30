import { API_BASE_URL } from '../config';

// In-memory runtime cache
const memoryCache = {
  rawData: null,
  modelsList: null,
  subscriptionTiers: null,
  promises: {}
};

/**
 * Safe browser storage accessor that catches QuotaExceededError and quota overflows.
 */
function safeGetStorage(key) {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  try {
    const item = window.sessionStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item);
  } catch {
    return null;
  }
}

function safeSetStorage(key, data) {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    const serialized = JSON.stringify(data);
    // Don't attempt to store payloads larger than 2.5MB in sessionStorage to avoid quota errors
    if (serialized.length > 2.5 * 1024 * 1024) return;
    window.sessionStorage.setItem(key, serialized);
  } catch {
    // Gracefully ignore storage quota limits
  }
}

/**
 * Get raw market data with request deduplication and in-memory/session storage caching
 */
export async function getCachedRawData(forceRefresh = false) {
  if (!forceRefresh && memoryCache.rawData) {
    return memoryCache.rawData;
  }

  // Check storage for fast warm starts across page navigation
  if (!forceRefresh) {
    const cached = safeGetStorage('audex_raw_data');
    if (cached && (cached.llms || cached.sources)) {
      memoryCache.rawData = cached;
      return cached;
    }
  }

  // De-duplicate in-flight requests
  if (memoryCache.promises.rawData) {
    return memoryCache.promises.rawData;
  }

  memoryCache.promises.rawData = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/audits/analysis/raw-data`);
      if (!res.ok) throw new Error(`Failed to fetch raw market data: ${res.statusText}`);
      const data = await res.json();
      memoryCache.rawData = data;
      safeSetStorage('audex_raw_data', data);
      return data;
    } finally {
      delete memoryCache.promises.rawData;
    }
  })();

  return memoryCache.promises.rawData;
}

/**
 * Get models list with request deduplication and caching
 */
export async function getCachedModelsList(forceRefresh = false) {
  if (!forceRefresh && memoryCache.modelsList) {
    return memoryCache.modelsList;
  }

  if (!forceRefresh) {
    const cached = safeGetStorage('audex_models_list');
    if (Array.isArray(cached) && cached.length > 0) {
      memoryCache.modelsList = cached;
      return cached;
    }
  }

  if (memoryCache.promises.modelsList) {
    return memoryCache.promises.modelsList;
  }

  memoryCache.promises.modelsList = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/audits/models/list`);
      if (!res.ok) throw new Error(`Failed to fetch models list: ${res.statusText}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        memoryCache.modelsList = data;
        safeSetStorage('audex_models_list', data);
      }
      return data;
    } finally {
      delete memoryCache.promises.modelsList;
    }
  })();

  return memoryCache.promises.modelsList;
}

/**
 * Get subscription tiers list with request deduplication and caching
 */
export async function getCachedSubscriptionTiers(forceRefresh = false) {
  if (!forceRefresh && memoryCache.subscriptionTiers) {
    return memoryCache.subscriptionTiers;
  }

  if (!forceRefresh) {
    const cached = safeGetStorage('audex_sub_tiers');
    if (Array.isArray(cached) && cached.length > 0) {
      memoryCache.subscriptionTiers = cached;
      return cached;
    }
  }

  if (memoryCache.promises.subscriptionTiers) {
    return memoryCache.promises.subscriptionTiers;
  }

  memoryCache.promises.subscriptionTiers = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/audits/subscription-tiers/list`);
      if (!res.ok) throw new Error(`Failed to fetch subscription tiers: ${res.statusText}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        memoryCache.subscriptionTiers = data;
        safeSetStorage('audex_sub_tiers', data);
      }
      return data;
    } finally {
      delete memoryCache.promises.subscriptionTiers;
    }
  })();

  return memoryCache.promises.subscriptionTiers;
}

/**
 * Warm the cache in the background during idle time
 */
export function preloadCoreData() {
  if (typeof window === 'undefined') return;
  const runner = () => {
    getCachedSubscriptionTiers().catch(() => {});
    getCachedModelsList().catch(() => {});
    getCachedRawData().catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(runner, { timeout: 3000 });
  } else {
    setTimeout(runner, 1200);
  }
}
