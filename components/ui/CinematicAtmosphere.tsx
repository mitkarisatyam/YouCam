'use client'

import { useEffect, useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

type AtmosphereMode = 'fashion' | 'skin' | 'hair' | 'wardrobe' | 'vto' | 'default'

const MODE_CONFIGS: Record<AtmosphereMode, {
  color1: string
  color2: string
  color3: string
  particleCount: number
  particleColor: string
}> = {
  fashion: {
    color1: 'rgba(212, 175, 55, 0.1)',   // Gold
    color2: 'rgba(197, 160, 89, 0.08)',  // Warm neutral
    color3: 'rgba(255, 255, 255, 0.05)',
    particleCount: 12,
    particleColor: 'rgba(255,255,255,0.4)'
  },
  skin: {
    color1: 'rgba(255, 218, 210, 0.15)', // Soft blush
    color2: 'rgba(212, 139, 152, 0.1)',  // Dusty rose
    color3: 'rgba(255, 240, 245, 0.08)',
    particleCount: 15,
    particleColor: 'rgba(255,218,210,0.6)'
  },
  hair: {
    color1: 'rgba(160, 160, 180, 0.1)',  // Silver
    color2: 'rgba(190, 180, 200, 0.08)', // Lavender tint
    color3: 'rgba(200, 200, 215, 0.05)',
    particleCount: 20,
    particleColor: 'rgba(200,200,215,0.5)'
  },
  wardrobe: {
    color1: 'rgba(170, 160, 140, 0.12)', // Khaki / taupe
    color2: 'rgba(200, 190, 170, 0.08)',
    color3: 'rgba(150, 140, 130, 0.05)',
    particleCount: 10,
    particleColor: 'rgba(200,190,170,0.4)'
  },
  vto: {
    color1: 'rgba(50, 50, 70, 0.2)',     // Deep charcoal/blue
    color2: 'rgba(100, 100, 120, 0.1)',
    color3: 'rgba(197, 160, 89, 0.05)',  // Subtle gold accent
    particleCount: 8,
    particleColor: 'rgba(255,255,255,0.3)'
  },
  default: {
    color1: 'rgba(200, 200, 200, 0.08)',
    color2: 'rgba(150, 150, 150, 0.05)',
    color3: 'rgba(100, 100, 100, 0.03)',
    particleCount: 10,
    particleColor: 'rgba(200,200,200,0.3)'
  }
}

function getMode(pathname: string): AtmosphereMode {
  if (pathname.includes('/skin-insights')) return 'skin'
  if (pathname.includes('/hair-studio')) return 'hair'
  if (pathname.includes('/wardrobe')) return 'wardrobe'
  if (pathname.includes('/test-look') || pathname.includes('/shopping')) return 'vto'
  if (pathname === '/') return 'fashion'
  return 'default'
}

export function CinematicAtmosphere() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const mode = useMemo(() => getMode(pathname), [pathname])
  const config = MODE_CONFIGS[mode]

  const particles = useMemo(() => {
    return Array.from({ length: config.particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }))
  }, [config.particleCount])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden bg-[var(--bg-primary)] transition-colors duration-1000">
      
      {/* Dynamic Animated Mesh Gradients */}
      <motion.div 
        className="absolute inset-0 opacity-70 mix-blend-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 2 }}
      >
        <motion.div
          className="absolute rounded-full blur-[100px]"
          style={{ background: config.color1, width: '60vw', height: '60vh' }}
          animate={{
            x: ['-10vw', '10vw', '-10vw'],
            y: ['-10vh', '10vh', '-10vh'],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full blur-[120px]"
          style={{ background: config.color2, width: '50vw', height: '50vh', right: '-10vw', top: '20vh' }}
          animate={{
            x: ['10vw', '-10vw', '10vw'],
            y: ['10vh', '-10vh', '10vh'],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute rounded-full blur-[150px]"
          style={{ background: config.color3, width: '70vw', height: '40vh', bottom: '-10vh', left: '15vw' }}
          animate={{
            x: ['0vw', '5vw', '0vw'],
            y: ['5vh', '-5vh', '5vh'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
      </motion.div>

      {/* Cinematic Particle System */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: \`\${p.x}%\`,
              top: \`\${p.y}%\`,
              width: p.size,
              height: p.size,
              background: config.particleColor,
              boxShadow: \`0 0 \${p.size * 2}px \${config.particleColor}\`
            }}
            animate={{
              y: ['0vh', '-20vh'],
              x: ['0vw', \`\${Math.random() * 10 - 5}vw\`],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Deep Film-Grain Texture Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-overlay">
        <filter id="cinematic-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cinematic-grain)" />
      </svg>
      
      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.15)_150%)] mix-blend-multiply pointer-events-none" />
    </div>
  )
}
