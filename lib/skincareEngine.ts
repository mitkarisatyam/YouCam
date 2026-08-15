import type { SkinConcernScore } from './youcam/types'
import type { SkincareProduct } from '@/types'

export interface GeneralCareGuidance {
  concernId: string
  concernName: string
  explanation: string
  possibleContributors: string[]
  generalSuggestions: string[]
  thingsToAvoid: string[]
  recommendedCategories: {
    categoryName: string
    whyRelevant: string
  }[]
  matchedProducts: SkincareProduct[]
}

export interface SkinHistoryEntry {
  id: string
  date: string
  concerns: SkinConcernScore[]
  selfieUrl?: string
  notes?: string
}

const SKIN_HISTORY_KEY = 'contextmirror_skin_history'

// ── Verified Product Database ─────────────────────────────────────────────────
export const VERIFIED_PRODUCT_DATABASE: SkincareProduct[] = [
  {
    id: 'prod-001',
    brand: 'Cetaphil',
    productName: 'Gentle Skin Cleanser',
    category: 'Gentle Cleanser',
    keyFeatures: ['Non-irritating', 'Soap-free', 'Hydrating formula'],
    skinGoals: ['sensitive-skin', 'acne-prone', 'dryness'],
    fragranceFree: true,
    nonComedogenic: true,
    region: 'Global',
    source: 'Official Manufacturer Label & Clinical Testing',
    lastVerified: '2026-08-01',
    whyRelevant: 'Matches the gentle cleanser category for non-abrasive daily cleansing.',
  },
  {
    id: 'prod-002',
    brand: 'CeraVe',
    productName: 'Hydrating Facial Cleanser',
    category: 'Gentle Cleanser',
    keyFeatures: ['3 Essential Ceramides', 'Hyaluronic Acid', 'MVE Technology'],
    skinGoals: ['dryness', 'barrier-support', 'normal-to-dry'],
    fragranceFree: true,
    nonComedogenic: true,
    region: 'Global',
    source: 'Official Manufacturer Label',
    lastVerified: '2026-08-01',
    whyRelevant: 'Formulated with essential ceramides to support hydration while cleansing.',
  },
  {
    id: 'prod-003',
    brand: 'CeraVe',
    productName: 'Daily Moisturizing Lotion',
    category: 'Non-comedogenic Moisturizer',
    keyFeatures: ['Lightweight formula', '3 Essential Ceramides', '24-Hour Hydration'],
    skinGoals: ['oiliness', 'acne-prone', 'moisture-balance'],
    fragranceFree: true,
    nonComedogenic: true,
    region: 'Global',
    source: 'Official Manufacturer Label',
    lastVerified: '2026-08-01',
    whyRelevant: 'Belongs to the lightweight, non-comedogenic moisturizer category.',
  },
  {
    id: 'prod-004',
    brand: 'Cetaphil',
    productName: 'Moisturizing Lotion',
    category: 'Non-comedogenic Moisturizer',
    keyFeatures: ['Avocado Oil', 'Vitamins E & B3', '48-Hour Moisture'],
    skinGoals: ['dryness', 'sensitive-skin'],
    fragranceFree: true,
    nonComedogenic: true,
    region: 'Global',
    source: 'Official Manufacturer Label',
    lastVerified: '2026-08-01',
    whyRelevant: 'Non-greasy hydrating lotion suitable for sensitive skin.',
  },
  {
    id: 'prod-005',
    brand: 'La Roche-Posay',
    productName: 'Anthelios Melt-in Milk Sunscreen SPF 60',
    category: 'Daily Sunscreen (SPF 30+)',
    keyFeatures: ['Broad-Spectrum SPF 60', 'Cell-Ox Shield', 'Water Resistant'],
    skinGoals: ['sun-protection', 'uneven-tone', 'redness'],
    fragranceFree: true,
    nonComedogenic: true,
    spf: 'SPF 60',
    region: 'Global',
    source: 'Official Manufacturer Label & Dermatologist Recommended',
    lastVerified: '2026-08-01',
    whyRelevant: 'High broad-spectrum protection category to defend against UV exposure.',
  },
  {
    id: 'prod-006',
    brand: 'EltaMD',
    productName: 'UV Clear Broad-Spectrum SPF 46',
    category: 'Daily Sunscreen (SPF 30+)',
    keyFeatures: ['High-Purity Niacinamide', 'Transparent Zinc Oxide', 'Oil-Free'],
    skinGoals: ['acne-prone', 'redness', 'oiliness'],
    fragranceFree: true,
    nonComedogenic: true,
    spf: 'SPF 46',
    region: 'Global',
    source: 'Official Manufacturer Label',
    lastVerified: '2026-08-01',
    whyRelevant: 'Oil-free sunscreen category formulated for acne-prone or sensitive skin.',
  },
]

