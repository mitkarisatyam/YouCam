'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function toggleAppearance() {
    const next = appearance === 'light' ? 'dark' : 'light'
    setAppearance(next)
    document.documentElement.setAttribute('data-appearance', next)
    localStorage.setItem('contextmirror_appearance', next)

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
    { href: '/history', label: 'History' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <motion.nav
      className="sticky top-4 z-40 px-4 max-w-6xl mx-auto mb-8"
      initial={{ y: -40, opacity: 0, filter: 'blur(10px)' }}
      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`glass-deep rounded-full flex items-center justify-between transition-all duration-500 ${
          scrolled ? 'px-5 py-2.5 shadow-elevated scale-[0.98]' : 'px-6 py-3 shadow-subtle'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-serif tracking-tight hover:opacity-80 transition-opacity flex items-center group relative overflow-hidden">
            <motion.span
              layoutId="brand"
              className={`transition-all duration-500 font-medium relative z-10 ${scrolled ? 'text-lg' : 'text-xl'}`}
            >
              ContextMirror
            </motion.span>
            {/* Soft highlight sweep on brand hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[var(--text-primary)] to-transparent opacity-[0.05] z-0" />
          </Link>
          <span className={`premium-badge transition-all duration-500 ${
            scrolled ? 'opacity-0 w-0 overflow-hidden px-0 border-0' : 'opacity-100'
          }`}>
            {isMock ? 'Demo' : 'YouCam'}
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1 relative">
          {links.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-[var(--text-inverse)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-[var(--text-primary)] rounded-full z-[-1]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <button
            onClick={toggleAppearance}
            className="w-8 h-8 flex items-center justify-center rounded-full text-sm hover:bg-[var(--bg-muted)] transition-colors border border-transparent hover:border-[var(--border-color)] group relative overflow-hidden"
            title={`Appearance: ${appearance}`}
          >
            <span className="relative z-10">{appearance === 'light' ? '☀️' : '🌙'}</span>
          </button>

          {/* Theme switcher */}
          <ThemeSwitcher />
        </div>
      </div>
    </motion.nav>
  )
}
