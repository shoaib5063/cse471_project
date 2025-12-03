'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'

export const Footer: React.FC = () => {
  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Recipes', href: '/recipes' },
      { label: 'Challenges', href: '/challenges' }
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' }
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' }
    ]
  }
  
  return (
    <footer className="bg-nights text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 gradient-lemonade rounded-lg flex items-center justify-center">
                <span className="text-electric font-bold text-lg">🌱</span>
              </div>
              <span className="font-display font-bold text-xl">
                MindfulMeals
              </span>
            </motion.div>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Track your meals, nourish your body, and discover mindful eating. 
              Transform your relationship with food through awareness and insights.
            </p>
            <div className="flex items-center space-x-4">
              <motion.a
                href="mailto:hello@mindfulmeals.com"
                className="flex items-center space-x-2 text-neutral-300 hover:text-lemonade transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
              >
                <Mail size={16} />
                <span className="text-sm">hello@mindfulmeals.com</span>
              </motion.a>
            </div>
          </div>
          
          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-300 hover:text-lemonade transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-300 hover:text-lemonade transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-300 hover:text-lemonade transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-neutral-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">
            © 2024 MindfulMeals. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-neutral-400 text-sm mt-4 md:mt-0">
            <span>Made with</span>
            <Heart size={16} className="text-crimson" />
            <span>for healthier living</span>
          </div>
        </div>
      </div>
    </footer>
  )
}