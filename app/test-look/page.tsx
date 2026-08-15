'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider'
import { UploadZone } from '@/components/ui/UploadZone'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { getStoredProfile, saveProfile } from '@/lib/profileEngine'
import {
  parseNaturalContext,
  generateContextCandidates,
  runChangeOneThing,
} from '@/lib/contextEngine'
import { getSavedContext, saveContext, logDecisionReplay } from '@/lib/memory'
import { getSkinProvider, getApparelVTOProvider, isDemoMode } from '@/lib/youcam'
import type {
  ContextSetup,
  PersonalProfile,
  LookCandidate,
  ChangeOneThingExperiment,
} from '@/types'

const OCCASION_TILES = [
  { id: 'wedding', label: 'Wedding', icon: '💍' },
  { id: 'party', label: 'Party', icon: '🎉' },
  { id: 'interview', label: 'Interview', icon: '💼' },
  { id: 'graduation', label: 'Graduation', icon: '🎓' },
  { id: 'college', label: 'College Event', icon: '🏫' },
  { id: 'date', label: 'Date', icon: '💌' },
  { id: 'dinner', label: 'Dinner', icon: '🍽️' },
  { id: 'brunch', label: 'Brunch', icon: '☕' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'vacation', label: 'Vacation', icon: '🏖️' },
  { id: 'festival', label: 'Festival', icon: '🪔' },
  { id: 'cultural', label: 'Cultural Event', icon: '🎭' },
  { id: 'office', label: 'Office', icon: '🧑‍💼' },
  { id: 'presentation', label: 'Presentation', icon: '🎤' },
  { id: 'photoshoot', label: 'Photoshoot', icon: '📸' },
  { id: 'concert', label: 'Concert', icon: '🎶' },
  { id: 'reception', label: 'Reception', icon: '🥂' },
  { id: 'formal', label: 'Formal Event', icon: '🏛️' },
  { id: 'casual-outing', label: 'Casual Outing', icon: '🌿' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'active', label: 'Active / Casual', icon: '🏃' },
  { id: 'custom', label: 'Custom', icon: '✍️' },
]

const STEP_LABELS = [
  { s: 1, name: 'Context', icon: '🎯' },
  { s: 2, name: 'Profile', icon: '👤' },
  { s: 3, name: 'Generate', icon: '👗' },
  { s: 4, name: 'Stress Test', icon: '⚡' },
  { s: 5, name: 'Compare', icon: '⭐' },
  { s: 6, name: 'Experiment', icon: '🔬' },
  { s: 7, name: 'Decide', icon: '📖' },
]

