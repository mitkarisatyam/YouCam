export interface WardrobeItem {
  id: string
  name: string
  category: 'clothing' | 'footwear' | 'jewelry' | 'bag' | 'outerwear' | 'tops' | 'bottoms' | 'traditional' | 'one-piece' | 'accessories'
  subcategory: string
  color: string
  secondaryColor?: string
  pattern: string
  neckline?: string
  sleeve?: string
  fabric: string
  season: string[]
  formality: 'casual' | 'smart-casual' | 'formal' | 'traditional' | string
  imageUrl: string
  lastWorn?: string
  wearCount: number
  purchaseDate?: string
  brand?: string
  favorite?: boolean
  tags: string[]
  styleTags?: string[]
  embedding?: number[]
  addedAt: string
}

export interface OutfitLog {
  id: string
  date: string
  itemIds: string[]
  occasion?: string
  notes?: string
  vtoResultUrl?: string
}

export interface UserPreferences {
  selfieUrl?: string
  styleProfile: string[]
  occasionHistory: Record<string, string[]>
  timeOfDayPatterns: Record<string, string[]>
  avoidList: string[]
}

export interface SearchResult {
  item: WardrobeItem
  score: number
  matchType: 'semantic' | 'lexical' | 'temporal'
}

// ── ContextMirror Extension Types ─────────────────────────────────────────────

export interface ContextSetup {
  occasion: string
  time: 'morning' | 'afternoon' | 'evening' | 'night'
  environment: 'indoor' | 'outdoor' | 'office' | 'hotel' | 'restaurant' | 'beach' | 'custom'
  formality: 'casual' | 'smart-casual' | 'formal' | 'traditional'
  importance: 'normal' | 'important' | 'very-important'
  weather?: 'hot' | 'warm' | 'mild' | 'cool' | 'cold' | 'rainy' | 'humid'
  mood?: 'minimal' | 'elegant' | 'bold' | 'classic' | 'relaxed' | 'trendy' | 'traditional' | 'creative'
  rawNaturalInput?: string
}

export interface PersonalProfile {
  skinSignals: {
    clarityScore: number
    hydrationLevel: 'hydrated' | 'balanced' | 'dry'
    undertone: 'warm' | 'cool' | 'neutral'
    textureNotes: string
  }
  facialSignals: {
    faceShape: string
    contrast: 'low' | 'medium' | 'high'
  }
  colorSignals: {
    recommendedPalettes: string[]
    bestColors: string[]
    colorsToAvoid: string[]
  }
  stylePreferences: string[]
  selfieUrl?: string
  selfieId?: string
}

export interface StressTestMetrics {
  occasionFit: number      // 0-100
  timeFit: number          // 0-100
  environmentFit: number   // 0-100
  colorCompatibility: number // 0-100
  photographySuitability: number // 0-100
  stylePreference: number  // 0-100
  wardrobeCompatibility: number // 0-100
  profileCompatibility?: number // 0-100
}

export interface LookCandidate {
  id: string
  name: string
  tag: string
  items: WardrobeItem[]
  explanation: string
  vtoResultUrl?: string
  vtoStatus: 'pending' | 'completed' | 'failed'
  stressTest?: StressTestMetrics
  stabilityScore?: number // 0-100
  contextMirrorScore?: number // 0-100
  isBestMatch?: boolean
}

export interface ChangeOneThingExperiment {
  originalLook: LookCandidate
  variableChanged: string
  oldValue: string
  newValue: string
  beforeScore: number
  afterScore: number
  scoreDelta: number
  explanation: string
}

export interface WardrobeImpactResult {
  candidateItems: WardrobeItem[]
  existingCombinations: number
  newCombinations: number
  impactDelta: number
  complementaryItemIds: string[]
  reasoning: string
}

export interface SkincareProduct {
  id: string
  brand: string
  productName: string
  category: string // 'gentle-cleanser' | 'moisturizer' | 'sunscreen' | 'hydrating-serum'
  keyFeatures: string[]
  skinGoals: string[]
  fragranceFree: boolean
  nonComedogenic: boolean
  spf?: string
  region: string
  source: string
  lastVerified: string
  whyRelevant?: string
}

export interface DecisionReplayEntry {
  id: string
  date: string
  context: ContextSetup
  candidates: LookCandidate[]
  recommendedLookId: string
  userSelectedLookId: string
  userFeedback?: 'i-wore-this' | 'liked-it' | 'would-change' | 'not-useful'
  notes?: string
}

// ── Hair Studio Extensions ───────────────────────────────────────────────

export interface HairProfile {
  id?: string
  hairType?: string
  texture?: string
  curlPattern?: string
  density?: string
  frizz?: string
  length?: string
  analysisSignals?: Record<string, unknown>
  date?: string
}

export interface HairstyleCandidate {
  id: string
  name: string
  category: string
  imageUrl: string
  compatibilityScore: number
  maintenanceLevel: 'low' | 'medium' | 'high'
  whyRecommended: string
}

export interface HairstyleResult {
  candidateId: string
  originalImageUrl: string
  resultImageUrl: string
  status: 'pending' | 'completed' | 'failed'
}
export interface WardrobeItem {
  id: string
  name: string
  category: 'clothing' | 'footwear' | 'jewelry' | 'bag' | 'outerwear' | 'tops' | 'bottoms' | 'traditional' | 'one-piece' | 'accessories'
  subcategory: string
  color: string
  secondaryColor?: string
  pattern: string
  neckline?: string
  sleeve?: string
  fabric: string
  season: string[]
  formality: 'casual' | 'smart-casual' | 'formal' | 'traditional' | string
  imageUrl: string
  lastWorn?: string
  wearCount: number
  purchaseDate?: string
  brand?: string
  favorite?: boolean
  tags: string[]
  styleTags?: string[]
  embedding?: number[]
  addedAt: string
}

