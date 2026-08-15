'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassNav } from '@/components/ui/GlassNav'
import { getDecisionHistory } from '@/lib/memory'
import type { DecisionReplayEntry } from '@/types'

export default function LooksPage() {
  const [history, setHistory] = useState<DecisionReplayEntry[]>([])

  useEffect(() => {
    setHistory(getDecisionHistory())
  }, [])

  return (
    <div className="min-h-screen pb-24">
      {/* Floating Glass Header Nav */}
      <GlassNav />

      <main className="max-w-5xl mx-auto px-6 pt-4 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[var(--text-primary)] mb-1">Tested Looks Archive</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Evaluated looks and ContextMirror Scores recorded across your events.
            </p>
          </div>
          <Link href="/test-look" className="btn-primary text-xs px-6 py-2.5 shadow-lg">
            + Test New Look
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="glass-panel p-12 text-center max-w-md mx-auto rounded-3xl space-y-4">
            <div className="text-4xl">👔</div>
            <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">No looks evaluated yet</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Run your first Context Stress Test to evaluate candidate looks for your upcoming events.
            </p>
            <Link href="/test-look" className="btn-primary inline-block text-xs py-2.5 px-6 shadow-md">
              Start Context Stress Test
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {history.map(item => (
              <div key={item.id} className="glass-card p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block font-mono">
                      {item.date}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] capitalize">
                      {item.context.occasion} ({item.context.time})
                    </h3>
                  </div>
                  <span className="glass-pill px-3 py-1 rounded-full text-xs font-semibold text-[var(--text-primary)]">
                    {item.context.environment}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {item.candidates.map(c => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-2xl border text-center text-xs transition-all ${
                        c.id === item.userSelectedLookId
                          ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-md'
                          : 'border-[var(--border-color)] glass-pill'
                      }`}
                    >
                      <div className="truncate font-bold mb-1">{c.name.split('—')[1] || c.name}</div>
                      <div className="text-xs">Score: {c.contextMirrorScore}</div>
                      {c.id === item.userSelectedLookId && (
                        <span className="text-[9px] block uppercase mt-1 text-emerald-300 font-bold">
                          ✓ Chosen
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
