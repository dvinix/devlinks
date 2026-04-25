import React from 'react'
import { motion } from 'framer-motion'
import { Twitter, Github, Linkedin, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold gradient-text mb-3">DevLinks</div>
            <p className="text-gray-400 max-w-sm">
              Link intelligence platform built for India. Track, analyze, and optimize your WhatsApp-first sharing strategy.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#analytics" className="text-gray-400 hover:text-white transition-colors">
                  Analytics
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  API Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 DevLinks. Built with ❤️ in India.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Github className="w-5 h-5 text-gray-400 hover:text-white" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-white" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              href="#"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5 text-gray-400 hover:text-white" />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
