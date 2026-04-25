import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Plus, Link2, Copy, Trash2, BarChart3, LogOut, Check, ExternalLink } from 'lucide-react'
import axios from 'axios'
import CreateLinkModal from '../components/CreateLinkModal'
import LinkAnalytics from '../components/LinkAnalytics'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Dashboard = () => {
  const [links, setLinks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedLink, setSelectedLink] = useState(null)
  const [copiedSlug, setCopiedSlug] = useState(null)
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
    return <LinkAnalytics link={selectedLink} onBack={() => setSelectedLink(null)} />
  }

  return (
    <div className="min-h-screen bg-dark-base">
      {/* Background */}
      <div className="fixed inset-0 dot-pattern opacity-50 pointer-events-none" />
      <div className="floating-orb w-96 h-96 bg-violet-600 top-20 -left-48" />
      <div className="floating-orb w-96 h-96 bg-cyan-500 bottom-20 -right-48" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-dark-surface/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold gradient-text">DevLinks</h1>
              {user && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-400">{user.email}</span>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-violet-600 to-cyan-500 rounded text-xs font-semibold">
                    {user.plan.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Link2 className="w-5 h-5 text-violet-400" />
                <span className="text-gray-400">Total Links</span>
              </div>
              <div className="text-3xl font-bold gradient-text">{links.length}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400">Active Links</span>
              </div>
              <div className="text-3xl font-bold gradient-text">
                {links.filter(l => l.is_active).length}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Plus className="w-5 h-5 text-green-400" />
                <span className="text-gray-400">Plan Limit</span>
              </div>
              <div className="text-3xl font-bold gradient-text">
                {user?.plan === 'free' ? `${links.length}/10` : '∞'}
              </div>
            </motion.div>
          </div>

          {/* Create Link Button */}
          <div className="mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create New Link
            </motion.button>
          </div>

          {/* Links List */}
          <div className="space-y-4">
            {loading ? (
              <div className="glass-card p-8 text-center text-gray-400">
                Loading your links...
              </div>
            ) : links.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Link2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No links yet. Create your first one!</p>
              </div>
            ) : (
              links.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-6 hover:glow-mixed transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-cyan-400 font-semibold">
                          {link.slug}
                        </span>
                        {!link.is_active && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm truncate">{link.original_url}</p>
                      <p className="text-gray-600 text-xs mt-1">
                        Created {new Date(link.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCopy(link.short_url, link.slug)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy link"
                      >
                        {copiedSlug === link.slug ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-400" />
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedLink(link)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="View analytics"
                      >
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                      </motion.button>

                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={link.short_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Open link"
                      >
                        <ExternalLink className="w-5 h-5 text-gray-400" />
                      </motion.a>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(link.slug)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete link"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </main>
      </div>

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

export default Dashboard
