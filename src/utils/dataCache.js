import { API_BASE_URL } from '../config';

// In-memory runtime cache
const memoryCache = {
  rawData: null,
  modelsList: null,
  subscriptionTiers: null,
  promises: {}
};

/**
 * Get raw market data with request deduplication and in-memory/session storage caching
 */
export async function getCachedRawData(forceRefresh = false) {
  if (!forceRefresh && memoryCache.rawData) {
    return memoryCache.rawData;
  }

  // Check sessionStorage for fast warm starts across page navigation
  if (!forceRefresh && typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const cached = sessionStorage.getItem('audex_raw_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.llms || parsed.sources)) {
          memoryCache.rawData = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
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
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('audex_raw_data', JSON.stringify(data));
        }
      } catch {
        // Ignore sessionStorage write errors
      }
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

  if (!forceRefresh && typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const cached = sessionStorage.getItem('audex_models_list');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCache.modelsList = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
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
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem('audex_models_list', JSON.stringify(data));
          }
        } catch {
          // Ignore sessionStorage write errors
        }
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

  if (!forceRefresh && typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const cached = sessionStorage.getItem('audex_sub_tiers');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCache.subscriptionTiers = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
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
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem('audex_sub_tiers', JSON.stringify(data));
          }
        } catch {
          // Ignore sessionStorage write errors
        }
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
