/**
 * Local storage utilities with type safety
 */

export const storage = {
  getToken: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error)
      return null
    }
  },

  setToken: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error)
    }
  },

  removeToken: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from storage: ${key}`, error)
    }
  },

  clearAll: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing storage', error)
    }
  },

  getAccessToken: (): string | null => {
    return storage.getToken('access_token')
  },

  setAccessToken: (token: string): void => {
    storage.setToken('access_token', token)
  },

  getRefreshToken: (): string | null => {
    return storage.getToken('refresh_token')
  },

  setRefreshToken: (token: string): void => {
    storage.setToken('refresh_token', token)
  },

  clearTokens: (): void => {
    storage.removeToken('access_token')
    storage.removeToken('refresh_token')
  },
}

export default storage
