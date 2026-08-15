import type { SkinProvider, ApparelVTOProvider, SkinResult, VTOResult } from './types'

export class MockSkinProvider implements SkinProvider {
  async analyze(selfieIdOrFile: string | File): Promise<SkinResult> {
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 1200))
    return {
      status: 'completed',
      signals: {
        clarityScore: 88,
        hydrationLevel: 'balanced',
        undertone: 'neutral',
        textureNotes: 'Optimal light dispersion for warm & deep tone garments.',
        concerns: [
          {
            id: 'oiliness',
            name: 'Visible Oiliness',
            score: 81,
            level: 'high',
            meaning: 'The analysis indicates a higher level of visible surface sheen.',
          },
          {
            id: 'acne',
            name: 'Acne-related Signs',
            score: 72,
            level: 'moderate',
            meaning: 'The analysis detected visible patterns associated with acne-prone texture.',
          },
          {
            id: 'hydration',
            name: 'Moisture Balance',
            score: 53,
            level: 'moderate',
            meaning: 'The analysis detected moderate moisture levels.',
          },
          {
            id: 'redness',
            name: 'Visible Redness',
            score: 48,
            level: 'moderate',
            meaning: 'The analysis detected a moderate level of visible surface redness.',
          },
          {
            id: 'pores',
            name: 'Pore Appearance',
            score: 42,
            level: 'low',
            meaning: 'The analysis indicates smooth, refined pore patterns.',
          },
        ],
      },
      overlays: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
      ],
    }
  }
}

export class MockApparelVTOProvider implements ApparelVTOProvider {
  async generate(selfieId: string, garmentUrl: string, category: string = 'cloth'): Promise<VTOResult> {
    // Simulate S2S task creation and polling latency
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Curated high quality result mock images matching garment/look categories
    const mockVTOImages: Record<string, string> = {
      cloth: 'https://images.unsplash.com/photo-1550614000-4b95d4ed79ea?w=600&q=80',
      shoes: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80',
      bag: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&q=80',
      outerwear: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=80',
      default: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
    }

    const imageUrl = mockVTOImages[category] || garmentUrl || mockVTOImages.default

    return {
      id: `vto-mock-${Date.now()}`,
      imageUrl,
      status: 'completed',
    }
  }
}
