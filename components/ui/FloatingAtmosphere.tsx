'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useMemo, useEffect, useState } from 'react'

export function FloatingAtmosphere() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const elements = useMemo(() => {
    if (pathname.includes('/skin-insights')) {
      return [
        { type: 'drop', x: '10vw', y: '20vh', size: 120, delay: 0 },
        { type: 'drop', x: '80vw', y: '60vh', size: 80, delay: 2 },
        { type: 'line', x: '60vw', y: '10vh', size: 200, delay: 1 },
      ]
    }
    if (pathname.includes('/hair-studio')) {
      return [
        { type: 'ribbon', x: '15vw', y: '15vh', size: 300, delay: 0 },
        { type: 'ribbon', x: '75vw', y: '70vh', size: 250, delay: 2 },
      ]
    }
    if (pathname === '/') {
      return [
        { type: 'hanger', x: '10vw', y: '20vh', size: 150, delay: 0 },
        { type: 'ribbon', x: '85vw', y: '50vh', size: 300, delay: 1 },
      ]
    }
    return []
  }, [pathname])

  if (!mounted || elements.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
      {elements.map((el, idx) => (
        <motion.div
          key={\`\${pathname}-\${idx}\`}
          className="absolute"
          style={{
            left: el.x,
            top: el.y,
            width: el.size,
            height: el.size,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0, 0.5, 0.5, 0],
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            delay: el.delay,
            ease: "linear"
          }}
        >
          {el.type === 'drop' && (
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full stroke-[var(--text-primary)] opacity-20">
              <path d="M50 10 C50 10, 80 50, 80 70 A30 30 0 0 1 20 70 C20 50, 50 10, 50 10 Z" strokeWidth="1" />
            </svg>
          )}
          {el.type === 'ribbon' && (
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full stroke-[var(--text-primary)] opacity-20">
              <path d="M10 50 Q 30 20, 50 50 T 90 50" strokeWidth="1" />
            </svg>
          )}
          {el.type === 'line' && (
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full stroke-[var(--text-primary)] opacity-20">
              <path d="M20 20 Q 50 80, 80 20" strokeWidth="1" />
            </svg>
          )}
          {el.type === 'hanger' && (
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full stroke-[var(--text-primary)] opacity-20">
              <path d="M50 10 C 60 10, 60 25, 50 30 L 10 60 L 90 60 Z" strokeWidth="1" />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  )
}
