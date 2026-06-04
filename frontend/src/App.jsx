import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Auth from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { useAuthStore } from './store/authStore'
import storage from './lib/storage'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore()
  const token = storage.getAccessToken()
  
  if (!token || !user) {
    return <Navigate to="/auth" replace />
  }
  
  return children
}

function App() {
  // Initialize auth from storage on mount
  useEffect(() => {
    const token = storage.getAccessToken()
    if (token) {
      // Token exists, user might be logged in
      // Auth store will validate on app load
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/:username/links" element={<Dashboard />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
