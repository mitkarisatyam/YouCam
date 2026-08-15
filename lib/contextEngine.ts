import type {
  ContextSetup,
  PersonalProfile,
  WardrobeItem,
  LookCandidate,
  StressTestMetrics,
  ChangeOneThingExperiment,
  WardrobeImpactResult,
  DecisionReplayEntry,
} from '@/types'
import { smart3, getWardrobe } from './memory'

// ── Natural Language Context Parser ──────────────────────────────────────────
export function parseNaturalContext(input: string): ContextSetup {
  const q = input.toLowerCase()
  
  let occasion = 'custom'
  if (q.includes('wedding')) occasion = 'wedding'
  else if (q.includes('party')) occasion = 'party'
  else if (q.includes('interview')) occasion = 'interview'
  else if (q.includes('graduation')) occasion = 'graduation'
  else if (q.includes('college')) occasion = 'college'
  else if (q.includes('date')) occasion = 'date'
  else if (q.includes('dinner')) occasion = 'dinner'
  else if (q.includes('brunch')) occasion = 'brunch'
  else if (q.includes('travel') || q.includes('flight')) occasion = 'travel'
  else if (q.includes('vacation')) occasion = 'vacation'
  else if (q.includes('festival')) occasion = 'festival'
  else if (q.includes('cultural')) occasion = 'cultural'
  else if (q.includes('office') || q.includes('work')) occasion = 'office'
  else if (q.includes('presentation')) occasion = 'presentation'
  else if (q.includes('photoshoot')) occasion = 'photoshoot'
  else if (q.includes('concert')) occasion = 'concert'
  else if (q.includes('reception')) occasion = 'reception'
  else if (q.includes('formal') || q.includes('black tie')) occasion = 'formal'
  else if (q.includes('shopping')) occasion = 'shopping'
  else if (q.includes('active') || q.includes('running')) occasion = 'active'
  else if (q.includes('casual')) occasion = 'casual-outing'

  let time: ContextSetup['time'] = 'afternoon'
  if (q.includes('7 pm') || q.includes('8 pm') || q.includes('evening') || q.includes('night') || q.includes('dinner')) {
    time = 'evening'
  } else if (q.includes('morning') || q.includes('9 am') || q.includes('breakfast')) {
    time = 'morning'
  } else if (q.includes('late night') || q.includes('11 pm')) {
    time = 'night'
  }

  let environment: ContextSetup['environment'] = 'indoor'
  if (q.includes('outdoor') || q.includes('garden') || q.includes('park') || q.includes('outside')) environment = 'outdoor'
  else if (q.includes('hotel') || q.includes('hall')) environment = 'hotel'
  else if (q.includes('restaurant')) environment = 'restaurant'
  else if (q.includes('beach')) environment = 'beach'
  else if (q.includes('office')) environment = 'office'

  let formality: ContextSetup['formality'] = 'smart-casual'
  if (occasion === 'wedding' || occasion === 'interview' || occasion === 'reception' || occasion === 'formal' || q.includes('elegant')) {
    formality = 'formal'
  } else if (q.includes('traditional') || occasion === 'cultural') {
    formality = 'traditional'
  } else if (q.includes('casual') || occasion === 'beach' || occasion === 'shopping' || occasion === 'active') {
    formality = 'casual'
  }

  let importance: ContextSetup['importance'] = 'normal'
  if (occasion === 'wedding' || occasion === 'interview' || q.includes('important')) {
    importance = 'very-important'
  } else if (occasion === 'date' || occasion === 'party') {
    importance = 'important'
  }

  let weather: ContextSetup['weather'] = undefined
  if (q.includes('hot')) weather = 'hot'
  else if (q.includes('warm')) weather = 'warm'
  else if (q.includes('cold') || q.includes('freezing')) weather = 'cold'
  else if (q.includes('cool')) weather = 'cool'
  else if (q.includes('rain')) weather = 'rainy'
  else if (q.includes('humid')) weather = 'humid'
  else if (q.includes('mild')) weather = 'mild'

  let mood: ContextSetup['mood'] = undefined
  if (q.includes('minimal')) mood = 'minimal'
  else if (q.includes('elegant')) mood = 'elegant'
  else if (q.includes('bold')) mood = 'bold'
  else if (q.includes('classic')) mood = 'classic'
  else if (q.includes('relaxed') || q.includes('chill')) mood = 'relaxed'
  else if (q.includes('trendy')) mood = 'trendy'
  else if (q.includes('creative')) mood = 'creative'

  return {
    occasion,
    time,
    environment,
    formality,
    importance,
    weather,
    mood,
    rawNaturalInput: input,
  }
}

