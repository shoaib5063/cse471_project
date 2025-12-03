'use client'

import React from 'react'

interface InputProps {
  label?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  className?: string
  error?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  className = '',
  error
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-crimson ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lemonade/50 focus:border-lemonade ${
          error 
            ? 'border-crimson bg-red-50' 
            : 'border-neutral-300 bg-white hover:border-neutral-400 focus:border-lemonade'
        }`}
      />
      {error && (
        <p className="text-sm text-crimson">{error}</p>
      )}
    </div>
  )
}