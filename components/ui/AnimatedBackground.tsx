'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'

/* ── Page-Specific Atmosphere Color Palettes ─────────────────────────────── */
const PAGE_PALETTES: Record<string, { g1: string; g2: string; g3: string; g4: string; particle: string }> = {
  '/': {
    g1: 'rgba(197, 160, 89, 0.12)',
    g2: 'rgba(212, 175, 55, 0.08)',
    g3: 'rgba(255, 248, 235, 0.15)',
    g4: 'rgba(180, 140, 70, 0.06)',
    particle: 'rgba(197, 160, 89, 0.4)',
  },
  '/skin-insights': {
    g1: 'rgba(212, 139, 152, 0.12)',
    g2: 'rgba(255, 218, 210, 0.10)',
    g3: 'rgba(248, 230, 225, 0.18)',
    g4: 'rgba(200, 160, 170, 0.08)',
    particle: 'rgba(212, 139, 152, 0.35)',
  },
  '/test-look': {
    g1: 'rgba(160, 160, 180, 0.10)',
    g2: 'rgba(197, 160, 89, 0.08)',
    g3: 'rgba(220, 215, 205, 0.14)',
    g4: 'rgba(170, 170, 190, 0.06)',
    particle: 'rgba(180, 175, 165, 0.35)',
  },
  '/settings': {
    g1: 'rgba(139, 139, 167, 0.10)',
    g2: 'rgba(200, 200, 215, 0.08)',
    g3: 'rgba(230, 230, 240, 0.12)',
    g4: 'rgba(160, 160, 180, 0.06)',
    particle: 'rgba(139, 139, 167, 0.3)',
  },
  '/history': {
    g1: 'rgba(170, 160, 140, 0.10)',
    g2: 'rgba(200, 190, 170, 0.07)',
    g3: 'rgba(230, 225, 215, 0.12)',
    g4: 'rgba(180, 170, 150, 0.05)',
    particle: 'rgba(170, 160, 140, 0.3)',
  },
}

const DEFAULT_PALETTE = PAGE_PALETTES['/']

/* ── Fashion Silhouette SVG Paths ─────────────────────────────────────── */
const FASHION_SILHOUETTES = [
  // Dress silhouette
  'M20 5 Q20 2 22 2 L28 2 Q30 2 30 5 L32 18 Q32 22 28 24 L22 24 Q18 22 18 18 Z',
  // Hanger
  'M15 8 L25 2 L35 8 M25 2 L25 0',
  // Perfume bottle
  'M22 6 L28 6 L28 4 L30 4 L30 2 L20 2 L20 4 L22 4 Z M21 6 L19 18 Q19 20 21 20 L29 20 Q31 20 31 18 L29 6',
  // Mirror frame (oval)
  'M25 4 Q35 4 35 15 Q35 26 25 26 Q15 26 15 15 Q15 4 25 4 Z M25 6 Q33 6 33 15 Q33 24 25 24 Q17 24 17 15 Q17 6 25 6',
  // Lipstick
  'M23 20 L27 20 L27 8 Q27 6 25 4 Q23 6 23 8 Z',
]

/* ── Floating Orb Configuration ──────────────────────────────────────── */
const ORBS = [
  { size: '42vw', x: '-8%', y: '-12%', blur: 130, opacity: 0.5, anim: 'drift-1', duration: '28s' },
  { size: '38vw', x: '65%', y: '15%', blur: 140, opacity: 0.3, anim: 'drift-2', duration: '34s' },
  { size: '50vw', x: '15%', y: '70%', blur: 160, opacity: 0.35, anim: 'drift-3', duration: '30s' },
  { size: '30vw', x: '70%', y: '60%', blur: 120, opacity: 0.25, anim: 'drift-4', duration: '26s' },
  { size: '35vw', x: '40%', y: '-5%', blur: 150, opacity: 0.2, anim: 'drift-5', duration: '32s' },
  { size: '25vw', x: '5%', y: '40%', blur: 110, opacity: 0.28, anim: 'drift-1', duration: '36s' },
  { size: '28vw', x: '80%', y: '80%', blur: 135, opacity: 0.22, anim: 'drift-3', duration: '38s' },
  { size: '20vw', x: '50%', y: '30%', blur: 100, opacity: 0.18, anim: 'drift-2', duration: '24s' },
]

