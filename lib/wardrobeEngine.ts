import type { WardrobeItem, LookCandidate } from '@/types'

// Map older categories and new ones for generation
function isTop(item: WardrobeItem) {
  return ['tops', 'clothing'].includes(item.category) && (item.subcategory.toLowerCase().includes('shirt') || item.subcategory.toLowerCase().includes('top') || item.subcategory.toLowerCase().includes('tee') || item.subcategory.toLowerCase().includes('polo') || item.category === 'tops')
}

function isBottom(item: WardrobeItem) {
  return ['bottoms', 'clothing'].includes(item.category) && (item.subcategory.toLowerCase().includes('pant') || item.subcategory.toLowerCase().includes('jean') || item.subcategory.toLowerCase().includes('trouser') || item.subcategory.toLowerCase().includes('short') || item.subcategory.toLowerCase().includes('skirt') || item.category === 'bottoms')
}

function isOuterwear(item: WardrobeItem) {
  return item.category === 'outerwear' || item.subcategory.toLowerCase().includes('jacket') || item.subcategory.toLowerCase().includes('blazer') || item.subcategory.toLowerCase().includes('coat')
}

function isShoe(item: WardrobeItem) {
  return item.category === 'footwear'
}

function isAccessory(item: WardrobeItem) {
  return item.category === 'accessories' || item.category === 'bag' || item.category === 'jewelry'
}

export function generateWardrobeOutfits(occasion: string, weather: string | undefined, wardrobe: WardrobeItem[], count: number = 4): LookCandidate[] {
  const tops = wardrobe.filter(isTop)
  const bottoms = wardrobe.filter(isBottom)
  const shoes = wardrobe.filter(isShoe)
  const outerwear = wardrobe.filter(isOuterwear)
  
  if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) {
    return [] // Not enough items to build an outfit
  }

  const generated: LookCandidate[] = []
  
  // Basic shuffle function for variation
  const shuffle = (arr: any[]) => [...arr].sort(() => 0.5 - Math.random())

  for (let i = 0; i < count; i++) {
    // Generate different styles depending on index
    const styleThemes = ['Classic', 'Modern', 'Relaxed', 'Statement', 'Versatile', 'Elevated']
    const theme = styleThemes[i % styleThemes.length]

    // Determine target formality based on occasion
    let targetFormality = 'casual'
    if (['wedding', 'formal event', 'interview'].includes(occasion.toLowerCase())) targetFormality = 'formal'
    else if (['office', 'date', 'dinner', 'party'].includes(occasion.toLowerCase())) targetFormality = 'smart-casual'

    // Try to find items matching the target formality, otherwise fallback to anything
    let top = shuffle(tops).find((t: WardrobeItem) => t.formality === targetFormality) || tops[Math.floor(Math.random() * tops.length)]
    let bottom = shuffle(bottoms).find((b: WardrobeItem) => b.formality === targetFormality && b.color !== top.color) || bottoms[Math.floor(Math.random() * bottoms.length)]
    let shoe = shuffle(shoes).find((s: WardrobeItem) => s.formality === targetFormality) || shoes[Math.floor(Math.random() * shoes.length)]
    
    const items = [top, bottom, shoe]

    // Optionally add outerwear
    let out = undefined
    if (outerwear.length > 0 && Math.random() > 0.3) { // 70% chance to add outerwear if available
      out = shuffle(outerwear).find((o: WardrobeItem) => o.formality === targetFormality) || outerwear[Math.floor(Math.random() * outerwear.length)]
      if (out && !items.includes(out)) {
        items.push(out)
      }
    }

    // Score the outfit
    const scoreInfo = scoreWardrobeOutfit(items, occasion, weather)
    
    // Create the LookCandidate structure
    const look: LookCandidate = {
      id: `wardrobe-look-${Date.now()}-${i}`,
      name: `${theme} ${occasion.charAt(0).toUpperCase() + occasion.slice(1)}`,
      tag: theme.toLowerCase(),
      items,
      explanation: scoreInfo.explanation,
      vtoStatus: 'pending',
      vtoResultUrl: top.imageUrl, // We use the top's image as the default visual hook before VTO
      contextMirrorScore: scoreInfo.score,
    }
    
    generated.push(look)
  }

  // Sort by score
  generated.sort((a, b) => (b.contextMirrorScore || 0) - (a.contextMirrorScore || 0))
  
  if (generated.length > 0) {
    generated[0].isBestMatch = true
  }

  return generated
}

export function scoreWardrobeOutfit(items: WardrobeItem[], occasion: string, weather?: string) {
  let score = 80
  const colors = items.map(i => i.color.toLowerCase())
  const formalities = items.map(i => i.formality)
  const isFormal = ['wedding', 'formal event', 'interview'].includes(occasion.toLowerCase())
  
  let explanation = ''

  // 1. Formality Check
  const formalCount = formalities.filter(f => f === 'formal').length
  const casualCount = formalities.filter(f => f === 'casual').length
  
  if (isFormal) {
    score += formalCount * 5
    score -= casualCount * 10
    if (casualCount > 0) explanation = 'Includes casual pieces which lower the formality fit.'
    else explanation = 'Strong formal composition for the occasion.'
  } else {
    // casual/smart-casual
    if (casualCount > 0) score += 5
    explanation = 'Balanced mix of comfortable and structured pieces.'
  }

  // 2. Color Harmony
  const uniqueColors = new Set(colors)
  if (uniqueColors.size > 3) {
    score -= 10
    explanation += ' A bit color-heavy, creating a bolder statement.'
  } else if (uniqueColors.size === 1) {
    score += 5
    explanation += ' Monochromatic and sleek.'
  } else {
    score += 8
    explanation += ' Good color harmony.'
  }

  // 3. Weather
  const hasOuterwear = items.some(isOuterwear)
  if (weather === 'hot' && hasOuterwear) {
    score -= 15
    explanation += ' Might be too warm with the outerwear.'
  } else if (weather === 'cold' && !hasOuterwear) {
    score -= 15
    explanation += ' Consider adding a jacket for the cold.'
  }

  // Bound score
  score = Math.min(Math.max(score, 40), 98)

  return {
    score,
    explanation: explanation.trim()
  }
}
