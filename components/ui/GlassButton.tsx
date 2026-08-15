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
  const baseClasses =
    'relative inline-flex items-center justify-center gap-2 rounded-full font-medium text-xs sm:text-sm px-7 py-3 cursor-pointer select-none overflow-hidden'

  const variantClasses = {
    primary: 'btn-primary shadow-xl',
    secondary: 'btn-secondary shadow-md',
    glass: 'glass-level-1 text-[var(--text-primary)] hover:border-[var(--accent-gold)] shadow-lg',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Glass reflection sweep on hover */}
      <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
        <span className="absolute top-0 left-[-100%] w-[60%] h-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent group-hover:left-[120%] transition-all duration-600" />
      </span>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
}
