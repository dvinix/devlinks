import { create } from 'zustand'
import { UserResponse, AuthTokens } from '../types'
import storage from '../lib/storage'

interface AuthStore {
  user: UserResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  
  setUser: (user: UserResponse | null) => void
  setIsAuthenticated: (authenticated: boolean) => void
  setIsLoading: (loading: boolean) => void
  logout: () => void
  
  // Initialize from localStorage on app load
  initializeAuth: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),
  setIsAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  logout: () => {
    storage.clearTokens()
    set({ user: null, isAuthenticated: false })
  },

  initializeAuth: () => {
    const token = storage.getAccessToken()
    if (token) {
      set({ isAuthenticated: true })
    } else {
      set({ isAuthenticated: false })
    }
    set({ isLoading: false })
  },
}))
