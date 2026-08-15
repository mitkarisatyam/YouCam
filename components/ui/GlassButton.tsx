'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'glass'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}: GlassButtonProps) {
  // Map legacy 'glass' to 'secondary'
  const finalVariant = variant === 'glass' ? 'secondary' : variant

  const variantClasses = {
    primary: 'btn-primary liquid-glass',
    secondary: 'btn-secondary liquid-glass',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${variantClasses[finalVariant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  )
}