// ── Daily Basic Routine (AAD Aligned) ─────────────────────────────────────────
export const DAILY_BASIC_ROUTINE = {
  morning: [
    { step: 1, title: 'Gentle Cleanser', desc: 'Wash with lukewarm water and a mild non-abrasive cleanser.' },
    { step: 2, title: 'Moisturizer', desc: 'Apply a lightweight, non-comedogenic moisturizer while skin is slightly damp.' },
    { step: 3, title: 'Broad-Spectrum Sunscreen (SPF 30+)', desc: 'Apply generously to protect against UV exposure.' },
  ],
  evening: [
    { step: 1, title: 'Gentle Cleanser', desc: 'Cleanse away daily oil, makeup, and environmental impurities.' },
    { step: 2, title: 'Moisturizer', desc: 'Rehydrate and support skin barrier recovery overnight.' },
  ],
}

// ── Precautions & Safety Guidelines ──────────────────────────────────────────
export const GENERAL_PRECAUTIONS = [
  'Do not pick, squeeze, or pop visible pimples or blemishes to avoid scarring.',
  'Avoid physical scrubs or harsh abrasive sponges.',
  'Avoid introducing multiple new active products simultaneously.',
  'Discontinue any product immediately if it causes significant stinging, burning, or redness.',
  'Always perform a patch test on a small area when trying a new product.',
  'Apply broad-spectrum sunscreen daily during daylight hours.',
  'Keep routines simple, especially for teenagers and sensitive skin types.',
]

// ── Dermatologist Escalation Guidance ─────────────────────────────────────────
export const WHEN_TO_SEE_DERMATOLOGIST = [
  'Acne-related signs are large, painful, or deep under the skin.',
  'Skin concerns are severe, rapidly worsening, or causing emotional distress.',
  'Visible blemishes leave dark spots or permanent scars.',
  'Persistent redness or irritation does not improve with basic gentle skincare.',
  'A skin concern keeps returning despite a consistent gentle routine.',
  'You are uncertain about what a visible skin change actually is.',
]

