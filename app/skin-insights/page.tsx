'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { UploadZone } from '@/components/ui/UploadZone'
import { CinematicAtmosphere } from '@/components/ui/CinematicAtmosphere'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { getSkinProvider, isDemoMode } from '@/lib/youcam'
import type { SkinResult } from '@/lib/youcam/types'
import { useRouter } from 'next/navigation'

type ViewState = 'landing' | 'uploading' | 'analyzing' | 'results'

export default function SkinInsightsPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewState>('landing')
  
  // Capture State
  const [selfiePreview, setSelfiePreview] = useState<string>('')
  const [stagedFile, setStagedFile] = useState<File | null>(null)
  
  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<SkinResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleFileSelect(file: File) {
    // Basic validation for non-face images in demo mode via size hashing could go here
    const url = URL.createObjectURL(file)
    setSelfiePreview(url)
    setStagedFile(file)
  }

  async function runAnalysis() {
    if (!stagedFile) return
    setErrorMsg('')
    setView('analyzing')
    
    try {
      const provider = getSkinProvider()
      const result = await provider.analyze(stagedFile)
      
      if (result.status === 'failed') {
        throw new Error(result.error || 'Analysis failed to process.')
      }
      
      setAnalysisResult(result)
      setView('results')
    } catch (e: any) {
      setErrorMsg(e.message || 'Please upload a clear photo showing one face.')
      setView('landing')
    }
  }

  return (
    <div className="min-h-screen pb-32 font-ui text-[var(--text-primary)] relative">
      <GlassNav />
      {/* Background specific to Skin Lab (pearl, soft champagne, liquid motion) */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-60">
        <CinematicAtmosphere />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(255,220,200,0.03)] to-[rgba(200,180,255,0.02)] mix-blend-overlay" />
      </div>

      <main className="max-w-[90rem] mx-auto px-6 pt-16 md:pt-24 space-y-24">
        <AnimatePresence mode="wait">

          {/* 1. HERO & UPLOAD SECTION */}
          {(view === 'landing' || view === 'uploading') && (
            <motion.section 
              key="landing" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} 
              className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]"
            >
              <div className="space-y-8 z-10">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <span className="premium-badge">✨ Beauty Laboratory</span>
                  <h1 className="font-serif text-5xl lg:text-7xl font-normal leading-[1.05] tracking-tight">
                    Understand your skin.<br/>
                    <span className="italic text-[var(--text-muted)] text-3xl lg:text-5xl block mt-4">See what your skin analysis can tell you.</span>
                  </h1>
                </motion.div>
                
                {isDemoMode() && (
                  <div className="inline-block glass-crystal px-4 py-2 rounded-full border border-orange-500/20 text-orange-400/80 text-xs tracking-widest uppercase">
                    Demo Mode — Sample analysis preview
                  </div>
                )}
                
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pt-4">
                  {!stagedFile ? (
                     <div className="glass-deep rounded-[3rem] p-8 max-w-md">
                       <UploadZone
                         label="Portrait Upload"
                         sublabel="Upload a clear face photo"
                         currentPreview={selfiePreview}
                         loading={false}
                         onFileSelect={handleFileSelect}
                       />
                       {errorMsg && <p className="text-red-400 text-sm mt-4 text-center">{errorMsg}</p>}
                     </div>
                  ) : (
                    <div className="glass-deep rounded-[3rem] p-8 max-w-md space-y-6 text-center">
                       <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border border-[var(--border-color)]">
                         <img src={selfiePreview} alt="Preview" className="w-full h-full object-cover" />
                       </div>
                       <GlassButton variant="primary" onClick={runAnalysis} className="w-full py-4 text-lg">
                         Analyze My Skin ✦
                       </GlassButton>
                       <button onClick={() => setStagedFile(null)} className="text-sm text-[var(--text-muted)] underline underline-offset-4">
                         Choose different photo
                       </button>
                    </div>
                  )}
                </motion.div>
              </div>

              <motion.div 
                initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group w-full max-w-md lg:max-w-full mx-auto"
              >
                <img src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=1200&q=80" alt="Skincare Laboratory" className="w-full h-full object-cover grayscale-[20%] group-hover:scale-[1.03] transition-transform duration-[3000ms]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/80 via-transparent to-transparent pointer-events-none" />
              </motion.div>
            </motion.section>
          )}

          {/* 2. ANALYZING LOADING STATE */}
          {view === 'analyzing' && (
            <motion.section 
              key="analyzing" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12"
            >
              <div className="relative">
                <div className="w-40 h-40 absolute inset-0 bg-[var(--text-primary)] opacity-5 rounded-full blur-2xl animate-pulse" />
                <svg className="w-32 h-32 text-[var(--text-primary)] animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <circle cx="50" cy="50" r="45" strokeDasharray="100 40" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="35" strokeDasharray="40 20" strokeLinecap="round" strokeOpacity="0.5" className="origin-center animate-[spin_4s_linear_reverse_infinite]" />
                  <circle cx="50" cy="50" r="25" strokeDasharray="20 10" strokeLinecap="round" strokeOpacity="0.3" className="origin-center animate-[spin_2s_linear_infinite]" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-16 h-16 rounded-full overflow-hidden opacity-50 animate-pulse">
                     <img src={selfiePreview} className="w-full h-full object-cover grayscale" alt="scanning" />
                   </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="font-serif text-4xl font-normal text-[var(--text-primary)] tracking-widest uppercase">Biometric Scan</h2>
                <p className="text-[var(--text-muted)] text-lg">Evaluating hydration, clarity, and texture.</p>
              </div>
            </motion.section>
          )}

          {/* 3. RESULTS DISPLAY */}
          {view === 'results' && analysisResult && (
            <motion.section key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-32">
              
              {/* SECTION: YOUR ANALYSIS */}
              <div className="grid md:grid-cols-2 gap-16 items-start">
                <div className="sticky top-32 space-y-8">
                  <div className="aspect-[4/5] relative rounded-[2rem] overflow-hidden shadow-2xl group">
                    <img src={selfiePreview} alt="Your Face" className="w-full h-full object-cover" />
                    {/* Simulated scanning lines for effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--text-primary)]/10 to-transparent h-[10%] animate-[scan_4s_ease-in-out_infinite]" />
                  </div>
                  {isDemoMode() && (
                    <p className="text-xs text-center text-[var(--text-muted)] italic">
                      Demo Analysis: Sample values for demonstration only.
                    </p>
                  )}
                </div>
                
                <div className="space-y-16">
                  <div className="space-y-6">
                    <span className="premium-badge">Analysis Complete</span>
                    <h1 className="font-serif text-5xl md:text-6xl font-normal">What We Noticed</h1>
                    <p className="text-xl text-[var(--text-muted)] leading-relaxed">
                      {analysisResult.signals.textureNotes}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: 'Overall Clarity', value: analysisResult.signals.clarityScore + '/100' },
                      { label: 'Hydration', value: analysisResult.signals.hydrationLevel },
                      { label: 'Undertone', value: analysisResult.signals.undertone }
                    ].map((stat, i) => (
                      <div key={i} className="glass-soft p-6 rounded-3xl">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">{stat.label}</div>
                        <div className="font-serif text-3xl capitalize text-[var(--text-primary)]">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* SECTION: MEANING & ACTIONS */}
                  <div className="space-y-8">
                    <h2 className="font-serif text-4xl border-b border-[var(--border-color)] pb-4">Concerns & Contributors</h2>
                    {analysisResult.signals.concerns.map(c => (
                      <div key={c.id} className="glass-deep p-8 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center">
                           <h4 className="font-medium text-xl">{c.name}</h4>
                           <span className={`text-xs uppercase tracking-widest px-3 py-1 rounded-full border ${c.level === 'high' ? 'border-orange-500/30 text-orange-500 bg-orange-500/5' : 'border-[var(--border-strong)] text-[var(--text-muted)]'}`}>
                             {c.level} level
                           </span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                          <strong>What it can mean:</strong> {c.meaning}
                        </p>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                          <strong>What you can do:</strong> Focus on maintaining a consistent cleansing routine and use barrier-supporting products.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION: ROUTINE & PRODUCTS */}
              <ScrollReveal>
                <div className="grid md:grid-cols-2 gap-16 items-start border-t border-[var(--border-color)] pt-24">
                  <div className="space-y-10">
                    <h2 className="font-serif text-5xl">Your Routine 🧴</h2>
                    <p className="text-[var(--text-muted)]">A simple, effective structure to support your skin's architecture.</p>
                    
                    <div className="space-y-6">
                      {[
                        { title: 'Morning', desc: 'Gentle cleanse, antioxidant serum, moisturizer, and broad-spectrum SPF 30+.' },
                        { title: 'Evening', desc: 'Double cleanse to remove SPF/makeup, targeted treatment (if needed), and nourishing moisturizer.' },
                        { title: 'Weekly', desc: 'Gentle exfoliation 1-2 times a week to support cell turnover without compromising the barrier.' }
                      ].map((step, i) => (
                        <div key={i} className="glass-soft p-8 rounded-[2rem] relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--text-primary)] opacity-50" />
                          <h4 className="font-medium text-xl mb-3">{step.title}</h4>
                          <p className="text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-10">
                    <h2 className="font-serif text-5xl">Product Categories</h2>
                    <p className="text-[var(--text-muted)]">Ingredients and formulas to look for based on your scan.</p>
                    
                    <div className="grid gap-6">
                      {[
                        { name: 'Hydrating Cleanser', purpose: 'To cleanse without stripping natural oils.' },
                        { name: 'Barrier Repair Cream', purpose: 'To address hydration levels and support skin health.' },
                        { name: 'Mineral Sunscreen', purpose: 'Daily protection essential for all routines.' }
                      ].map((prod, i) => (
                        <div key={i} className="glass-deep p-6 rounded-2xl flex flex-col justify-center">
                          <span className="font-medium mb-1 text-lg">{prod.name}</span>
                          <span className="text-sm text-[var(--text-muted)]">{prod.purpose}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 p-6 border border-orange-500/20 bg-orange-500/5 rounded-2xl">
                      <h4 className="text-orange-400/80 font-medium text-sm tracking-widest uppercase mb-2 flex items-center gap-2">
                        <span>👩‍⚕️</span> Professional Advice
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        This AI scan is an educational tool, not a medical diagnosis. If you experience painful breakouts, severe redness, or changing moles, please consult a board-certified dermatologist.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

            </motion.section>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
