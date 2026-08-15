import type { WardrobeItem, SearchResult } from '@/types'
import { DEMO_WARDROBE } from './demoData'

// ── localStorage keys ────────────────────────────────────────────────────────
const WARDROBE_KEY = 'closetmind_wardrobe'
const PREFS_KEY = 'closetmind_prefs'
const HISTORY_KEY = 'closetmind_history'

export function getWardrobe(): WardrobeItem[] {
  if (typeof window === 'undefined') return DEMO_WARDROBE
  try {
    const raw = localStorage.getItem(WARDROBE_KEY)
    if (!raw) {
      localStorage.setItem(WARDROBE_KEY, JSON.stringify(DEMO_WARDROBE))
      return DEMO_WARDROBE
    }
    return JSON.parse(raw)
  } catch {
    return DEMO_WARDROBE
  }
}

export function saveWardrobe(items: WardrobeItem[]) {
  localStorage.setItem(WARDROBE_KEY, JSON.stringify(items))
}

export function addItem(item: WardrobeItem) {
  const wardrobe = getWardrobe()
  saveWardrobe([...wardrobe, item])
}

export function updateItem(id: string, patch: Partial<WardrobeItem>) {
  const wardrobe = getWardrobe()
  saveWardrobe(wardrobe.map(i => i.id === id ? { ...i, ...patch } : i))
}

export function toggleFavoriteItem(id: string) {
  const wardrobe = getWardrobe()
  saveWardrobe(wardrobe.map(i => i.id === id ? { ...i, favorite: !i.favorite } : i))
}

export function addMultipleItems(items: WardrobeItem[]) {
  const wardrobe = getWardrobe()
  saveWardrobe([...items, ...wardrobe])
}

// ── Hybrid search ────────────────────────────────────────────────────────────
const SEMANTIC_KEYWORDS: Record<string, string[]> = {
  cozy: ['knit', 'sweater', 'wool', 'cashmere', 'soft', 'cream', 'beige'],
  formal: ['blazer', 'formal', 'silk', 'pumps', 'pearl', 'dress'],
  casual: ['jeans', 'sneakers', 'casual', 'denim', 'tee'],
  rainy: ['coat', 'boots', 'trench', 'outerwear', 'dark'],
  summer: ['summer', 'light', 'white', 'linen', 'short'],
  winter: ['winter', 'wool', 'coat', 'boots', 'knit', 'warm'],
  work: ['blazer', 'blouse', 'formal', 'smart-casual', 'office'],
  date: ['dress', 'elegant', 'dinner', 'heels', 'pumps'],
  travel: ['comfortable', 'casual', 'sneakers', 'crossbody', 'tote'],
  confident: ['blazer', 'structured', 'dark', 'formal', 'classic'],
  elegant: ['silk', 'pearl', 'formal', 'dress', 'heels'],
  minimal: ['solid', 'white', 'black', 'silver', 'chain'],
}

function semanticScore(item: WardrobeItem, query: string): number {
  const q = query.toLowerCase()
  let score = 0
  const itemText = [
    item.name, item.color, item.pattern, item.fabric,
    item.subcategory, item.formality, ...item.tags, ...item.season
  ].join(' ').toLowerCase()

  // Direct text match
  if (itemText.includes(q)) score += 0.8

  // Semantic keyword expansion
  for (const [concept, keywords] of Object.entries(SEMANTIC_KEYWORDS)) {
    if (q.includes(concept)) {
      const matches = keywords.filter(kw => itemText.includes(kw))
      score += matches.length * 0.15
    }
  }

  // Word-by-word match
  const words = q.split(/\s+/).filter(w => w.length > 2)
  for (const word of words) {
    if (itemText.includes(word)) score += 0.2
  }

  return Math.min(score, 1)
}

function lexicalScore(item: WardrobeItem, query: string): number {
  const q = query.toLowerCase()
  const itemText = [item.name, item.color, item.subcategory, item.category].join(' ').toLowerCase()
  if (itemText.includes(q)) return 1
  const words = q.split(/\s+/)
  const matches = words.filter(w => itemText.includes(w))
  return matches.length / words.length
}

function preferenceScore(item: WardrobeItem): number {
  // Boost items worn more often, penalize recently worn (avoid repeats)
  const wearBoost = Math.min(item.wearCount / 50, 0.3)
  const daysSinceWorn = item.lastWorn
    ? (Date.now() - new Date(item.lastWorn).getTime()) / (1000 * 60 * 60 * 24)
    : 90
  const freshBoost = daysSinceWorn > 60 ? 0.2 : 0
  return wearBoost + freshBoost
}

export function hybridSearch(query: string, filters?: {
  season?: string
  formality?: string
  category?: string
  lastWornBefore?: string
}): SearchResult[] {
  const wardrobe = getWardrobe()
  const q = query.trim().toLowerCase()

  let items = wardrobe
  if (filters?.season) items = items.filter(i => i.season.includes(filters.season!))
  if (filters?.formality) items = items.filter(i => i.formality === filters.formality)
  if (filters?.category) items = items.filter(i => i.category === filters.category)
  if (filters?.lastWornBefore) {
    const cutoff = new Date(filters.lastWornBefore).getTime()
    items = items.filter(i => !i.lastWorn || new Date(i.lastWorn).getTime() < cutoff)
  }

  if (!q) {
    return items.map(item => ({ item, score: preferenceScore(item), matchType: 'semantic' as const }))
      .sort((a, b) => b.score - a.score)
  }

  return items.map(item => {
    const sem = semanticScore(item, q) * 0.7
    const lex = lexicalScore(item, q) * 0.2
    const pref = preferenceScore(item) * 0.1
    const score = sem + lex + pref
    const matchType = lex > sem ? 'lexical' : 'semantic'
    return { item, score, matchType: matchType as SearchResult['matchType'] }
  })
    .filter(r => r.score > 0.05)
    .sort((a, b) => b.score - a.score)
}

