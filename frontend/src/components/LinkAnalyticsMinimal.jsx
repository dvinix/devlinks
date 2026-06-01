import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Smartphone, Globe, Chrome, MessageCircle, MapPin } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const LinkAnalyticsMinimal = ({ link, onBack }) => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(
        `${API_URL}/analytics/${link.slug}?days=${days}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAnalytics(response.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  const maxClicks = Math.max(...(analytics?.daily_clicks?.map(d => d.count) || [1]))
  const whatsappClicks = analytics?.sources?.find(s => s._id?.toLowerCase().includes('whatsapp'))?.count || 0
  const whatsappPercentage = analytics?.total_clicks > 0 
    ? ((whatsappClicks / analytics.total_clicks) * 100).toFixed(1) 
    : 0

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">{link.slug}</h1>
            <p className="text-sm text-gray-600 truncate">{link.original_url}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Time Period Selector */}
        <div className="flex gap-2 mb-8">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                days === d
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <div className="text-3xl font-semibold text-gray-900">{analytics?.total_clicks || 0}</div>
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
            <div className="text-3xl font-semibold text-gray-900">{whatsappClicks}</div>
            <div className="text-sm text-gray-500 mt-1">{whatsappPercentage}% of total</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white rounded-md border border-gray-200">
                <Smartphone className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-600">Top Device</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900 capitalize">
              {analytics?.devices?.[0]?._id || 'N/A'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white rounded-md border border-gray-200">
                <Globe className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm text-gray-600">Top Country</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {analytics?.top_locations?.[0]?._id?.country || 'N/A'}
            </div>
          </motion.div>
        </div>

        {/* Clicks Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-8 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Clicks Over Time</h2>
          <div className="flex items-end justify-between gap-2 h-64">
            {analytics?.daily_clicks?.length > 0 ? (
              analytics.daily_clicks.map((data, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.count / maxClicks) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                  className="flex-1 flex flex-col items-center gap-2 min-w-0"
                >
                  <div className="w-full bg-blue-600 rounded-t relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.count} clicks
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 truncate w-full text-center">
                    {new Date(data._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center text-gray-500">No data available</div>
            )}
          </div>
        </motion.div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Devices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-gray-600" />
              Devices
            </h3>
            <div className="space-y-3">
              {analytics?.devices?.slice(0, 5).map((device, index) => {
                const percentage = ((device.count / analytics.total_clicks) * 100).toFixed(1)
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{device._id || 'Unknown'}</span>
                      <span className="font-medium text-gray-900">{device.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Browsers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Chrome className="w-5 h-5 text-gray-600" />
              Browsers
            </h3>
            <div className="space-y-3">
              {analytics?.browsers?.slice(0, 5).map((browser, index) => {
                const percentage = ((browser.count / analytics.total_clicks) * 100).toFixed(1)
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{browser._id || 'Unknown'}</span>
                      <span className="font-medium text-gray-900">{browser.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gray-600" />
              Traffic Sources
            </h3>
            <div className="space-y-3">
              {analytics?.sources?.slice(0, 5).map((source, index) => {
                const percentage = ((source.count / analytics.total_clicks) * 100).toFixed(1)
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{source._id || 'Direct'}</span>
                      <span className="font-medium text-gray-900">{source.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              Top Locations
            </h3>
            <div className="space-y-3">
              {analytics?.top_locations?.slice(0, 5).map((location, index) => {
                const percentage = ((location.count / analytics.total_clicks) * 100).toFixed(1)
                return (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {location._id?.city || 'Unknown'}, {location._id?.country || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">{percentage}% of traffic</div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{location.count}</div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default LinkAnalyticsMinimal
