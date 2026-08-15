import { getSkinProvider } from './skin'
import { getApparelVTOProvider } from './apparel'
import { getHairAnalyzer, getHairstyleProvider } from './hair'

export const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

export const providers = {
  get skin() {
    return getSkinProvider(isDemoMode())
  },
  get apparel() {
    return getApparelVTOProvider(isDemoMode())
  },
  get hairAnalyzer() {
    return getHairAnalyzer(isDemoMode())
  },
  get hairstyle() {
    return getHairstyleProvider(isDemoMode())
  }
}
