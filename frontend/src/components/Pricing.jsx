import React from 'react'
import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: [
      '10 shortened links',
      'Basic analytics',
      'WhatsApp detection',
      'QR code generation',
      'Community support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹299',
    period: '/month',
    features: [
      'Unlimited links',
      'Advanced analytics',
      'OG tag override',
      'Custom QR codes',
      'Expiring links',
      'Link-in-bio pages',
      'Priority support',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
]

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h2>
          <p className="text-xl text-gray-400">
            Start free, upgrade when you're ready
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`relative ${
                plan.popular ? 'gradient-border glow-mixed' : 'glass-card'
              } p-8 hover:scale-105 transition-all duration-300`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full text-sm font-semibold">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold gradient-text">{plan.price}</span>
                <span className="text-gray-400 ml-2">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-500 hover:shadow-lg hover:shadow-violet-500/50'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