// ── Context Stress Test Evaluator ───────────────────────────────────────────
export function evaluateStressTest(
  candidate: WardrobeItem[],
  context: ContextSetup,
  profile: PersonalProfile
): StressTestMetrics {
  
  // 1. Occasion Fit
  let occasionFit = 85
  const hasBlazer = candidate.some(i => i.subcategory === 'blazer' || i.name.toLowerCase().includes('blazer'))
  const hasFormalDress = candidate.some(i => i.subcategory === 'dress' && i.formality === 'formal')
  const hasSneakers = candidate.some(i => i.subcategory === 'sneakers')
  const hasCoat = candidate.some(i => i.category === 'outerwear')
  
  if (context.formality === 'formal') {
    if (hasFormalDress || hasBlazer) occasionFit += 10
    if (hasSneakers) occasionFit -= 35 // Punish wrong choice hard
  } else if (context.formality === 'casual') {
    if (hasSneakers) occasionFit += 10
    if (hasFormalDress) occasionFit -= 25
  }
  occasionFit = Math.min(Math.max(occasionFit, 30), 98)

  // 2. Time Fit
  let timeFit = 82
  const colors = candidate.map(i => i.color.toLowerCase())
  const hasDarkColors = colors.some(c => c.includes('black') || c.includes('navy') || c.includes('dark'))
  const hasLightColors = colors.some(c => c.includes('white') || c.includes('cream') || c.includes('light') || c.includes('beige'))

  if (context.time === 'evening' || context.time === 'night') {
    if (hasDarkColors) timeFit += 12
    if (hasLightColors && !hasDarkColors) timeFit -= 15
  } else if (context.time === 'morning' || context.time === 'afternoon') {
    if (hasLightColors) timeFit += 10
  }
  timeFit = Math.min(Math.max(timeFit, 40), 96)

  // 3. Environment (and Weather) Fit
  let environmentFit = 80
  if (context.environment === 'indoor' || context.environment === 'hotel') {
    environmentFit = hasCoat ? 84 : 94
    if (context.weather === 'hot' && hasCoat) environmentFit -= 20
  } else if (context.environment === 'outdoor' || context.environment === 'beach') {
    environmentFit = hasCoat ? 92 : 75
    if (context.weather === 'hot') {
      environmentFit = hasCoat ? 50 : 96
    }
    if (context.weather === 'cold') {
      environmentFit = hasCoat ? 98 : 45
    }
  }
  environmentFit = Math.min(Math.max(environmentFit, 40), 98)

  // 4. Color Compatibility
  let colorCompatibility = 85
  const bestColors = profile.colorSignals.bestColors || []
  const matchesBest = colors.some(c => bestColors.some(bc => c.includes(bc.toLowerCase())))
  if (matchesBest) colorCompatibility += 10
  colorCompatibility = Math.min(Math.max(colorCompatibility, 55), 98)

  // 5. Photography Suitability
  let photoSuitability = 86
  if (hasDarkColors && (context.time === 'evening' || context.environment === 'hotel')) {
    photoSuitability += 8
  }
  if (candidate.some(i => i.fabric.includes('silk') || i.fabric.includes('suede'))) {
    photoSuitability += 5
  }
  photoSuitability = Math.min(Math.max(photoSuitability, 50), 96)

  // 6. Style & Mood Preference
  let stylePreference = 84
  const prefs = profile.stylePreferences.map(s => s.toLowerCase())
  const itemsFormality = candidate.map(i => i.formality.toLowerCase())
  if (itemsFormality.some(f => prefs.includes(f))) stylePreference += 10
  if (context.mood) {
    // Basic heuristics for mood matching
    if (context.mood === 'minimal' && !candidate.some(i => i.pattern !== 'solid')) stylePreference += 5
    if (context.mood === 'elegant' && (hasBlazer || hasFormalDress)) stylePreference += 5
  }
  stylePreference = Math.min(Math.max(stylePreference, 50), 96)

  // 7. Wardrobe Compatibility
  let wardrobeCompatibility = 88
  const avgWear = candidate.reduce((acc, i) => acc + (i.wearCount || 0), 0) / candidate.length
  if (avgWear > 10) wardrobeCompatibility += 6
  wardrobeCompatibility = Math.min(Math.max(wardrobeCompatibility, 50), 95)

  // 8. Profile Compatibility
  let profileCompatibility = 85
  if (profile.skinSignals.undertone === 'cool' && colors.some(c => c.includes('blue') || c.includes('silver'))) profileCompatibility += 5
  if (profile.skinSignals.undertone === 'warm' && colors.some(c => c.includes('gold') || c.includes('orange') || c.includes('yellow'))) profileCompatibility += 5
  profileCompatibility = Math.min(Math.max(profileCompatibility, 50), 98)

  return {
    occasionFit,
    timeFit,
    environmentFit,
    colorCompatibility,
    photographySuitability: photoSuitability,
    stylePreference,
    wardrobeCompatibility,
    profileCompatibility
  }
}

