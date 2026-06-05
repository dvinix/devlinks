import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { env } from '../config/env'

// Firebase config object
const firebaseConfig = {
  apiKey: env.firebaseApiKey,
  authDomain: env.firebaseAuthDomain,
  projectId: env.firebaseProjectId,
}

// Validate Firebase config
const hasFirebaseConfig = firebaseConfig.apiKey && firebaseConfig.projectId
if (!hasFirebaseConfig && env.isProduction) {
  console.warn('Firebase configuration is incomplete')
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export const isFirebaseConfigured = (): boolean => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain)
}