function TestLookContent() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1)

  // Step 1: Context Setup
  const [context, setContextState] = useState<ContextSetup>(getSavedContext())
  const [naturalInput, setNaturalInput] = useState(
    context.rawNaturalInput || ''
  )
  const [parsing, setParsing] = useState(false)

  // Step 2: Personal Profile
  const [profile, setProfileState] = useState<PersonalProfile>(getStoredProfile())
  const [selfiePreview, setSelfiePreview] = useState<string>(profile.selfieUrl || '')
  const [analyzingSkin, setAnalyzingSkin] = useState(false)
  const [hasActualProfile, setHasActualProfile] = useState(!!profile.skinSignals?.clarityScore)

  // Step 3: Candidates & VTO
  const [candidates, setCandidates] = useState<LookCandidate[]>([])
  const [generatingVTO, setGeneratingVTO] = useState(false)
  const [generatingMore, setGeneratingMore] = useState(false)

  // Step 4, 5 & 6: Focus & Experiment
  const [selectedCandidate, setSelectedCandidate] = useState<LookCandidate | null>(null)
  
  // Step 6: Change One Thing
  const [experiment, setExperiment] = useState<ChangeOneThingExperiment | null>(null)
  const [changeItem, setChangeItem] = useState('jacket')
  const [changeValue, setChangeValue] = useState('')

  // Step 7: Decision Replay
  const [userChoice, setUserChoice] = useState<string>('')
  const [userFeedback, setUserFeedback] = useState<'i-wore-this' | 'liked-it' | 'would-change' | 'not-useful'>('liked-it')
  const [replaySaved, setReplaySaved] = useState(false)

  function handleParseNatural() {
    if (!naturalInput.trim()) return
    setParsing(true)
    setTimeout(() => {
      const parsed = parseNaturalContext(naturalInput)
      setContextState(parsed)
      saveContext(parsed)
      setParsing(false)
    }, 800)
  }

  async function handleAnalyzeProfile() {
    if (!selfiePreview) return
    setAnalyzingSkin(true)
    try {
      const skinProvider = getSkinProvider()
      // Simulate real API fetching file blob from object URL if needed.
      const res = await skinProvider.analyze(new File([], 'selfie.jpg'))
      const updated: PersonalProfile = {
        ...profile,
        selfieUrl: selfiePreview,
        skinSignals: res.signals,
      }
      setProfileState(updated)
      saveProfile(updated)
      setHasActualProfile(true)
    } catch {
      // In demo mode or error, use existing mock or defaults
      setHasActualProfile(true)
    } finally {
      setAnalyzingSkin(false)
    }
  }

  async function generateLooks(count: number = 4) {
    const isAdding = candidates.length > 0
    if (isAdding) setGeneratingMore(true)
    else setGeneratingVTO(true)
    
    try {
      const cands = generateContextCandidates(context, profile, count)
      const vtoProvider = getApparelVTOProvider()

      const updatedCandidates = await Promise.all(
        cands.map(async c => {
          const garmentUrl = c.items[0]?.imageUrl || ''
          const vtoRes = await vtoProvider.generate('selfie-id', garmentUrl, 'cloth')
          return {
            ...c,
            vtoResultUrl: vtoRes.imageUrl || c.vtoResultUrl,
            vtoStatus: vtoRes.status,
          }
        })
      )

      setCandidates(isAdding ? [...candidates, ...updatedCandidates.slice(candidates.length)] : updatedCandidates)
      if (!isAdding) {
        const best = updatedCandidates.find(c => c.isBestMatch) || updatedCandidates[0]
        setSelectedCandidate(best)
        setUserChoice(best.id)
      }
    } finally {
      if (isAdding) setGeneratingMore(false)
      else {
        setGeneratingVTO(false)
        setStep(4) // Move to Stress Test
      }
    }
  }

  function handleRunExperiment() {
    if (!selectedCandidate || !changeValue) return
    const exp = runChangeOneThing(selectedCandidate, context, profile, changeItem, changeValue)
    setExperiment(exp)
  }

  function handleSaveDecision() {
    if (!selectedCandidate) return
    logDecisionReplay({
      context,
      candidates,
      recommendedLookId: candidates.find(c => c.isBestMatch)?.id || selectedCandidate.id,
      userSelectedLookId: userChoice || selectedCandidate.id,
      userFeedback,
    })
    setReplaySaved(true)
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--bg-primary),transparent_50%),radial-gradient(ellipse_at_bottom_left,var(--accent-glow),transparent_50%)] opacity-30 animate-pulse-slow"></div>
      <GlassNav />

      <main className="max-w-5xl mx-auto px-6 pt-2 space-y-10">
        {/* ═══ PROGRESS NAV ═════════════════════════════════════════ */}
        <div className="glass-level-1 p-2.5 rounded-full flex flex-wrap justify-between items-center gap-1 overflow-x-auto hide-scrollbar">
          {STEP_LABELS.map(st => (
            <button
              key={st.s}
              onClick={() => {
                if (st.s <= step || candidates.length > 0) setStep(st.s as any)
              }}
              className={`relative px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                step === st.s
                  ? 'text-[var(--bg-primary)] font-bold shadow-md'
                  : st.s < step
                  ? 'text-[var(--text-primary)] opacity-70'
                  : 'text-[var(--text-muted)] opacity-40'
              }`}
            >
              {step === st.s && (
                <motion.div
                  layoutId="stepPill"
                  className="absolute inset-0 bg-[var(--text-primary)] rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="flex items-center gap-1.5">
                <span>{st.icon}</span>
                <span className="hidden sm:inline">{st.name}</span>
              </span>
            </button>
          ))}
        </div>

        {/* ═══ STEP 1: CONTEXT ══════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h1 className="font-serif text-4xl lg:text-5xl text-[var(--text-primary)] font-normal">
                  What are you getting ready for?
                </h1>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  Tell us about the moment. We'll build your look around it.
                </p>
              </div>

              {/* Natural Language Input */}
              <div className="glass-level-3 p-8 rounded-[2rem] space-y-6 relative overflow-hidden">
                <label className="block text-xl font-serif font-bold text-[var(--text-primary)] text-center">
                  Tell us about the moment...
                </label>
                <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
                  <input
                    type="text"
                    value={naturalInput}
                    onChange={e => setNaturalInput(e.target.value)}
                    placeholder="e.g. Wedding at 7 PM in an indoor hotel. I want something elegant."
                    className={`flex-1 px-6 py-5 rounded-2xl glass-pill text-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 transition-all ${parsing ? 'blur-sm opacity-50 scale-95' : ''}`}
                  />
                  <GlassButton variant="primary" onClick={handleParseNatural} className={`transition-all ${parsing ? 'scale-95' : ''}`}>
                    {parsing ? 'Understanding context...' : 'Build My Context ✦'}
                  </GlassButton>
                </div>
                
                {parsing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-primary)]/40 backdrop-blur-sm z-10 rounded-[2rem]">
                     <div className="flex flex-col items-center gap-2">
                       <span className="animate-spin text-3xl">✦</span>
                       <span className="text-xs font-mono tracking-widest uppercase">Understanding occasion & style</span>
                     </div>
                  </div>
                )}

                {/* Parsed Context Chips */}
                {!parsing && context.rawNaturalInput && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap justify-center gap-3 pt-4">
                    {[
                      { icon: '🎯', value: context.occasion },
                      { icon: '🕒', value: context.time },
                      { icon: '📍', value: context.environment },
                      { icon: '🎩', value: context.formality },
                      { icon: '☁️', value: context.weather },
                      { icon: '✨', value: context.mood },
                    ].filter(s => s.value).map(s => (
                      <span key={s.icon} className="glass-liquid px-4 py-2 rounded-full text-sm font-bold text-[var(--text-primary)] capitalize shadow-sm">
                        {s.icon} {s.value}
                      </span>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Occasion Grid */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider pl-2">Or select an occasion</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {OCCASION_TILES.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => {
                        const updated = { ...context, occasion: tile.id }
                        setContextState(updated)
                        saveContext(updated)
                      }}
                      className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                        context.occasion === tile.id
                          ? 'glass-level-3 ring-2 ring-[var(--text-primary)] shadow-lg'
                          : 'glass-pill hover:bg-white/5'
                      }`}
                    >
                      <span className="text-2xl">{tile.icon}</span>
                      <span className="text-[10px] font-bold text-[var(--text-primary)] text-center">{tile.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Options */}
              <div className="glass-card p-6 rounded-[2rem] grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase">Time</label>
                  <select value={context.time} onChange={e => setContextState({...context, time: e.target.value as any})} className="w-full p-2.5 rounded-xl glass-pill focus:outline-none">
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase">Environment</label>
                  <select value={context.environment} onChange={e => setContextState({...context, environment: e.target.value as any})} className="w-full p-2.5 rounded-xl glass-pill focus:outline-none">
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="office">Office</option>
                    <option value="hotel">Hotel</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="beach">Beach</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase">Formality</label>
                  <select value={context.formality} onChange={e => setContextState({...context, formality: e.target.value as any})} className="w-full p-2.5 rounded-xl glass-pill focus:outline-none">
                    <option value="casual">Casual</option>
                    <option value="smart-casual">Smart Casual</option>
                    <option value="formal">Formal</option>
                    <option value="traditional">Traditional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase">Weather</label>
                  <select value={context.weather || ''} onChange={e => setContextState({...context, weather: e.target.value as any})} className="w-full p-2.5 rounded-xl glass-pill focus:outline-none">
                    <option value="">Any / Unknown</option>
                    <option value="hot">Hot</option>
                    <option value="warm">Warm</option>
                    <option value="mild">Mild</option>
                    <option value="cool">Cool</option>
                    <option value="cold">Cold</option>
                    <option value="rainy">Rainy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase">Mood / Style</label>
                  <select value={context.mood || ''} onChange={e => setContextState({...context, mood: e.target.value as any})} className="w-full p-2.5 rounded-xl glass-pill focus:outline-none">
                    <option value="">Any</option>
                    <option value="minimal">Minimal</option>
                    <option value="elegant">Elegant</option>
                    <option value="bold">Bold</option>
                    <option value="classic">Classic</option>
                    <option value="relaxed">Relaxed</option>
                    <option value="trendy">Trendy</option>
                  </select>
                </div>
              </div>

              {/* Context Result Card */}
              {context.rawNaturalInput && !parsing && (
                <div className="flex justify-center pt-4">
                  <div className="glass-level-3 p-8 rounded-[2rem] text-center max-w-sm w-full shadow-2xl border border-[var(--border-color)]">
                    <h3 className="font-serif text-2xl font-normal text-[var(--text-primary)] mb-6 border-b border-[var(--border-color)] pb-4">Your Moment</h3>
                    <div className="space-y-4 text-lg">
                      <div className="capitalize">🎯 {context.occasion}</div>
                      <div className="capitalize">🕒 {context.time}</div>
                      <div className="capitalize">📍 {context.environment}</div>
                      <div className="capitalize">🎩 {context.formality}</div>
                      {context.mood && <div className="capitalize">✨ {context.mood}</div>}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-8">
                <GlassButton variant="primary" onClick={() => setStep(2)}>
                  Continue to Personal Profile →
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 2: PROFILE ══════════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h1 className="font-serif text-4xl lg:text-5xl text-[var(--text-primary)] font-normal">
                  Make it personal.
                </h1>
                <p className="text-[var(--text-muted)] text-sm">
                  Add your photo so we can personalize the experience with accurate skin and color analysis.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="space-y-6">
                  <UploadZone
                    label="Add Your Photo"
                    sublabel="Upload Photo or Take Photo"
                    currentPreview={selfiePreview}
                    loading={analyzingSkin}
                    onFileSelect={(file) => setSelfiePreview(URL.createObjectURL(file))}
                  />
                  
                  <div className="glass-pill p-4 rounded-2xl text-xs text-[var(--text-muted)] flex items-start gap-2">
                    <span className="text-lg">ℹ️</span>
                    <p>For best results, use a photo with clear face visibility, good lighting, and only one person.</p>
                  </div>

                  <GlassButton 
                    variant="primary" 
                    onClick={handleAnalyzeProfile} 
                    disabled={!selfiePreview || analyzingSkin} 
                    className="w-full py-4 text-lg"
                  >
                    {analyzingSkin ? 'Analyzing Profile...' : 'Analyze My Profile ✦'}
                  </GlassButton>
                </div>

                <div className="glass-card p-8 rounded-[2rem] flex flex-col justify-center">
                  {!hasActualProfile ? (
                    <div className="text-center space-y-4 opacity-50">
                      <div className="text-4xl">🔍</div>
                      <p className="text-sm font-medium">Your personal analysis will appear here after you upload a photo.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
                        Your Skin Profile
                      </h3>
                      
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center glass-pill p-4 rounded-xl">
                          <span className="text-[var(--text-muted)] font-bold">Undertone</span>
                          <span className="font-bold text-[var(--text-primary)] capitalize">{profile.skinSignals.undertone}</span>
                        </div>
                        <div className="flex justify-between items-center glass-pill p-4 rounded-xl">
                          <span className="text-[var(--text-muted)] font-bold">Hydration Level</span>
                          <span className="font-bold text-[var(--text-primary)] capitalize">{profile.skinSignals.hydrationLevel}</span>
                        </div>
                        <div className="flex justify-between items-center glass-pill p-4 rounded-xl">
                          <span className="text-[var(--text-muted)] font-bold">Clarity Signal</span>
                          <span className="font-numeric font-bold text-[var(--text-primary)]">{profile.skinSignals.clarityScore} / 100</span>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase">Recommended Palettes</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.colorSignals.recommendedPalettes.map(p => (
                            <span key={p} className="glass-liquid px-3.5 py-1.5 rounded-full text-xs font-bold">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-8">
                <GlassButton variant="secondary" onClick={() => setStep(1)}>
                  ← Back to Context
                </GlassButton>
                <GlassButton variant="primary" onClick={() => setStep(3)}>
                  Continue to Generate Looks →
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 3: GENERATE LOOKS ════════════════════════════════ */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h1 className="font-serif text-4xl lg:text-5xl text-[var(--text-primary)] font-normal">
                  What could you wear?
                </h1>
                <p className="text-[var(--text-muted)] text-sm">
                  Built for your moment, your wardrobe, and your preferences.
                </p>
              </div>

              {candidates.length === 0 ? (
                <div className="glass-level-3 p-12 text-center max-w-xl mx-auto rounded-[2rem] space-y-7 relative overflow-hidden">
                  <div className="text-5xl relative z-10">👗 👔 👠</div>
                  <h3 className="font-serif text-2xl font-normal text-[var(--text-primary)] mb-2">Ready to curate your looks</h3>
                  <GlassButton variant="primary" onClick={() => generateLooks(4)} disabled={generatingVTO} className="w-full py-4 text-sm relative z-10">
                    {generatingVTO ? 'Generating looks...' : 'Generate 4 Candidate Looks ✦'}
                  </GlassButton>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {candidates.map((candidate, idx) => (
                      <div key={candidate.id} className="glass-card p-0 rounded-[2rem] overflow-hidden flex flex-col sm:flex-row group shadow-xl">
                        <div className="sm:w-2/5 aspect-[3/4] relative">
                          <img
                            src={candidate.vtoResultUrl}
                            alt={candidate.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent sm:bg-gradient-to-r" />
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-center space-y-4">
                          <div>
                            <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">{candidate.name}</h3>
                            <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--accent-gold)] mt-1">{candidate.tag}</div>
                          </div>
                          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{candidate.explanation}</p>
                          <div className="pt-4 flex gap-4 text-xs font-bold text-[var(--text-primary)]">
                            <span className="glass-pill px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
                              Profile Match: {hasActualProfile ? candidate.stressTest?.profileCompatibility : 'Available after analysis'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    {candidates.length < 6 && (
                      <GlassButton variant="secondary" onClick={() => generateLooks(6)} disabled={generatingMore}>
                        {generatingMore ? 'Generating...' : 'Generate 2 More ✦'}
                      </GlassButton>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-8">
                <GlassButton variant="secondary" onClick={() => setStep(2)}>
                  ← Back to Profile
                </GlassButton>
                <GlassButton variant="primary" onClick={() => setStep(4)} disabled={candidates.length === 0}>
                  Continue to Stress Test →
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 4: STRESS TEST ═══════════════════════════════════ */}
          {step === 4 && candidates.length > 0 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h1 className="font-serif text-4xl lg:text-5xl text-[var(--text-primary)] font-normal">
                  Stress-Test Your Look
                </h1>
                <p className="text-[var(--text-muted)] text-sm">
                  See how your chosen looks perform in the real situations that matter. <br/> 
                  <span className="italic opacity-70">AI Context Evaluation scores looks based on real-world constraints.</span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {candidates.map((candidate, idx) => (
                  <div key={candidate.id} className="glass-card p-6 rounded-[2rem] space-y-5 text-sm flex flex-col shadow-lg hover:-translate-y-2 transition-transform cursor-pointer" onClick={() => { setSelectedCandidate(candidate); setStep(5); }}>
                    <div className="aspect-square rounded-xl overflow-hidden relative">
                      <img src={candidate.vtoResultUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white font-bold font-serif text-lg">{candidate.name}</div>
                    </div>
                    
                    <div className="space-y-3 flex-1 border-b border-[var(--border-color)] pb-4">
                      {[
                        { label: 'Occasion Fit', val: candidate.stressTest?.occasionFit },
                        { label: 'Context Stability', val: candidate.stabilityScore },
                        { label: 'Profile Compatibility', val: hasActualProfile ? candidate.stressTest?.profileCompatibility : 'N/A' },
                        { label: 'Style Match', val: candidate.stressTest?.stylePreference },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center">
                          <span className="text-[var(--text-muted)] font-medium text-xs">{row.label}</span>
                          <span className="font-numeric font-bold text-[var(--text-primary)]">{row.val !== 'N/A' ? `${row.val}` : '--'}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-[var(--text-primary)] text-lg">Overall</span>
                      <ScoreRing score={candidate.contextMirrorScore || 0} size={50} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-8">
                <GlassButton variant="secondary" onClick={() => setStep(3)}>
                  ← Back to Generated Looks
                </GlassButton>
                <GlassButton variant="primary" onClick={() => setStep(5)}>
                  Compare Results →
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 5: COMPARE ═══════════════════════════════════════ */}
          {step === 5 && candidates.length > 0 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
               <div className="text-center max-w-2xl mx-auto space-y-3">
                <h1 className="font-serif text-4xl lg:text-5xl text-[var(--text-primary)] font-normal">
                  Which look works best?
                </h1>
                <p className="text-[var(--text-muted)] text-sm">
                  Fashion editorial comparison of all generated candidates.
                </p>
              </div>

              <div className="space-y-8 max-w-4xl mx-auto">
                {candidates.map(candidate => (
                  <div key={candidate.id} className={`glass-level-2 rounded-[2rem] p-6 flex flex-col md:flex-row gap-8 items-center ${candidate.isBestMatch ? 'ring-2 ring-[var(--accent-gold)] shadow-[0_0_40px_rgba(212,175,55,0.15)]' : ''}`}>
                    <div className="w-full md:w-1/3 aspect-[3/4] rounded-xl overflow-hidden shadow-lg relative">
                      <img src={candidate.vtoResultUrl} className="w-full h-full object-cover" />
                      {candidate.isBestMatch && (
                        <div className="absolute top-4 left-4 bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl font-mono">
                          Best Match
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-4">
                        <div>
                          <h3 className="font-serif text-3xl font-bold text-[var(--text-primary)]">{candidate.name}</h3>
                          <p className="text-sm text-[var(--text-muted)] mt-2">{candidate.explanation}</p>
                        </div>
                        <div className="text-4xl font-numeric font-bold text-[var(--text-primary)]">
                          {candidate.contextMirrorScore}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="glass-pill p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                          <span className="block font-bold text-green-500 mb-1">Strongest Point</span>
                          <span className="text-[var(--text-primary)]">
                            {candidate.stressTest?.occasionFit && candidate.stressTest.occasionFit > 85 ? `Excellent ${context.occasion} fit` : 'Overall Versatility'}
                          </span>
                        </div>
                        <div className="glass-pill p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                          <span className="block font-bold text-red-500 mb-1">Weakness</span>
                          <span className="text-[var(--text-primary)]">
                            {candidate.stressTest?.environmentFit && candidate.stressTest.environmentFit < 80 ? `Not ideal for ${context.environment}` : 'Less versatile'}
                          </span>
                        </div>
                      </div>

                      <GlassButton variant="primary" className="w-full" onClick={() => { setSelectedCandidate(candidate); setStep(6); }}>
                        Experiment with this look ✦
                      </GlassButton>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-8">
                <GlassButton variant="secondary" onClick={() => setStep(4)}>
                  ← Back to Stress Test
                </GlassButton>
                <GlassButton variant="primary" onClick={() => { setSelectedCandidate(candidates.find(c => c.isBestMatch) || candidates[0]); setStep(7); }}>
                  Skip to Final Decision →
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 6: EXPERIMENT ════════════════════════════════════ */}
          {step === 6 && selectedCandidate && (
             <motion.div
              key="step6"
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h1 className="font-serif text-4xl lg:text-5xl text-[var(--text-primary)] font-normal">
                  Change One Thing
                </h1>
                <p className="text-[var(--text-muted)] text-sm">
                  Fine-tune your choice. What would you like to change?
                </p>
              </div>

              <div className="glass-level-3 p-8 rounded-[2rem] max-w-4xl mx-auto space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase">Select Item to Change</label>
                    <select value={changeItem} onChange={e => setChangeItem(e.target.value)} className="w-full p-4 rounded-xl glass-pill focus:outline-none text-lg">
                      <option value="jacket">🧥 Jacket / Outerwear</option>
                      <option value="top">👕 Top</option>
                      <option value="bottom">👖 Bottom</option>
                      <option value="shoes">👟 Shoes</option>
                      <option value="color">🎨 Color Palette</option>
                      <option value="custom">✍️ Custom Change</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] mb-2 uppercase">What do you want instead?</label>
                    <input 
                      type="text" 
                      value={changeValue} 
                      onChange={e => setChangeValue(e.target.value)}
                      placeholder="e.g. Navy blazer, Black boots..."
                      className="w-full p-4 rounded-xl glass-pill focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] text-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                   <GlassButton variant="primary" onClick={handleRunExperiment} disabled={!changeValue} className="px-12">
                     Apply Change ✦
                   </GlassButton>
                </div>
              </div>

              {experiment && (
                <ScrollReveal>
                  <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto items-center pt-8">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)]">
                      <BeforeAfterSlider
                        beforeImage={selectedCandidate.vtoResultUrl || ''}
                        afterImage="https://images.unsplash.com/photo-1594938298603-c8148c4b4e5b?w=600&q=80" // Mock image for now
                        beforeLabel={`BEFORE (${experiment.beforeScore})`}
                        afterLabel={`AFTER (${experiment.afterScore})`}
                      />
                    </div>
                    
                    <div className="space-y-6">
                      <h3 className="font-serif text-3xl font-bold text-[var(--text-primary)]">Experiment Result</h3>
                      
                      <div className={`p-8 rounded-[2rem] border shadow-lg ${experiment.scoreDelta >= 0 ? 'bg-emerald-50/10 border-emerald-500/30' : 'bg-red-50/10 border-red-500/30'}`}>
                        <span className="text-xs font-mono uppercase tracking-widest block mb-2 opacity-70">Score Delta</span>
                        <div className="flex items-end gap-2 mb-4">
                          <span className={`text-5xl font-numeric font-bold ${experiment.scoreDelta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {experiment.scoreDelta > 0 ? '+' : ''}{experiment.scoreDelta}
                          </span>
                          <span className="text-xl mb-1 opacity-70">Points</span>
                        </div>
                        <p className="text-[var(--text-primary)] leading-relaxed text-lg border-t border-[var(--border-color)] pt-4">
                          {experiment.explanation}
                        </p>
                      </div>

                      <div className="pt-4">
                        <GlassButton variant="primary" className="w-full" onClick={() => setStep(7)}>
                          Proceed to Final Decision →
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              )}

              <div className="flex justify-between pt-8">
                <GlassButton variant="secondary" onClick={() => setStep(5)}>
                  ← Back to Comparison
                </GlassButton>
                <GlassButton variant="primary" onClick={() => setStep(7)}>
                  Skip to Final Decision →
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 7: DECIDE (Decision Replay) ══════════════════════ */}
          {step === 7 && selectedCandidate && (
             <motion.div
              key="step7"
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.5 }}
              className="space-y-12 max-w-3xl mx-auto"
            >
               <div className="text-center space-y-3">
                <h1 className="font-serif text-4xl lg:text-5xl text-[var(--text-primary)] font-normal">
                  Final Decision
                </h1>
                <p className="text-[var(--text-muted)] text-sm">
                  Log your choice to build your personal style pattern.
                </p>
              </div>

              <div className="glass-level-3 p-8 rounded-[2rem] space-y-8 shadow-xl">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-muted)] mb-4 uppercase tracking-widest font-mono text-center">
                    What did you decide to wear?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {candidates.slice(0, 4).map(c => (
                      <button
                        key={c.id}
                        onClick={() => setUserChoice(c.id)}
                        className={`p-4 rounded-[1.25rem] border text-left transition-all ${
                          userChoice === c.id
                            ? 'border-[var(--accent-gold)] bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold shadow-lg scale-[1.02]'
                            : 'border-[var(--border-color)] hover:border-[var(--accent-gold)]/50 glass-pill text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="font-bold mb-1 text-sm">{c.name}</div>
                        <div className="font-numeric text-xs opacity-80">Score: {c.contextMirrorScore}</div>
                        {c.isBestMatch && <div className="text-[10px] mt-2 uppercase tracking-widest text-[var(--accent-gold)]">AI Recommended</div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[var(--border-color)] pt-6">
                  <label className="block text-sm font-bold text-[var(--text-muted)] mb-4 uppercase tracking-widest font-mono text-center">
                    Feedback for your Style Diary
                  </label>
                  <select
                    value={userFeedback}
                    onChange={e => setUserFeedback(e.target.value as any)}
                    className="w-full p-4 border border-[var(--border-color)] rounded-[1.25rem] text-lg glass-pill text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] text-center font-serif"
                  >
                    <option value="liked-it">I liked this look for the situation</option>
                    <option value="i-wore-this">I definitely wore this to the event</option>
                    <option value="would-change">I would change an item next time</option>
                    <option value="not-useful">This wasn't useful</option>
                  </select>
                </div>

                <div className="pt-6 flex justify-center">
                  <GlassButton variant="primary" onClick={handleSaveDecision} className="px-12 py-4 text-lg">
                    {replaySaved ? '✓ Logged to Diary!' : 'Save Decision ✦'}
                  </GlassButton>
                </div>
              </div>

              {replaySaved && (
                <div className="text-center pt-4">
                  <Link href="/history" className="text-sm text-[var(--accent-gold)] font-medium hover:underline flex items-center justify-center gap-2">
                    View your Fashion Diary <span>→</span>
                  </Link>
                </div>
              )}

              <div className="flex justify-start pt-8">
                <GlassButton variant="secondary" onClick={() => setStep(6)}>
                  ← Back to Experiment
                </GlassButton>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}

export default function TestLookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Studio...</div>}>
      <TestLookContent />
    </Suspense>
  )
}
