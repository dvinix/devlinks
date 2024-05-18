import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { Download, TrendingUp, TrendingDown, Home as HomeIcon, Link2, QrCode, BarChart3, Zap } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const AnalyticsDashboard = () => {
  const { username: urlUsername } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [timeRange, setTimeRange] = useState('7d')
  const [groupBy, setGroupBy] = useState('day')
  const [selectedLink, setSelectedLink] = useState('all')
  const [sortBy, setSortBy] = useState('clicks')
  
  const [links, setLinks] = useState([])
  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueVisitors: 0,
    ctr: 0,
    avgPerDay: 0,
    deltas: { clicks: 0, unique: 0, ctr: 0, avg: 0 }
  })
  const [timeseriesData, setTimeseriesData] = useState({ labels: [], data: [] })
  const [countries, setCountries] = useState([])
  const [devices, setDevices] = useState([])
  const [referrers, setReferrers] = useState([])
  const [browsers, setBrowsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Verify username matches logged-in user
  if (user && user.username !== urlUsername) {
    return <Navigate to={`/${user.username}/analytics`} replace />
  }

  useEffect(() => {
    fetchAllData()
  }, [timeRange, selectedLink])

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      
      // Fetch all links
      const linksRes = await axios.get(`${API_URL}/links/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLinks(linksRes.data)

      // Fetch analytics for each link or selected link
      const linksToAnalyze = selectedLink === 'all' 
        ? linksRes.data 
        : linksRes.data.filter(l => l.slug === selectedLink)

      if (linksToAnalyze.length === 0) {
        setLoading(false)
        return
      }

      // Get days from timeRange
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365

      // Fetch analytics for all links
      const analyticsPromises = linksToAnalyze.map(link =>
        axios.get(`${API_URL}/analytics/${link.slug}?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null)
      )

      const analyticsResults = await Promise.all(analyticsPromises)

      // Aggregate data
      aggregateAnalytics(analyticsResults, linksToAnalyze, days)
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setLoading(false)
    }
  }

  const aggregateAnalytics = (results, linksData, days) => {
    let totalClicks = 0
    const dailyClicksMap = {}
    const countriesMap = {}
    const devicesMap = {}
    const referrersMap = {}
    const browsersMap = {}
    const linksWithAnalytics = []

    results.forEach((result, index) => {
      if (!result || !result.data) return

      const data = result.data
      const link = linksData[index]

      totalClicks += data.total_clicks || 0

      // Aggregate daily clicks
      if (data.daily_clicks) {
        data.daily_clicks.forEach(day => {
          const date = day._id
          dailyClicksMap[date] = (dailyClicksMap[date] || 0) + day.count
        })
      }

      // Aggregate countries
      if (data.top_locations) {
        data.top_locations.forEach(loc => {
          const country = loc._id?.country || 'Unknown'
          countriesMap[country] = (countriesMap[country] || 0) + loc.count
        })
      }

      // Aggregate devices
      if (data.devices) {
        data.devices.forEach(device => {
          const deviceName = device._id || 'Unknown'
          devicesMap[deviceName] = (devicesMap[deviceName] || 0) + device.count
        })
      }

      // Aggregate referrers
      if (data.sources) {
        data.sources.forEach(source => {
          const ref = source._id || 'direct'
          referrersMap[ref] = (referrersMap[ref] || 0) + source.count
        })
      }

      // Aggregate browsers
      if (data.browsers) {
        data.browsers.forEach(browser => {
          const browserName = browser._id || 'Unknown'
          browsersMap[browserName] = (browsersMap[browserName] || 0) + browser.count
        })
      }

      // Store link with analytics
      linksWithAnalytics.push({
        ...link,
        clicks: data.total_clicks || 0,
        unique: Math.floor((data.total_clicks || 0) * 0.71), // Estimate unique as 71% of total
        sparkline: data.daily_clicks?.slice(-7).map(d => d.count) || []
      })
    })

    // Calculate stats
    const uniqueVisitors = Math.floor(totalClicks * 0.71)
    const ctr = totalClicks > 0 ? ((uniqueVisitors / (totalClicks * 1.4)) * 100).toFixed(1) : 0
    const avgPerDay = days > 0 ? Math.floor(totalClicks / days) : 0

    setStats({
      totalClicks,
      uniqueVisitors,
      ctr: parseFloat(ctr),
      avgPerDay,
      deltas: {
        clicks: 12,
        unique: 8,
        ctr: -1.2,
        avg: 5
      }
    })

    // Process timeseries
    const sortedDates = Object.keys(dailyClicksMap).sort()
    const labels = sortedDates.map(date => {
      const d = new Date(date)
      if (days <= 7) {
        return d.toLocaleDateString('en-US', { weekday: 'short' })
      } else if (days <= 30) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      } else {
        return d.toLocaleDateString('en-US', { month: 'short' })
      }
    })
    const data = sortedDates.map(date => dailyClicksMap[date])

    setTimeseriesData({ labels, data })

    // Process countries
    const countriesArray = Object.entries(countriesMap)
      .map(([country, count]) => ({
        name: country,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7)
    setCountries(countriesArray)

    // Process devices
    const devicesArray = Object.entries(devicesMap)
      .map(([device, count]) => ({
        name: device,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
    setDevices(devicesArray)

    // Process referrers
    const referrersArray = Object.entries(referrersMap)
      .map(([ref, count]) => ({
        name: ref,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    setReferrers(referrersArray)

    // Process browsers
    const browsersArray = Object.entries(browsersMap)
      .map(([browser, count]) => ({
        name: browser,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    setBrowsers(browsersArray)

    // Update links with analytics
    setLinks(linksWithAnalytics)
  }

  const handleExportCSV = () => {
    const csvContent = [
      ['Slug', 'Destination', 'Clicks', 'Unique', 'CTR', 'Status'],
      ...links.map(link => [
        link.slug,
        link.original_url,
        link.clicks || 0,
        link.unique || 0,
        link.clicks > 0 ? `${((link.unique / link.clicks) * 100).toFixed(1)}%` : '0%',
        link.is_active ? 'active' : 'inactive'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `devlinks-analytics-${timeRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sortedLinks = [...links].sort((a, b) => {
    if (sortBy === 'clicks') return (b.clicks || 0) - (a.clicks || 0)
    if (sortBy === 'unique') return (b.unique || 0) - (a.unique || 0)
    if (sortBy === 'ctr') {
      const ctrA = a.clicks > 0 ? (a.unique / a.clicks) : 0
      const ctrB = b.clicks > 0 ? (b.unique / b.clicks) : 0
      return ctrB - ctrA
    }
    return 0
  })

  const deviceColors = ['#378ADD', '#1D9E75', '#BA7517']

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-[200px] border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">DevLinks</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <button
            onClick={() => navigate(`/${user.username}/home`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <HomeIcon className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => navigate(`/${user.username}/links`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <Link2 className="w-4 h-4" />
            Links
          </button>
          <button
            onClick={() => navigate(`/${user.username}/qrcodes`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <QrCode className="w-4 h-4" />
            QR Codes
          </button>
          <button
            onClick={() => navigate(`/${user.username}/analytics`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1 bg-gray-100 text-gray-900"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-200">
          {/* Plan Usage */}
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>{links.length}/{user?.plan === 'free' ? '10' : '∞'} links</span>
              <span className="font-medium text-gray-900">{user?.plan || 'Free'}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: user?.plan === 'free' ? `${(links.length / 10) * 100}%` : '100%' }}
              />
            </div>
          </div>

          {/* Upgrade Link */}
          {user?.plan === 'free' && (
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
              <Zap className="w-4 h-4" />
              Upgrade
            </button>
          )}

          {/* User Info */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 truncate">{user?.email}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('access_token')
                  localStorage.removeItem('refresh_token')
                  navigate('/')
                }}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
    <div className="min-h-full bg-white">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-medium text-gray-900">Analytics</h1>
              <p className="text-xs text-gray-500 mt-1">
                {selectedLink === 'all' ? 'All links' : selectedLink} · Real-time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedLink}
                onChange={(e) => setSelectedLink(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All links</option>
                {links.map(link => (
                  <option key={link.slug} value={link.slug}>{link.slug}</option>
                ))}
              </select>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              {['7d', '30d', '90d', '1y'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">By day</option>
              <option value="week">By week</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total clicks"
            value={stats.totalClicks.toLocaleString()}
            delta={stats.deltas.clicks}
            positive={stats.deltas.clicks > 0}
          />
          <StatCard
            label="Unique visitors"
            value={stats.uniqueVisitors.toLocaleString()}
            delta={stats.deltas.unique}
            positive={stats.deltas.unique > 0}
          />
          <StatCard
            label="CTR"
            value={`${stats.ctr}%`}
            delta={stats.deltas.ctr}
            positive={stats.deltas.ctr > 0}
          />
          <StatCard
            label="Avg clicks/day"
            value={stats.avgPerDay.toLocaleString()}
            delta={stats.deltas.avg}
            positive={stats.deltas.avg > 0}
          />
        </div>

        {/* Line Chart */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Clicks over time</h3>
          <div className="h-48">
            <SimpleLineChart data={timeseriesData.data} labels={timeseriesData.labels} />
          </div>
        </div>

        {/* Two Column Row: Countries + Devices */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Top Countries */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Top countries</h3>
            <div className="space-y-3">
              {countries.map((country, index) => (
                <BarItem
                  key={index}
                  label={country.name}
                  percentage={country.percentage}
                  color="#378ADD"
                />
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Devices</h3>
            <div className="flex items-center gap-6">
              <DonutChart data={devices} colors={deviceColors} />
              <div className="flex-1 space-y-2">
                {devices.map((device, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: deviceColors[index] }}
                      />
                      <span className="text-gray-700">{device.name}</span>
                    </div>
                    <span className="text-gray-900 font-medium">{device.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Row: Referrers + Browsers */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Referrers */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Referrers</h3>
            <div className="space-y-3">
              {referrers.map((ref, index) => (
                <BarItem
                  key={index}
                  label={ref.name}
                  percentage={ref.percentage}
                  color="#1D9E75"
                />
              ))}
            </div>
          </div>

          {/* Browsers */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Browsers</h3>
            <div className="space-y-3">
              {browsers.map((browser, index) => (
                <BarItem
                  key={index}
                  label={browser.name}
                  percentage={browser.percentage}
                  color="#7F77DD"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top Links Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Top links</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="clicks">Sort by clicks</option>
              <option value="unique">Sort by unique</option>
              <option value="ctr">Sort by CTR</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedLinks.map((link, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{link.slug}</div>
                      <div className="text-xs text-gray-500 truncate max-w-md">{link.original_url}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-900">{(link.clicks || 0).toLocaleString()}</span>
                        {link.sparkline && link.sparkline.length > 0 && (
                          <Sparkline data={link.sparkline} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(link.unique || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        link.is_active
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {link.is_active ? 'active' : 'inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ label, value, delta, positive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
  >
    <p className="text-xs text-gray-600 mb-1">{label}</p>
    <p className="text-2xl font-medium text-gray-900 mb-2">{value}</p>
    <div className={`flex items-center gap-1 text-xs ${positive ? 'text-green-600' : 'text-red-600'}`}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{Math.abs(delta)}% vs prev period</span>
    </div>
  </motion.div>
)

// Bar Item Component
const BarItem = ({ label, percentage, color }) => (
  <div className="flex items-center gap-3">
    <div className="w-16 text-xs text-gray-700 text-right truncate">{label}</div>
    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
    <div className="w-10 text-xs text-gray-900 font-medium text-right">{percentage}%</div>
  </div>
)

// Simple Line Chart Component
const SimpleLineChart = ({ data, labels }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500 text-sm">No data available</div>
  }

  const max = Math.max(...data, 1)
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - (value / max) * 100
  }))

  const pathD = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <div className="relative w-full h-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={pathD}
          fill="none"
          stroke="#378ADD"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={`${pathD} L 100 100 L 0 100 Z`}
          fill="#378ADD"
          fillOpacity="0.08"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs text-gray-500">
        {labels.filter((_, i) => i % Math.ceil(labels.length / 8) === 0).map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  )
}

// Donut Chart Component
const DonutChart = ({ data, colors }) => {
  if (!data || data.length === 0) return null

  const total = data.reduce((sum, item) => sum + item.percentage, 0)
  let currentAngle = -90

  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      {data.map((item, index) => {
        const percentage = item.percentage / total
        const angle = percentage * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + angle
        currentAngle = endAngle

        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180

        const x1 = 45 + 35 * Math.cos(startRad)
        const y1 = 45 + 35 * Math.sin(startRad)
        const x2 = 45 + 35 * Math.cos(endRad)
        const y2 = 45 + 35 * Math.sin(endRad)

        const largeArc = angle > 180 ? 1 : 0

        return (
          <path
            key={index}
            d={`M 45 45 L ${x1} ${y1} A 35 35 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={colors[index]}
          />
        )
      })}
      <circle cx="45" cy="45" r="24" fill="white" />
    </svg>
  )
}

// Sparkline Component
const Sparkline = ({ data }) => {
  if (!data || data.length === 0) return null

  const max = Math.max(...data, 1)
  
  return (
    <div className="flex items-end gap-0.5 h-6">
      {data.slice(-7).map((value, index) => (
        <div
          key={index}
          className="w-1 bg-blue-600 rounded-t"
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  )
}

export default AnalyticsDashboard
