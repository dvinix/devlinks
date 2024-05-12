import React, { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Link2, 
  MessageCircle, 
  QrCode, 
  BarChart3, 
  Clock, 
  Zap,
  Check,
  ArrowRight,
  Globe,
  Smartphone,
  Chrome,
  Copy,
  CheckCircle2
} from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const LandingPage = () => {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [demoUrl, setDemoUrl] = useState('')
  const [demoResult, setDemoResult] = useState(null)
  const [demoLoading, setDemoLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDemoShorten = async (e) => {
    e.preventDefault()
    if (!demoUrl) return

    setDemoLoading(true)
    
    // Show fake result for demo (since user isn't logged in)
    setTimeout(() => {
      const randomSlug = Math.random().toString(36).substring(2, 8)
      setDemoResult({
        short_url: `${window.location.origin}/${randomSlug}`,
        original_url: demoUrl,
        slug: randomSlug
      })
      setDemoLoading(false)
    }, 800)
  }

  const handleCopyDemo = () => {
    if (demoResult) {
      navigator.clipboard.writeText(demoResult.short_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-white border-b border-gray-200 shadow-sm' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xl font-semibold text-gray-900">
              DevLinks
            </button>
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('features')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Shorten. Share. See who clicked.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 mb-12"
          >
            Built for WhatsApp-first creators and businesses in India.
          </motion.p>

          {/* Live Demo Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <form onSubmit={handleDemoShorten} className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://example.com/your-long-url"
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 focus:outline-none transition-all"
                required
              />
              <button
                type="submit"
                disabled={demoLoading}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {demoLoading ? 'Shortening...' : 'Shorten'}
              </button>
            </form>

            {/* Demo Result */}
            {demoResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Link2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <code className="text-sm text-blue-600 font-mono truncate">{demoResult.short_url}</code>
                </div>
                <button
                  onClick={handleCopyDemo}
                  className="ml-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors"
            >
              See how it works
            </button>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 px-6 border-y border-gray-200 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-2xl font-semibold text-gray-900 mb-1">8,000+</div>
              <div className="text-sm text-gray-600">clicks tracked</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-2xl font-semibold text-gray-900 mb-1">150+</div>
              <div className="text-sm text-gray-600">creators</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-2xl font-semibold text-gray-900 mb-1">India · UAE · UK</div>
              <div className="text-sm text-gray-600">global reach</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to track your links
            </h2>
            <p className="text-lg text-gray-600">
              Built for the way India shares content
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp traffic detection</h3>
                <p className="text-gray-600">Know exactly how many clicks came from WhatsApp. No other tool shows this.</p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom short slugs</h3>
                <p className="text-gray-600">Create memorable links like devl.ink/sale or devl.ink/offer2024.</p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">QR code per link</h3>
                <p className="text-gray-600">Generate QR codes instantly for offline marketing and print materials.</p>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Click analytics</h3>
                <p className="text-gray-600">See device types, countries, browsers, and traffic sources for every link.</p>
              </div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Link expiry</h3>
                <p className="text-gray-600">Set expiration dates for time-sensitive campaigns and offers.</p>
              </div>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast redirects</h3>
                <p className="text-gray-600">Redis-cached redirects under 10ms. Your users won't notice the hop.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600">
              Start free, upgrade when you need more
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-gray-200 rounded-lg p-8"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">₹0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">10 links</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Basic analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">WhatsApp detection</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="w-5 h-5 flex-shrink-0 mt-0.5"></span>
                  <span className="text-gray-400 line-through">Custom slugs</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Start free
              </button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border-2 border-blue-600 rounded-lg p-8 relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  Most popular
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">₹299</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Unlimited links</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Custom slugs</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">QR codes</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Analytics export</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Priority support</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/register')}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade to Pro
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Tagline */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">DevLinks</h3>
              <p className="text-gray-600 mb-4">
                The link shortener built for WhatsApp-first India.
              </p>
              <p className="text-sm text-gray-500">
                Built for India 🇮🇳
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('features')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Dashboard
                  </button>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            © 2026 DevLinks. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