export interface OutfitLog {
  id: string
  date: string
  itemIds: string[]
  occasion?: string
  notes?: string
  vtoResultUrl?: string
}

export interface UserPreferences {
  selfieUrl?: string
  styleProfile: string[]
  occasionHistory: Record<string, string[]>
  timeOfDayPatterns: Record<string, string[]>
  avoidList: string[]
}

export interface SearchResult {
  item: WardrobeItem
  score: number
  matchType: 'semantic' | 'lexical' | 'temporal'
}

// ── ContextMirror Extension Types ─────────────────────────────────────────────

export interface ContextSetup {
  occasion: string
  time: 'morning' | 'afternoon' | 'evening' | 'night'
  environment: 'indoor' | 'outdoor' | 'office' | 'hotel' | 'restaurant' | 'beach' | 'custom'
  formality: 'casual' | 'smart-casual' | 'formal' | 'traditional'
  importance: 'normal' | 'important' | 'very-important'
  weather?: 'hot' | 'warm' | 'mild' | 'cool' | 'cold' | 'rainy' | 'humid'
  mood?: 'minimal' | 'elegant' | 'bold' | 'classic' | 'relaxed' | 'trendy' | 'traditional' | 'creative'
  rawNaturalInput?: string
}

export interface PersonalProfile {
  skinSignals: {
    clarityScore: number
    hydrationLevel: 'hydrated' | 'balanced' | 'dry'
    undertone: 'warm' | 'cool' | 'neutral'
    textureNotes: string
  }
  facialSignals: {
    faceShape: string
    contrast: 'low' | 'medium' | 'high'
  }
  colorSignals: {
    recommendedPalettes: string[]
    bestColors: string[]
    colorsToAvoid: string[]
  }
  stylePreferences: string[]
  selfieUrl?: string
  selfieId?: string
}

export interface StressTestMetrics {
  occasionFit: number      // 0-100
  timeFit: number          // 0-100
  environmentFit: number   // 0-100
  colorCompatibility: number // 0-100
  photographySuitability: number // 0-100
  stylePreference: number  // 0-100
  wardrobeCompatibility: number // 0-100
  profileCompatibility?: number // 0-100
}

export interface LookCandidate {
  id: string
  name: string
  tag: string
  items: WardrobeItem[]
  explanation: string
  vtoResultUrl?: string
  vtoStatus: 'pending' | 'completed' | 'failed'
  stressTest?: StressTestMetrics
  stabilityScore?: number // 0-100
  contextMirrorScore?: number // 0-100
  isBestMatch?: boolean
}

export interface ChangeOneThingExperiment {
  originalLook: LookCandidate
  variableChanged: string
  oldValue: string
  newValue: string
  beforeScore: number
  afterScore: number
  scoreDelta: number
  explanation: string
}

export interface WardrobeImpactResult {
  candidateItems: WardrobeItem[]
  existingCombinations: number
  newCombinations: number
  impactDelta: number
  complementaryItemIds: string[]
  reasoning: string
}

export interface SkincareProduct {
  id: string
  brand: string
  productName: string
  category: string // 'gentle-cleanser' | 'moisturizer' | 'sunscreen' | 'hydrating-serum'
  keyFeatures: string[]
  skinGoals: string[]
  fragranceFree: boolean
  nonComedogenic: boolean
  spf?: string
  region: string
  source: string
  lastVerified: string
  whyRelevant?: string
}

export interface DecisionReplayEntry {
  id: string
  date: string
  context: ContextSetup
  candidates: LookCandidate[]
  recommendedLookId: string
  userSelectedLookId: string
  userFeedback?: 'i-wore-this' | 'liked-it' | 'would-change' | 'not-useful'
  notes?: string
}

// ── Hair Studio Extensions ───────────────────────────────────────────────

export interface HairProfile {
  id?: string
  hairType?: string
  texture?: string
  curlPattern?: string
  density?: string
  frizz?: string
  length?: string
  analysisSignals?: Record<string, unknown>
  date?: string
}

export interface HairstyleCandidate {
  id: string
  name: string
  category: string
  imageUrl: string
  compatibilityScore: number
  maintenanceLevel: 'low' | 'medium' | 'high'
  whyRecommended: string
}

export interface HairstyleResult {
  candidateId: string
  originalImageUrl: string
  resultImageUrl: string
  status: 'pending' | 'completed' | 'failed'
}

export interface HairPreferences {
  preferredLength: string
  maintenancePreference: string
  stylePreference: string
  professionalOrCasual: string
  willingToTryBold: boolean
}

// ── Shopping Assistant Extensions ────────────────────────────────────────

export interface ShoppingItem {
  id: string
  imageUrl: string
  category: string
  subcategory?: string
  color: string
  pattern: string
  styleTags: string[]
  formality: string
}

export interface PurchaseDecisionScore {
  totalScore: number
  wardrobeCompatibilityScore: number
  occasionFitScore: number
  colorHarmonyScore: number
  styleMatchScore: number
  explanation: string
}

export interface TestPurchaseResult {
  id: string
  date: string
  item: ShoppingItem
  score: PurchaseDecisionScore
  vtoImageUrl?: string
}
