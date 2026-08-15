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
    { title: '01 Front', desc: 'Look straight at the camera.' },
    { title: '02 Right', desc: 'Slowly turn your head right.' },
    { title: '03 Left', desc: 'Slowly turn your head left.' }
  ]

  useEffect(() => {
    setPreferences(getHairPreferences())
  }, [])

  async function runAnalysis() {
    setView('analyzing')
    // Mock API Call
    const result = await hairAnalyzer.analyze({ frontImage: 'mock' })
    setProfile(result)
    logHairAnalysis(result)
    
    // Generate Recommendations
    if (preferences) {
      setRecommendedStyles(recommendHairstyles(result, preferences))
    }
    
    setView('profile')
  }

  async function runTryOn(style: HairstyleCandidate) {
    setSelectedStyle(style)
    setView('vto')
    setVtoResult({ candidateId: style.id, originalImageUrl: '', resultImageUrl: '', status: 'pending' }) // Reset
    
    const result = await hairstyleTryOn.generate({ userImage: 'mock_user.jpg', candidateId: style.id })
    setVtoResult(result)
  }

  return (
    <div className="min-h-screen pb-24 text-[var(--text-primary)]">
      {/* Animated Hair/Fabric Background */}
      <div className="fixed inset-0 -z-10 bg-[var(--bg-primary)] overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[60%] h-[70%] bg-[var(--accent-gold)] rounded-full blur-[120px] opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#b89f89] rounded-full blur-[100px] opacity-10"></div>
        {/* Subtle curved lines simulating hair strands */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,500 C200,200 400,800 1200,300" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M-100,600 C300,100 500,900 1200,400" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
      
      <GlassNav />

      <main className="max-w-6xl mx-auto px-6 pt-4">
        <AnimatePresence mode="wait">

          {/* 1. LANDING SCREEN */}
          {view === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center text-center mt-12 space-y-8">
              <div className="w-full max-w-4xl rounded-[3rem] overflow-hidden aspect-[21/9] relative shadow-2xl mb-8">
                <img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&q=80" className="w-full h-full object-cover" alt="Hair Studio" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-12">
                  <h1 className="font-serif text-5xl md:text-6xl text-white font-normal tracking-tight">Understand your hair.<br/>Find your style.</h1>
                </div>
              </div>
              
              <p className="max-w-2xl text-lg text-[var(--text-muted)] font-medium">
                Analyze your hair characteristics, explore care guidance, discover hairstyles, and preview them on yourself.
              </p>

              <div className="flex gap-4 pt-4">
                <GlassButton variant="primary" onClick={() => setView('capture')} className="px-10 py-4 text-lg">
                  Analyze My Hair ✦
                </GlassButton>
                <GlassButton variant="secondary" onClick={() => { /* Skip to lookbook if profile exists */ }} className="px-8 py-4 text-lg">
                  Explore Hairstyles
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* 2. GUIDED CAPTURE */}
          {view === 'capture' && (
            <motion.div key="capture" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="font-serif text-3xl font-bold">Guided Hair Capture</h2>
                <p className="text-[var(--text-muted)] text-sm">Follow the prompts to capture 3 angles for accurate analysis.</p>
              </div>

              <div className="glass-card rounded-[3rem] p-8 aspect-[3/4] flex flex-col items-center justify-center relative overflow-hidden border border-[var(--text-muted)]">
                {/* Mock Camera Viewfinder */}
                <div className="absolute inset-8 border-2 border-dashed border-[var(--text-muted)] rounded-full opacity-30 animate-spin-slow"></div>
                <div className="absolute inset-0 bg-black/5 z-0"></div>
                
                <div className="relative z-10 text-center space-y-6">
                  <div className="text-6xl mb-4 text-[var(--text-primary)]">📸</div>
                  <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">{captureInstructions[captureStep].title}</h3>
                  <p className="text-[var(--text-muted)] font-medium">{captureInstructions[captureStep].desc}</p>
                  
                  {captureStep < 2 ? (
                    <GlassButton variant="primary" onClick={() => setCaptureStep(s => s + 1)} className="px-8 mt-8">
                      Capture
                    </GlassButton>
                  ) : (
                    <GlassButton variant="primary" onClick={runAnalysis} className="px-8 mt-8">
                      Start Hair Analysis ✦
                    </GlassButton>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map(step => (
                  <div key={step} className={`h-2 rounded-full transition-all duration-500 ${step <= captureStep ? 'w-8 bg-[var(--text-primary)]' : 'w-2 bg-[var(--text-muted)] opacity-30'}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* 3. ANALYZING LOADING STATE */}
          {view === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
              <div className="w-24 h-24 border-4 border-[var(--text-muted)] border-t-[var(--text-primary)] rounded-full animate-spin"></div>
              <h2 className="font-serif text-4xl font-bold text-[var(--text-primary)]">Reading your hair ✨</h2>
              <div className="space-y-3 text-left max-w-xs mx-auto text-[var(--text-muted)] font-medium">
                <p className="flex items-center gap-2"><span>✓</span> Capturing views</p>
                <p className="flex items-center gap-2"><span>✓</span> Understanding hair type</p>
                <p className="flex items-center gap-2 animate-pulse text-[var(--text-primary)]"><span>●</span> Building your profile</p>
                <p className="flex items-center gap-2 opacity-50"><span>○</span> Finding suitable styles</p>
              </div>
            </motion.div>
          )}

          {/* 4. HAIR PROFILE & CARE */}
          {view === 'profile' && profile && (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="font-serif text-5xl font-bold mb-2">Your Hair Profile</h1>
                  <p className="text-[var(--text-muted)] font-medium text-lg">Analysis complete. Here is what we found.</p>
                </div>
                <GlassButton variant="primary" onClick={() => setView('lookbook')} className="px-8 py-3">
                  View Recommended Hairstyles →
                </GlassButton>
              </div>

              {/* Top Signals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Hair Type', value: profile.hairType },
                  { label: 'Texture', value: profile.texture },
                  { label: 'Curl Pattern', value: profile.curlPattern },
                  { label: 'Density', value: profile.density }
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-6 rounded-[2rem] text-center">
                    <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{stat.label}</div>
                    <div className="font-serif text-2xl font-bold text-[var(--text-primary)]">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Care Guidance */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="glass-card p-8 rounded-[3rem] space-y-6">
                  <h2 className="font-serif text-3xl font-bold">What your hair may need</h2>
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)]">
                      <div className="font-bold mb-1">Moisture & Definition</div>
                      <p className="text-sm opacity-90">The analysis indicates a wavy hair pattern with visible mild dryness. Common factors include environment and styling habits.</p>
                    </div>
                    <div>
                      <div className="font-bold text-[var(--text-primary)] mb-2">What you can do:</div>
                      <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                        <li>• Use lightweight, hydrating conditioner</li>
                        <li>• Avoid excessive brushing when hair is wet</li>
                        <li>• Scrunch in a wave-defining product</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 rounded-[3rem] space-y-6">
                  <h2 className="font-serif text-3xl font-bold">Things to Be Careful With</h2>
                  <ul className="space-y-3 text-sm text-[var(--text-muted)]">
                    <li className="flex gap-3"><span className="text-xl">⚠️</span> Excessive heat styling without protection</li>
                    <li className="flex gap-3"><span className="text-xl">⚠️</span> Heavy oils that may weigh down waves</li>
                    <li className="flex gap-3"><span className="text-xl">⚠️</span> Over-washing, which can strip natural moisture</li>
                  </ul>
                  
                  <div className="mt-8 pt-6 border-t border-[var(--text-muted)]/20">
                    <h3 className="font-bold text-sm text-[var(--text-primary)] mb-2">When to Get Professional Advice</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      This AI analysis is not a medical diagnosis. A qualified dermatologist or professional stylist can assess persistent concerns like scalp irritation or unusual shedding.
                    </p>
                  </div>
                </div>
              </div>

              {/* Curated Product Categories */}
              <div>
                <h2 className="font-serif text-3xl font-bold mb-6">Hair Care Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { cat: 'Lightweight Conditioner', reason: 'To hydrate without weighing down loose waves.' },
                    { cat: 'Wave-Defining Mousse', reason: 'Enhances curl pattern and reduces frizz.' },
                    { cat: 'Clarifying Shampoo', reason: 'Use occasionally to prevent product buildup.' }
                  ].map((p, i) => (
                     <div key={i} className="glass-card p-6 rounded-[2rem]">
                       <div className="font-bold text-[var(--text-primary)] mb-2">{p.cat}</div>
                       <div className="text-xs text-[var(--text-muted)]">{p.reason}</div>
                     </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 5. HAIRSTYLE LOOKBOOK */}
          {view === 'lookbook' && (
             <motion.div key="lookbook" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-8">
               <div className="flex justify-between items-center mb-8">
                 <div>
                   <h2 className="font-serif text-4xl font-bold text-[var(--text-primary)]">Which Hairstyles Could Suit You?</h2>
                   <p className="text-[var(--text-muted)] mt-2">Tailored to your {profile?.hairType?.toLowerCase()} hair and style preferences.</p>
                 </div>
                 <button onClick={() => setView('profile')} className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]">← Back to Profile</button>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {recommendedStyles.map((style, idx) => (
                   <div key={style.id} className="glass-card rounded-[2rem] overflow-hidden group flex flex-col">
                     <div className="relative aspect-[4/5] overflow-hidden">
                       <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                       <div className="absolute top-4 right-4 bg-[var(--bg-primary)]/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                         <span className="font-numeric font-bold text-[var(--text-primary)]">{style.compatibilityScore}</span>
                         <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Match</span>
                       </div>
                       <div className="absolute bottom-4 left-4 bg-[var(--bg-primary)]/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                         {style.category}
                       </div>
                     </div>
                     <div className="p-6 flex-1 flex flex-col">
                       <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)] mb-2">{style.name}</h3>
                       <div className="text-xs text-[var(--text-muted)] mb-4 flex gap-2">
                         <span className="uppercase font-bold tracking-wider">Maint: {style.maintenanceLevel}</span>
                       </div>
                       <p className="text-sm text-[var(--text-muted)] mb-6 flex-1">{style.whyRecommended}</p>
                       <GlassButton variant="primary" onClick={() => runTryOn(style)} className="w-full py-3">
                         Try This Hairstyle ✦
                       </GlassButton>
                     </div>
                   </div>
                 ))}
               </div>
             </motion.div>
          )}

          {/* 6. VIRTUAL TRY ON (VTO) */}
          {view === 'vto' && selectedStyle && (
            <motion.div key="vto" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-8 max-w-4xl mx-auto">
              <div className="flex justify-between items-center">
                 <h2 className="font-serif text-3xl font-bold">Virtual Try-On</h2>
                 <button onClick={() => setView('lookbook')} className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕ Close</button>
              </div>

              {vtoResult?.status === 'pending' ? (
                <div className="glass-card rounded-[3rem] p-12 aspect-[4/3] flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 border-4 border-[var(--text-muted)] border-t-[var(--text-primary)] rounded-full animate-spin"></div>
                  <h3 className="font-serif text-2xl font-bold">Creating your new look...</h3>
                  <div className="text-[var(--text-muted)] text-sm space-y-2">
                    <p className="animate-pulse">Applying hairstyle: {selectedStyle.name}</p>
                    <p>Refining the result</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Before/After Slider Mock */}
                  <div className="glass-card rounded-[3rem] p-4 flex gap-4 aspect-[21/9]">
                    <div className="w-1/2 relative rounded-[2.5rem] overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80" className="w-full h-full object-cover filter grayscale opacity-80" alt="Before" />
                      <div className="absolute top-4 left-4 glass-pill px-3 py-1 text-xs font-bold shadow-sm">Before</div>
                    </div>
                    <div className="w-1/2 relative rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white">
                      <img src={vtoResult?.resultImageUrl} className="w-full h-full object-cover" alt="After" />
                      <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-xs font-bold shadow-md">After</div>
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                         <span className="glass-pill px-4 py-2 font-serif text-lg shadow-lg backdrop-blur-xl">
                           {selectedStyle.name}
                         </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Connection */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-[2rem] space-y-4">
                      <h3 className="font-bold text-[var(--text-primary)]">Change One Thing</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Shorter', 'Longer', 'More Volume', 'Different Color'].map(opt => (
                          <button key={opt} onClick={() => runTryOn(selectedStyle)} className="text-xs px-4 py-2 rounded-full border border-[var(--text-muted)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors">
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center items-center text-center space-y-4 bg-[var(--text-primary)] text-[var(--bg-primary)]">
                      <div>
                        <h3 className="font-bold mb-1">Love this look?</h3>
                        <p className="text-xs opacity-80">Take it to Test My Look to see how it pairs with your wardrobe.</p>
                      </div>
                      <button onClick={() => router.push('/test-look')} className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-bold py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
                        Use This Hairstyle in My Look ✦
                      </button>
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
