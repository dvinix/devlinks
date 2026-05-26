import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { 
  Link2, 
  BarChart3, 
  QrCode as QrCodeIcon, 
  Home as HomeIcon,
  Download,
  Search,
  X,
  Zap,
  TrendingUp,
  Globe,
  MessageCircle
} from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const QRCodesPage = () => {
  const { username: urlUsername } = useParams()
  const { user } = useAuthStore()
  const [links, setLinks] = useState([])
  const [filteredLinks, setFilteredLinks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [qrImages, setQrImages] = useState({})
  const [stats, setStats] = useState({ totalClicks: 0, whatsappPercent: 0, topCountry: 'N/A' })
  const [linkAnalytics, setLinkAnalytics] = useState({})
  const navigate = useNavigate()

  // Verify username matches logged-in user
  if (user && user.username !== urlUsername) {
    return <Navigate to={`/${user.username}/qrcodes`} replace />
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  useEffect(() => {
    // Filter links based on search query
    if (searchQuery.trim() === '') {
      setFilteredLinks(links)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = links.filter(link =>
        link.slug.toLowerCase().includes(query) ||
        link.original_url.toLowerCase().includes(query) ||
        link.short_url.toLowerCase().includes(query)
      )
      setFilteredLinks(filtered)
    }
  }, [searchQuery, links])

  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/links/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLinks(response.data)
      setFilteredLinks(response.data)
      
      // Fetch QR codes and analytics for each link
      if (response.data.length > 0) {
        await Promise.all([
          fetchAllQRCodes(response.data, token),
          fetchAllLinkAnalytics(response.data, token),
          fetchAggregateStats(response.data, token)
        ])
      } else {
        setStats({
          totalClicks: 0,
          whatsappPercent: 0,
          topCountry: 'N/A'
        })
      }
    } catch (error) {
      console.error('Failed to fetch links:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllQRCodes = async (userLinks, token) => {
    const qrData = {}
    
    await Promise.all(
      userLinks.map(async (link) => {
        try {
          const response = await axios.get(`${API_URL}/links/${link.slug}/qr`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
          })
          qrData[link.slug] = URL.createObjectURL(response.data)
        } catch (error) {
          console.error(`Failed to fetch QR for ${link.slug}:`, error)
        }
      })
    )
    
    setQrImages(qrData)
  }

  const fetchAllLinkAnalytics = async (userLinks, token) => {
    const analyticsData = {}
    
    await Promise.all(
      userLinks.map(async (link) => {
        try {
          const response = await axios.get(`${API_URL}/analytics/${link.slug}?days=30`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          analyticsData[link.slug] = response.data.total_clicks || 0
        } catch (error) {
          analyticsData[link.slug] = 0
        }
      })
    )
    
    setLinkAnalytics(analyticsData)
  }

  const fetchAggregateStats = async (userLinks, token) => {
    try {
      const analyticsPromises = userLinks.map(link =>
        axios.get(`${API_URL}/analytics/${link.slug}?days=30`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null)
      )
      
      const analyticsResults = await Promise.all(analyticsPromises)
      
      let totalClicks = 0
      let whatsappClicks = 0
      const countryCounts = {}
      
      analyticsResults.forEach(result => {
        if (result && result.data) {
          const data = result.data
          totalClicks += data.total_clicks || 0
          
          if (data.sources) {
            data.sources.forEach(source => {
              if (source._id && source._id.toLowerCase().includes('whatsapp')) {
                whatsappClicks += source.count
              }
            })
          }
          
          if (data.top_locations) {
            data.top_locations.forEach(loc => {
              const country = loc._id?.country || 'Unknown'
              countryCounts[country] = (countryCounts[country] || 0) + loc.count
            })
          }
        }
      })
      
      const whatsappPercent = totalClicks > 0 
        ? Math.round((whatsappClicks / totalClicks) * 100)
        : 0
      
      const topCountry = Object.keys(countryCounts).length > 0
        ? Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A'
      
      setStats({
        totalClicks,
        whatsappPercent,
        topCountry
      })
    } catch (error) {
      console.error('Failed to fetch aggregate stats:', error)
      setStats({
        totalClicks: 0,
        whatsappPercent: 0,
        topCountry: 'N/A'
      })
    }
  }

  const handleDownloadQR = (slug, shortUrl) => {
    const qrUrl = qrImages[slug]
    if (qrUrl) {
      const link = document.createElement('a')
      link.href = qrUrl
      link.download = `${slug}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1 bg-gray-100 text-gray-900"
          >
            <QrCodeIcon className="w-4 h-4" />
            QR Codes
          </button>
          <button
            onClick={() => navigate(`/${user.username}/analytics`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </nav>

        <div className="p-3 border-t border-gray-200">
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
                onClick={handleLogout}
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
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-900">QR Codes</h2>
        </div>

        <div className="p-8">
          {/* Stats Row */}
          {!loading && links.length > 0 && (
            <div className="grid grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white rounded-md border border-gray-200">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600">Total Clicks</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stats.totalClicks}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white rounded-md border border-gray-200">
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600">WhatsApp Traffic</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stats.whatsappPercent}%</div>
                <div className="text-xs text-gray-500 mt-1">of all clicks</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white rounded-md border border-gray-200">
                    <Globe className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600">Top Country</span>
                </div>
                <div className="text-2xl font-semibold text-gray-900">{stats.topCountry}</div>
              </motion.div>
            </div>
          )}

          {/* Search Bar */}
          {!loading && links.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search QR codes by URL or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="mt-2 text-sm text-gray-600">
                  Found {filteredLinks.length} {filteredLinks.length === 1 ? 'QR code' : 'QR codes'}
                </div>
              )}
            </div>
          )}

          {/* QR Codes Grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading QR codes...
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <QrCodeIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No QR codes yet</h3>
              <p className="text-gray-600 mb-6">Create a link to get its QR code</p>
              <button
                onClick={() => navigate(`/${user.username}/home`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Go to Home
              </button>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search query</p>
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center mb-4 bg-gray-50 rounded-lg p-4">
                    {qrImages[link.slug] ? (
                      <img
                        src={qrImages[link.slug]}
                        alt={`QR code for ${link.slug}`}
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                        <QrCodeIcon className="w-16 h-16" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <code className="text-sm font-mono text-blue-600 truncate block">
                        {link.short_url}
                      </code>
                      <p className="text-xs text-gray-600 truncate mt-1" title={link.original_url}>
                        {link.original_url}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Clicks:</span>
                      <span className="font-medium text-gray-900">
                        {linkAnalytics[link.slug] !== undefined ? linkAnalytics[link.slug].toLocaleString() : '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-600">{formatDate(link.created_at)}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleDownloadQR(link.slug, link.short_url)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => navigate(`/${user.username}/links/${link.slug}/details`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default QRCodesPage
