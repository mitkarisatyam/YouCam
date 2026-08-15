'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { THEMES, type ThemeName } from '@/components/ui/ThemeSwitcher'

const MOTION_OPTIONS = [
  { id: 'full', label: 'Full Motion', icon: '✨', desc: 'All animations and transitions' },
  { id: 'reduced', label: 'Reduced Motion', icon: '🌿', desc: 'Only essential transitions' },
  { id: 'off', label: 'Minimal', icon: '⏸', desc: 'Almost no motion' },
]

const BACKGROUND_OPTIONS = [
  { id: 'living', label: 'Living Atmosphere', desc: 'Full animated background' },
  { id: 'soft', label: 'Soft Motion', desc: 'Only gradients & orbs' },
  { id: 'minimal', label: 'Minimal', desc: 'Very subtle movement' },
  { id: 'static', label: 'Static', desc: 'No background animation' },
]

const GLASS_OPTIONS = [
  { id: 'maximum', label: 'Maximum Glass', desc: 'Strong blur & transparency' },
  { id: 'balanced', label: 'Balanced', desc: 'Recommended' },
  { id: 'reduced', label: 'Reduced Glass', desc: 'Less transparency for readability' },
]

export default function SettingsPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('editorial-ivory')
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('light')
  const [motion_, setMotion_] = useState('full')
  const [background, setBackground] = useState('living')
  const [glass, setGlass] = useState('balanced')

  useEffect(() => {
    const savedTheme = localStorage.getItem('contextmirror_theme') as ThemeName
    if (savedTheme) setCurrentTheme(savedTheme)
    const savedAppearance = localStorage.getItem('contextmirror_appearance') as typeof appearance
    if (savedAppearance) setAppearance(savedAppearance)
    const savedMotion = localStorage.getItem('contextmirror_motion')
    if (savedMotion) setMotion_(savedMotion)
    const savedBg = localStorage.getItem('contextmirror_background')
    if (savedBg) setBackground(savedBg)
    const savedGlass = localStorage.getItem('contextmirror_glass')
    if (savedGlass) setGlass(savedGlass)
  }, [])

  function changeTheme(themeId: ThemeName) {
    setCurrentTheme(themeId)
    document.documentElement.setAttribute('data-theme', themeId)
    localStorage.setItem('contextmirror_theme', themeId)
  }

  function changeAppearance(mode: 'light' | 'dark' | 'system') {
    setAppearance(mode)
    document.documentElement.setAttribute('data-appearance', mode)
    localStorage.setItem('contextmirror_appearance', mode)
    if (mode === 'dark' && !['midnight-couture', 'obsidian'].includes(currentTheme)) {
      changeTheme('midnight-couture')
    } else if (mode === 'light' && ['midnight-couture', 'obsidian'].includes(currentTheme)) {
      changeTheme('editorial-ivory')
    }
  }

  function saveSetting(key: string, value: string, setter: (v: string) => void) {
    setter(value)
    localStorage.setItem(`contextmirror_${key}`, value)
  }

  function clearData(key: string) {
    if (confirm(`Clear ${key}? This cannot be undone.`)) {
      localStorage.removeItem(`closetmind_${key}`)
      localStorage.removeItem(`contextmirror_${key}`)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <GlassNav />

      <main className="max-w-3xl mx-auto px-6 pt-2 space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-3"
        >
          <span className="inline-flex items-center gap-2 glass-liquid px-5 py-2 rounded-full text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">
            ⚙️ Personalization
          </span>
          <h1 className="font-serif text-4xl lg:text-5xl text-[var(--text-primary)] font-normal">
            Choose your atmosphere
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Customize the visual experience of ContextMirror.
          </p>
        </motion.div>

        {/* ═══ APPEARANCE ══════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-5">
            <h2 className="font-serif text-2xl text-[var(--text-primary)]">Appearance</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light' as const, label: 'Light', icon: '☀️' },
                { id: 'dark' as const, label: 'Dark', icon: '🌙' },
                { id: 'system' as const, label: 'System', icon: '🌓' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => changeAppearance(opt.id)}
                  className={`p-5 rounded-[1.25rem] text-center transition-all ${
                    appearance === opt.id
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-xl'
                      : 'glass-card hover:border-[var(--accent-gold)]'
                  }`}
                >
                  <span className="text-2xl block mb-2">{opt.icon}</span>
                  <span className="text-sm font-medium block">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ THEME ═══════════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-5">
            <h2 className="font-serif text-2xl text-[var(--text-primary)]">Visual Theme</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {THEMES.map(theme => (
                <motion.button
                  key={theme.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => changeTheme(theme.id)}
                  className={`p-4 rounded-[1.25rem] text-center transition-all relative overflow-hidden ${
                    currentTheme === theme.id
                      ? 'ring-2 ring-[var(--text-primary)] shadow-xl'
                      : 'glass-card'
                  }`}
                >
                  <span className="text-2xl block mb-2">{theme.icon}</span>
                  <span className="text-xs font-medium block text-[var(--text-primary)]">{theme.name}</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mt-0.5">{theme.mode}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ MOTION ═════════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-5">
            <h2 className="font-serif text-2xl text-[var(--text-primary)]">Motion</h2>
            <div className="grid grid-cols-3 gap-3">
              {MOTION_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => saveSetting('motion', opt.id, setMotion_)}
                  className={`p-5 rounded-[1.25rem] text-center transition-all ${
                    motion_ === opt.id
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-xl'
                      : 'glass-card hover:border-[var(--accent-gold)]'
                  }`}
                >
                  <span className="text-xl block mb-2">{opt.icon}</span>
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] opacity-70 block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ BACKGROUND ═════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-5">
            <h2 className="font-serif text-2xl text-[var(--text-primary)]">Background</h2>
            <div className="grid grid-cols-2 gap-3">
              {BACKGROUND_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => saveSetting('background', opt.id, setBackground)}
                  className={`p-5 rounded-[1.25rem] text-left transition-all ${
                    background === opt.id
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-xl'
                      : 'glass-card hover:border-[var(--accent-gold)]'
                  }`}
                >
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] opacity-70 block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ GLASS ══════════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-5">
            <h2 className="font-serif text-2xl text-[var(--text-primary)]">Glass Intensity</h2>
            <div className="grid grid-cols-3 gap-3">
              {GLASS_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => saveSetting('glass', opt.id, setGlass)}
                  className={`p-5 rounded-[1.25rem] text-center transition-all ${
                    glass === opt.id
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-xl'
                      : 'glass-card hover:border-[var(--accent-gold)]'
                  }`}
                >
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] opacity-70 block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ PRIVACY ════════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-5">
            <h2 className="font-serif text-2xl text-[var(--text-primary)]">Privacy & Data</h2>
            <p className="text-xs text-[var(--text-muted)]">
              All data is stored locally in your browser. Nothing is sent to external servers.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'wardrobe', label: 'Clear Wardrobe', icon: '👗' },
                { key: 'history', label: 'Clear History', icon: '📅' },
                { key: 'skin_history', label: 'Clear Skin Data', icon: '🧴' },
                { key: 'profile', label: 'Clear Profile', icon: '👤' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => clearData(item.key)}
                  className="p-4 rounded-[1.25rem] glass-card text-left text-xs hover:border-rose-300 transition-all group"
                >
                  <span className="text-lg block mb-1">{item.icon}</span>
                  <span className="font-bold text-[var(--text-primary)] group-hover:text-rose-600 transition-colors">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ API STATUS ═════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="glass-card p-6 rounded-[1.5rem] flex items-center justify-between">
            <div>
              <div className="font-medium text-[var(--text-primary)] text-sm mb-0.5">API Status</div>
              <div className="text-xs text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Perfect Corp API key configured
              </div>
            </div>
            <span className="glass-pill px-3 py-1 rounded-full text-[10px] font-mono text-[var(--text-muted)]">
              v2.0
            </span>
          </div>
        </ScrollReveal>
      </main>
    </div>
  )
}
