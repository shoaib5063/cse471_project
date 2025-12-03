'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  gradient?: 'crimson' | 'lemonade' | 'electric' | 'nights' | 'none'
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  gradient = 'none',
  onClick
}) => {
  const baseClasses = 'rounded-2xl p-6 transition-all duration-300'
  
  const gradientClasses = {
    crimson: 'gradient-crimson text-white',
    lemonade: 'gradient-lemonade text-electric',
    electric: 'gradient-electric text-white',
    nights: 'gradient-nights text-white',
    none: 'bg-white shadow-lg border border-neutral-200'
  }
  
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : ''
  
  return (
    <motion.div
      className={`${baseClasses} ${gradientClasses[gradient]} ${hoverClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}