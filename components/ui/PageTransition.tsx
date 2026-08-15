'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const getTransitionVariants = (pathname: string) => {
  // Shared easing curve for premium feel
  const transition = { duration: 1.2, ease: [0.16, 1, 0.3, 1] }

  if (pathname.includes('/skin-insights')) {
    return {
      initial: { opacity: 0, scale: 0.95, filter: 'blur(20px) contrast(0.8)', backgroundColor: 'var(--bg-primary)' },
      animate: { opacity: 1, scale: 1, filter: 'blur(0px) contrast(1)', backgroundColor: 'transparent' },
      exit: { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
      transition
    }
  }

  if (pathname.includes('/hair-studio')) {
    return {
      initial: { opacity: 0, x: -50, filter: 'blur(15px)' },
      animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
      exit: { opacity: 0, x: 50, filter: 'blur(10px)' },
      transition
    }
  }

  if (pathname.includes('/wardrobe')) {
    return {
      initial: { opacity: 0, y: 50, scale: 1.05 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -50, scale: 0.95 },
      transition
    }
  }

  if (pathname.includes('/test-look')) {
    return {
      initial: { opacity: 0, scale: 1.1, filter: 'blur(30px) saturate(0)' },
      animate: { opacity: 1, scale: 1, filter: 'blur(0px) saturate(1)' },
      exit: { opacity: 0, scale: 0.9, filter: 'blur(20px) saturate(0)' },
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] }
    }
  }

  // Default elegant transition
  return {
    initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -20, filter: 'blur(8px)' },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const variants = getTransitionVariants(pathname)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={variants.transition}
        className="w-full min-h-screen perspective-1000 origin-center"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
