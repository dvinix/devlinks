import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Zap, Smartphone, BarChart3, Lock } from 'lucide-react';
import './Landing.css';

export const Landing: React.FC = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-content">
          <h1>DevLinks</h1>
          <div className="header-nav">
            <Link to="/login">Sign In</Link>
            <Link to="/register" className="btn-register">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Short links. Deep insights.</h1>
          <p>Track every click — especially WhatsApp.</p>
          <div className="hero-cta">
            <Link to="/register" className="btn-primary">
              Get Started Free
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-grid">
          <div className="feature-item">
            <Zap size={24} />
            <h3>Redis-Cached Redirects</h3>
            <p>Lightning-fast redirects with sub-millisecond response times</p>
          </div>
          <div className="feature-item">
            <Smartphone size={24} />
            <h3>WhatsApp Detection</h3>
            <p>Know exactly how many clicks came from WhatsApp</p>
          </div>
          <div className="feature-item">
            <BarChart3 size={24} />
            <h3>Real-time Analytics</h3>
            <p>Comprehensive analytics with devices, browsers, and locations</p>
          </div>
          <div className="feature-item">
            <Lock size={24} />
            <h3>JWT Secured</h3>
            <p>Enterprise-grade security with JWT authentication</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2026 DevLinks. All rights reserved.</p>
      </footer>
    </div>
  );
};
