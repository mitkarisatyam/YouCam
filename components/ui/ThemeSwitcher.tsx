'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ThemeName =
  | 'editorial-ivory'
  | 'midnight-couture'
  | 'rose-beauty'
  | 'glass-atelier'
  | 'cocoa-minimal'
  | 'pearl'
  | 'obsidian'

export const THEMES: Array<{ id: ThemeName; name: string; icon: string; mode: 'light' | 'dark'; colors: string[] }> = [
  { id: 'editorial-ivory', name: 'Editorial Ivory', icon: '🤍', mode: 'light', colors: ['#f7f4ed', '#c5a059', '#191919'] },
  { id: 'midnight-couture', name: 'Midnight Couture', icon: '🌙', mode: 'dark', colors: ['#0b0c0e', '#e2c08d', '#f5f5f7'] },
  { id: 'rose-beauty', name: 'Rose Beauty', icon: '🌸', mode: 'light', colors: ['#fcf5f3', '#d48b98', '#2d1a1f'] },
  { id: 'glass-atelier', name: 'Glass Atelier', icon: '✨', mode: 'light', colors: ['#f2f5f9', '#5b86e5', '#121c2b'] },
  { id: 'cocoa-minimal', name: 'Cocoa Atelier', icon: '🤎', mode: 'light', colors: ['#f5f0eb', '#a67c52', '#2a1e17'] },
  { id: 'pearl', name: 'Pearl Lab', icon: '🫧', mode: 'light', colors: ['#f9f9fb', '#8b8ba7', '#18181b'] },
  { id: 'obsidian', name: 'Obsidian', icon: '🖤', mode: 'dark', colors: ['#050505', '#d4af37', '#ffffff'] },
]

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('editorial-ivory')
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('contextmirror_theme') as ThemeName
    if (saved && THEMES.some(t => t.id === saved)) {
      setCurrentTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  function changeTheme(themeId: ThemeName) {
    setCurrentTheme(themeId)
    document.documentElement.setAttribute('data-theme', themeId)
    localStorage.setItem('contextmirror_theme', themeId)
    setIsOpen(false)
  }

  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0]

  return (
    <div className="relative z-50" ref={panelRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="glass-pill px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 hover:border-[var(--accent-gold)] transition-all"
        title="Choose Atmosphere"
      >
        <span>{activeThemeObj.icon}</span>
        <span className="font-medium hidden sm:inline">{activeThemeObj.name}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-64 glass-level-3 rounded-[1.25rem] p-3 shadow-2xl border border-[var(--border-color)] space-y-1.5"
          >
            <div className="text-[10px] uppercase font-bold tracking-[0.15em] text-[var(--text-muted)] px-3 py-1.5 font-mono">
              Choose your atmosphere
            </div>

            {THEMES.map(theme => (
              <motion.button
                key={theme.id}
                whileHover={{ x: 3 }}
                onClick={() => changeTheme(theme.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                  currentTheme === theme.id
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-md'
                    : 'hover:bg-[var(--bg-card)] text-[var(--text-primary)]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">{theme.icon}</span>
                  <span>{theme.name}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {/* Mini color preview */}
                  <div className="flex -space-x-1">
                    {theme.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] opacity-50 uppercase tracking-wider ml-1">{theme.mode}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
