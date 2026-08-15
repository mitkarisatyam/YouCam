'use client'

import { useState, useEffect } from 'react'
import { motion, useSpring } from 'framer-motion'

export function CursorInteraction() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Use springs for buttery smooth, slightly delayed magnetic following
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 }
  const cursorX = useSpring(-100, springConfig)
  const cursorY = useSpring(-100, springConfig)

  useEffect(() => {
    // Only enable on desktop
    const checkDesktop = () => setIsDesktop(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
    checkDesktop()
    
    if (!isDesktop) return

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', moveCursor)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    document.documentElement.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [cursorX, cursorY, isDesktop, isVisible])

  if (!isDesktop) return null

  return (
    <>
      {/* Soft Light that follows the cursor */}
      <motion.div
        className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0 mix-blend-screen"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, color-mix(in srgb, var(--text-primary) 8%, transparent) 0%, transparent 60%)',
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.5 } }}
      />
    </>
  )
}
