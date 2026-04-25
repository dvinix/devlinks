import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import StatsBar from '../components/StatsBar'
import Features from '../components/Features'
import Analytics from '../components/Analytics'
import Pricing from '../components/Pricing'
import Footer from '../components/Footer'

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-dark-base overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 dot-pattern opacity-50 pointer-events-none" />
      
      {/* Floating Orbs */}
      <div className="floating-orb w-96 h-96 bg-violet-600 top-20 -left-48" style={{ animationDelay: '0s' }} />
      <div className="floating-orb w-96 h-96 bg-cyan-500 top-1/3 -right-48" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-96 h-96 bg-violet-600 bottom-20 left-1/4" style={{ animationDelay: '4s' }} />
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <StatsBar />
        <Features />
        <Analytics />
        <Pricing />
        <Footer />
      </div>
    </div>
  )
}

export default LandingPage
