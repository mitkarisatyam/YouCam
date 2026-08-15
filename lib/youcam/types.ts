export type SkinConcernScore = {
  id: string
  name: string
  score: number // 0-100
  level: 'low' | 'moderate' | 'high'
  meaning: string
}

export type SkinResult = {
  raw?: unknown
  signals: {
    clarityScore: number
    hydrationLevel: 'hydrated' | 'balanced' | 'dry'
    undertone: 'warm' | 'cool' | 'neutral'
    textureNotes: string
    concerns: SkinConcernScore[]
  }
  overlays?: string[]
  status: 'pending' | 'completed' | 'failed'
  error?: string
}

export type VTOResult = {
  id: string
  imageUrl?: string
  status: 'pending' | 'completed' | 'failed'
  error?: string
}

export interface SkinProvider {
  analyze(selfieIdOrFile: string | File): Promise<SkinResult>
}

export interface ApparelVTOProvider {
  generate(selfieId: string, garmentUrl: string, category?: string): Promise<VTOResult>
}
