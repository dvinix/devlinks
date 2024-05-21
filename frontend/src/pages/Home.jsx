import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { 
  Link2, 
  BarChart3, 
  QrCode, 
  Home as HomeIcon,
  Copy,
  Download,
  Check,
  Loader2,
  Zap
} from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const Home = () => {
  const { username: urlUsername } = useParams()
  const { user } = useAuthStore()
  const [links, setLinks] = useState([])
  const [activeNav, setActiveNav] = useState('home')
  const [mode, setMode] = useState('link') // 'link' or 'qr'
  const [url, setUrl] = useState('')
  const [createQR, setCreateQR] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState(null)
  const navigate = useNavigate()

  // Verify username matches logged-in user
  if (user && user.username !== urlUsername) {
    return <Navigate to={`/${user.username}/home`} replace />
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/links/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLinks(response.data)
    } catch (error) {
      console.error('Failed to fetch links:', error)
    }
  }

  const handleCreateLink = async (e) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    setResult(null)
    setQrImageUrl(null)

    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.post(
        `${API_URL}/links/`,
        { original_url: url },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const newLink = response.data
      setResult(newLink)
      setLinks([newLink, ...links])

      // Fetch QR code if checkbox is checked or in QR mode
      if (createQR || mode === 'qr') {
        await fetchQRCode(newLink.slug)
      }

      setUrl('')
    } catch (error) {
      console.error('Failed to create link:', error)
      alert(error.response?.data?.detail || 'Failed to create link')
    } finally {
      setLoading(false)
    }
  }

  const fetchQRCode = async (slug) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/links/${slug}/qr`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      
      const url = URL.createObjectURL(response.data)
      setQrImageUrl(url)
    } catch (error) {
      console.error('Failed to fetch QR code:', error)
    }
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.short_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadQR = () => {
    if (qrImageUrl && result) {
      const link = document.createElement('a')
      link.href = qrImageUrl
      link.download = `${result.slug}-qr.png`
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

  const remainingLinks = user?.plan === 'free' ? 10 - links.length : '∞'

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
            onClick={() => setActiveNav('home')}
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
            onClick={() => navigate(`/${user.username}/links`)}
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
          <h2 className="text-lg font-semibold text-gray-900">Home</h2>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
              </h1>
              <p className="text-gray-600">Create and manage your short links and QR codes</p>
            </motion.div>

            {/* Quick Create Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 border border-gray-200 rounded-lg p-6"
            >
              {/* Mode Toggle */}
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => {
                    setMode('link')
                    setResult(null)
                    setQrImageUrl(null)
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === 'link'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Short link
                </button>
                <button
                  onClick={() => {
                    setMode('qr')
                    setResult(null)
                    setQrImageUrl(null)
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === 'qr'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  QR Code
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your destination URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/your-long-url"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 focus:outline-none transition-all"
                  />
                </div>

                {/* Checkbox for QR (only in link mode) */}
                {mode === 'link' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="createQR"
                      checked={createQR}
                      onChange={(e) => setCreateQR(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="createQR" className="text-sm text-gray-700">
                      Also create a QR Code for this link
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={loading || (user?.plan === 'free' && links.length >= 10)}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        {mode === 'link' ? 'Create link' : 'Create QR Code'}
                      </>
                    )}
                  </button>
                  <span className="text-sm text-gray-600">
                    You can create <span className="font-medium text-gray-900">{remainingLinks}</span> more {remainingLinks === 1 ? 'link' : 'links'} this month
                  </span>
                </div>
              </form>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Link2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 mb-1">Your short link:</p>
                        <code className="text-sm text-blue-600 font-mono block truncate">{result.short_url}</code>
                      </div>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="ml-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* QR Code Display */}
                  {qrImageUrl && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-4">
                        <img
                          src={qrImageUrl}
                          alt={`QR code for ${result.slug}`}
                          className="w-32 h-32 border border-gray-200 rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-2">QR Code ready!</p>
                          <p className="text-xs text-gray-600 mb-3">Scan this code to visit your link</p>
                          <button
                            onClick={handleDownloadQR}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download PNG
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Recent Links */}
            {links.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent links</h3>
                  <button
                    onClick={() => navigate(`/${user.username}/links`)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {links.slice(0, 5).map((link) => (
                    <div
                      key={link.id}
                      className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <code className="text-sm font-mono text-blue-600 block mb-1">{link.slug}</code>
                          <p className="text-xs text-gray-600 truncate">{link.original_url}</p>
                        </div>
                        <span className={`ml-3 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          link.is_active
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
