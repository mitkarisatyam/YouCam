import type { PersonalProfile } from '@/types'
import { providers } from './providers'

const PROFILE_STORAGE_KEY = 'contextmirror_profile'

export const DEFAULT_PERSONAL_PROFILE: PersonalProfile = {
  skinSignals: {
    clarityScore: 88,
    hydrationLevel: 'balanced',
    undertone: 'neutral',
    textureNotes: 'Optimal light dispersion for warm & deep tone garments.',
  },
  facialSignals: {
    faceShape: 'oval',
    contrast: 'medium',
  },
  colorSignals: {
    recommendedPalettes: ['Earth Tones', 'Deep Jewel', 'Crisp Monochrome'],
    bestColors: ['navy', 'cream', 'black', 'camel', 'emerald', 'burgundy'],
    colorsToAvoid: ['neon green', 'harsh yellow'],
  },
  stylePreferences: ['smart-casual', 'tailored', 'minimalist', 'classic'],
}

export function getStoredProfile(): PersonalProfile {
  if (typeof window === 'undefined') return DEFAULT_PERSONAL_PROFILE
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return DEFAULT_PERSONAL_PROFILE
    return JSON.parse(raw)
  } catch {
    return DEFAULT_PERSONAL_PROFILE
  }
}

export function saveProfile(profile: PersonalProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  }
}

export async function generateProfileFromSelfie(selfieIdOrUrl: string): Promise<PersonalProfile> {
  // Use the new provider abstraction
  const skinResult = await providers.skin.analyze({ imageUrl: selfieIdOrUrl, selfieId: selfieIdOrUrl })
  
  const current = getStoredProfile()
  
  // Calculate average score as a mock clarity score
  const avgScore = skinResult.concerns.length > 0 
    ? skinResult.concerns.reduce((acc, c) => acc + c.score, 0) / skinResult.concerns.length
    : 88
    
  const updated: PersonalProfile = {
    ...current,
    skinSignals: {
      clarityScore: Math.round(avgScore),
      hydrationLevel: 'balanced', // mock inference
      undertone: 'neutral',
      textureNotes: 'Updated via provider analysis.',
    },
    selfieId: selfieIdOrUrl,
    selfieUrl: selfieIdOrUrl,
  }
  
  saveProfile(updated)
  return updated
}
