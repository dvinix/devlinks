import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { API_CONFIG } from '../constants'
import storage from './storage'
import { handleApiError, getErrorMessage } from './errors'

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
})

// Request interceptor: Add Bearer token
api.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor: Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = storage.getRefreshToken()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const { access_token } = response.data
        storage.setAccessToken(access_token)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        // Clear auth and redirect to login
        storage.clearTokens()
        useAuthStore.getState().logout()
        window.location.href = '/auth'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(handleApiError(error))
  }
)

export default api
