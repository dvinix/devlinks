import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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
  Zap
} from 'lucide-react'
import axios from 'axios'
import CreateLinkModal from '../components/CreateLinkModal'
import LinkAnalyticsMinimal from '../components/LinkAnalyticsMinimal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const Dashboard = () => {
  const [links, setLinks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState(null)
  const [copiedSlug, setCopiedSlug] = useState(null)
  const [activeNav, setActiveNav] = useState('links')
  const [stats, setStats] = useState({ totalClicks: 0, whatsappPercent: 0, topCountry: 'N/A' })
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserData()
    fetchLinks()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/auth')
        return
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token')
        navigate('/auth')
      }
    }
  }

  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/links/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLinks(response.data)
      
      // Calculate aggregate stats
      let totalClicks = 0
      let whatsappClicks = 0
      const countries = {}
      
      // In a real app, you'd fetch this from a dedicated stats endpoint
      // For now, we'll show placeholder data
      setStats({
        totalClicks: response.data.length * 42, // Placeholder
        whatsappPercent: 58, // Placeholder
        topCountry: 'India' // Placeholder
      })
    } catch (error) {
      console.error('Failed to fetch links:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (shortUrl, slug) => {
    navigator.clipboard.writeText(shortUrl)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const handleDelete = async (slug) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`${API_URL}/links/${slug}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLinks(links.filter(link => link.slug !== slug))
    } catch (error) {
      console.error('Failed to delete link:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/auth')
  }

  if (selectedLink) {
    return <LinkAnalyticsMinimal link={selectedLink} onBack={() => setSelectedLink(null)} />
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
            onClick={() => setActiveNav('links')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeNav === 'links'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Links
          </button>
          <button
            onClick={() => setActiveNav('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1 ${
              activeNav === 'analytics'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setActiveNav('qr')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1 ${
              activeNav === 'qr'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Codes
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
              {/* Stats Row */}
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
                    <span className="text-sm text-gray-600">WhatsApp</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{stats.whatsappPercent}%</div>
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
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <div className="col-span-2">Slug</div>
                    <div className="col-span-5">Original URL</div>
                    <div className="col-span-2">Clicks</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {links.map((link, index) => (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="col-span-2 flex items-center">
                          <code className="text-sm font-mono text-blue-600">{link.slug}</code>
                        </div>
                        <div className="col-span-5 flex items-center">
                          <span className="text-sm text-gray-900 truncate">{link.original_url}</span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm text-gray-600">-</span>
                        </div>
                        <div className="col-span-1 flex items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            link.is_active
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                            {link.is_active ? 'Active' : 'Inactive'}
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
                            onClick={() => setSelectedLink(link)}
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

          {activeNav === 'analytics' && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Overview</h3>
              <p className="text-gray-600">Coming soon</p>
            </div>
          )}

          {activeNav === 'qr' && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <QrCode className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Codes</h3>
              <p className="text-gray-600">Coming soon</p>
            </div>
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
    </div>
  )
}