// ── Context Stability Score ──────────────────────────────────────────────────
export function calculateStabilityScore(metrics: StressTestMetrics): number {
  const scores = [
    metrics.occasionFit,
    metrics.timeFit,
    metrics.environmentFit,
    metrics.colorCompatibility,
    metrics.photographySuitability,
    metrics.stylePreference,
    metrics.wardrobeCompatibility,
    metrics.profileCompatibility || 85,
  ]
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  return Math.round(avg)
}

// ── ContextMirror Score Engine (Weighted) ───────────────────────
export function calculateContextMirrorScore(metrics: StressTestMetrics): number {
  const stability = calculateStabilityScore(metrics)
  const score =
    metrics.occasionFit * 0.25 +
    stability * 0.20 +
    metrics.environmentFit * 0.15 +
    metrics.colorCompatibility * 0.15 +
    metrics.stylePreference * 0.10 +
    (metrics.profileCompatibility || 85) * 0.15

  return Math.round(score)
}

// ── Generate Context-Aware Candidates ─────────────────────────────────
export function generateContextCandidates(
  context: ContextSetup,
  profile: PersonalProfile,
  count: number = 4
): LookCandidate[] {
  const wardrobe = getWardrobe()
  if (wardrobe.length === 0) return []

  const query = `${context.occasion} ${context.formality} ${context.time} ${context.mood || ''} ${context.weather || ''}`
  const s3: WardrobeItem[] = smart3(query) || []

  // Create a pool of varied items based on context
  const pool = [...s3, ...wardrobe.filter(w => !s3.includes(w))].slice(0, 10)
  
  const footwear = wardrobe.find(i => i.category === 'footwear')
  const jewelry = wardrobe.find(i => i.category === 'jewelry')

  // Dynamic names based on Occasion
  let name1 = 'Refined Classic', name2 = 'Modern Elevation', name3 = 'Bold Remix', name4 = 'Comfortable Choice'
  if (context.occasion === 'wedding') { name1 = 'Elegant Statement'; name2 = 'Contemporary Traditional'; name3 = 'Minimal Luxe'; name4 = 'Refined Classic'; }
  else if (context.occasion === 'interview') { name1 = 'Sharp Professional'; name2 = 'Minimal Executive'; name3 = 'Creative Professional'; name4 = 'Modern Formal'; }
  else if (context.occasion === 'travel') { name1 = 'Comfortable Layered'; name2 = 'Minimal Travel'; name3 = 'Elevated Casual'; name4 = 'Casual Utility'; }
  else if (context.occasion === 'college') { name1 = 'Smart Casual'; name2 = 'Relaxed'; name3 = 'Clean Minimal'; name4 = 'Trend-forward'; }

  const candidateConfigs: Array<{ tag: string; name: string; items: WardrobeItem[]; baseExp: string }> = [
    {
      tag: 'look1',
      name: name1,
      items: [pool[0] || wardrobe[0], footwear].filter(Boolean) as WardrobeItem[],
      baseExp: `High-confidence, structured outfit tuned specifically for an indoor ${context.occasion} (${context.time}).`,
    },
    {
      tag: 'look2',
      name: name2,
      items: [pool[1] || wardrobe[1] || wardrobe[0], footwear].filter(Boolean) as WardrobeItem[],
      baseExp: `Fresh combinations perfectly balanced for your selected ${context.mood || 'elegant'} style.`,
    },
    {
      tag: 'look3',
      name: name3,
      items: [pool[2] || wardrobe[2] || wardrobe[0], jewelry].filter(Boolean) as WardrobeItem[],
      baseExp: `Distinctive silhouette with strong color compatibility tailored to your profile undertone.`,
    },
    {
      tag: 'look4',
      name: name4,
      items: [pool[3] || wardrobe[3] || wardrobe[0], footwear].filter(Boolean) as WardrobeItem[],
      baseExp: `A balanced alternative emphasizing comfort and ${context.weather ? context.weather + ' weather' : 'versatile'} practicality.`,
    },
  ]

  let candidates: LookCandidate[] = candidateConfigs.slice(0, count).map((cfg, idx) => {
    const stressTest = evaluateStressTest(cfg.items, context, profile)
    const stabilityScore = calculateStabilityScore(stressTest)
    const score = calculateContextMirrorScore(stressTest)

    return {
      id: `candidate-${idx + 1}-${Date.now()}`,
      name: cfg.name,
      tag: cfg.tag,
      items: cfg.items,
      explanation: cfg.baseExp,
      vtoStatus: 'completed',
      vtoResultUrl: cfg.items[0]?.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
      stressTest,
      stabilityScore,
      contextMirrorScore: score,
      isBestMatch: false,
    }
  })

  // Determine BEST MATCH
  let maxScore = -1
  let bestIdx = 0
  candidates.forEach((c, i) => {
    if ((c.contextMirrorScore || 0) > maxScore) {
      maxScore = c.contextMirrorScore || 0
      bestIdx = i
    }
  })
  if (candidates[bestIdx]) {
    candidates[bestIdx].isBestMatch = true
  }

  return candidates
}

