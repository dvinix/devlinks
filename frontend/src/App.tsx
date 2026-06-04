import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import Home from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import LinkDetails from './pages/LinkDetails';
import QRCodesPage from './pages/QRCodesPage';
import './App.css';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="app-loading">Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => {
  const { initializeAuth } = useAuthStore();
  const { getCurrentUser } = useAuth();

  useEffect(() => {
    initializeAuth();
    getCurrentUser();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PrivateRoute />}>
        <Route path="/:username/home" element={<Home />} />
        <Route path="/:username/links" element={<Dashboard />} />
        <Route path="/:username/links/:slug/details" element={<LinkDetails />} />
        <Route path="/:username/qrcodes" element={<QRCodesPage />} />
        <Route path="/:username/analytics" element={<AnalyticsDashboard />} />
        <Route path="/:username/analytics/:slug" element={<Analytics />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
