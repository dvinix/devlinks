import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Loader2 } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const QRModal = ({ slug, shortUrl, onClose }) => {
  const [qrImageUrl, setQrImageUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchQRCode()
  }, [slug])

  const fetchQRCode = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/links/${slug}/qr`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      
      const url = URL.createObjectURL(response.data)
      setQrImageUrl(url)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch QR code:', err)
      setError('Failed to generate QR code')
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (qrImageUrl) {
      const link = document.createElement('a')
      link.href = qrImageUrl
      link.download = `${slug}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (qrImageUrl) {
        URL.revokeObjectURL(qrImageUrl)
      }
    }
  }, [qrImageUrl])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black bg-opacity-40"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">QR Code</h2>
            <p className="text-sm text-gray-600 truncate">{shortUrl}</p>
          </div>

          {/* QR Code Image */}
          <div className="flex items-center justify-center mb-6">
            {loading ? (
              <div className="w-52 h-52 flex items-center justify-center bg-gray-50 rounded-lg">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : error ? (
              <div className="w-52 h-52 flex items-center justify-center bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 text-center px-4">{error}</p>
              </div>
            ) : (
              <img
                src={qrImageUrl}
                alt={`QR code for ${slug}`}
                className="w-52 h-52 border border-gray-200 rounded-lg"
              />
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={loading || error}
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default QRModal
