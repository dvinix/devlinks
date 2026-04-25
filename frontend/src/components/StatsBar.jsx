import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Globe } from 'lucide-react'

const stats = [
  { icon: TrendingUp, value: '8,000+', label: 'Clicks Tracked' },
  { icon: Users, value: '150+', label: 'Creators' },
  { icon: Globe, value: '4', label: 'Countries' },
]

const StatsBar = () => {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 text-center hover:glow-mixed transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 mb-4">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
