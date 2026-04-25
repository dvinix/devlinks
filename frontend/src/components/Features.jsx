import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Image, User, QrCode, Timer, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    title: 'WhatsApp Traffic Detection',
    description: 'Automatically identify and track clicks coming from WhatsApp with precision.',
  },
  {
    icon: Image,
    title: 'Smart OG Tag Override',
    description: 'Customize preview images and titles for each platform dynamically.',
  },
  {
    icon: User,
    title: 'Link-in-Bio Page',
    description: 'Beautiful, mobile-optimized landing pages for all your important links.',
  },
  {
    icon: QrCode,
    title: 'QR Code with Analytics',
    description: 'Generate trackable QR codes and see exactly who scanned them.',
  },
  {
    icon: Timer,
    title: 'Expiring Links + Countdown',
    description: 'Create time-limited links with countdown timers for urgency.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Dashboard',
    description: 'Watch clicks roll in live with detailed geographic and device data.',
  },
]

const Features = () => {
  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to <span className="gradient-text">grow</span>
          </h2>
          <p className="text-xl text-gray-400">
            Powerful features designed for the Indian digital ecosystem
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card p-8 hover:glow-mixed transition-all duration-300 cursor-pointer"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 mb-6">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
