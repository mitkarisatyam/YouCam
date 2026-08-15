'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
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

  return (
    <div className="min-h-screen pb-24">
      <GlassNav />

      <main className="max-w-3xl mx-auto px-6 pt-2 space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-end justify-between"
        >
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 glass-liquid px-5 py-2 rounded-full text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">
              📅 Style Timeline
            </span>
            <h1 className="font-serif text-4xl lg:text-5xl text-[var(--text-primary)] font-normal">Outfit History</h1>
            <p className="text-[var(--text-muted)] text-sm">Track what you wear. Never repeat to the same crowd.</p>
          </div>
          <GlassButton variant="primary" onClick={() => setLogging(!logging)}>
            {logging ? 'Cancel' : '+ Log Today'}
          </GlassButton>
        </motion.div>

        {/* Log Today Panel */}
        {logging && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="glass-level-3 p-7 rounded-[1.5rem] space-y-5"
          >
            <h3 className="font-serif text-xl text-[var(--text-primary)]">What did you wear today?</h3>
            <div className="grid grid-cols-5 gap-2">
              {wardrobe.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelected(prev => prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id])}
                  className={`aspect-square rounded-[1rem] overflow-hidden border-2 transition-all ${
                    selected.includes(item.id) ? 'border-[var(--text-primary)] shadow-lg ring-2 ring-[var(--accent-glow)]' : 'border-transparent hover:border-[var(--border-color)]'
                  }`}
                >
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              className="w-full p-4 glass-pill rounded-[1.25rem] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
              placeholder="Occasion (optional)"
              value={occasion}
              onChange={e => setOccasion(e.target.value)}
            />
            <div className="flex gap-3">
              <GlassButton variant="secondary" onClick={() => setLogging(false)} className="flex-1">Cancel</GlassButton>
              <GlassButton variant="primary" onClick={logToday} disabled={selected.length === 0} className="flex-1">Save ✨</GlassButton>
            </div>
          </motion.div>
        )}

        {/* History Timeline */}
        {history.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-20 glass-level-3 rounded-[2rem] space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent-glow),transparent_70%)] opacity-30 pointer-events-none" />
              <div className="text-5xl relative z-10">📅</div>
              <h3 className="font-serif text-2xl text-[var(--text-primary)] relative z-10">Your history is waiting.</h3>
              <p className="text-sm text-[var(--text-muted)] relative z-10">Click &ldquo;Log Today&rdquo; to start tracking your style decisions.</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[var(--border-color)]" />

            <div className="space-y-6">
              {history.map((entry, idx) => {
                const items = getItems(entry.itemIds)
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="pl-14 relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[18px] top-5 w-3.5 h-3.5 rounded-full bg-[var(--text-primary)] border-2 border-[var(--bg-primary)] z-10" />

                    <div className="glass-card glass-reflection p-6 rounded-[1.5rem]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-serif text-base font-bold text-[var(--text-primary)]">
                            {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </div>
                          {entry.occasion && (
                            <div className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                              <span>💍</span> {entry.occasion}
                            </div>
                          )}
                        </div>
                        <span className="glass-pill px-3 py-1 rounded-full text-[10px] font-mono text-[var(--text-muted)]">
                          {items.length} items
                        </span>
                      </div>
                      <div className="flex gap-2.5">
                        {items.map(item => (
                          <div key={item.id} className="relative group">
                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-xl group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[9px] text-center px-1">{item.name}</span>
                            </div>
                          </div>
                        ))}
                        <Link
                          href={`/look?items=${entry.itemIds.join(',')}`}
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-gold)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors text-xs"
                        >
                          Remix
                        </Link>
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
