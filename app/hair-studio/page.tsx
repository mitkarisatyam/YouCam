'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { UploadZone } from '@/components/ui/UploadZone'
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider'
import { CinematicAtmosphere } from '@/components/ui/CinematicAtmosphere'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { logHairAnalysis, getHairPreferences } from '@/lib/memory'
import { recommendHairstyles } from '@/lib/hairEngine'
import { getHairProvider, getHairstyleProvider, isDemoMode } from '@/lib/youcam'
import type { HairstyleCandidate, HairPreferences } from '@/types'
import type { HairResult, VTOResult } from '@/lib/youcam/types'
import { useRouter } from 'next/navigation'

type ViewState = 'landing' | 'capture' | 'analyzing' | 'profile' | 'preferences' | 'lookbook' | 'vto'
type VTOState = 'idle' | 'uploading' | 'queued' | 'processing' | 'success' | 'error'

export default function HairStudioPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewState>('landing')
  
  // State
  const [profile, setProfile] = useState<HairResult | null>(null)
  const [preferences, setPreferences] = useState<HairPreferences>({ maintenancePreference: 'medium', preferredLength: 'any' })
  const [stylePreference, setStylePreference] = useState<string>('Casual')
  const [recommendedStyles, setRecommendedStyles] = useState<HairstyleCandidate[]>([])
  const [selectedStyle, setSelectedStyle] = useState<HairstyleCandidate | null>(null)
  
  // VTO State Machine
  const [vtoStatus, setVtoStatus] = useState<VTOState>('idle')
  const [vtoResult, setVtoResult] = useState<VTOResult | null>(null)
  const [vtoError, setVtoError] = useState('')

  // Capture State
  const [selfiePreview, setSelfiePreview] = useState<string>('')
  const [stagedFile, setStagedFile] = useState<File | null>(null)

  useEffect(() => {
    const saved = getHairPreferences()
    if (saved) setPreferences(saved)
  }, [])

  async function runAnalysis(file: File) {
    setView('analyzing')
    const provider = getHairProvider()
    const result = await provider.analyze(file)
    setProfile(result)
    setView('profile')
  }

  function proceedToPreferences() {
    setView('preferences')
  }

  function generateLookbook() {
    const mockLegacyProfile = profile ? {
      id: 'mock',
      hairType: profile.signals.hairType,
      texture: 'Coarse',
      curlPattern: profile.signals.curlPattern || 'Unknown',
      density: profile.signals.density || 'Unknown',
      porosity: 'Normal',
      condition: profile.signals.condition,
      concerns: profile.signals.concerns.map(c => c.name)
    } : {
      id: 'mock', hairType: 'wavy', texture: 'Coarse', curlPattern: '2B', density: 'High', porosity: 'Normal', condition: 'healthy', concerns: []
    }
    
    // Pass the style preference to the recommendation engine
    setRecommendedStyles(recommendHairstyles(mockLegacyProfile, preferences, stylePreference))
    setView('lookbook')
  }

  async function runTryOn(style: HairstyleCandidate) {
    setSelectedStyle(style)
    setView('vto')
    setVtoStatus('uploading')
    setVtoError('')
    
    // Simulate Asynchronous VTO Polling Architecture
    try {
      await new Promise(r => setTimeout(r, 800))
      setVtoStatus('queued')
      await new Promise(r => setTimeout(r, 1200))
      setVtoStatus('processing')
      
      const provider = getHairstyleProvider()
      const result = await provider.generate('mock_user_id', style.id)
      
      if (result.status === 'failed' || !result.imageUrl) {
        throw new Error(result.error || 'Failed to generate hairstyle.')
      }
      
      setVtoResult(result)
      setVtoStatus('success')
    } catch (e: any) {
      setVtoError(e.message || 'We couldn\'t create this hairstyle preview.')
      setVtoStatus('error')
    }
  }

  return (
    <div className="min-h-screen pb-32 font-ui text-[var(--text-primary)] relative">
      <GlassNav />
      {/* Background specific to hair studio (dark, luxurious, glowing) */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-80">
        <CinematicAtmosphere />
      </div>

      <main className="max-w-[90rem] mx-auto px-6 pt-16 md:pt-24 space-y-24">
        <AnimatePresence mode="wait">

          {/* 1. LANDING SCREEN */}
          {view === 'landing' && (
            <motion.section 
              key="landing" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} 
              className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]"
            >
              <div className="space-y-8 z-10">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <span className="premium-badge">💇 Digital Salon</span>
                  <h1 className="font-serif text-5xl lg:text-7xl font-normal leading-[1.05] tracking-tight">
                    Understand your hair.<br/>
                    <span className="italic text-[var(--text-muted)]">Discover what works with it.</span>
                  </h1>
                </motion.div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[var(--text-muted)] text-lg leading-relaxed max-w-md">
                  Analyze your hair characteristics, understand your care needs, discover hairstyles suited to you, and preview them before making a change.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center gap-6 pt-4">
                  <GlassButton variant="primary" onClick={() => setView('capture')} className="px-8 py-4 text-base">
                    ✦ Analyze My Hair
                  </GlassButton>
                  <GlassButton variant="secondary" onClick={generateLookbook} className="px-8 py-4 text-base">
                    Explore Hairstyles
                  </GlassButton>
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group w-full max-w-md lg:max-w-full mx-auto"
              >
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?w=1200&q=80" 
                  alt="Flowing Hair Editorial" 
                  fallbackType="hair"
                  className="w-full h-full grayscale-[10%] group-hover:scale-[1.03] transition-transform duration-[3000ms]" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[rgba(255,255,255,0.05)] to-transparent pointer-events-none" />
                
                {/* Floating labels */}
                <motion.div className="absolute top-1/4 left-8 glass-crystal px-4 py-2 rounded-full text-xs font-medium shadow-elevated" animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                  Hair Type
                </motion.div>
                <motion.div className="absolute top-1/2 right-8 glass-crystal px-4 py-2 rounded-full text-xs font-medium shadow-elevated" animate={{ y: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}>
                  Try-On
                </motion.div>
              </motion.div>
            </motion.section>
          )}

          {/* 2. UPLOAD & CAPTURE */}
          {view === 'capture' && (
            <motion.section 
              key="capture" 
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} 
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="max-w-2xl mx-auto space-y-12 min-h-[70vh] flex flex-col justify-center"
            >
              <div className="text-center space-y-4">
                <span className="premium-badge">📷 Guided Capture</span>
                <h2 className="font-serif text-5xl font-normal">Provide reference photos</h2>
                <div className="text-[var(--text-muted)] text-base space-y-1 max-w-sm mx-auto">
                  <p>• Keep hair visible</p>
                  <p>• Use good lighting</p>
                </div>
              </div>

              <div className="glass-deep rounded-[3rem] p-12 relative overflow-hidden group">
                {!stagedFile ? (
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <h3 className="font-medium text-lg uppercase tracking-widest text-[var(--text-primary)]">Step 1 — Front</h3>
                      <p className="text-xs text-[var(--text-muted)]">Look straight at the camera.</p>
                    </div>
                    <UploadZone
                      label="Upload Front Photo"
                      sublabel=""
                      currentPreview={selfiePreview}
                      loading={false}
                      onFileSelect={(file) => {
                        const url = URL.createObjectURL(file)
                        setSelfiePreview(url)
                        setStagedFile(file)
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="text-center space-y-2">
                      <h3 className="font-medium text-lg uppercase tracking-widest text-[var(--text-primary)]">Review Photos</h3>
                      <p className="text-xs text-[var(--text-muted)]">Front angle captured. Left/Right angles are optional in Demo Mode.</p>
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                      <div className="w-24 h-32 rounded-xl overflow-hidden glass-crystal">
                        <img src={selfiePreview} alt="Front" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-24 h-32 rounded-xl border border-dashed border-[var(--border-strong)] flex items-center justify-center text-[var(--text-muted)] text-xs text-center p-2 cursor-not-allowed">
                        Turn right
                      </div>
                      <div className="w-24 h-32 rounded-xl border border-dashed border-[var(--border-strong)] flex items-center justify-center text-[var(--text-muted)] text-xs text-center p-2 cursor-not-allowed">
                        Turn left
                      </div>
                    </div>

                    <AnimatePresence>
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-8 flex justify-end">
                        <GlassButton variant="primary" onClick={() => runAnalysis(stagedFile)} className="w-full py-4 px-8 text-lg">
                          Analyze My Hair ✦
                        </GlassButton>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* 3. ANALYZING LOADING STATE */}
          {view === 'analyzing' && (
            <motion.section 
              key="analyzing" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12"
            >
              <div className="relative">
                <div className="w-32 h-32 absolute inset-0 bg-[var(--text-primary)] opacity-5 rounded-full blur-2xl animate-pulse" />
                <svg className="w-24 h-24 text-[var(--text-primary)] animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="50" cy="50" r="40" strokeDasharray="60 40" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="30" strokeDasharray="30 20" strokeLinecap="round" strokeOpacity="0.5" className="origin-center animate-[spin_3s_linear_reverse_infinite]" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl animate-pulse">✦</div>
              </div>
              
              <div className="space-y-4">
                <h2 className="font-serif text-4xl font-normal text-[var(--text-primary)]">Reading your hair...</h2>
                <p className="text-[var(--text-muted)] text-lg">Scanning texture, wave pattern, and density.</p>
              </div>
            </motion.section>
          )}

          {/* 4. HAIR PROFILE & CARE */}
          {view === 'profile' && profile && (
            <motion.section key="profile" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-24">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="w-full md:w-1/3 aspect-[3/4] relative rounded-[2rem] overflow-hidden shadow-2xl">
                  {selfiePreview ? (
                    <img src={selfiePreview} alt="Your Hair" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-500">No Image</div>
                  )}
                </div>
                <div className="w-full md:w-2/3 space-y-8">
                  <span className="premium-badge">Your Hair Profile</span>
                  <h1 className="font-serif text-5xl font-normal">What We Found</h1>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Hair Type', value: profile.signals.hairType },
                      { label: 'Curl Pattern', value: profile.signals.curlPattern || 'N/A' },
                      { label: 'Density', value: profile.signals.density || 'N/A' },
                      { label: 'Condition', value: profile.signals.condition }
                    ].map((stat, i) => (
                      <div key={i} className="glass-soft p-6 rounded-3xl">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">{stat.label}</div>
                        <div className="font-serif text-2xl capitalize text-[var(--text-primary)]">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-lg text-[var(--text-muted)] italic border-l-2 border-[var(--border-strong)] pl-4">
                    "{profile.signals.textureNotes}"
                  </p>
                </div>
              </div>

              {/* Care Considerations & Routine */}
              <ScrollReveal>
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h2 className="font-serif text-4xl font-normal border-b border-[var(--border-color)] pb-4">Care Considerations</h2>
                    {profile.signals.concerns.map(c => (
                      <div key={c.id} className="glass-soft p-6 rounded-2xl space-y-4">
                        <h4 className="font-medium text-lg flex justify-between">
                          {c.name}
                          <span className={`text-xs uppercase tracking-widest px-2 py-1 rounded-sm border ${c.level === 'high' ? 'border-orange-500/30 text-orange-500' : 'border-emerald-500/30 text-emerald-500'}`}>
                            {c.level} level
                          </span>
                        </h4>
                        <p className="text-sm text-[var(--text-muted)]">{c.meaning}</p>
                      </div>
                    ))}
                    
                    <div className="glass-frosted p-6 rounded-2xl mt-4">
                      <h4 className="font-medium text-sm uppercase tracking-widest mb-4">Good to Know (Precautions)</h4>
                      <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-2">
                        <li>Avoid excessive heat styling</li>
                        <li>Avoid unnecessary over-washing</li>
                        <li>Protect hair when heat styling</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h2 className="font-serif text-4xl font-normal border-b border-[var(--border-color)] pb-4">Your Routine 🧴</h2>
                    
                    <div className="space-y-6">
                      <div className="glass-deep p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[var(--text-primary)]" />
                        <h4 className="font-medium text-lg mb-2">1. Wash Day</h4>
                        <p className="text-sm text-[var(--text-muted)]">Cleanse with a gentle shampoo. Follow with an appropriate conditioning treatment to manage texture.</p>
                      </div>
                      
                      <div className="glass-deep p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[var(--border-strong)]" />
                        <h4 className="font-medium text-lg mb-2">2. Styling</h4>
                        <p className="text-sm text-[var(--text-muted)]">Apply leave-in treatment on damp hair. Use heat protection if diffusing or straightening.</p>
                      </div>

                      <div className="glass-deep p-6 rounded-3xl relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[var(--border-strong)]" />
                        <h4 className="font-medium text-lg mb-2">3. Maintenance</h4>
                        <p className="text-sm text-[var(--text-muted)]">Keep styling simple and compatible with your {profile.signals.hairType} characteristics. Protect hair at night.</p>
                      </div>
                    </div>

                    <div className="pt-8">
                      <h4 className="font-medium text-sm uppercase tracking-widest mb-4">Product Categories</h4>
                      <div className="flex flex-wrap gap-3">
                        {['Gentle Shampoo', 'Moisturizing Conditioner', 'Leave-In Treatment', 'Heat Protection', 'Anti-Frizz Serum'].map(cat => (
                          <span key={cat} className="px-4 py-2 border border-[var(--border-color)] rounded-full text-xs text-[var(--text-muted)]">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Next Step */}
              <div className="text-center pt-16">
                <GlassButton variant="primary" onClick={proceedToPreferences} className="px-10 py-5 text-lg">
                  Find Your Next Hairstyle ✨
                </GlassButton>
              </div>

            </motion.section>
          )}

          {/* 4.5. STYLE PREFERENCES */}
          {view === 'preferences' && (
             <motion.section key="preferences" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-12 min-h-[60vh] flex flex-col justify-center">
               <div className="text-center space-y-4">
                 <span className="premium-badge">Style Personalization</span>
                 <h2 className="font-serif text-5xl font-normal">What are you looking for?</h2>
                 <p className="text-[var(--text-muted)] text-lg">Help us recommend the perfect hairstyles for your aesthetic.</p>
               </div>
               
               <div className="flex flex-wrap justify-center gap-4">
                 {['Professional', 'Casual', 'Trendy', 'Classic', 'Low Maintenance', 'Bold', 'Formal', 'Natural'].map(pref => (
                   <button 
                     key={pref} 
                     onClick={() => setStylePreference(pref)}
                     className={`px-8 py-4 rounded-full border transition-all text-sm font-medium tracking-wide ${stylePreference === pref ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)] shadow-elevated scale-105' : 'glass-soft border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]'}`}
                   >
                     {pref}
                   </button>
                 ))}
               </div>

               <div className="pt-12 text-center">
                 <GlassButton variant="primary" onClick={generateLookbook} className="px-12 py-5 text-lg">
                   Generate Lookbook ✦
                 </GlassButton>
               </div>
             </motion.section>
          )}

          {/* 5. HAIRSTYLE LOOKBOOK */}
          {view === 'lookbook' && (
             <motion.section key="lookbook" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
               <div className="flex flex-col md:flex-row justify-between items-end border-b border-[var(--border-color)] pb-8 gap-4">
                 <div>
                   <span className="premium-badge mb-4 block">Lookbook</span>
                   <h2 className="font-serif text-5xl font-normal text-[var(--text-primary)]">Hairstyles That Could Suit You</h2>
                   <p className="text-[var(--text-muted)] mt-2 text-lg">Curated based on your hair profile and <strong className="text-[var(--text-primary)]">{stylePreference}</strong> aesthetic.</p>
                 </div>
                 {profile && (
                   <button onClick={() => setView('profile')} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-4">
                     Return to Profile
                   </button>
                 )}
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {recommendedStyles.map((style, idx) => (
                   <motion.div key={style.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="group flex flex-col glass-soft rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500">
                     <div className="relative aspect-[4/5] overflow-hidden bg-black">
                       <ImageWithFallback src={style.imageUrl} fallbackType="hair" alt={style.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-[2000ms] group-hover:scale-105" />
                       <div className="absolute top-4 right-4 glass-crystal px-4 py-2 text-[10px] font-medium tracking-widest rounded-full shadow-subtle">
                         {style.compatibilityScore} MATCH
                       </div>
                       <div className="absolute bottom-4 left-4 glass-crystal px-4 py-2 text-[10px] uppercase tracking-widest rounded-full">
                         {style.category}
                       </div>
                     </div>
                     <div className="flex-1 flex flex-col p-8 space-y-4">
                       <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">{style.name}</h3>
                       <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                         Upkeep: {style.maintenanceLevel}
                       </div>
                       <p className="text-sm text-[var(--text-muted)] flex-1 leading-relaxed border-l border-[var(--border-color)] pl-3">
                         {style.whyRecommended}
                       </p>
                       <GlassButton variant="primary" onClick={() => runTryOn(style)} className="w-full py-4 text-sm tracking-wide mt-4">
                         Try This Hairstyle ✦
                       </GlassButton>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </motion.section>
          )}

          {/* 6. VIRTUAL TRY ON (VTO) */}
          {view === 'vto' && selectedStyle && (
            <motion.section key="vto" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 max-w-6xl mx-auto min-h-[80vh]">
              <div className="flex justify-between items-end border-b border-[var(--border-color)] pb-8">
                 <h2 className="font-serif text-5xl font-normal">Virtual Render 💫</h2>
                 <button onClick={() => setView('lookbook')} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-4">
                   Back to Lookbook
                 </button>
              </div>

              {vtoStatus !== 'success' && vtoStatus !== 'error' && (
                <div className="glass-deep rounded-[3rem] p-16 flex flex-col items-center justify-center text-center space-y-10 min-h-[50vh]">
                  <div className="w-16 h-16 border-[2px] border-transparent border-t-[var(--text-primary)] border-r-[var(--text-primary)] rounded-full animate-spin-slow opacity-80" />
                  <div>
                    <h3 className="font-serif text-4xl font-normal mb-4">
                      {vtoStatus === 'uploading' && 'Connecting to Synthesis Engine...'}
                      {vtoStatus === 'queued' && 'Preparing your hairstyle task...'}
                      {vtoStatus === 'processing' && 'Creating your new look...'}
                    </h3>
                    <p className="text-[var(--text-muted)] text-lg">Applying <span className="text-[var(--text-primary)]">{selectedStyle.name}</span> architecture...</p>
                  </div>
                </div>
              )}

              {vtoStatus === 'error' && (
                <div className="glass-deep rounded-[3rem] p-16 flex flex-col items-center justify-center text-center space-y-8 min-h-[50vh]">
                  <div className="text-5xl mb-4">⚠️</div>
                  <h3 className="font-serif text-3xl font-normal text-red-400">{vtoError}</h3>
                  <div className="flex gap-4">
                    <GlassButton variant="primary" onClick={() => runTryOn(selectedStyle)} className="px-8 py-3">Try Again</GlassButton>
                    <GlassButton variant="secondary" onClick={() => setView('lookbook')} className="px-8 py-3">Choose Another Style</GlassButton>
                  </div>
                </div>
              )}

              {vtoStatus === 'success' && (
                <div className="space-y-16">
                  {/* Before/After Slider */}
                  <div className="w-full max-w-4xl mx-auto aspect-[3/4] md:aspect-[4/5] lg:aspect-[16/10] bg-[var(--surface)] border border-[var(--border-color)] p-2 rounded-[2rem] overflow-hidden shadow-2xl">
                    <BeforeAfterSlider
                      beforeImage={selfiePreview || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80'}
                      afterImage={vtoResult?.imageUrl || ''}
                      beforeLabel="Current Style"
                      afterLabel="New Style"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 pt-8">
                    <div className="glass-soft rounded-[2rem] p-10 space-y-6">
                      <h3 className="font-serif text-3xl font-normal mb-2">Change One Thing</h3>
                      <p className="text-sm text-[var(--text-muted)] mb-4">What would you like to tweak?</p>
                      <div className="flex flex-wrap gap-4">
                        {['Length', 'Bangs', 'Volume', 'Color'].map(opt => (
                          <button key={opt} onClick={() => runTryOn(selectedStyle)} className="text-xs uppercase tracking-widest px-6 py-3 glass-deep text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all rounded-full border border-[var(--border-color)]">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="glass-deep rounded-[2rem] p-10 flex flex-col justify-center items-start space-y-6">
                      <div>
                        <h3 className="font-serif text-3xl font-normal mb-3">Save & Contextualize</h3>
                        <p className="text-base text-[var(--text-muted)] leading-relaxed">Incorporate this hairstyle into your ContextMirror profile to evaluate alongside your wardrobe selections.</p>
                      </div>
                      <GlassButton variant="primary" onClick={() => router.push('/test-look')} className="px-8 py-4 text-base w-full md:w-auto">
                        Use This Hairstyle in My Look
                      </GlassButton>
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
