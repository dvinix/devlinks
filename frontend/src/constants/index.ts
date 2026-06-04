/**
 * Application Constants
 * Centralized configuration for API endpoints, routes, and app settings
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  ENDPOINTS: {
    AUTH: '/auth',
    LINKS: '/links',
    ANALYTICS: '/analytics',
    QR: '/links/qr',
    REDIRECT: '/',
  },
  TIMEOUT: 10000,
}

export const APP_ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  USER_DASHBOARD: (username) => `/${username}/links`,
  LINK_DETAILS: (username, slug) => `/${username}/links/${slug}`,
}

export const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
}

export const APP_INFO = {
  NAME: 'DevLinks',
  VERSION: '1.0.0',
  DESCRIPTION: 'URL Shortener with Analytics',
}

export const FIREBASE_ERRORS = {
  INVALID_TOKEN: 'Invalid Firebase token',
  NETWORK_ERROR: 'Network error',
  UNAUTHORIZED: 'Unauthorized',
}
