import { vtoHairStyle } from '../perfectcorp'
import type { HairProfile, HairstyleResult } from '@/types'

export interface HairInput {
  frontImage: string
  leftImage?: string
  rightImage?: string
}

export interface HairstyleInput {
  userImage: string
  candidateId: string
  styleGroupId?: number
  styleId?: number
}

export interface HairAnalyzer {
  analyze(input: HairInput): Promise<HairProfile>
}

export interface HairstyleProvider {
  generate(input: HairstyleInput): Promise<HairstyleResult>
}

export class MockHairProvider implements HairAnalyzer {
  async analyze(input: HairInput): Promise<HairProfile> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          hairType: 'Wavy',
          texture: 'Medium',
          curlPattern: 'Loose Waves',
          density: 'Average',
          frizz: 'Moderate',
          length: 'Shoulder',
          analysisSignals: {
            dryness: 'Mild',
            volume: 'Good at roots',
          }
        })
      }, 3000)
    })
  }
}

export class YouCamHairProvider implements HairAnalyzer {
  async analyze(input: HairInput): Promise<HairProfile> {
    // YouCam Hair Type Analysis API integration goes here when available
    // Fallback to mock for now even in production if not supported
    return new MockHairProvider().analyze(input)
  }
}

export class MockHairstyleProvider implements HairstyleProvider {
  async generate(input: HairstyleInput): Promise<HairstyleResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          candidateId: input.candidateId,
          originalImageUrl: input.userImage,
          resultImageUrl: 'https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?w=800&q=80',
          status: 'completed'
        })
      }, 4000)
    })
  }
}

export class YouCamHairstyleProvider implements HairstyleProvider {
  async generate(input: HairstyleInput): Promise<HairstyleResult> {
    if (!input.styleGroupId || !input.styleId) {
      throw new Error('YouCam Hairstyle requires styleGroupId and styleId')
    }
    const resultUrl = await vtoHairStyle(input.userImage, input.styleGroupId, input.styleId)
    return {
      candidateId: input.candidateId,
      originalImageUrl: input.userImage,
      resultImageUrl: resultUrl,
      status: 'completed'
    }
  }
}

export function getHairAnalyzer(isDemo: boolean): HairAnalyzer {
  return isDemo ? new MockHairProvider() : new YouCamHairProvider()
}

export function getHairstyleProvider(isDemo: boolean): HairstyleProvider {
  return isDemo ? new MockHairstyleProvider() : new YouCamHairstyleProvider()
}
