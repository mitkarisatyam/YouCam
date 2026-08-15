'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ThemeSwitcher } from './ThemeSwitcher'
import { isDemoMode } from '@/lib/youcam'

export function GlassNav() {
  const pathname = usePathname()
  const isMock = isDemoMode()
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('light')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('contextmirror_appearance') as 'light' | 'dark' | 'system'
    if (saved) {
      setAppearance(saved)
      document.documentElement.setAttribute('data-appearance', saved)
    }
  }, [])

  // Scroll-responsive nav
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function toggleAppearance() {
    const next = appearance === 'light' ? 'dark' : 'light'
    setAppearance(next)
    document.documentElement.setAttribute('data-appearance', next)
    localStorage.setItem('contextmirror_appearance', next)

    // Switch default dark/light theme if appropriate
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'midnight-couture')
      localStorage.setItem('contextmirror_theme', 'midnight-couture')
    } else {
      document.documentElement.setAttribute('data-theme', 'editorial-ivory')
      localStorage.setItem('contextmirror_theme', 'editorial-ivory')
    }
  }

  const links = [
    { href: '/test-look', label: 'Test My Look', highlight: true },
    { href: '/skin-insights', label: 'Skin Insights' },
    { href: '/hair-studio', label: 'Hair Studio' },
    { href: '/wardrobe', label: 'Wardrobe' },
    { href: '/shopping-assistant', label: 'Shopping' },
    { href: '/looks', label: 'Looks' },
    { href: '/history', label: 'History' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <motion.nav
      className="sticky top-4 z-40 px-4 max-w-6xl mx-auto mb-8"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`glass-level-1 rounded-full flex items-center justify-between shadow-2xl transition-all duration-500 ${
          scrolled ? 'px-5 py-2' : 'px-6 py-3'
        }`}
        style={{
          backdropFilter: scrolled ? 'blur(32px) saturate(1.4)' : 'blur(24px)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-serif text-2xl tracking-tight hover:opacity-80 transition-opacity">
            <motion.span
              layoutId="brand"
              className={`transition-all duration-500 ${scrolled ? 'text-xl' : 'text-2xl'}`}
            >
              ContextMirror
            </motion.span>
          </Link>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full glass-pill text-[var(--text-muted)] font-mono uppercase tracking-wider transition-all duration-500 ${
            scrolled ? 'hidden' : 'hidden lg:inline-block'
          }`}>
            {isMock ? '🟡 Demo' : '🟢 YouCam API'}
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-0.5 relative">
          {links.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors text-[var(--text-primary)]"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-[var(--text-primary)] rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={isActive ? 'text-[var(--bg-primary)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors'}>
                  {link.highlight ? `⭐ ${link.label}` : link.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAppearance}
            className="glass-pill p-2 rounded-full text-xs hover:border-[var(--accent-gold)] transition-all"
            title={`Appearance: ${appearance}`}
          >
            {appearance === 'light' ? '☀️' : '🌙'}
          </motion.button>

          {/* Theme switcher */}
          <ThemeSwitcher />

          <Link href="/test-look" className="btn-primary text-xs px-4 py-1.5 hidden sm:inline-block">
            Test Look
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