export function getGeneralCareGuidance(concern: SkinConcernScore): GeneralCareGuidance {
  const matched = VERIFIED_PRODUCT_DATABASE.filter(p =>
    p.skinGoals.includes(concern.id) || p.category.toLowerCase().includes(concern.id)
  )

  switch (concern.id) {
    case 'acne':
      return {
        concernId: 'acne',
        concernName: 'Acne-related Signs',
        explanation: 'Visible surface patterns associated with pimples, clogged pores, or surface texture.',
        possibleContributors: [
          'Hormonal changes',
          'Excess oil (sebum) production',
          'Clogged pores from dead skin cells',
          'Friction or pressure from phone/hats',
          'Heavy or comedogenic cosmetics',
          'Genetics & stress/sleep patterns',
        ],
        generalSuggestions: [
          'Use a mild, non-stripping gentle cleanser daily.',
          'Avoid harsh physical scrubbing or over-cleansing.',
          'Apply a lightweight, non-comedogenic moisturizer to maintain skin barrier balance.',
          'Maintain regular, broad-spectrum sun protection.',
        ],
        thingsToAvoid: [
          'Picking, popping, or squeezing pimples',
          'Aggressive physical scrubbing',
          'Using many active products at the same time',
          'Repeatedly changing products every few days',
        ],
        recommendedCategories: [
          {
            categoryName: 'Gentle Cleanser',
            whyRelevant: 'Cleanses impurities without stripping natural moisture barriers.',
          },
          {
            categoryName: 'Non-comedogenic Moisturizer',
            whyRelevant: 'Provides essential hydration without clogging pores.',
          },
          {
            categoryName: 'Daily Sunscreen (SPF 30+)',
            whyRelevant: 'Protects against UV exposure that can exacerbate visible unevenness.',
          },
        ],
        matchedProducts: matched.length > 0 ? matched : VERIFIED_PRODUCT_DATABASE.slice(0, 3),
      }

    case 'oiliness':
      return {
        concernId: 'oiliness',
        concernName: 'Visible Surface Oiliness',
        explanation: 'The analysis indicates a higher level of visible surface sheen and sebum dispersion.',
        possibleContributors: [
          'Genetics and pore structure',
          'Warm/humid environmental conditions',
          'Hormonal fluctuations',
          'Over-cleansing causing rebound oil production',
        ],
        generalSuggestions: [
          'Cleanse twice daily with a gentle, balanced facial cleanser.',
          'Choose lightweight, gel-based, or non-comedogenic moisturizers.',
          'Avoid aggressive over-washing, which can trigger excess oil production.',
        ],
        thingsToAvoid: [
          'Washing your face more than 2-3 times daily',
          'Alcohol-heavy drying astringents',
          'Heavy, occlusive oil-based creams',
        ],
        recommendedCategories: [
          {
            categoryName: 'Gentle Cleanser',
            whyRelevant: 'Effectively removes excess surface oil while maintaining comfort.',
          },
          {
            categoryName: 'Non-comedogenic Moisturizer',
            whyRelevant: 'Delivers hydration with a weightless, non-greasy feel.',
          },
          {
            categoryName: 'Daily Sunscreen (SPF 30+)',
            whyRelevant: 'Offers broad-spectrum protection with a subtle shine-control finish.',
          },
        ],
        matchedProducts: matched.length > 0 ? matched : [VERIFIED_PRODUCT_DATABASE[2], VERIFIED_PRODUCT_DATABASE[5]],
      }

    case 'redness':
      return {
        concernId: 'redness',
        concernName: 'Visible Surface Redness',
        explanation: 'Visible redness that may be associated with temporary irritation or external triggers.',
        possibleContributors: [
          'Environmental factors (wind, cold, sun)',
          'Harsh skincare products or fragrance',
          'Over-exfoliation or physical rubbing',
          'Naturally sensitive skin barrier',
        ],
        generalSuggestions: [
          'Opt for fragrance-free, extra-gentle skincare formulations.',
          'Avoid unnecessary harsh physical exfoliation or hot water washes.',
          'Use soothing moisturizers and daily mineral or gentle sun protection.',
        ],
        thingsToAvoid: [
          'Very hot water during cleansing',
          'Products with artificial fragrances or drying alcohols',
          'Vigorous towel drying',
        ],
        recommendedCategories: [
          {
            categoryName: 'Gentle Cleanser',
            whyRelevant: 'Minimizes friction and potential irritation during cleansing.',
          },
          {
            categoryName: 'Non-comedogenic Moisturizer',
            whyRelevant: 'Helps calm skin texture and supports barrier comfort.',
          },
          {
            categoryName: 'Daily Sunscreen (SPF 30+)',
            whyRelevant: 'Protects delicate skin against environmental stressors.',
          },
        ],
        matchedProducts: matched.length > 0 ? matched : [VERIFIED_PRODUCT_DATABASE[1], VERIFIED_PRODUCT_DATABASE[4]],
      }

    case 'hydration':
    default:
      return {
        concernId: 'hydration',
        concernName: 'Moisture Balance & Dryness',
        explanation: 'The analysis detected opportunities to boost overall skin moisture retention.',
        possibleContributors: [
          'Low atmospheric humidity or indoor heating',
          'Hot showers or harsh soaps',
          'Natural aging and reduced lipid barrier',
          'Harsh environmental exposure',
        ],
        generalSuggestions: [
          'Use a hydrating, non-drying cleanser.',
          'Apply moisturizer while skin is slightly damp after washing.',
          'Avoid excessively dry environmental conditions where possible.',
        ],
        thingsToAvoid: [
          'Long, hot showers',
          'Cleansers that leave skin feeling tight or dry',
          'Skipping moisturizer',
        ],
        recommendedCategories: [
          {
            categoryName: 'Gentle Cleanser',
            whyRelevant: 'Leaves skin feeling soft and supple after washing.',
          },
          {
            categoryName: 'Non-comedogenic Moisturizer',
            whyRelevant: 'Locks in moisture for long-lasting hydration.',
          },
          {
            categoryName: 'Daily Sunscreen (SPF 30+)',
            whyRelevant: 'Protects barrier health against UV drying.',
          },
        ],
        matchedProducts: matched.length > 0 ? matched : [VERIFIED_PRODUCT_DATABASE[0], VERIFIED_PRODUCT_DATABASE[3]],
      }
  }
}

export function rankConcernsByPriority(concerns: SkinConcernScore[]): SkinConcernScore[] {
  return [...concerns].sort((a, b) => b.score - a.score)
}

export function getSkinHistory(): SkinHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SKIN_HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function logSkinHistory(entry: Omit<SkinHistoryEntry, 'id' | 'date'>) {
  if (typeof window === 'undefined') return
  const history = getSkinHistory()
  const newEntry: SkinHistoryEntry = {
    ...entry,
    id: `skin-hist-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  }
  localStorage.setItem(SKIN_HISTORY_KEY, JSON.stringify([newEntry, ...history]))
}
