/**
 * CRIMENET AI - Centralized Environment Configuration
 * Evaluates runtime URLs dynamically and prevents hardcoded development origins
 * or sensitive secrets from leaking into production builds.
 */

export const getApiBaseUrl = () => {
  // 1. Explicit environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    const raw = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }

  // 2. Browser runtime determination
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // Production / Deployed environment (e.g. Vercel, cloud domain)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${window.location.origin}/api`;
    }
    // Local development: use relative /api (handled by Vite proxy with cloud fallback)
    return '/api';
  }

  // 3. Fallback relative path
  return '/api';
};

export const ENV_CONFIG = {
  get apiBaseUrl() {
    return getApiBaseUrl();
  },
  isDemo: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CRIMENET_ENV === 'demo') || true,
  isProduction: typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'production',
  defaultTimeoutMs: 8000
};
