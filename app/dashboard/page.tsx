'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GlassNav } from '@/components/ui/GlassNav'
import { getWardrobe, getRediscoveries } from '@/lib/memory'
import type { WardrobeItem } from '@/types'

export default function DashboardPage() {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([])
  const [rediscoveries, setRediscoveries] = useState<WardrobeItem[]>([])

  useEffect(() => {
    setWardrobe(getWardrobe())
    setRediscoveries(getRediscoveries())
  }, [])

  const stats = [
    { label: 'Total items', value: wardrobe.length },
    { label: 'Worn this month', value: wardrobe.filter(i => i.lastWorn && new Date(i.lastWorn) > new Date(Date.now() - 30 * 86400000)).length },
    { label: 'Unworn 90+ days', value: rediscoveries.length },
    { label: 'Total wears logged', value: wardrobe.reduce((s, i) => s + i.wearCount, 0) },
  ]

  const quickActions = [
    { href: '/test-look', icon: '⭐', label: 'Test My Look', desc: 'Context stress test' },
    { href: '/skin-insights', icon: '🧴', label: 'Skin Insights', desc: 'YouCam Skin AI' },
    { href: '/ingest', icon: '📸', label: 'Add item', desc: 'Upload a new piece' },
    { href: '/search', icon: '🔍', label: 'Search wardrobe', desc: 'Natural language search' },
    { href: '/studio', icon: '✨', label: 'AI Studio', desc: 'Virtual try-on' },
    { href: '/history', icon: '📅', label: 'History', desc: 'Past outfits & decisions' },
  ]

  return (
    <div className="min-h-screen pb-24">
      <GlassNav />

      <main className="max-w-6xl mx-auto px-6 pt-4 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[var(--text-primary)] mb-1">Your Wardrobe Library</h1>
            <p className="text-[var(--text-muted)] text-xs">Everything you own, searchable and visualizable.</p>
          </div>
          <Link href="/test-look" className="btn-primary text-xs px-6 py-2.5 shadow-lg">
            ⭐ Test My Look
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="glass-card p-5 rounded-2xl">
              <div className="font-serif text-2xl font-bold text-[var(--text-primary)] mb-1">{s.value}</div>
              <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-serif text-xl font-bold text-[var(--text-primary)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map(a => (
              <Link key={a.href} href={a.href} className="glass-card p-5 rounded-2xl group">
                <div className="text-2xl mb-2">{a.icon}</div>
                <div className="font-bold text-[var(--text-primary)] text-sm group-hover:underline">{a.label}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{a.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Rediscoveries */}
        {rediscoveries.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[var(--text-primary)]">Rediscover These</h2>
              <span className="text-xs font-mono text-[var(--text-muted)]">Unworn 90+ days</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {rediscoveries.map(item => (
                <Link key={item.id} href={`/studio?item=${item.id}`} className="glass-card rounded-2xl overflow-hidden group">
                  <div className="aspect-square overflow-hidden bg-[#e8e4da]">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">{item.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      {item.lastWorn ? `Last worn ${new Date(item.lastWorn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Never worn'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Full wardrobe grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[var(--text-primary)]">All Items</h2>
            <Link href="/search" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">Search →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {wardrobe.map(item => (
              <Link key={item.id} href={`/studio?item=${item.id}`} className="glass-card rounded-2xl overflow-hidden group">
                <div className="aspect-square overflow-hidden bg-[#e8e4da]">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <div className="text-xs font-bold text-[var(--text-primary)] truncate">{item.name}</div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-[var(--text-muted)]">
                    <span className="capitalize">{item.category}</span>
                    <span>·</span>
                    <span>{item.wearCount}×</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
