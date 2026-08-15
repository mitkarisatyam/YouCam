'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { logHairAnalysis, getHairPreferences } from '@/lib/memory'
import { hairAnalyzer, hairstyleTryOn, recommendHairstyles } from '@/lib/hairEngine'
import type { HairProfile, HairstyleCandidate, HairPreferences, HairstyleResult } from '@/types'
import { useRouter } from 'next/navigation'

type ViewState = 'landing' | 'capture' | 'analyzing' | 'profile' | 'lookbook' | 'vto'

export default function HairStudioPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewState>('landing')
  
  // State
  const [profile, setProfile] = useState<HairProfile | null>(null)
  const [preferences, setPreferences] = useState<HairPreferences | null>(null)
  const [recommendedStyles, setRecommendedStyles] = useState<HairstyleCandidate[]>([])
  const [selectedStyle, setSelectedStyle] = useState<HairstyleCandidate | null>(null)
  const [vtoResult, setVtoResult] = useState<HairstyleResult | null>(null)

  // Capture State
  const [captureStep, setCaptureStep] = useState<number>(0)
  const captureInstructions = [
    { title: 'Front Profile', desc: 'Maintain a neutral expression, looking directly into the lens.' },
    { title: 'Right Profile', desc: 'Turn slowly to expose the right side of your face and hair.' },
    { title: 'Left Profile', desc: 'Turn slowly to expose the left side.' }
  ]

  useEffect(() => {
    setPreferences(getHairPreferences())
  }, [])

  async function runAnalysis() {
    setView('analyzing')
    const result = await hairAnalyzer.analyze({ frontImage: 'mock' })
    setProfile(result)
    logHairAnalysis(result)
    
    if (preferences) {
      setRecommendedStyles(recommendHairstyles(result, preferences))
    }
    
    setView('profile')
  }

  async function runTryOn(style: HairstyleCandidate) {
    setSelectedStyle(style)
    setView('vto')
    setVtoResult({ candidateId: style.id, originalImageUrl: '', resultImageUrl: '', status: 'pending' })
    
    const result = await hairstyleTryOn.generate({ userImage: 'mock_user.jpg', candidateId: style.id })
    setVtoResult(result)
  }

  return (
    <div className="min-h-screen pb-24 font-ui text-[var(--text-primary)]">
      <GlassNav />

      <main className="max-w-[85rem] mx-auto px-6 pt-12">
        <AnimatePresence mode="wait">

          {/* 1. LANDING SCREEN */}
          {view === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }} className="flex flex-col items-center text-center mt-12 space-y-10">
              <div className="w-full max-w-6xl overflow-hidden aspect-[21/9] relative mb-4 rounded-3xl shadow-elevated">
                <img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&q=80" className="w-full h-full object-cover grayscale-[10%] hover:scale-105 transition-transform duration-[3000ms]" alt="Hair Studio" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h1 className="font-serif text-6xl md:text-8xl text-white font-normal tracking-tight mix-blend-overlay">
                    Hair Intelligence
                  </h1>
                </div>
              </div>
              
              <p className="max-w-2xl text-xl text-[var(--text-muted)] font-light leading-relaxed">
                A rigorous analysis of your hair's characteristics, paired with personalized style recommendations and high-fidelity virtual try-on.
              </p>

              <div className="flex gap-6 pt-4">
                <GlassButton variant="primary" onClick={() => setView('capture')} className="px-10 py-4 text-base">
                  Initiate Analysis
                </GlassButton>
                <GlassButton variant="secondary" onClick={() => {}} className="px-10 py-4 text-base">
                  Explore Lookbook
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* 2. GUIDED CAPTURE */}
          {view === 'capture' && (
            <motion.div key="capture" initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl mx-auto space-y-12 mt-12">
              <div className="text-center space-y-4">
                <h2 className="font-serif text-5xl font-normal">Visual Capture</h2>
                <p className="text-[var(--text-muted)] text-base">Follow the prompts to capture 3 angles for accurate analysis.</p>
              </div>

              <div className="glass-deep rounded-[2rem] p-12 aspect-[3/4] flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000" />
                <div className="text-center space-y-8 relative z-10">
                  <div className="text-xs font-numeric text-[var(--text-muted)] tracking-widest px-4 py-1 glass-soft rounded-full inline-block">
                    STEP 0{captureStep + 1}
                  </div>
                  <h3 className="font-serif text-4xl font-medium text-[var(--text-primary)]">{captureInstructions[captureStep].title}</h3>
                  <p className="text-[var(--text-muted)] text-lg max-w-sm mx-auto">{captureInstructions[captureStep].desc}</p>
                  
                  <div className="pt-8">
                    {captureStep < 2 ? (
                      <GlassButton variant="primary" onClick={() => setCaptureStep(s => s + 1)} className="px-10 py-4">
                        Capture Frame
                      </GlassButton>
                    ) : (
                      <GlassButton variant="primary" onClick={runAnalysis} className="px-10 py-4">
                        Commence Analysis
                      </GlassButton>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                {[0, 1, 2].map(step => (
                  <div key={step} className={`h-[2px] transition-all duration-700 ${step <= captureStep ? 'w-16 bg-[var(--text-primary)]' : 'w-8 bg-color-mix(in_srgb,var(--border-color)_50%,transparent)'}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* 3. ANALYZING LOADING STATE */}
          {view === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10">
              <div className="w-20 h-20 border-[2px] border-transparent border-t-[var(--text-primary)] border-r-[var(--text-primary)] rounded-full animate-spin-slow opacity-80" />
              <h2 className="font-serif text-4xl font-normal text-[var(--text-primary)]">Evaluating Profile</h2>
              <div className="space-y-4 text-left max-w-sm mx-auto text-[var(--text-muted)] text-base glass-soft p-8 rounded-3xl">
                <p className="flex items-center gap-4"><span className="text-xs font-numeric">01</span> Capturing structural data</p>
                <p className="flex items-center gap-4"><span className="text-xs font-numeric">02</span> Determining texture profile</p>
                <p className="flex items-center gap-4 text-[var(--text-primary)]"><span className="text-xs font-numeric">03</span> Generating recommendations</p>
              </div>
            </motion.div>
          )}

          {/* 4. HAIR PROFILE & CARE */}
          {view === 'profile' && profile && (
            <motion.div key="profile" initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="space-y-16 mt-12">
              <div className="flex justify-between items-end border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-8">
                <div>
                  <h1 className="font-serif text-6xl font-normal mb-4">Diagnostic Results</h1>
                  <p className="text-[var(--text-muted)] text-lg">Analysis complete. Below is your structural hair profile.</p>
                </div>
                <GlassButton variant="primary" onClick={() => setView('lookbook')} className="px-8 py-4">
                  View Recommendations
                </GlassButton>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Classification', value: profile.hairType },
                  { label: 'Texture', value: profile.texture },
                  { label: 'Curl Pattern', value: profile.curlPattern },
                  { label: 'Density', value: profile.density }
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-soft p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500" />
                    <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-4 relative z-10">{stat.label}</div>
                    <div className="font-serif text-3xl font-normal text-[var(--text-primary)] relative z-10">{stat.value}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-12 pt-8">
                <div className="glass-deep rounded-[2rem] p-10 space-y-8">
                  <h2 className="font-serif text-4xl font-normal">Care Directives</h2>
                  <div className="space-y-8">
                    <div className="p-8 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl">
                      <div className="font-medium mb-3 text-lg">Moisture & Definition Focus</div>
                      <p className="text-base opacity-90 leading-relaxed">Analysis indicates a wavy pattern with mild structural dehydration. This requires targeted hydration to maintain elasticity.</p>
                    </div>
                    <div>
                      <div className="font-medium text-[var(--text-primary)] mb-4 text-sm uppercase tracking-widest">Actionable Steps:</div>
                      <ul className="space-y-4 text-base text-[var(--text-muted)] border-l-2 border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pl-6">
                        <li>Integrate lightweight, hydrating conditioner</li>
                        <li>Minimize mechanical stress when wet</li>
                        <li>Utilize a defining product for structure</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="glass-frosted rounded-[2rem] p-10 space-y-8">
                  <h2 className="font-serif text-4xl font-normal">Risk Factors</h2>
                  <ul className="space-y-5 text-base text-[var(--text-muted)] border-l-2 border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pl-6">
                    <li>Excessive thermal styling without protective barriers</li>
                    <li>Application of heavy occlusives that disrupt wave patterns</li>
                    <li>Over-cleansing leading to lipid barrier degradation</li>
                  </ul>
                  
                  <div className="mt-12 pt-8 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                    <h3 className="font-medium text-xs uppercase tracking-widest text-[var(--text-primary)] mb-3">Medical Disclaimer</h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      This assessment is cosmetic in nature. For pathological conditions (e.g., unusual shedding, scalp inflammation), consult a certified dermatologist.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 5. HAIRSTYLE LOOKBOOK */}
          {view === 'lookbook' && (
             <motion.div key="lookbook" initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="space-y-16 mt-12">
               <div className="flex justify-between items-end border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-8">
                 <div>
                   <h2 className="font-serif text-5xl font-normal text-[var(--text-primary)]">Recommended Aesthetics</h2>
                   <p className="text-[var(--text-muted)] mt-4 text-lg">Curated based on your structural profile and indicated preferences.</p>
                 </div>
                 <button onClick={() => setView('profile')} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-4">
                   Return to Diagnostic
                 </button>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {recommendedStyles.map((style, idx) => (
                   <motion.div key={style.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="group flex flex-col glass-soft rounded-[2rem] overflow-hidden">
                     <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface)]">
                       <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover grayscale-[10%] transition-transform duration-[2000ms] group-hover:scale-105" />
                       <div className="absolute top-4 right-4 glass-crystal text-[var(--text-primary)] px-4 py-2 text-xs font-numeric font-medium tracking-widest rounded-full">
                         {style.compatibilityScore} MATCH
                       </div>
                       <div className="absolute bottom-4 left-4 bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-2 text-xs uppercase tracking-widest rounded-full">
                         {style.category}
                       </div>
                     </div>
                     <div className="flex-1 flex flex-col p-8">
                       <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)] mb-3">{style.name}</h3>
                       <div className="text-xs text-[var(--text-muted)] mb-4 uppercase tracking-widest">
                         Upkeep: {style.maintenanceLevel}
                       </div>
                       <p className="text-base text-[var(--text-muted)] mb-8 flex-1 leading-relaxed">{style.whyRecommended}</p>
                       <GlassButton variant="primary" onClick={() => runTryOn(style)} className="w-full py-4 text-base">
                         Virtual Try-On
                       </GlassButton>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </motion.div>
          )}

          {/* 6. VIRTUAL TRY ON (VTO) */}
          {view === 'vto' && selectedStyle && (
            <motion.div key="vto" initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="space-y-12 max-w-6xl mx-auto mt-12">
              <div className="flex justify-between items-end border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-8">
                 <h2 className="font-serif text-5xl font-normal">Virtual Render</h2>
                 <button onClick={() => setView('lookbook')} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-4">
                   Close Render
                 </button>
              </div>

              {vtoResult?.status === 'pending' ? (
                <div className="glass-deep rounded-[3rem] p-16 flex flex-col items-center justify-center text-center space-y-10 min-h-[60vh]">
                  <div className="w-16 h-16 border-[2px] border-transparent border-t-[var(--text-primary)] border-r-[var(--text-primary)] rounded-full animate-spin-slow opacity-80" />
                  <div>
                    <h3 className="font-serif text-4xl font-normal mb-4">Generating Synthesis</h3>
                    <p className="text-[var(--text-muted)] text-lg">Applying <span className="text-[var(--text-primary)]">{selectedStyle.name}</span> architecture...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="flex gap-4">
                    <div className="w-1/2 relative glass-soft p-2 rounded-[2rem] overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80" className="w-full aspect-[3/4] object-cover grayscale-[30%] rounded-[1.5rem]" alt="Source" />
                      <div className="absolute top-8 left-8 glass-crystal text-[var(--text-primary)] px-4 py-2 text-xs uppercase tracking-widest rounded-full">Source</div>
                    </div>
                    <div className="w-1/2 relative glass-deep p-2 rounded-[2rem] overflow-hidden">
                      <img src={vtoResult?.resultImageUrl} className="w-full aspect-[3/4] object-cover rounded-[1.5rem]" alt="Render" />
                      <div className="absolute top-8 right-8 bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-2 text-xs uppercase tracking-widest rounded-full">Render</div>
                      <div className="absolute bottom-10 left-0 right-0 text-center">
                         <span className="glass-crystal text-[var(--text-primary)] px-8 py-4 font-serif text-2xl tracking-wide rounded-full shadow-elevated">
                           {selectedStyle.name}
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 pt-8">
                    <div className="glass-soft rounded-[2rem] p-10 space-y-6">
                      <h3 className="font-medium text-[var(--text-primary)] text-sm uppercase tracking-widest mb-2">Adjust Parameters</h3>
                      <div className="flex flex-wrap gap-4">
                        {['Shorter', 'Longer', 'More Volume', 'Tone Shift'].map(opt => (
                          <button key={opt} onClick={() => runTryOn(selectedStyle)} className="text-sm px-6 py-3 glass-frosted text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all rounded-full hover:shadow-subtle">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="glass-deep rounded-[2rem] p-10 flex flex-col justify-center items-start space-y-6">
                      <div>
                        <h3 className="font-medium text-sm mb-3 uppercase tracking-widest">Confirm Aesthetic</h3>
                        <p className="text-base text-[var(--text-muted)] leading-relaxed">Incorporate this hairstyle into your overall ContextMirror profile to evaluate alongside wardrobe selections.</p>
                      </div>
                      <GlassButton variant="primary" onClick={() => router.push('/test-look')} className="px-8 py-4 text-base">
                        Proceed to Context Test
                      </GlassButton>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
