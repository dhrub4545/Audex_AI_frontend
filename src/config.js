// Audex AI Frontend Config - Deployed 2026-07-28
let baseUrl = import.meta.env.VITE_API_URL;

if (!baseUrl) {
  // If running in production browser on a domain (like www.audexai.in), default to /api or deployed backend
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    baseUrl = '/api';
  } else {
    baseUrl = 'http://localhost:5000/api';
  }
}

// Strip accidental VITE_API_URL= prefix if typed into environment variable value
if (baseUrl.includes('VITE_API_URL=')) {
  baseUrl = baseUrl.split('VITE_API_URL=')[1];
}

// Strip leading slashes if absolute URL became relative
if (baseUrl.startsWith('/http')) {
  baseUrl = baseUrl.replace(/^\/+/, '');
} else if (baseUrl.startsWith('/') && baseUrl.includes('vercel.app')) {
  baseUrl = 'https://' + baseUrl.replace(/^\/+/, '');
}

// Remove trailing slash
if (baseUrl.endsWith('/')) {
  baseUrl = baseUrl.slice(0, -1);
}

// Ensure it ends with /api
if (!baseUrl.endsWith('/api')) {
  baseUrl = baseUrl + '/api';
}

export const API_BASE_URL = baseUrl;
