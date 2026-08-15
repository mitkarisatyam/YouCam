import { vtoClothes, vtoShoes } from '../perfectcorp'

export interface VTOInput {
  userImage: string // selfie ID or URL
  garmentImage: string // garment ID or URL
  category: 'top' | 'bottom' | 'shoes' | 'dress' | 'outerwear'
}

export interface VTOResult {
  originalImage: string
  resultImageUrl: string
  status: 'completed' | 'failed' | 'pending'
}

export interface ApparelVTOProvider {
  generate(input: VTOInput): Promise<VTOResult>
}

export class MockApparelProvider implements ApparelVTOProvider {
  async generate(input: VTOInput): Promise<VTOResult> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          originalImage: input.userImage,
          resultImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', // Fashion mockup
          status: 'completed'
        })
      }, 3500)
    })
  }
}

export class YouCamApparelProvider implements ApparelVTOProvider {
  async generate(input: VTOInput): Promise<VTOResult> {
    let resultUrl = ''
    if (input.category === 'shoes') {
      resultUrl = await vtoShoes(input.userImage, input.garmentImage)
    } else {
      resultUrl = await vtoClothes(input.userImage, input.garmentImage)
    }
    
    return {
      originalImage: input.userImage,
      resultImageUrl: resultUrl,
      status: 'completed'
    }
  }
}

export function getApparelVTOProvider(isDemo: boolean): ApparelVTOProvider {
  return isDemo ? new MockApparelProvider() : new YouCamApparelProvider()
}
