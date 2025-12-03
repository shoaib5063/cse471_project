'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Star } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-lemonade/20 via-white to-electric/10" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 gradient-lemonade rounded-full opacity-20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 gradient-crimson rounded-full opacity-20"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-12 h-12 gradient-electric rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -180, -360]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Main Heading */}
          <div className="space-y-4">
            <motion.h1 
              className="text-5xl md:text-7xl font-display font-bold text-electric leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Mindful
              <span className="block gradient-lemonade bg-clip-text text-transparent">
                Meals
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-neutral-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Track your meals, nourish your body, and discover mindful eating.
              <span className="block mt-2 text-lg text-neutral-500">
                Transform your relationship with food through awareness and insights.
              </span>
            </motion.p>
          </div>
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button variant="crimson" size="lg" className="min-w-[200px]">
              Start Your Journey
              <ArrowRight size={20} />
            </Button>
            <Button variant="outline" size="lg" className="min-w-[200px]">
              <Play size={20} />
              Watch Demo
            </Button>
          </motion.div>
          
          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="text-center">
              <div className="text-3xl font-bold text-crimson mb-2">10K+</div>
              <div className="text-neutral-600">Happy Users</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-electric mb-2">50M+</div>
              <div className="text-neutral-600">Meals Tracked</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-lemonade mb-2">95%</div>
              <div className="text-neutral-600">Success Rate</div>
            </Card>
          </motion.div>
          
          {/* Social Proof */}
          <motion.div 
            className="flex items-center justify-center space-x-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-neutral-600 text-sm">
              Rated 4.9/5 by our community
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}