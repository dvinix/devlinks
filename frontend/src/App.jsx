import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/auth" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
