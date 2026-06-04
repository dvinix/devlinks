/**
 * Environment Configuration
 * Validates and exposes environment variables
 */

interface EnvConfig {
  apiBaseUrl: string
  firebaseApiKey: string | undefined
  firebaseAuthDomain: string | undefined
  firebaseProjectId: string | undefined
  isDevelopment: boolean
  isProduction: boolean
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[`VITE_${key}`]
  if (!value && !defaultValue) {
    console.warn(`Environment variable VITE_${key} is not set`)
    return defaultValue || ''
  }
  return value || defaultValue || ''
}

export const env: EnvConfig = {
  apiBaseUrl: getEnvVar('API_BASE_URL', 'http://localhost:8000'),
  firebaseApiKey: getEnvVar('FIREBASE_API_KEY'),
  firebaseAuthDomain: getEnvVar('FIREBASE_AUTH_DOMAIN'),
  firebaseProjectId: getEnvVar('FIREBASE_PROJECT_ID'),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}

export default env
