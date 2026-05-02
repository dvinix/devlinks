import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';
import { Badge } from '../components/ui/Badge';
import { formatNumber } from '../lib/utils';
import type { AnalyticsResponse } from '../types';
import './Analytics.css';

export const Analytics: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getAnalytics, isLoading } = useAnalytics();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [days, setDays] = useState(30);
  const [shortUrl] = useState(`http://localhost:8000/${slug}`);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        if (slug) {
          const data = await getAnalytics(slug, days);
          setAnalytics(data);
        }
      } catch {
        navigate('/dashboard');
      }
    };
    loadAnalytics();
  }, [slug, days]);

  if (!analytics) {
    return <div className="analytics-loading">Loading...</div>;
  }

  const whatsappClicks =
    analytics.sources.find((s) => s._id === 'whatsapp')?.count || 0;
  const whatsappPercentage =
    analytics.total_clicks > 0 ? ((whatsappClicks / analytics.total_clicks) * 100).toFixed(1) : '0';

  const topDevice = analytics.devices[0];
  const topCountry = analytics.top_locations[0];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} /> Back
        </button>
        <div className="header-title">
          <h1>Analytics</h1>
          <div className="slug-info">
            <p className="analyzing-label">Analyzing:</p>
            <code>{shortUrl}</code>
            <CopyButton text={shortUrl} label="📋" />
          </div>
        </div>
      </div>

      <div className="time-range-selector">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            className={`time-btn ${days === d ? 'active' : ''}`}
            onClick={() => setDays(d)}
          >
            {d} days
          </button>
        ))}
      </div>

      <div className="stats-grid">
        <Card>
          <div className="stat-content">
            <p className="stat-label">Total Clicks</p>
            <p className="stat-value">{formatNumber(analytics.total_clicks)}</p>
            <p className="stat-period">Last {analytics.period_days}d</p>
          </div>
        </Card>

        <Card>
          <div className="stat-content whatsapp">
            <p className="stat-label">From WhatsApp</p>
            <p className="stat-value">{whatsappPercentage}%</p>
            <p className="stat-period">{formatNumber(whatsappClicks)} clicks</p>
          </div>
        </Card>

        {topDevice && (
          <Card>
            <div className="stat-content">
              <p className="stat-label">Top Device</p>
              <p className="stat-value">{topDevice._id}</p>
              <p className="stat-period">
                {((topDevice.count / analytics.total_clicks) * 100).toFixed(1)}%
              </p>
            </div>
          </Card>
        )}

        {topCountry && (
          <Card>
            <div className="stat-content">
              <p className="stat-label">Top Country</p>
              <p className="stat-value">{topCountry._id.country}</p>
              <p className="stat-period">{formatNumber(topCountry.count)} clicks</p>
            </div>
          </Card>
        )}
      </div>

      <div className="charts-grid">
        <Card className="chart-card">
          <h3>Daily Clicks</h3>
          <div className="chart-placeholder">
            {analytics.daily_clicks.length > 0 ? (
              <div className="daily-list">
                {analytics.daily_clicks.map((daily) => (
                  <div key={daily._id} className="daily-item">
                    <span className="date">{daily._id}</span>
                    <div className="bar-chart">
                      <div
                        className="bar"
                        style={{
                          width: `${(daily.count / Math.max(...analytics.daily_clicks.map((d) => d.count))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="count">{daily.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No data</p>
            )}
          </div>
        </Card>

        <Card className="chart-card">
          <h3>Traffic Sources</h3>
          <div className="sources-list">
            {analytics.sources.map((source) => {
              const percentage = (
                (source.count / analytics.total_clicks) *
                100
              ).toFixed(1);
              return (
                <div key={source._id} className="source-item">
                  <div className="source-header">
                    <span className="source-name">
                      {source._id === 'whatsapp' ? '💬' : '🔗'} {source._id}
                    </span>
                    <span className="source-count">{source.count}</span>
                  </div>
                  <div className="source-bar">
                    <div
                      className="source-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="source-percent">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="details-grid">
        <Card>
          <h3>Device Distribution</h3>
          <div className="devices-list">
            {analytics.devices.map((device) => {
              const percentage = (
                (device.count / analytics.total_clicks) *
                100
              ).toFixed(1);
              return (
                <div key={device._id} className="device-item">
                  <span className="device-name">{device._id}</span>
                  <span className="device-stats">
                    {device.count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3>Top Browsers</h3>
          <div className="browsers-list">
            {analytics.browsers.map((browser) => (
              <div key={browser._id} className="browser-item">
                <span className="browser-name">{browser._id}</span>
                <span className="browser-count">{browser.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3>Top Locations</h3>
          <div className="locations-list">
            {analytics.top_locations.slice(0, 5).map((location, idx) => (
              <div key={idx} className="location-item">
                <span className="location-name">
                  {location._id.country} - {location._id.city}
                </span>
                <span className="location-count">{location.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
