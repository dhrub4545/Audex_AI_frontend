let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Remove trailing slash
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1);
}

// Ensure it ends with /api
if (!baseUrl.endsWith('/api')) {
  baseUrl = baseUrl + '/api';
}

export const API_BASE_URL = baseUrl;
