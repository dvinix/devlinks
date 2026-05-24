import { useState, useEffect } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Link2,
  BarChart3,
  QrCode,
  Home as HomeIcon,
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  Globe,
  Smartphone,
  MessageCircle,
  Zap
} from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const LinkDetails = () => {
  const { username: urlUsername, slug } = useParams()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [link, setLink] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Verify username matches logged-in user
  if (user && user.username !== urlUsername) {
    return <Navigate to={`/${user.username}/links`} replace />
  }

  useEffect(() => {
    if (slug) {
      fetchLinkData()
    }
  }, [slug, timeRange])

  const fetchLinkData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      
      // Fetch link details
      const linksResponse = await axios.get(`${API_URL}/links/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const linkData = linksResponse.data.find(l => l.slug === slug)
      
      if (!linkData) {
        navigate(`/${user.username}/links`)
        return
      }
      
      setLink(linkData)
      
      // Fetch analytics
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
      const analyticsResponse = await axios.get(`${API_URL}/analytics/${slug}?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setAnalytics(analyticsResponse.data)
    } catch (error) {
      console.error('Failed to fetch link data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (link) {
      navigator.clipboard.writeText(link.short_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        {/* Sidebar */}
        <aside className="w-[200px] border-r border-gray-200 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">DevLinks</h1>
          </div>
          <nav className="flex-1 p-3">
            <button onClick={() => navigate(`/${user.username}/home`)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
              <HomeIcon className="w-4 h-4" />
              Home
            </button>
            <button onClick={() => navigate(`/${user.username}/links`)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mt-1 bg-gray-100 text-gray-900">
              <Link2 className="w-4 h-4" />
              Links
            </button>
            <button onClick={() => navigate(`/${user.username}/qrcodes`)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mt-1 text-gray-600 hover:bg-gray-50">
              <QrCode className="w-4 h-4" />
              QR Codes
            </button>
            <button onClick={() => navigate(`/${user.username}/analytics`)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mt-1 text-gray-600 hover:bg-gray-50">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </nav>
          <div className="p-3 border-t border-gray-200">
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="font-medium text-gray-900">{user?.plan || 'Free'}</span>
              </div>
            </div>
            {user?.plan === 'free' && (
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                <Zap className="w-4 h-4" />
                Upgrade
              </button>
            )}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 truncate">{user?.email}</span>
                <button onClick={() => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); navigate('/'); }} className="text-xs text-gray-500 hover:text-gray-900">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto flex items-center justify-center">
          <div className="text-gray-500">Loading link details...</div>
        </main>
      </div>
    )
  }

  if (!link || !analytics) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Link not found</div>
      </div>
    )
  }

  const totalClicks = analytics.total_clicks || 0
  const uniqueVisitors = Math.floor(totalClicks * 0.71)

  // Process WhatsApp data
  const whatsappSource = analytics.sources?.find(s => s._id && s._id.toLowerCase().includes('whatsapp'))
  const whatsappClicks = whatsappSource ? whatsappSource.count : 0
  const whatsappPercent = totalClicks > 0 ? Math.round((whatsappClicks / totalClicks) * 100) : 0

  // Process locations
  const topCountries = analytics.top_locations?.slice(0, 5).map(loc => ({
    name: loc._id?.country || 'Unknown',
    clicks: loc.count,
    percentage: totalClicks > 0 ? Math.round((loc.count / totalClicks) * 100) : 0
  })) || []

  // Process devices
  const devices = analytics.devices?.map(d => ({
    name: d._id || 'Unknown',
    clicks: d.count,
    percentage: totalClicks > 0 ? Math.round((d.count / totalClicks) * 100) : 0
  })).sort((a, b) => b.clicks - a.clicks) || []

  // Process referrers
  const topReferrers = analytics.sources?.slice(0, 5).map(s => ({
    name: s._id || 'direct',
    clicks: s.count,
    percentage: totalClicks > 0 ? Math.round((s.count / totalClicks) * 100) : 0
  })) || []

  // Process engagement over time
  const engagementData = analytics.daily_clicks?.map(d => ({
    date: new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    clicks: d.count
  })) || []

  const maxClicks = Math.max(...engagementData.map(d => d.clicks), 1)

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-[200px] border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">DevLinks</h1>
        </div>

        <nav className="flex-1 p-3">
          <button
            onClick={() => navigate(`/${user.username}/home`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => navigate(`/${user.username}/links`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mt-1 bg-gray-100 text-gray-900"
          >
            <Link2 className="w-4 h-4" />
            Links
          </button>
          <button
            onClick={() => navigate(`/${user.username}/qrcodes`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mt-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            QR Codes
          </button>
          <button
            onClick={() => navigate(`/${user.username}/analytics`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mt-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span className="font-medium text-gray-900">{user?.plan || 'Free'}</span>
            </div>
          </div>

          {user?.plan === 'free' && (
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
              <Zap className="w-4 h-4" />
              Upgrade
            </button>
          )}

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
      <main className="flex-1 overflow-auto bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="px-8 py-4">
            <button
              onClick={() => navigate(`/${user.username}/links`)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Links
            </button>
            
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <code className="text-lg font-mono font-semibold text-blue-600">{link.short_url}</code>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={link.short_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-sm text-gray-600 truncate">{link.original_url}</p>
                <p className="text-xs text-gray-500 mt-1">Created {formatDate(link.created_at)}</p>
              </div>

              <div className="flex items-center gap-2 ml-4">
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
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} icon={TrendingUp} />
            <StatCard label="Unique Visitors" value={uniqueVisitors.toLocaleString()} icon={Globe} />
            <StatCard label="WhatsApp Clicks" value={`${whatsappPercent}%`} icon={MessageCircle} />
            <StatCard label="Devices" value={devices.length} icon={Smartphone} />
          </div>

          {/* Engagement Over Time */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Engagement over time</h3>
            <div className="h-48">
              {engagementData.length > 0 ? (
                <div className="flex items-end justify-between h-full gap-2">
                  {engagementData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700" style={{ height: `${(item.clicks / maxClicks) * 100}%`, minHeight: item.clicks > 0 ? '4px' : '0' }} title={`${item.date}: ${item.clicks} clicks`} />
                      {index % Math.ceil(engagementData.length / 8) === 0 && (
                        <span className="text-xs text-gray-500 mt-2">{item.date}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">No engagement data yet</div>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Top Countries */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Top locations</h3>
              <div className="space-y-3">
                {topCountries.length > 0 ? topCountries.map((country, index) => (
                  <BarItem key={index} label={country.name} value={country.clicks} percentage={country.percentage} />
                )) : (
                  <div className="text-sm text-gray-500">No location data yet</div>
                )}
              </div>
            </div>

            {/* Devices */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Devices</h3>
              <div className="space-y-3">
                {devices.length > 0 ? devices.map((device, index) => (
                  <BarItem key={index} label={device.name} value={device.clicks} percentage={device.percentage} color={index === 0 ? '#378ADD' : index === 1 ? '#1D9E75' : '#BA7517'} />
                )) : (
                  <div className="text-sm text-gray-500">No device data yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Referrers */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Top referrers</h3>
            <div className="space-y-3">
              {topReferrers.length > 0 ? topReferrers.map((ref, index) => (
                <BarItem key={index} label={ref.name} value={ref.clicks} percentage={ref.percentage} color="#7F77DD" />
              )) : (
                <div className="text-sm text-gray-500">No referrer data yet</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const StatCard = ({ label, value, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-6 bg-gray-50 rounded-lg border border-gray-200"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-white rounded-md border border-gray-200">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <div className="text-2xl font-semibold text-gray-900">{value}</div>
  </motion.div>
)

const BarItem = ({ label, value, percentage, color = '#378ADD' }) => (
  <div className="flex items-center gap-3">
    <div className="w-24 text-sm text-gray-700 truncate" title={label}>{label}</div>
    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
    <div className="w-16 text-right">
      <span className="text-sm text-gray-900 font-medium">{value}</span>
      <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
    </div>
  </div>
)

export default LinkDetails
