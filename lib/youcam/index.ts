import type { SkinProvider, ApparelVTOProvider, HairProvider, HairstyleProvider } from './types'
import { MockSkinProvider, MockApparelVTOProvider, MockHairProvider, MockHairstyleProvider } from './mock'
import { YouCamSkinProvider } from './skin'
import { YouCamApparelVTOProvider } from './apparel-vto'

// Default to Demo mode if DEMO_MODE env is true or if API key is not configured
export function isDemoMode(): boolean {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('contextmirror_demo_mode')
    if (override !== null) return override === 'true'
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.PERFECT_CORP_API_KEY
}

export function getSkinProvider(): SkinProvider {
  return isDemoMode() ? new MockSkinProvider() : new YouCamSkinProvider()
}

export function getApparelVTOProvider(): ApparelVTOProvider {
  return isDemoMode() ? new MockApparelVTOProvider() : new YouCamApparelVTOProvider()
}

export function getHairProvider(): HairProvider {
  // If YouCamHairProvider does not exist yet, fallback to Mock for both
  return new MockHairProvider()
}

export function getHairstyleProvider(): HairstyleProvider {
  return new MockHairstyleProvider()
}

export * from './types'
