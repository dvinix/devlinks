import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Smartphone, MapPin } from 'lucide-react'

const Analytics = () => {
  const chartData = [
    { day: 'Mon', clicks: 120 },
    { day: 'Tue', clicks: 180 },
    { day: 'Wed', clicks: 150 },
    { day: 'Thu', clicks: 240 },
    { day: 'Fri', clicks: 320 },
    { day: 'Sat', clicks: 280 },
    { day: 'Sun', clicks: 200 },
  ]

  const maxClicks = Math.max(...chartData.map(d => d.clicks))

  return (
    <section id="analytics" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Know exactly where <span className="gradient-text">every click</span> came from
          </h2>
          <p className="text-xl text-gray-400">
            Real-time analytics that actually matter
          </p>
        </motion.div>

        {/* Analytics Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-12"
        >
          {/* Stats Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                <div>
                  <div className="text-sm text-gray-400">Total Clicks</div>
                  <div className="text-2xl font-bold">1,490</div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-sm text-gray-400">WhatsApp Clicks</div>
                  <div className="text-2xl font-bold">892</div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-400">Top Country</div>
                  <div className="text-2xl font-bold">🇮🇳 India</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-6">Clicks over last 7 days</h3>
            <div className="flex items-end justify-between gap-4 h-64">
              {chartData.map((data, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(data.clicks / maxClicks) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full bg-gradient-to-t from-violet-600 to-cyan-500 rounded-t-lg relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-elevated px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.clicks}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{data.day}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Mobile</span>
                  <span className="font-semibold">68%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '68%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-violet-600 to-cyan-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Desktop</span>
                  <span className="font-semibold">24%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '24%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-violet-600 to-cyan-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Tablet</span>
                  <span className="font-semibold">8%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '8%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full bg-gradient-to-r from-violet-600 to-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const MessageCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

export default Analytics
