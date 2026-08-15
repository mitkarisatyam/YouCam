import { analyzeSkin } from '../perfectcorp'
import type { SkinConcernScore } from '../youcam/types'

export interface SkinInput {
  imageFile?: File
  imageUrl?: string
  selfieId?: string
}

export interface SkinResult {
  concerns: SkinConcernScore[]
  selfieId?: string
}

export interface SkinProvider {
  analyze(input: SkinInput): Promise<SkinResult>
}

export class MockSkinProvider implements SkinProvider {
  async analyze(input: SkinInput): Promise<SkinResult> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          concerns: [
            { id: 'acne', name: 'Acne-related Signs', score: 65, level: 'high', meaning: 'Needs attention' },
            { id: 'hydration', name: 'Moisture Balance', score: 45, level: 'moderate', meaning: 'Balanced' },
            { id: 'oiliness', name: 'Visible Surface Oiliness', score: 30, level: 'low', meaning: 'Good' },
          ]
        })
      }, 3000)
    })
  }
}

export class YouCamSkinProvider implements SkinProvider {
  async analyze(input: SkinInput): Promise<SkinResult> {
    if (!input.selfieId) {
      throw new Error('YouCamSkinProvider requires a pre-uploaded selfieId')
    }
    const resultUrl = await analyzeSkin(input.selfieId)
    // NOTE: Real parsing of the YouCam response image/JSON would happen here.
    // For now, we mock the parsed result structure for the UI.
    return {
      selfieId: input.selfieId,
      concerns: [
        { id: 'acne', name: 'Acne', score: 50, level: 'moderate', meaning: 'Moderate' },
        { id: 'hydration', name: 'Hydration', score: 60, level: 'moderate', meaning: 'Balanced' },
      ]
    }
  }
}

export function getSkinProvider(isDemo: boolean): SkinProvider {
  return isDemo ? new MockSkinProvider() : new YouCamSkinProvider()
}
