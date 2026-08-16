import type { SkinProvider, ApparelVTOProvider, SkinResult, VTOResult, HairProvider, HairstyleProvider, HairResult } from './types'

export class MockSkinProvider implements SkinProvider {
  async analyze(selfieIdOrFile: string | File): Promise<SkinResult> {
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Validation for demo mode
    let fileName = 'unknown'
    let fileSize = 0
    if (selfieIdOrFile instanceof File) {
      fileName = selfieIdOrFile.name.toLowerCase()
      fileSize = selfieIdOrFile.size
      
      // Super naive fake validation to simulate the API rejecting non-faces
      if (fileName.includes('landscape') || fileName.includes('dog') || fileName.includes('cat')) {
        return {
          status: 'failed',
          error: 'Please upload a clear photo showing one face.',
          signals: { clarityScore: 0, hydrationLevel: 'balanced', undertone: 'neutral', textureNotes: '', concerns: [] }
        }
      }
    } else {
      fileName = selfieIdOrFile.toLowerCase()
    }

    // Pseudo-random deterministic results based on filename length or size
    const seed = (fileName.length + fileSize) % 3
    
    const variations = [
      {
        clarityScore: 82,
        hydrationLevel: 'hydrated' as const,
        undertone: 'neutral' as const,
        textureNotes: 'Skin shows good overall hydration with minimal textural irregularities.',
        concerns: [
          { id: 'dark-circles', name: 'Dark Circles', score: 35, level: 'low' as const, meaning: 'Slight pigmentation detected under the eyes.' }
        ]
      },
      {
        clarityScore: 71,
        hydrationLevel: 'dry' as const,
        undertone: 'cool' as const,
        textureNotes: 'Skin appears slightly compromised with visible dry patches and dullness.',
        concerns: [
          { id: 'texture', name: 'Rough Texture', score: 65, level: 'moderate' as const, meaning: 'Uneven skin texture concentrated on the cheeks.' },
          { id: 'redness', name: 'Redness', score: 45, level: 'low' as const, meaning: 'Mild capillary visibility.' }
        ]
      },
      {
        clarityScore: 64,
        hydrationLevel: 'balanced' as const,
        undertone: 'warm' as const,
        textureNotes: 'Overall balanced sebum production, but localized congestion detected.',
        concerns: [
          { id: 'acne', name: 'Acne/Blemishes', score: 78, level: 'high' as const, meaning: 'Active inflammatory lesions detected in the T-zone.' },
          { id: 'pores', name: 'Enlarged Pores', score: 55, level: 'moderate' as const, meaning: 'Visible pore structure around the nose.' }
        ]
      }
    ]

    const selectedVariation = variations[seed]

    return {
      status: 'completed',
      signals: selectedVariation
    }
  }
}

export class MockApparelVTOProvider implements ApparelVTOProvider {
  async generate(selfieId: string, garmentUrl: string, category: string = 'cloth'): Promise<VTOResult> {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Curated high quality result mock images matching garment/look categories
    const mockVTOImages: Record<string, string> = {
      cloth: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
      shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      bag: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80',
      outerwear: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
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

export class MockHairProvider implements HairProvider {
  async analyze(selfieIdOrFile: string | File): Promise<HairResult> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return {
      status: 'completed',
      signals: {
        hairType: 'wavy',
        curlPattern: 'Type 2B',
        density: 'Medium-High',
        condition: 'healthy',
        color: 'Dark Brunette',
        textureNotes: 'Natural volume with mild frizz at the ends. High density.',
        concerns: [
          {
            id: 'frizz',
            name: 'Frizz',
            score: 45,
            level: 'moderate',
            meaning: 'Moderate structural flyaways detected.',
          },
          {
            id: 'split-ends',
            name: 'Split Ends',
            score: 12,
            level: 'low',
            meaning: 'Ends appear structurally sound.',
          }
        ]
      }
    }
  }
}

export class MockHairstyleProvider implements HairstyleProvider {
  async generate(selfieId: string, styleId: string, colorHex?: string): Promise<VTOResult> {
    await new Promise(resolve => setTimeout(resolve, 1800))
    
    const mockVTOImages: Record<string, string> = {
      'hs-1': 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=600&q=80',
      'hs-2': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80',
      'hs-3': 'https://images.unsplash.com/photo-1622281549424-fd9a0e41a2e0?w=600&q=80',
      'hs-4': 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80',
      'hs-5': 'https://images.unsplash.com/photo-1512303452027-750531d7cb7f?w=600&q=80',
      'hs-6': 'https://images.unsplash.com/photo-1605801700683-f54f738090b8?w=600&q=80',
    }

    return {
      id: `hair-vto-${Date.now()}`,
      imageUrl: mockVTOImages[styleId] || 'https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?w=600&q=80',
      status: 'completed'
    }
  }
}
