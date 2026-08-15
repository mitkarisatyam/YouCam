import type { ShoppingItem, PurchaseDecisionScore, WardrobeItem } from '@/types'
import { getWardrobe } from './memory'

export function evaluatePurchase(item: ShoppingItem, userPhoto?: string): PurchaseDecisionScore {
  const wardrobe = getWardrobe()
  
  let wardrobeCompat = 0
  let occasionFit = 0
  let colorHarmony = 0
  let styleMatch = 0
  
  // 1. Wardrobe Compatibility (How many items can it be worn with?)
  // Simplified logic: Count items of different categories
  const complementaryItems = wardrobe.filter(w => {
    if (item.category.includes('Top') && w.category.includes('bottoms')) return true
    if (item.category.includes('Bottom') && w.category.includes('tops')) return true
    if (item.category.includes('Shoe') || item.category.includes('Outerwear')) return true
    return false
  })
  wardrobeCompat = Math.min(Math.round((complementaryItems.length / Math.max(wardrobe.length, 1)) * 100) + 40, 95)
  
  // 2. Occasion Fit
  if (item.formality === 'casual') occasionFit = 85
  else if (item.formality === 'formal') occasionFit = 90
  else occasionFit = 80
  
  // 3. Color Harmony
  const hasMatchingColors = complementaryItems.some(w => 
    w.color === item.color || 
    (item.color === 'Black' || item.color === 'White' || w.color === 'Black' || w.color === 'White')
  )
  colorHarmony = hasMatchingColors ? 92 : 65
  
  // 4. Style Match
  const styleOverlap = wardrobe.filter(w => w.formality === item.formality).length
  styleMatch = Math.min(Math.round((styleOverlap / Math.max(wardrobe.length, 1)) * 100) + 50, 98)

  const totalScore = Math.round((wardrobeCompat * 0.4) + (occasionFit * 0.2) + (colorHarmony * 0.2) + (styleMatch * 0.2))

  let explanation = ''
  if (totalScore > 85) {
    explanation = 'This item strongly complements your existing wardrobe and matches your current style patterns perfectly.'
  } else if (totalScore > 70) {
    explanation = 'A solid choice, though you may need to buy additional pieces to unlock its full potential.'
  } else {
    explanation = 'This is quite different from what you currently own. Consider if it fits your long-term style goals.'
  }

  return {
    totalScore,
    wardrobeCompatibilityScore: wardrobeCompat,
    occasionFitScore: occasionFit,
    colorHarmonyScore: colorHarmony,
    styleMatchScore: styleMatch,
    explanation
  }
}
