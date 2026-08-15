import type { ApparelVTOProvider, VTOResult } from './types'

export class YouCamApparelVTOProvider implements ApparelVTOProvider {
  async generate(selfieId: string, garmentUrl: string, category: string = 'cloth'): Promise<VTOResult> {
    try {
      const res = await fetch('/api/vto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: category,
          selfie_id: selfieId,
          item_url: garmentUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'VTO generation failed')
      }

      return {
        id: `vto-real-${Date.now()}`,
        imageUrl: data.url,
        status: 'completed',
      }
    } catch (err: unknown) {
      return {
        id: `vto-err-${Date.now()}`,
        status: 'failed',
        error: (err as Error).message,
      }
    }
  }
}
