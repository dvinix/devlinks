/**
 * Service layer for API calls
 * Encapsulates all backend communication
 */

import { api } from '../lib/api'

export const linkService = {
  // Get all links for current user
  getAllLinks: async (headers?: any) => {
    return api.get('/links', { headers })
  },

  // Create a new short link
  createLink: async (payload: { original_url: string }, headers?: any) => {
    return api.post('/links', payload, { headers })
  },

  // Delete a link
  deleteLink: async (slug: string, headers?: any) => {
    return api.delete(`/links/${slug}`, { headers })
  },

  // Get QR code for a link
  getQRCode: async (slug: string, headers?: any) => {
    return api.get(`/links/qr/${slug}`, { headers })
  },

  // Get analytics for a link
  getAnalytics: async (slug: string, days: number = 30, headers?: any) => {
    return api.get(`/analytics/${slug}?days=${days}`, { headers })
  },
}

export const authService = {
  // Register new user
  register: async (payload: { username: string; email: string; password: string }) => {
    return api.post('/auth/register', payload)
  },

  // Login user
  login: async (payload: { email: string; password: string }) => {
    return api.post('/auth/login', payload)
  },

  // Refresh access token
  refreshToken: async (refreshToken: string) => {
    return api.post('/auth/refresh', { refresh_token: refreshToken })
  },

  // Firebase authentication
  firebaseAuth: async (payload: { id_token: string }) => {
    return api.post('/auth/firebase', payload)
  },
}
