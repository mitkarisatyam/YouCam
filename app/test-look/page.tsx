'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  
  const [experiment, setExperiment] = useState<ChangeOneThingExperiment | null>(null)
  const [experimentImage, setExperimentImage] = useState<string>('')
  const [isExperimenting, setIsExperimenting] = useState(false)
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

  async function handleRunExperiment() {
    if (!selectedCandidate || !changeValue) return
    setIsExperimenting(true)
    const exp = runChangeOneThing(selectedCandidate, context, profile, changeItem, changeValue)
    setExperiment(exp)
    
    try {
      const vtoProvider = getApparelVTOProvider()
      const res = await vtoProvider.generate('selfie-id', `mock-garment-${Date.now()}`, 'cloth')
      setExperimentImage(res.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80')
    } catch {
      setExperimentImage('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80')
    } finally {
      setIsExperimenting(false)
    }
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
    <div className="min-h-screen pb-24 font-ui text-[var(--text-primary)]">

      <main className="max-w-[85rem] mx-auto px-6 pt-12 space-y-16">
        {/* ═══ PROGRESS NAV ═════════════════════════════════════════ */}
        <div className="glass-crystal rounded-full p-2 flex flex-wrap justify-between items-center gap-2 overflow-x-auto hide-scrollbar sticky top-24 z-30 shadow-elevated backdrop-blur-xl">
          {STEP_LABELS.map(st => (
            <button
              key={st.s}
              onClick={() => {
                if (st.s <= step || candidates.length > 0) setStep(st.s as any)
              }}
              className={`relative px-8 py-3 text-xs tracking-widest uppercase font-medium transition-all duration-500 whitespace-nowrap rounded-full ${
                step === st.s
                  ? 'text-[var(--bg-primary)] shadow-md'
                  : st.s < step
                  ? 'text-[var(--text-primary)] opacity-80 hover:opacity-100'
                  : 'text-[var(--text-muted)] opacity-50'
              }`}
            >
              {step === st.s && (
                <motion.div
                  layoutId="stepPill"
                  className="absolute inset-0 bg-[var(--text-primary)] -z-10 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="flex items-center gap-2">
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
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-16"
            >
              <div className="text-center max-w-4xl mx-auto space-y-6 pt-8">
                <span className="glass-crystal px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest inline-block shadow-subtle text-[var(--text-primary)]">Context Initialization</span>
                <h1 className="font-serif text-6xl lg:text-8xl text-[var(--text-primary)] font-normal tracking-tight">
                  Define the Environment.
                </h1>
                <p className="text-[var(--text-muted)] text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
                  Establish the spatial, temporal, and atmospheric parameters for your aesthetic synthesis.
                </p>
              </div>

              {/* Natural Language Input */}
              <div className="glass-deep rounded-[3rem] p-16 space-y-10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-1000" />
                <label className="block text-sm uppercase tracking-widest font-medium text-[var(--text-muted)] text-center relative z-10">
                  Semantic Input
                </label>
                <div className="flex flex-col sm:flex-row gap-6 max-w-5xl mx-auto relative z-10">
                  <input
                    type="text"
                    value={naturalInput}
                    onChange={e => setNaturalInput(e.target.value)}
                    placeholder="e.g. Corporate event at 7 PM in an indoor hotel."
                    className={`flex-1 px-8 py-5 rounded-[2rem] glass-soft bg-[color-mix(in_srgb,var(--bg-primary)_50%,transparent)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all ${parsing ? 'opacity-50 scale-95 filter blur-sm' : ''}`}
                  />
                  <GlassButton variant="primary" onClick={handleParseNatural} className={`px-12 py-5 text-base transition-all rounded-[2rem] shadow-elevated ${parsing ? 'scale-95 opacity-80' : ''}`}>
                    {parsing ? 'Processing...' : 'Execute Context'}
                  </GlassButton>
                </div>
                
                {parsing && (
                  <div className="absolute inset-0 flex items-center justify-center glass-frosted z-20 rounded-[3rem]">
                     <div className="flex flex-col items-center gap-6">
                       <span className="animate-spin-slow text-5xl font-serif text-[var(--text-primary)]">✦</span>
                       <span className="text-sm font-medium tracking-widest uppercase text-[var(--text-muted)]">Parsing Semantics</span>
                     </div>
                  </div>
                )}

                {/* Parsed Context Chips */}
                {!parsing && context.rawNaturalInput && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-4 pt-10 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] relative z-10">
                    {[
                      { icon: 'Target', value: context.occasion },
                      { icon: 'Time', value: context.time },
                      { icon: 'Location', value: context.environment },
                      { icon: 'Formality', value: context.formality },
                      { icon: 'Weather', value: context.weather },
                      { icon: 'Style', value: context.mood },
                    ].filter(s => s.value).map((s, i) => (
                      <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} key={s.icon} className="px-6 py-3 glass-crystal rounded-full text-xs font-medium text-[var(--text-primary)] uppercase tracking-widest shadow-subtle">
                        <span className="opacity-50 mr-2">{s.icon}:</span> {s.value}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Manual Options */}
              <div className="space-y-8 glass-soft p-12 rounded-[3rem]">
                <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-widest border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-4">Parameter Manual Override</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-4 uppercase tracking-widest">Time</label>
                    <select value={context.time} onChange={e => setContextState({...context, time: e.target.value as any})} className="w-full p-5 rounded-2xl glass-frosted focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-sm uppercase tracking-wider appearance-none cursor-pointer">
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-4 uppercase tracking-widest">Environment</label>
                    <select value={context.environment} onChange={e => setContextState({...context, environment: e.target.value as any})} className="w-full p-5 rounded-2xl glass-frosted focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-sm uppercase tracking-wider appearance-none cursor-pointer">
                      <option value="indoor">Indoor</option>
                      <option value="outdoor">Outdoor</option>
                      <option value="office">Office</option>
                      <option value="hotel">Hotel</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="beach">Beach</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-4 uppercase tracking-widest">Formality</label>
                    <select value={context.formality} onChange={e => setContextState({...context, formality: e.target.value as any})} className="w-full p-5 rounded-2xl glass-frosted focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-sm uppercase tracking-wider appearance-none cursor-pointer">
                      <option value="casual">Casual</option>
                      <option value="smart-casual">Smart Casual</option>
                      <option value="formal">Formal</option>
                      <option value="traditional">Traditional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-4 uppercase tracking-widest">Weather</label>
                    <select value={context.weather || ''} onChange={e => setContextState({...context, weather: e.target.value as any})} className="w-full p-5 rounded-2xl glass-frosted focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-sm uppercase tracking-wider appearance-none cursor-pointer">
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
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-4 uppercase tracking-widest">Style Vector</label>
                    <select value={context.mood || ''} onChange={e => setContextState({...context, mood: e.target.value as any})} className="w-full p-5 rounded-2xl glass-frosted focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-sm uppercase tracking-wider appearance-none cursor-pointer">
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

                {/* Occasion Grid */}
                <div className="pt-8 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] space-y-6">
                  <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">Preset Contexts</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {OCCASION_TILES.map((tile) => (
                      <button
                        key={tile.id}
                        onClick={() => {
                          const updated = { ...context, occasion: tile.id }
                          setContextState(updated)
                          saveContext(updated)
                        }}
                        className={`p-4 rounded-[1.5rem] text-center transition-all duration-300 ${
                          context.occasion === tile.id
                            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-elevated scale-105'
                            : 'glass-frosted text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_10%,transparent)] hover:scale-105'
                        }`}
                      >
                        <span className="text-xs font-medium uppercase tracking-widest block">{tile.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Context Result Card */}
              {context.rawNaturalInput && !parsing && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center pt-8">
                  <div className="glass-deep p-12 rounded-[3rem] text-center w-full max-w-2xl shadow-elevated relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--text-primary)] to-transparent opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000" />
                    <h3 className="font-serif text-4xl font-normal text-[var(--text-primary)] mb-8 border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-6 relative z-10">Active Parameters</h3>
                    <div className="space-y-6 text-sm font-medium uppercase tracking-widest text-[var(--text-muted)] relative z-10">
                      <div className="flex justify-between items-center bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] p-4 rounded-xl"><span>Occasion</span> <span className="text-[var(--text-primary)] text-base">{context.occasion}</span></div>
                      <div className="flex justify-between items-center bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] p-4 rounded-xl"><span>Time</span> <span className="text-[var(--text-primary)] text-base">{context.time}</span></div>
                      <div className="flex justify-between items-center bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] p-4 rounded-xl"><span>Environment</span> <span className="text-[var(--text-primary)] text-base">{context.environment}</span></div>
                      <div className="flex justify-between items-center bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] p-4 rounded-xl"><span>Formality</span> <span className="text-[var(--text-primary)] text-base">{context.formality}</span></div>
                      {context.mood && <div className="flex justify-between items-center bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] p-4 rounded-xl"><span>Style</span> <span className="text-[var(--text-primary)] text-base">{context.mood}</span></div>}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-end pt-12 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                <GlassButton variant="primary" onClick={() => setStep(2)} className="px-10 py-5 text-base shadow-elevated">
                  Proceed to Subject Profile
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 2: PROFILE ══════════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-16"
            >
              <div className="text-center max-w-4xl mx-auto space-y-6 pt-8">
                <span className="glass-crystal px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest inline-block shadow-subtle text-[var(--text-primary)]">Subject Analysis</span>
                <h1 className="font-serif text-6xl lg:text-8xl text-[var(--text-primary)] font-normal tracking-tight">
                  Personalize Parameters.
                </h1>
                <p className="text-[var(--text-muted)] text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
                  Ingest subject imagery for objective skin and aesthetic evaluation.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div className="space-y-10 glass-deep p-12 rounded-[3rem] shadow-subtle group">
                  <div className="border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-6">
                     <h2 className="font-serif text-4xl font-normal text-[var(--text-primary)]">Image Acquisition</h2>
                  </div>
                  <UploadZone
                    label="Provide Subject Image"
                    sublabel="Upload or Capture Reference Material"
                    currentPreview={selfiePreview}
                    loading={analyzingSkin}
                    onFileSelect={(file) => setSelfiePreview(URL.createObjectURL(file))}
                  />
                  
                  <div className="glass-soft p-6 rounded-2xl text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest flex items-start gap-4">
                    <span className="text-xl text-[var(--text-primary)]">ℹ</span>
                    <p className="leading-relaxed mt-0.5">Optimal precision requires clear facial exposure, uniform illumination, and a singular subject.</p>
                  </div>

                  <GlassButton 
                    variant="primary" 
                    onClick={handleAnalyzeProfile} 
                    disabled={!selfiePreview || analyzingSkin} 
                    className="w-full py-5 text-base shadow-elevated"
                  >
                    {analyzingSkin ? 'Processing...' : 'Execute Analysis'}
                  </GlassButton>
                </div>

                <div className="glass-soft p-12 rounded-[3rem] flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02]" />
                  {!hasActualProfile ? (
                    <div className="text-center space-y-8 opacity-50 relative z-10">
                      <div className="text-6xl text-[var(--text-primary)] font-serif animate-pulse">✦</div>
                      <p className="text-sm font-medium uppercase tracking-widest text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">Awaiting subject imagery for biometric evaluation.</p>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 relative z-10">
                      <h3 className="font-serif text-4xl font-normal text-[var(--text-primary)] border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-6">
                        Diagnostic Output
                      </h3>
                      
                      <div className="space-y-6 text-sm">
                        <div className="flex justify-between items-center glass-frosted p-6 rounded-2xl hover:scale-[1.02] transition-transform">
                          <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">Chromatic Base</span>
                          <span className="text-base font-medium text-[var(--text-primary)] capitalize tracking-wide">{profile.skinSignals.undertone}</span>
                        </div>
                        <div className="flex justify-between items-center glass-frosted p-6 rounded-2xl hover:scale-[1.02] transition-transform">
                          <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">Moisture Index</span>
                          <span className="text-base font-medium text-[var(--text-primary)] capitalize tracking-wide">{profile.skinSignals.hydrationLevel}</span>
                        </div>
                        <div className="flex justify-between items-center glass-frosted p-6 rounded-2xl hover:scale-[1.02] transition-transform">
                          <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium">Clarity Metric</span>
                          <span className="font-numeric font-light text-4xl text-[var(--text-primary)] tracking-tighter">{profile.skinSignals.clarityScore} <span className="text-sm text-[var(--text-muted)]">/ 100</span></span>
                        </div>
                      </div>

                      <div className="pt-8 space-y-6 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                        <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">Aesthetic Prescriptions</h4>
                        <div className="flex flex-wrap gap-4">
                          {profile.colorSignals.recommendedPalettes.map((p, i) => (
                            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={p} className="glass-crystal px-5 py-3 rounded-full text-[10px] uppercase tracking-widest font-medium text-[var(--text-primary)] shadow-subtle">
                              {p}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-12 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                <GlassButton variant="secondary" onClick={() => setStep(1)} className="px-8 py-4 text-sm uppercase tracking-widest">
                  Return to Context
                </GlassButton>
                <GlassButton variant="primary" onClick={() => setStep(3)} className="px-10 py-5 text-base uppercase tracking-widest shadow-elevated">
                  Proceed to Synthesis
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 3: GENERATE LOOKS ════════════════════════════════ */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-16"
            >
              <div className="text-center max-w-4xl mx-auto space-y-6 pt-8">
                <span className="glass-crystal px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest inline-block shadow-subtle text-[var(--text-primary)]">Aesthetic Synthesis</span>
                <h1 className="font-serif text-6xl lg:text-8xl text-[var(--text-primary)] font-normal tracking-tight">
                  Configuration Candidates.
                </h1>
                <p className="text-[var(--text-muted)] text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
                  Algorithmic curation based on established parameters and biometric profiling.
                </p>
              </div>

              {candidates.length === 0 ? (
                <div className="glass-deep rounded-[3rem] p-24 text-center max-w-3xl mx-auto shadow-elevated space-y-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--text-primary)_0%,transparent_70%)] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-1000" />
                  <div className="text-6xl font-serif text-[var(--text-primary)] relative z-10 animate-pulse">✦</div>
                  <h3 className="font-serif text-4xl font-normal text-[var(--text-primary)] mb-4 relative z-10">Initialize Generation Sequence</h3>
                  <GlassButton variant="primary" onClick={() => generateLooks(4)} disabled={generatingVTO} className="w-full py-5 text-base relative z-10 shadow-elevated">
                    {generatingVTO ? 'Synthesizing...' : 'Execute Synthesis'}
                  </GlassButton>
                </div>
              ) : (
                <div className="space-y-16">
                  <div className="grid md:grid-cols-2 gap-10">
                    {candidates.map((candidate, idx) => (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={candidate.id} className="glass-soft rounded-[2.5rem] p-4 flex flex-col sm:flex-row group transition-all duration-500 hover:shadow-elevated hover:bg-[color-mix(in_srgb,var(--surface)_80%,transparent)]">
                        <div className="sm:w-2/5 aspect-[3/4] relative rounded-[2rem] overflow-hidden">
                          <img
                            src={candidate.vtoResultUrl}
                            alt={candidate.name}
                            className="w-full h-full object-cover grayscale-[10%] group-hover:scale-[1.03] transition-transform duration-[2000ms]"
                          />
                        </div>
                        <div className="p-8 flex-1 flex flex-col justify-center space-y-8">
                          <div>
                            <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">{candidate.name}</h3>
                            <div className="text-[10px] uppercase tracking-widest font-medium text-[var(--text-muted)] mt-3 glass-crystal px-3 py-1 inline-block rounded-full">Class: {candidate.tag}</div>
                          </div>
                          <div className="glass-frosted p-6 rounded-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02]" />
                            <p className="text-sm text-[var(--text-muted)] leading-relaxed relative z-10">{candidate.explanation}</p>
                          </div>
                          <div className="pt-2">
                            <span className="text-xs font-medium uppercase tracking-widest text-[var(--text-primary)] glass-crystal px-5 py-3 rounded-full shadow-subtle flex justify-between items-center">
                              <span>Biometric Compatibility</span>
                              <span className="font-numeric text-lg">{hasActualProfile ? candidate.stressTest?.profileCompatibility : 'Pending'}</span>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-10 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                    {candidates.length < 6 && (
                      <GlassButton variant="secondary" onClick={() => generateLooks(6)} disabled={generatingMore} className="px-10 py-4 text-sm uppercase tracking-widest rounded-full">
                        {generatingMore ? 'Processing...' : 'Expand Candidates'}
                      </GlassButton>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-12 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                <GlassButton variant="secondary" onClick={() => setStep(2)} className="px-8 py-4 text-sm uppercase tracking-widest">
                  Return to Profile
                </GlassButton>
                <GlassButton variant="primary" onClick={() => setStep(4)} disabled={candidates.length === 0} className="px-10 py-5 text-base uppercase tracking-widest shadow-elevated">
                  Proceed to Evaluation
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 4: STRESS TEST ═══════════════════════════════════ */}
          {step === 4 && candidates.length > 0 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-16"
            >
              <div className="text-center max-w-4xl mx-auto space-y-6 pt-8">
                <span className="glass-crystal px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest inline-block shadow-subtle text-[var(--text-primary)]">Context Simulation</span>
                <h1 className="font-serif text-6xl lg:text-8xl text-[var(--text-primary)] font-normal tracking-tight">
                  Stress-Test Execution.
                </h1>
                <p className="text-[var(--text-muted)] text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
                  Evaluating algorithmic viability across real-world environmental and social parameters.
                </p>
              </div>

              <div className="space-y-16">
                {candidates.map((candidate, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: idx * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
                    key={candidate.id} 
                    className="relative glass-deep rounded-[3rem] overflow-hidden group cursor-pointer tilt-card" 
                    onClick={() => { setSelectedCandidate(candidate); setStep(5); }}
                  >
                    {/* Runway Belt Animation Layer */}
                    <div className="absolute inset-0 z-0 flex items-center overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-1000 pointer-events-none">
                       <motion.div
                         animate={{ x: [0, -1500] }}
                         transition={{ ease: "linear", duration: 25, repeat: Infinity }}
                         className="flex gap-40 items-center whitespace-nowrap font-serif text-6xl md:text-8xl text-[color-mix(in_srgb,var(--text-primary)_30%,transparent)]"
                       >
                         <span>☀️ Daylight</span>
                         <span>🏛 Indoor</span>
                         <span>🌙 Evening</span>
                         <span>📸 Photography</span>
                         <span>☀️ Daylight</span>
                         <span>🏛 Indoor</span>
                         <span>🌙 Evening</span>
                         <span>📸 Photography</span>
                       </motion.div>
                    </div>

                    {/* Outfit Centered in Runway */}
                    <div className="relative z-10 flex flex-col md:flex-row p-8 gap-12 items-center bg-gradient-to-r from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]">
                      <div className="w-full md:w-1/3 aspect-[3/4] relative rounded-[2rem] overflow-hidden shadow-elevated">
                        <img src={candidate.vtoResultUrl} className="w-full h-full object-cover grayscale-[10%] transition-transform duration-[2000ms] group-hover:scale-[1.05]" />
                      </div>
                      
                      <div className="flex-1 space-y-8 glass-soft p-10 rounded-[2.5rem]">
                        <h3 className="font-serif text-4xl font-normal text-[var(--text-primary)] leading-tight border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-4">{candidate.name}</h3>
                        
                        <div className="grid grid-cols-2 gap-6">
                          {[
                            { label: 'Occasion Fit', val: candidate.stressTest?.occasionFit },
                            { label: 'Profile Viability', val: hasActualProfile ? candidate.stressTest?.profileCompatibility : 'N/A' },
                            { label: 'Style Match', val: candidate.stressTest?.stylePreference },
                          ].map(row => (
                            <div key={row.label} className="flex justify-between items-center text-xs uppercase tracking-widest font-medium glass-frosted px-4 py-3 rounded-xl">
                              <span className="text-[var(--text-muted)]">{row.label}</span>
                              <span className="font-numeric text-sm text-[var(--text-primary)]">{row.val !== 'N/A' ? `${row.val}` : '--'}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center pt-6">
                          <span className="text-sm uppercase tracking-widest font-medium text-[var(--text-primary)]">Context Stability Score</span>
                          <div className="glass-crystal rounded-full p-2 shadow-elevated bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center w-20 h-20">
                             <span className="font-numeric text-3xl font-light">{candidate.stabilityScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between pt-12 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                <GlassButton variant="secondary" onClick={() => setStep(3)} className="px-8 py-4 text-sm uppercase tracking-widest">
                  Return to Synthesis
                </GlassButton>
                <GlassButton variant="primary" onClick={() => setStep(5)} className="px-10 py-5 text-base uppercase tracking-widest shadow-elevated">
                  Proceed to Comparison
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 5: COMPARE ═══════════════════════════════════════ */}
          {step === 5 && candidates.length > 0 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-16"
            >
               <div className="text-center max-w-4xl mx-auto space-y-6 pt-8">
                <span className="glass-crystal px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest inline-block shadow-subtle text-[var(--text-primary)]">Aesthetic Comparison</span>
                <h1 className="font-serif text-6xl lg:text-8xl text-[var(--text-primary)] font-normal tracking-tight">
                  Editorial Review.
                </h1>
                <p className="text-[var(--text-muted)] text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
                  Analyze performance metrics to identify optimal configurations.
                </p>
              </div>

              <div className="space-y-10 max-w-6xl mx-auto">
                {candidates.map((candidate, idx) => (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={candidate.id} className={`glass-deep p-6 rounded-[3rem] flex flex-col md:flex-row gap-12 items-center transition-all duration-500 hover:shadow-elevated group ${candidate.isBestMatch ? 'ring-2 ring-[var(--text-primary)] ring-offset-4 ring-offset-[var(--bg-primary)]' : ''}`}>
                    <div className="w-full md:w-1/3 aspect-[3/4] relative rounded-[2rem] overflow-hidden glass-soft p-2">
                      <img src={candidate.vtoResultUrl} className="w-full h-full object-cover rounded-[1.5rem] grayscale-[10%] group-hover:scale-[1.03] transition-transform duration-[2000ms]" />
                      {candidate.isBestMatch && (
                        <div className="absolute top-8 left-8 bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-3 text-xs font-medium uppercase tracking-widest rounded-full shadow-elevated">
                          Algorithmic Optimum
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-10 py-6 pr-6">
                      <div className="flex justify-between items-start border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-8">
                        <div>
                          <h3 className="font-serif text-5xl font-normal text-[var(--text-primary)] leading-tight">{candidate.name}</h3>
                          <p className="text-base text-[var(--text-muted)] mt-4 leading-relaxed max-w-xl">{candidate.explanation}</p>
                        </div>
                        <div className="relative w-40 h-40 flex items-center justify-center">
                          {/* Converging Metrics */}
                          <motion.div initial={{ opacity: 0, x: -60, y: -60 }} animate={{ opacity: [0, 1, 0], x: [-60, 0], y: [-60, 0] }} transition={{ duration: 1.5, delay: idx * 0.1, ease: "easeInOut" }} className="absolute text-[10px] uppercase tracking-widest font-medium text-[var(--text-muted)] whitespace-nowrap">Occasion {candidate.stressTest?.occasionFit}</motion.div>
                          <motion.div initial={{ opacity: 0, x: 60, y: -60 }} animate={{ opacity: [0, 1, 0], x: [60, 0], y: [-60, 0] }} transition={{ duration: 1.5, delay: idx * 0.1 + 0.1, ease: "easeInOut" }} className="absolute text-[10px] uppercase tracking-widest font-medium text-[var(--text-muted)] whitespace-nowrap">Style {candidate.stressTest?.stylePreference}</motion.div>
                          <motion.div initial={{ opacity: 0, x: 0, y: 60 }} animate={{ opacity: [0, 1, 0], x: [0, 0], y: [60, 0] }} transition={{ duration: 1.5, delay: idx * 0.1 + 0.2, ease: "easeInOut" }} className="absolute text-[10px] uppercase tracking-widest font-medium text-[var(--text-muted)] whitespace-nowrap">Stability {candidate.stabilityScore}</motion.div>
                          
                          {/* Final Score Reveal */}
                          <motion.div initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ delay: idx * 0.1 + 1.2, type: 'spring', damping: 12 }} className="text-8xl font-numeric font-light text-[var(--text-primary)] tracking-tighter z-10">
                            {candidate.contextMirrorScore}
                          </motion.div>
                          
                          {/* Impact Ring */}
                          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 2] }} transition={{ delay: idx * 0.1 + 1.2, duration: 1 }} className="absolute inset-0 border border-[var(--text-primary)] rounded-full z-0 pointer-events-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 text-sm">
                        <div className="glass-soft p-8 rounded-[2rem] relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02]" />
                          <span className="block text-[10px] font-medium uppercase tracking-widest text-[var(--text-primary)] mb-3 relative z-10 glass-crystal px-3 py-1 inline-block rounded-full">Primary Advantage</span>
                          <span className="text-[var(--text-muted)] text-base relative z-10 block mt-2">
                            {candidate.stressTest?.occasionFit && candidate.stressTest.occasionFit > 85 ? `Excellent ${context.occasion} fit` : 'Overall Versatility'}
                          </span>
                        </div>
                        <div className="glass-frosted p-8 rounded-[2rem] relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02]" />
                          <span className="block text-[10px] font-medium uppercase tracking-widest text-[var(--text-primary)] mb-3 relative z-10 glass-crystal px-3 py-1 inline-block rounded-full">Identified Compromise</span>
                          <span className="text-[var(--text-muted)] text-base relative z-10 block mt-2">
                            {candidate.stressTest?.environmentFit && candidate.stressTest.environmentFit < 80 ? `Not ideal for ${context.environment}` : 'Less versatile'}
                          </span>
                        </div>
                      </div>

                      <GlassButton variant="primary" className="w-full py-5 text-sm uppercase tracking-widest shadow-elevated" onClick={() => { setSelectedCandidate(candidate); setStep(6); }}>
                        Execute Sub-Component Alteration
                      </GlassButton>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between pt-12 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                <GlassButton variant="secondary" onClick={() => setStep(4)} className="px-8 py-4 text-sm uppercase tracking-widest">
                  Return to Simulation
                </GlassButton>
                <GlassButton variant="primary" onClick={() => { setSelectedCandidate(candidates.find(c => c.isBestMatch) || candidates[0]); setStep(7); }} className="px-10 py-5 text-base uppercase tracking-widest shadow-elevated">
                  Bypass to Final Selection
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 6: EXPERIMENT ════════════════════════════════════ */}
          {step === 6 && selectedCandidate && (
             <motion.div
              key="step6"
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-16"
            >
              <div className="text-center max-w-4xl mx-auto space-y-6 pt-8">
                <span className="glass-crystal px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest inline-block shadow-subtle text-[var(--text-primary)]">Micro-Adjustments</span>
                <h1 className="font-serif text-6xl lg:text-8xl text-[var(--text-primary)] font-normal tracking-tight">
                  Component Isolation.
                </h1>
                <p className="text-[var(--text-muted)] text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
                  Modify individual elements to observe cascading aesthetic effects.
                </p>
              </div>

              <div className="glass-deep p-16 rounded-[3rem] max-w-5xl mx-auto space-y-12 shadow-elevated">
                <div className="grid md:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-4 uppercase tracking-widest">Target Sub-Component</label>
                    <select value={changeItem} onChange={e => setChangeItem(e.target.value)} className="w-full p-5 rounded-2xl glass-soft focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-base uppercase tracking-wider text-[var(--text-primary)] appearance-none cursor-pointer">
                      <option value="jacket">Outerwear Module</option>
                      <option value="top">Base Layer (Top)</option>
                      <option value="bottom">Base Layer (Bottom)</option>
                      <option value="shoes">Footwear Module</option>
                      <option value="color">Chromatic Palette</option>
                      <option value="custom">Custom Variable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-4 uppercase tracking-widest">Proposed Replacement</label>
                    <input 
                      type="text" 
                      value={changeValue} 
                      onChange={e => setChangeValue(e.target.value)}
                      placeholder="e.g. Navy blazer, Black boots..."
                      className="w-full p-5 rounded-2xl glass-soft focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-base uppercase tracking-wider text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-8 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                   <GlassButton variant="primary" onClick={handleRunExperiment} disabled={!changeValue || isExperimenting} className="px-16 py-5 text-base shadow-elevated">
                     {isExperimenting ? 'Synthesizing Alteration...' : 'Execute Substitution'}
                   </GlassButton>
                </div>
              </div>

              {experiment && !isExperimenting && (
                <ScrollReveal>
                  <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto items-center pt-12">
                    <div className="aspect-[3/4] glass-soft p-4 rounded-[3rem] shadow-elevated">
                      <BeforeAfterSlider
                        beforeImage={selectedCandidate.vtoResultUrl || ''}
                        afterImage={experimentImage}
                        beforeLabel={`PREVIOUS (${experiment.beforeScore})`}
                        afterLabel={`REVISED (${experiment.afterScore})`}
                      />
                    </div>
                    
                    <div className="space-y-10">
                      <h3 className="font-serif text-5xl font-normal text-[var(--text-primary)] border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-6">Substitution Analysis</h3>
                      
                      <div className={`p-12 rounded-[2.5rem] ${experiment.scoreDelta >= 0 ? 'glass-deep ring-2 ring-[var(--text-primary)] ring-offset-4 ring-offset-[var(--bg-primary)]' : 'glass-frosted'}`}>
                        <span className="glass-crystal px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest inline-block mb-6 text-[var(--text-muted)]">Net Viability Shift</span>
                        <div className="flex items-end gap-4 mb-8">
                          <span className={`text-8xl font-numeric font-light tracking-tighter ${experiment.scoreDelta >= 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                            {experiment.scoreDelta > 0 ? '+' : ''}{experiment.scoreDelta}
                          </span>
                          <span className="text-sm uppercase tracking-widest text-[var(--text-muted)] mb-3">Points</span>
                        </div>
                        <p className="text-[var(--text-muted)] leading-relaxed text-base border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pt-8">
                          {experiment.explanation}
                        </p>
                      </div>

                      <div className="pt-8">
                        <GlassButton variant="primary" className="w-full py-5 text-sm uppercase tracking-widest shadow-elevated" onClick={() => setStep(7)}>
                          Proceed to Finalization
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              )}

              <div className="flex justify-between pt-12 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                <GlassButton variant="secondary" onClick={() => setStep(5)} className="px-8 py-4 text-sm uppercase tracking-widest">
                  Return to Editorial Review
                </GlassButton>
                <GlassButton variant="primary" onClick={() => setStep(7)} className="px-10 py-5 text-base uppercase tracking-widest shadow-elevated">
                  Bypass to Final Selection
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 7: DECIDE (Decision Replay) ══════════════════════ */}
          {step === 7 && selectedCandidate && (
             <motion.div
              key="step7"
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-16 max-w-5xl mx-auto"
            >
               <div className="text-center space-y-6 pt-8">
                <span className="glass-crystal px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest inline-block shadow-subtle text-[var(--text-primary)]">Definitive Output</span>
                <h1 className="font-serif text-6xl lg:text-8xl text-[var(--text-primary)] font-normal tracking-tight">
                  Final Selection.
                </h1>
                <p className="text-[var(--text-muted)] text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
                  Commit configuration to personal stylistic telemetry.
                </p>
              </div>

              <div className="glass-deep p-16 rounded-[3rem] space-y-12 shadow-elevated">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-8 uppercase tracking-widest text-center">
                    Confirm Chosen Configuration
                  </label>
                  <div className="grid grid-cols-2 gap-8">
                    {candidates.slice(0, 4).map(c => (
                      <button
                        key={c.id}
                        onClick={() => setUserChoice(c.id)}
                        className={`p-8 rounded-[2rem] text-left transition-all duration-300 relative overflow-hidden group ${
                          userChoice === c.id
                            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-elevated scale-105'
                            : 'glass-soft text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_10%,transparent)] hover:scale-[1.02]'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-[0.05]" />
                        <div className="font-serif text-3xl mb-4 relative z-10">{c.name}</div>
                        <div className="text-xs uppercase tracking-widest opacity-80 relative z-10">Viability: <span className="font-numeric">{c.contextMirrorScore}</span></div>
                        {c.isBestMatch && <div className={`text-[10px] mt-6 uppercase tracking-widest font-medium inline-block px-3 py-1 rounded-full relative z-10 ${userChoice === c.id ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] opacity-90' : 'glass-crystal text-[var(--text-primary)]'}`}>Algorithmic Optimum</div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pt-10">
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-8 uppercase tracking-widest text-center">
                    Post-Execution Feedback
                  </label>
                  <select
                    value={userFeedback}
                    onChange={e => setUserFeedback(e.target.value as any)}
                    className="w-full max-w-md mx-auto block p-5 rounded-full glass-frosted text-base uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] text-[var(--text-primary)] text-center appearance-none cursor-pointer"
                  >
                    <option value="liked-it">Configuration Validated</option>
                    <option value="i-wore-this">Configuration Deployed</option>
                    <option value="would-change">Sub-optimal Validation</option>
                    <option value="not-useful">Configuration Rejected</option>
                  </select>
                </div>

                <div className="pt-12 flex justify-center border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                  <GlassButton variant="primary" onClick={handleSaveDecision} className="px-16 py-5 text-base shadow-elevated">
                    {replaySaved ? 'Telemetry Logged' : 'Commit Configuration'}
                  </GlassButton>
                </div>
              </div>

              {replaySaved && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-8">
                  <Link href="/history" className="text-sm uppercase tracking-widest text-[var(--text-primary)] font-medium hover:opacity-70 transition-opacity flex items-center justify-center gap-4 glass-crystal rounded-full py-5 max-w-md mx-auto shadow-subtle hover:shadow-elevated">
                    Review Telemetry Logs <span>→</span>
                  </Link>
                </motion.div>
              )}

              <div className="flex justify-start pt-12 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                <GlassButton variant="secondary" onClick={() => setStep(6)} className="px-8 py-4 text-sm uppercase tracking-widest">
                  Return to Micro-Adjustments
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center glass-deep"><div className="text-4xl animate-spin text-[var(--text-primary)] font-serif">✦</div></div>}>
      <TestLookContent />
    </Suspense>
  )
}