// ── Change One Thing Experiment Simulator ────────────────────────────────────
export function runChangeOneThing(
  originalLook: LookCandidate,
  context: ContextSetup,
  profile: PersonalProfile,
  variableChanged: string,
  newValue: string
): ChangeOneThingExperiment {
  const beforeScore = originalLook.contextMirrorScore || 88
  let scoreDelta = 0
  let explanation = ''

  if (variableChanged.toLowerCase().includes('jacket') || variableChanged.toLowerCase().includes('blazer')) {
    if (context.formality === 'formal') {
      scoreDelta = +8
      explanation = `Swapping to a ${newValue} sharpens structure and increases formal occasion fit for ${context.occasion}.`
    } else {
      scoreDelta = -12
      explanation = `The ${newValue} makes the look too formal for a ${context.formality} ${context.occasion}.`
    }
  } else if (variableChanged === 'time') {
    scoreDelta = -4
    explanation = `Shifting context time from ${context.time} to ${newValue} slightly reduces contrast compatibility.`
  } else if (variableChanged === 'environment') {
    scoreDelta = +4
    explanation = `Adapting for ${newValue} improves indoor photography suitability.`
  } else if (variableChanged === 'sneakers' && context.formality === 'formal') {
    scoreDelta = -24
    explanation = `The new option is less suitable because it is too casual for the selected formal occasion.`
  } else {
    scoreDelta = +5
    explanation = `Modifying ${variableChanged} to ${newValue} enhances color harmony and overall profile compatibility.`
  }

  const afterScore = Math.min(Math.max(beforeScore + scoreDelta, 40), 99)

  return {
    originalLook,
    variableChanged,
    oldValue: 'Original piece',
    newValue,
    beforeScore,
    afterScore,
    scoreDelta,
    explanation,
  }
}

// ── Wardrobe Impact Calculator (Legacy) ────────────────────────────────────────────────
export function calculateWardrobeImpact(candidateItems: WardrobeItem[]): WardrobeImpactResult {
  const wardrobe = getWardrobe()
  const existingCount = wardrobe.length
  const existingCombinations = Math.round(existingCount * 1.5)
  const newCombinations = existingCombinations + 8

  return {
    candidateItems,
    existingCombinations,
    newCombinations,
    impactDelta: 8,
    complementaryItemIds: wardrobe.slice(0, 3).map(i => i.id),
    reasoning: `Adding or wearing this look unlocks 8 new valid outfit combinations with your existing ${existingCount} items.`,
  }
}
