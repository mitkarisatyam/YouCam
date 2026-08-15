'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'

const PAGE_PALETTES: Record<string, { g1: string; g2: string }> = {
  '/': {
    g1: 'rgba(197, 160, 89, 0.05)',
    g2: 'rgba(212, 175, 55, 0.03)',
  },
  '/skin-insights': {
    g1: 'rgba(212, 139, 152, 0.05)',
    g2: 'rgba(255, 218, 210, 0.04)',
  },
  '/test-look': {
    g1: 'rgba(160, 160, 180, 0.04)',
    g2: 'rgba(197, 160, 89, 0.03)',
  },
  '/settings': {
    g1: 'rgba(139, 139, 167, 0.04)',
    g2: 'rgba(200, 200, 215, 0.03)',
  },
  '/history': {
    g1: 'rgba(170, 160, 140, 0.04)',
    g2: 'rgba(200, 190, 170, 0.03)',
  },
}

const DEFAULT_PALETTE = PAGE_PALETTES['/']

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const palette = useMemo(() => {
    return PAGE_PALETTES[pathname] || DEFAULT_PALETTE
  }, [pathname])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[var(--bg-primary)]">
      {/* Soft Ambient Gradients */}
      <div className="absolute inset-0 transition-colors duration-1000 opacity-60">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 15% 15%, ${palette.g1}, transparent 40%),
              radial-gradient(circle at 85% 85%, ${palette.g2}, transparent 40%)
            `,
          }}
        />
      </div>

      {/* Film-Grain Texture Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.015] mix-blend-overlay">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  )
}
