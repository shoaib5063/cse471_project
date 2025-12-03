'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, User, Bell, Settings } from 'lucide-react'
import { Button } from '../ui/Button'

interface HeaderProps {
  isAuthenticated?: boolean
  userName?: string
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated = false,
  userName = 'User'
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Meal Log', href: '/meals' },
    { label: 'Recipes', href: '/recipes' },
    { label: 'Challenges', href: '/challenges' },
    { label: 'Insights', href: '/insights' }
  ]
  
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 gradient-lemonade rounded-lg flex items-center justify-center">
              <span className="text-electric font-bold text-lg">🌱</span>
            </div>
            <span className="font-display font-bold text-xl text-electric">
              MindfulMeals
            </span>
          </motion.div>
          
          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-neutral-600 hover:text-electric transition-colors duration-200 font-medium"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
          
          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <motion.button
                  className="p-2 text-neutral-600 hover:text-electric transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Bell size={20} />
                </motion.button>
                
                {/* Settings */}
                <motion.button
                  className="p-2 text-neutral-600 hover:text-electric transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Settings size={20} />
                </motion.button>
                
                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 gradient-crimson rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-neutral-700">
                    {userName}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  Login
                </Button>
                <Button variant="crimson" size="sm">
                  Sign Up
                </Button>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-neutral-600 hover:text-electric transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && isAuthenticated && (
          <motion.div
            className="md:hidden py-4 border-t border-neutral-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-neutral-600 hover:text-electric transition-colors duration-200 font-medium py-2"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}