/* ── Particle Configuration ──────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  delay: `${Math.random() * 12}s`,
  duration: `${10 + Math.random() * 15}s`,
  size: 2 + Math.random() * 3,
  opacity: 0.2 + Math.random() * 0.35,
}))

/* ── Fashion Silhouette Items ────────────────────────────────────────── */
const FASHION_ITEMS = [
  { path: FASHION_SILHOUETTES[0], x: '8%', y: '20%', size: 60, rotation: -12, delay: '0s', duration: '40s' },
  { path: FASHION_SILHOUETTES[1], x: '85%', y: '15%', size: 50, rotation: 8, delay: '5s', duration: '35s' },
  { path: FASHION_SILHOUETTES[2], x: '75%', y: '70%', size: 45, rotation: -5, delay: '10s', duration: '42s' },
  { path: FASHION_SILHOUETTES[3], x: '12%', y: '75%', size: 55, rotation: 15, delay: '3s', duration: '38s' },
  { path: FASHION_SILHOUETTES[4], x: '50%', y: '85%', size: 35, rotation: -8, delay: '7s', duration: '36s' },
]

/* ── Light Ray Configuration ─────────────────────────────────────────── */
const LIGHT_RAYS = [
  { angle: -35, width: '200px', left: '20%', delay: '0s', duration: '20s' },
  { angle: -25, width: '150px', left: '60%', delay: '8s', duration: '25s' },
  { angle: -40, width: '180px', left: '80%', delay: '4s', duration: '22s' },
]

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
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* ═══ LAYER 1: Animated Gradient Mesh ═══ */}
      <div className="absolute inset-0 transition-colors duration-1000">
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, ${palette.g1}, transparent),
              radial-gradient(ellipse 70% 50% at 80% 20%, ${palette.g2}, transparent),
              radial-gradient(ellipse 90% 70% at 50% 80%, ${palette.g3}, transparent),
              radial-gradient(ellipse 60% 80% at 70% 60%, ${palette.g4}, transparent)
            `,
          }}
        />
        <div className="absolute inset-0 bg-[var(--bg-primary)] opacity-60 transition-colors duration-700" />
      </div>

      {/* ═══ LAYER 2: Floating Glass Orbs ═══ */}
      {ORBS.map((orb, i) => (
        <div
          key={`orb-${i}`}
          className={`absolute rounded-full animate-${orb.anim}`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${palette.g1}, transparent 70%)`,
            filter: `blur(${orb.blur}px)`,
            opacity: orb.opacity,
            animationDuration: orb.duration,
            willChange: 'transform',
          }}
        />
      ))}

      {/* ═══ LAYER 3: Floating Fashion Silhouettes ═══ */}
      {FASHION_ITEMS.map((item, i) => (
        <div
          key={`fashion-${i}`}
          className="absolute animate-fashion-float"
          style={{
            left: item.x,
            top: item.y,
            animationDuration: item.duration,
            animationDelay: item.delay,
            willChange: 'transform',
          }}
        >
          <svg
            width={item.size}
            height={item.size}
            viewBox="0 0 50 30"
            fill="none"
            style={{
              transform: `rotate(${item.rotation}deg)`,
              opacity: 0.06,
              filter: 'blur(1.5px)',
            }}
          >
            <path
              d={item.path}
              stroke="var(--text-muted)"
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}

      {/* ═══ LAYER 4: Drifting Particles ═══ */}
      {PARTICLES.map(p => (
        <div
          key={`particle-${p.id}`}
          className="absolute rounded-full animate-particle-fall"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: palette.particle,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* ═══ LAYER 5: Light Rays ═══ */}
      {LIGHT_RAYS.map((ray, i) => (
        <div
          key={`ray-${i}`}
          className="absolute animate-light-ray"
          style={{
            left: ray.left,
            top: '-20%',
            width: ray.width,
            height: '140%',
            background: `linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 70%, transparent 100%)`,
            transform: `rotate(${ray.angle}deg)`,
            transformOrigin: 'top center',
            animationDelay: ray.delay,
            animationDuration: ray.duration,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* ═══ Film-Grain Texture Overlay ═══ */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025] mix-blend-overlay">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* ═══ Soft Radial Glow Spotlight ═══ */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.06),transparent_65%)]" />
    </div>
  )
}
