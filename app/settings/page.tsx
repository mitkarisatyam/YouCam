'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { THEMES, type ThemeName } from '@/components/ui/ThemeSwitcher'

const MOTION_OPTIONS = [
  { id: 'full', label: 'Full', icon: '✨', desc: 'All animations and transitions' },
  { id: 'reduced', label: 'Reduced', icon: '🌿', desc: 'Essential transitions only' },
  { id: 'off', label: 'Off', icon: '⏸', desc: 'Minimal motion' },
]

const BACKGROUND_OPTIONS = [
  { id: 'living', label: 'Living', desc: 'Full animated atmosphere' },
  { id: 'soft', label: 'Soft', desc: 'Subtle gradients & orbs' },
  { id: 'minimal', label: 'Minimal', desc: 'Very slow movement' },
  { id: 'static', label: 'Static', desc: 'Static imagery' },
]

const GLASS_OPTIONS = [
  { id: 'maximum', label: 'Maximum', desc: 'Deep blur and high transparency' },
  { id: 'balanced', label: 'Balanced', desc: 'Editorial default' },
  { id: 'reduced', label: 'Reduced', desc: 'Higher opacity for contrast' },
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
    if (confirm(`Clear ${key}? This action is permanent and cannot be undone.`)) {
      localStorage.removeItem(`closetmind_${key}`)
      localStorage.removeItem(`contextmirror_${key}`)
    }
  }

  return (
    <div className="min-h-screen pb-32 text-[var(--text-primary)] relative">
      <div className="fixed inset-0 -z-10 bg-[var(--bg-primary)] overflow-hidden transition-colors duration-1000">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[50%] bg-color-mix(in_srgb,var(--text-primary)_5%,transparent) blur-[150px] rounded-full pointer-events-none transition-all duration-1000" />
      </div>

      <GlassNav />

      <main className="max-w-[85rem] mx-auto px-6 pt-16">
        
        <div className="grid lg:grid-cols-[1fr_2.5fr] gap-16">
          
          {/* Header & Sticky Nav */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-serif text-5xl tracking-tight mb-4">Control Your Atmosphere.</h1>
              <p className="text-[var(--text-muted)] text-lg">Shape the aesthetic and behavioral parameters of your ContextMirror studio.</p>
            </motion.div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-16">
            
            {/* 1. APPEARANCE */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
              <h2 className="text-xs uppercase tracking-widest font-medium border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-4">Appearance</h2>
              <div className="flex gap-4">
                {[
                  { id: 'light' as const, label: 'Light', icon: '☀️' },
                  { id: 'dark' as const, label: 'Dark', icon: '🌙' },
                  { id: 'system' as const, label: 'System', icon: '🌓' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => changeAppearance(opt.id)}
                    className={`flex-1 py-6 rounded-[2rem] text-center transition-all duration-500 ${
                      appearance === opt.id
                        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-elevated scale-105'
                        : 'glass-soft hover:shadow-subtle'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{opt.icon}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.section>

            {/* 2. THEME */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
              <h2 className="text-xs uppercase tracking-widest font-medium border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-4">Visual Theme</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => changeTheme(theme.id)}
                    className={`p-6 rounded-[2rem] text-left transition-all duration-500 relative overflow-hidden group ${
                      currentTheme === theme.id
                        ? 'ring-2 ring-[var(--text-primary)] ring-offset-4 ring-offset-[var(--bg-primary)] glass-deep shadow-elevated'
                        : 'glass-frosted hover:glass-soft'
                    }`}
                  >
                    <span className="text-2xl block mb-4 group-hover:scale-110 transition-transform">{theme.icon}</span>
                    <span className="text-sm font-medium block text-[var(--text-primary)]">{theme.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mt-1">{theme.mode}</span>
                  </button>
                ))}
              </div>
            </motion.section>

            {/* 3. ATMOSPHERE / BACKGROUND & GLASS */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
              <h2 className="text-xs uppercase tracking-widest font-medium border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-4">Atmosphere Dynamics</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-soft p-8 rounded-[2.5rem] space-y-6">
                  <h3 className="font-serif text-2xl">Background</h3>
                  <div className="space-y-3">
                    {BACKGROUND_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => saveSetting('background', opt.id, setBackground)}
                        className={`w-full p-4 rounded-[1.5rem] text-left transition-all duration-300 flex items-center justify-between ${
                          background === opt.id ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'hover:glass-frosted'
                        }`}
                      >
                        <span className="font-medium text-sm">{opt.label}</span>
                        {background === opt.id && <span className="text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-soft p-8 rounded-[2.5rem] space-y-6">
                  <h3 className="font-serif text-2xl">Glass Intensity</h3>
                  <div className="space-y-3">
                    {GLASS_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => saveSetting('glass', opt.id, setGlass)}
                        className={`w-full p-4 rounded-[1.5rem] text-left transition-all duration-300 flex items-center justify-between ${
                          glass === opt.id ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'hover:glass-frosted'
                        }`}
                      >
                        <span className="font-medium text-sm">{opt.label}</span>
                        {glass === opt.id && <span className="text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 4. ACCESSIBILITY & MOTION */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
              <h2 className="text-xs uppercase tracking-widest font-medium border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-4">Accessibility & Motion</h2>
              
              <div className="glass-deep p-8 rounded-[2.5rem] space-y-8">
                <div>
                  <h3 className="font-serif text-2xl mb-4">Motion Fluidity</h3>
                  <div className="flex gap-4">
                    {MOTION_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => saveSetting('motion', opt.id, setMotion_)}
                        className={`flex-1 p-5 rounded-[1.5rem] text-center transition-all ${
                          motion_ === opt.id ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-elevated' : 'glass-frosted hover:glass-soft'
                        }`}
                      >
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-px w-full bg-[color-mix(in_srgb,var(--border-color)_50%,transparent)]" />
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">Text Size</span>
                    <span className="glass-pill px-4 py-2 rounded-full text-xs cursor-pointer hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors">Default</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-muted)]">High Contrast</span>
                    <span className="glass-pill px-4 py-2 rounded-full text-xs cursor-pointer hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors">Off</span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 5. PRIVACY */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-6">
              <h2 className="text-xs uppercase tracking-widest font-medium border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-4">Privacy & Data</h2>
              <div className="glass-soft p-10 rounded-[2.5rem]">
                <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
                  ContextMirror operates locally. Your images, history, and physical profile signals are stored securely in your browser's local memory.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'photos', label: 'Delete Photos' },
                    { key: 'history', label: 'Clear History' },
                    { key: 'wardrobe', label: 'Delete Wardrobe' },
                    { key: 'profile', label: 'Reset Profile' },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => clearData(item.key)}
                      className="p-5 rounded-[1.5rem] glass-frosted text-center text-xs font-medium hover:border-red-400 hover:text-red-500 transition-all duration-300"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>

          </div>
        </div>
      </main>
    </div>
  )
}
