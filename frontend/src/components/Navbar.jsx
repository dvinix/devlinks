import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-surface/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="text-2xl font-bold gradient-text">
          DevLinks
        </button>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors">
            Features
          </a>
          <a href="#analytics" className="text-gray-300 hover:text-white transition-colors">
            Analytics
          </a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
            Pricing
          </a>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/auth')}
          className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
        >
          Get Started Free
        </motion.button>
      </div>
    </motion.nav>
  )
}

export default Navbar
