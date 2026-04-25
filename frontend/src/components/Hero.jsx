import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const [url, setUrl] = useState('')
  const [shortened, setShortened] = useState('devl.ink/abc123')
  const [copied, setCopied] = useState(false)
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  const handleCopy = () => {
    navigator.clipboard.writeText(shortened)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShorten = () => {
    // Redirect to auth/dashboard for actual shortening
    navigate('/auth')
  }

  return (
    <section className="relative pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          Your links. <span className="gradient-text">Smarter.</span>
          <br />
          Built for WhatsApp.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          Track every click from WhatsApp, Instagram, and beyond. Smart analytics built for Indian creators and businesses.
        </motion.p>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className={`relative ${focused ? 'animated-gradient-border' : 'glass-card'} p-2 transition-all`}>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Paste your long URL here..."
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-500 outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShorten}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
              >
                Shorten
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Shortened Link Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card max-w-md mx-auto p-4 flex items-center justify-between"
        >
          <span className="text-cyan-400 font-mono">{shortened}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-gray-400" />
            )}
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
