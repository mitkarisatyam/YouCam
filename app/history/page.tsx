'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassButton } from '@/components/ui/GlassButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { getHistory, getWardrobe, logOutfit } from '@/lib/memory'
import type { WardrobeItem } from '@/types'

export default function HistoryPage() {
  const [history, setHistory] = useState<ReturnType<typeof getHistory>>([])
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([])
  const [logging, setLogging] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [occasion, setOccasion] = useState('')

  useEffect(() => {
    setHistory(getHistory())
    setWardrobe(getWardrobe())
  }, [])

  function getItems(ids: string[]) {
    return ids.map(id => wardrobe.find(i => i.id === id)).filter(Boolean) as WardrobeItem[]
  }

  function logToday() {
    if (selected.length === 0) return
    logOutfit({ date: new Date().toISOString().split('T')[0], itemIds: selected, occasion })
    setHistory(getHistory())
    setWardrobe(getWardrobe())
    setSelected([])
    setOccasion('')
    setLogging(false)
  }

  // Simulated score mapping for visual diary feel
  const generateMockScore = (dateStr: string) => {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    return 80 + (Math.abs(hash) % 18); // Score between 80 and 97
  }

  return (
    <div className="min-h-screen pb-32 text-[var(--text-primary)] relative">
      {/* Editorial Background */}
      <div className="fixed inset-0 -z-10 bg-[var(--bg-primary)] overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[30%] h-[60%] bg-color-mix(in_srgb,var(--text-primary)_5%,transparent) blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000')] opacity-[0.03] mix-blend-overlay object-cover pointer-events-none" />
      </div>


      <main className="max-w-4xl mx-auto px-6 pt-16 space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-10"
        >
          <div className="space-y-4">
            <h1 className="font-serif text-6xl text-[var(--text-primary)] font-normal tracking-tight">Your Style Journal</h1>
            <p className="text-[var(--text-muted)] text-lg max-w-md leading-relaxed">
              A personal visual diary of your aesthetic timeline. Document your daily looks and contextual decisions.
            </p>
          </div>
          <GlassButton variant="primary" onClick={() => setLogging(!logging)} className="px-8 py-4 shrink-0">
            {logging ? 'Close Journal' : 'Log New Entry ✦'}
          </GlassButton>
        </motion.div>

        {/* Log Today Panel */}
        {logging && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="glass-deep p-10 rounded-[2.5rem] space-y-8"
          >
            <div>
              <h3 className="font-serif text-3xl mb-2">Record your look</h3>
              <p className="text-[var(--text-muted)] text-sm">Select the garments that define today's aesthetic.</p>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {wardrobe.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelected(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])}
                  className={`relative aspect-[3/4] rounded-[1rem] overflow-hidden transition-all duration-300 ${
                    selected.includes(item.id) ? 'ring-2 ring-[var(--text-primary)] ring-offset-4 ring-offset-[var(--bg-primary)] shadow-elevated scale-105' : 'opacity-70 hover:opacity-100 hover:shadow-subtle'
                  }`}
                >
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover grayscale-[20%]" />
                  {selected.includes(item.id) && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <span className="bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full p-1 text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <input
                className="flex-1 px-8 py-4 glass-soft rounded-[2rem] text-base focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all"
                placeholder="Describe the occasion (e.g., Evening dinner party)"
                value={occasion}
                onChange={e => setOccasion(e.target.value)}
              />
              <GlassButton variant="primary" onClick={logToday} disabled={selected.length === 0} className="px-10 py-4">
                Save Entry
              </GlassButton>
            </div>
          </motion.div>
        )}

        {/* Visual Timeline */}
        {history.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-32 space-y-6">
              <h3 className="font-serif text-4xl text-[var(--text-muted)]">Your journal is empty.</h3>
              <p className="text-lg text-[var(--text-muted)] opacity-60">Begin documenting your aesthetic journey today.</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="relative pl-4 md:pl-0">
            {/* Center Timeline line for Desktop, Left for Mobile */}
            <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-px bg-[color-mix(in_srgb,var(--border-color)_50%,transparent)] -translate-x-1/2" />

            <div className="space-y-24">
              {history.map((entry, idx) => {
                const items = getItems(entry.itemIds)
                const dateObj = new Date(entry.date)
                const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
                const day = dateObj.toLocaleDateString('en-US', { day: 'numeric' })
                const isEven = idx % 2 === 0
                const score = generateMockScore(entry.id)

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative flex flex-col md:flex-row items-center gap-10 md:gap-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {/* Timeline Node */}
                    <div className="absolute left-[15px] md:left-1/2 w-4 h-4 rounded-full glass-crystal border-[3px] border-[var(--text-primary)] -translate-x-1/2 z-10 shadow-[0_0_15px_var(--text-primary)]" />

                    {/* Content Block */}
                    <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pr-20 text-left' : 'md:pl-20 md:text-right'}`}>
                      <h3 className="font-serif text-5xl text-[var(--text-primary)] mb-6">
                        {month} {day}
                      </h3>
                      
                      <div className={`glass-soft p-8 rounded-[2rem] hover:shadow-elevated transition-shadow duration-500 flex flex-col ${isEven ? 'items-start' : 'md:items-end items-start'}`}>
                        
                        {entry.occasion && (
                          <div className="mb-4 text-xl text-[var(--text-primary)] flex items-center gap-3">
                            <span className="opacity-80">💍</span> {entry.occasion}
                          </div>
                        )}
                        
                        <div className={`flex items-baseline gap-2 mb-8 text-[var(--text-muted)] uppercase tracking-widest text-xs font-medium`}>
                          <span>Selected: Look {idx + 1}</span>
                          <span className="px-2">|</span>
                          <span className="text-[var(--text-primary)]">Score: {score}</span>
                        </div>

                        {/* Garment Images Row */}
                        <div className={`flex gap-3 w-full ${isEven ? 'justify-start' : 'md:justify-end justify-start'}`}>
                          {items.map(item => (
                            <div key={item.id} className="relative w-20 h-24 rounded-[1rem] overflow-hidden shadow-subtle group">
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                            </div>
                          ))}
                        </div>
                        
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
