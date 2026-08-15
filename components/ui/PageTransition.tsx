'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 30, scale: 0.96, filter: 'blur(12px) brightness(0.8)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px) brightness(1)' }}
        exit={{ opacity: 0, y: -20, scale: 1.02, filter: 'blur(8px) brightness(1.2)' }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1], // Custom sophisticated curve
        }}
        className="w-full h-full perspective-1000"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
