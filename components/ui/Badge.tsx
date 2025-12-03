'use client'

import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'crimson' | 'lemonade' | 'electric' | 'nights' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'lemonade',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center font-semibold rounded-full'
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  const variantClasses = {
    crimson: 'bg-crimson/10 text-crimson border border-crimson/20',
    lemonade: 'bg-lemonade/20 text-electric border border-lemonade/30',
    electric: 'bg-electric/10 text-electric border border-electric/20',
    nights: 'bg-nights/10 text-nights border border-nights/20',
    neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200'
  }
  
  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}