// Smart 3 algorithm
export function smart3(query: string): [WardrobeItem, WardrobeItem, WardrobeItem] | null {
  const results = hybridSearch(query)
  if (results.length < 3) return null

  const safe = results[0].item
  // Fresh: unworn 60+ days
  const fresh = results.find(r =>
    r.item.id !== safe.id &&
    (!r.item.lastWorn || (Date.now() - new Date(r.item.lastWorn).getTime()) > 60 * 24 * 60 * 60 * 1000)
  )?.item ?? results[1].item
  // Remix: different category from safe
  const remix = results.find(r =>
    r.item.id !== safe.id && r.item.id !== fresh.id && r.item.category !== safe.category
  )?.item ?? results[2].item

  return [safe, fresh, remix]
}

// Outfit history
export interface OutfitEntry {
  id: string
  date: string
  itemIds: string[]
  occasion?: string
  vtoUrl?: string
}

export function getHistory(): OutfitEntry[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}

export function logOutfit(entry: Omit<OutfitEntry, 'id'>) {
  const history = getHistory()
  const newEntry = { ...entry, id: `outfit-${Date.now()}` }
  localStorage.setItem(HISTORY_KEY, JSON.stringify([newEntry, ...history]))
  // Increment wear counts
  const wardrobe = getWardrobe()
  saveWardrobe(wardrobe.map(item =>
    entry.itemIds.includes(item.id)
      ? { ...item, wearCount: item.wearCount + 1, lastWorn: entry.date }
      : item
  ))
}

// Rediscovery: items not worn in 90+ days
export function getRediscoveries(): WardrobeItem[] {
  const wardrobe = getWardrobe()
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000
  return wardrobe.filter(item =>
    !item.lastWorn || new Date(item.lastWorn).getTime() < cutoff
  ).slice(0, 6)
}

// ── ContextMirror Storage Extensions ─────────────────────────────────────────
import type { ContextSetup, DecisionReplayEntry } from '@/types'

const CONTEXT_KEY = 'contextmirror_current_context'
const DECISION_REPLAY_KEY = 'contextmirror_decision_replay'

export const DEFAULT_CONTEXT: ContextSetup = {
  occasion: 'wedding',
  time: 'evening',
  environment: 'hotel',
  formality: 'formal',
  importance: 'very-important',
  rawNaturalInput: 'I have a wedding at 7 PM in an indoor hotel.',
}

export function getSavedContext(): ContextSetup {
  if (typeof window === 'undefined') return DEFAULT_CONTEXT
  try {
    const raw = localStorage.getItem(CONTEXT_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_CONTEXT
  } catch {
    return DEFAULT_CONTEXT
  }
}

export function saveContext(ctx: ContextSetup) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(ctx))
  }
}

export function getDecisionHistory(): DecisionReplayEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(DECISION_REPLAY_KEY) || '[]')
  } catch {
    return []
  }
}

export function logDecisionReplay(entry: Omit<DecisionReplayEntry, 'id' | 'date'>) {
  if (typeof window === 'undefined') return
  const history = getDecisionHistory()
  const newEntry: DecisionReplayEntry = {
    ...entry,
    id: `decision-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  }
  localStorage.setItem(DECISION_REPLAY_KEY, JSON.stringify([newEntry, ...history]))
}

// ── Hair Studio Extensions ───────────────────────────────────────────────────
import type { HairProfile, HairPreferences } from '@/types'

const HAIR_HISTORY_KEY = 'closetmind_hair_history'
const HAIR_PREFS_KEY = 'closetmind_hair_prefs'

export function getHairHistory(): HairProfile[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HAIR_HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function logHairAnalysis(profile: HairProfile) {
  if (typeof window === 'undefined') return
  const history = getHairHistory()
  const newProfile = {
    ...profile,
    id: `hair-profile-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  }
  localStorage.setItem(HAIR_HISTORY_KEY, JSON.stringify([newProfile, ...history]))
}

export function clearHairHistory() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(HAIR_HISTORY_KEY)
  }
}

const DEFAULT_HAIR_PREFS: HairPreferences = {
  preferredLength: 'any',
  maintenancePreference: 'medium',
  stylePreference: 'versatile',
  professionalOrCasual: 'balanced',
  willingToTryBold: false
}

export function getHairPreferences(): HairPreferences {
  if (typeof window === 'undefined') return DEFAULT_HAIR_PREFS
  try {
    const raw = localStorage.getItem(HAIR_PREFS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_HAIR_PREFS
  } catch {
    return DEFAULT_HAIR_PREFS
  }
}

export function saveHairPreferences(prefs: HairPreferences) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(HAIR_PREFS_KEY, JSON.stringify(prefs))
  }
}

// ── Shopping Assistant Extensions ────────────────────────────────────────────
import type { TestPurchaseResult } from '@/types'

const SHOPPING_HISTORY_KEY = 'closetmind_shopping_history'

export function getShoppingHistory(): TestPurchaseResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SHOPPING_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function logTestPurchase(result: Omit<TestPurchaseResult, 'id' | 'date'>) {
  if (typeof window === 'undefined') return
  const history = getShoppingHistory()
  const newEntry: TestPurchaseResult = {
    ...result,
    id: `purchase-test-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  }
  localStorage.setItem(SHOPPING_HISTORY_KEY, JSON.stringify([newEntry, ...history]))
}

export function clearShoppingHistory() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SHOPPING_HISTORY_KEY)
  }
}
