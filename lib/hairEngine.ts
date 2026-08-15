import type { HairProfile, HairstyleCandidate, HairstyleResult, HairPreferences } from '@/types'

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface HairInput {
  frontImage: string
  leftImage?: string
  rightImage?: string
}

export interface HairstyleInput {
  userImage: string
  candidateId: string
  changeVariable?: { key: string, value: string }
}

export interface HairAnalyzer {
  analyze(input: HairInput): Promise<HairProfile>
}

export interface HairstyleTryOn {
  generate(input: HairstyleInput): Promise<HairstyleResult>
}

// ── Mock Implementations have been moved to lib/providers/hair.ts ───────

// ── Recommendation Engine ──────────────────────────────────────────────────

const HAIRSTYLE_LIBRARY: Omit<HairstyleCandidate, 'compatibilityScore' | 'whyRecommended'>[] = [
  { id: 'hs-1', name: 'Textured Crop', category: 'Short', imageUrl: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=600&q=80', maintenanceLevel: 'low' },
  { id: 'hs-2', name: 'Soft Waves', category: 'Long', imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=80', maintenanceLevel: 'medium' },
  { id: 'hs-3', name: 'Classic Side Part', category: 'Professional', imageUrl: 'https://images.unsplash.com/photo-1582233479966-d466fa3594b5?w=600&q=80', maintenanceLevel: 'medium' },
  { id: 'hs-4', name: 'Shoulder Length Layers', category: 'Medium', imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&q=80', maintenanceLevel: 'high' },
  { id: 'hs-5', name: 'Defined Curls', category: 'Curly/Wavy', imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1bfa8c?w=600&q=80', maintenanceLevel: 'high' },
  { id: 'hs-6', name: 'Clean Buzz Cut', category: 'Short', imageUrl: 'https://images.unsplash.com/photo-1518577915332-c2a19f149a75?w=600&q=80', maintenanceLevel: 'low' },
]

export function recommendHairstyles(profile: HairProfile, prefs: HairPreferences): HairstyleCandidate[] {
  // Simple heuristic scoring based on preferences and profile
  const recommended = HAIRSTYLE_LIBRARY.map(style => {
    let score = 80
    let reason = ''

    // Maintenance match
    if (prefs.maintenancePreference === style.maintenanceLevel) {
      score += 10
      reason += `Aligns with your preference for ${style.maintenanceLevel}-maintenance. `
    } else if (prefs.maintenancePreference === 'low' && style.maintenanceLevel === 'high') {
      score -= 15
      reason += 'Requires more styling time than you prefer. '
    }

    // Length/Category match
    if (prefs.preferredLength !== 'any') {
      if (style.category.toLowerCase().includes(prefs.preferredLength)) {
        score += 8
        reason += 'Matches your desired length. '
      }
    }

    // Hair Type match
    if (profile.hairType?.toLowerCase() === 'wavy' && style.category === 'Curly/Wavy') {
      score += 10
      reason += 'Perfectly accentuates your natural wavy pattern. '
    }

    if (!reason) {
      reason = 'A versatile style that works well with your hair characteristics.'
    }

    score = Math.min(Math.max(score, 40), 98)

    return {
      ...style,
      compatibilityScore: score,
      whyRecommended: reason.trim()
    } as HairstyleCandidate
  })

  // Sort by score
  return recommended.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
}

// ── Export default providers (can be swapped when API is live) ────────────
import { providers } from './providers'

export const hairAnalyzer: HairAnalyzer = providers.hairAnalyzer
export const hairstyleTryOn: HairstyleTryOn = providers.hairstyle
