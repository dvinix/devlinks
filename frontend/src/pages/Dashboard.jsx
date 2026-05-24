import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { 
  Link2, 
  BarChart3, 
  QrCode, 
  Plus, 
  Copy, 
  Trash2, 
  ExternalLink,
  Check,
  TrendingUp,
  Globe,
  MessageCircle,
  Zap,
  Home as HomeIcon,
  Search,
  X
} from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import CreateLinkModal from '../components/CreateLinkModal'
import QRModal from '../components/QRModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const Dashboard = () => {
  const { username: urlUsername } = useParams()
  const { user } = useAuthStore()
  const [links, setLinks] = useState([])
  const [filteredLinks, setFilteredLinks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState(null)
  const [activeNav, setActiveNav] = useState('links')
  const [stats, setStats] = useState({ totalClicks: 0, whatsappPercent: 0, topCountry: 'N/A' })
  const [qrSlug, setQrSlug] = useState(null)
  const [qrShortUrl, setQrShortUrl] = useState(null)
  const [linkAnalytics, setLinkAnalytics] = useState({})
  const navigate = useNavigate()

  // Verify username matches logged-in user
  if (user && user.username !== urlUsername) {
    return <Navigate to={`/${user.username}/links`} replace />
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
      
      // Fetch analytics for each link
      if (response.data.length > 0) {
        await fetchAllLinkAnalytics(response.data, token)
        await fetchAggregateStats(response.data, token)
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
      // Fetch analytics for each link and aggregate
      const analyticsPromises = userLinks.map(link =>
        axios.get(`${API_URL}/analytics/${link.slug}?days=30`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null) // Handle errors gracefully
      )
      
      const analyticsResults = await Promise.all(analyticsPromises)
      
      let totalClicks = 0
      let whatsappClicks = 0
      const countryCounts = {}
      
      analyticsResults.forEach(result => {
        if (result && result.data) {
          const data = result.data
          totalClicks += data.total_clicks || 0
          
          // Count WhatsApp clicks from sources
          if (data.sources) {
            data.sources.forEach(source => {
              if (source._id && source._id.toLowerCase().includes('whatsapp')) {
                whatsappClicks += source.count
              }
            })
          }
          
          // Count countries
          if (data.top_locations) {
            data.top_locations.forEach(loc => {
              const country = loc._id?.country || 'Unknown'
              countryCounts[country] = (countryCounts[country] || 0) + loc.count
            })
          }
        }
      })
      
      // Calculate WhatsApp percentage
      const whatsappPercent = totalClicks > 0 
        ? Math.round((whatsappClicks / totalClicks) * 100)
        : 0
      
      // Find top country
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
      // Fallback to zeros
      setStats({
        totalClicks: 0,
        whatsappPercent: 0,
        topCountry: 'N/A'
      })
    }
  }

  const handleCopy = (shortUrl, slug) => {
    navigator.clipboard.writeText(shortUrl)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const handleDelete = async (slug) => {
    if (!confirm('Are you sure you want to delete this link? The shortened URL will stop working.')) return

    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`${API_URL}/links/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLinks(links.filter(link => link.slug !== slug))
      setFilteredLinks(filteredLinks.filter(link => link.slug !== slug))
    } catch (error) {
      console.error('Failed to delete link:', error)
      alert('Failed to delete link. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/')
  }

  const handleShowQR = (slug, shortUrl) => {
    setQrSlug(slug)
    setQrShortUrl(shortUrl)
  }

  const handleCloseQR = () => {
    setQrSlug(null)
    setQrShortUrl(null)
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
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">DevLinks</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <button
            onClick={() => navigate(`/${user.username}/home`)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeNav === 'home'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => setActiveNav('links')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1 ${
              activeNav === 'links'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Links
          </button>
          <button
            onClick={() => navigate(`/${user.username}/qrcodes`)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1 ${
              activeNav === 'qr'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Codes
          </button>
          <button
            onClick={() => navigate(`/${user.username}/analytics`)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1 ${
              activeNav === 'analytics'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
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
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeNav === 'links' && 'Links'}
            {activeNav === 'analytics' && 'Analytics'}
            {activeNav === 'qr' && 'QR Codes'}
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New link
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeNav === 'links' && (
            <>
              {/* Stats Row - Only show when there are links */}
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
                      placeholder="Search links by URL or slug..."
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
                      Found {filteredLinks.length} {filteredLinks.length === 1 ? 'link' : 'links'}
                    </div>
                  )}
                </div>
              )}

              {/* Links Table */}
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  Loading your links...
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Link2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No links yet</h3>
                  <p className="text-gray-600 mb-6">Create your first short link to get started</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first link
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
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <div className="col-span-3">Short Link</div>
                    <div className="col-span-4">Original URL</div>
                    <div className="col-span-1 text-center">Clicks</div>
                    <div className="col-span-2">Created</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {filteredLinks.map((link, index) => (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="col-span-3 flex flex-col justify-center">
                          <code className="text-sm font-mono text-blue-600 truncate">{link.short_url}</code>
                          <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded-md text-xs font-medium mt-1 ${
                            link.is_active
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                            {link.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="col-span-4 flex items-center">
                          <span className="text-sm text-gray-900 truncate" title={link.original_url}>
                            {link.original_url}
                          </span>
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-900">
                            {linkAnalytics[link.slug] !== undefined ? linkAnalytics[link.slug].toLocaleString() : '-'}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm text-gray-600">
                            {formatDate(link.created_at)}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(link.short_url, link.slug)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Copy link"
                          >
                            {copiedSlug === link.slug ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleShowQR(link.slug, link.short_url)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/${user.username}/links/${link.slug}/details`)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="View analytics"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <a
                            href={link.short_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Open link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(link.slug)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete link"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create Link Modal */}
      {showCreateModal && (
        <CreateLinkModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchLinks()
          }}
        />
      )}

      {/* QR Code Modal */}
      {qrSlug && (
        <QRModal
          slug={qrSlug}
          shortUrl={qrShortUrl}
          onClose={handleCloseQR}
        />
      )}
    </div>
  )
}
