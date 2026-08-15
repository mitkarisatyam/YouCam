'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { evaluatePurchase } from '@/lib/shoppingEngine'
import { logTestPurchase } from '@/lib/memory'
import { providers } from '@/lib/providers'
import type { ShoppingItem, PurchaseDecisionScore } from '@/types'
import type { VTOResult } from '@/lib/providers/apparel'
import { useRouter } from 'next/navigation'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

type ViewState = 'landing' | 'analyzing' | 'decision' | 'vto'

export default function ShoppingAssistantPage() {
  const router = useRouter()
  const [view, setView] = useState<ViewState>('landing')
  
  const [shoppingItem, setShoppingItem] = useState<ShoppingItem | null>(null)
  const [score, setScore] = useState<PurchaseDecisionScore | null>(null)
  const [vtoResult, setVtoResult] = useState<VTOResult | null>(null)

  const handleUpload = () => {
    setView('analyzing')
    
    setTimeout(() => {
      // Mock analyzing an uploaded garment
      const item: ShoppingItem = {
        id: \`shop-\${Date.now()}\`,
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
        category: 'Outerwear',
        color: 'Brown',
        pattern: 'Solid',
        styleTags: ['Casual', 'Smart Casual'],
        formality: 'casual'
      }
      setShoppingItem(item)
      
      const evalScore = evaluatePurchase(item)
      setScore(evalScore)
      
      logTestPurchase({
        item,
        score: evalScore
      })
      
      setView('decision')
    }, 3000)
  }

  const handleVto = async () => {
    if (!shoppingItem) return
    setView('vto')
    setVtoResult({ originalImage: '', resultImageUrl: '', status: 'pending' })
    
    try {
      const res = await providers.apparel.generate({
        userImage: 'mock_user_selfie.jpg',
        garmentImage: shoppingItem.imageUrl,
        category: 'outerwear'
      })
      setVtoResult(res)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen pb-24 font-ui text-[var(--text-primary)]">
      <GlassNav />

      <main className="max-w-[85rem] mx-auto px-6 pt-12">
        <AnimatePresence mode="wait">

          {/* 1. LANDING SCREEN */}
          {view === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center text-center mt-4 space-y-12">
              <div className="w-full max-w-6xl overflow-hidden aspect-[21/9] relative rounded-[3rem] shadow-elevated group">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80" className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-[3000ms]" alt="Shopping Assistant" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[color-mix(in_srgb,var(--bg-primary)_40%,transparent)] to-transparent flex items-end justify-center pb-16">
                  <h1 className="font-serif text-6xl md:text-8xl text-[var(--text-primary)] font-normal tracking-tight">Purchase Evaluation.</h1>
                </div>
              </div>
              
              <p className="max-w-3xl text-xl text-[var(--text-muted)] font-light leading-relaxed">
                Ingest a reference image of a prospective garment. Evaluate compatibility with existing inventory, visualize via VTO, and generate a definitive acquisition score.
              </p>

              <div className="glass-deep rounded-[3rem] p-16 w-full max-w-4xl border-[2px] border-dashed border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] hover:border-[var(--text-primary)] transition-all duration-500 flex flex-col items-center justify-center space-y-8 group cursor-pointer relative overflow-hidden" onClick={handleUpload}>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02] group-hover:translate-y-full transition-transform duration-[2000ms] ease-in-out" />
                <div className="text-6xl text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:-translate-y-2 transition-all duration-500 font-serif font-light relative z-10">↑</div>
                <div className="space-y-4 relative z-10">
                  <h3 className="font-medium text-2xl uppercase tracking-widest text-[var(--text-primary)]">Ingest Reference Material</h3>
                  <p className="text-base text-[var(--text-muted)]">Select or drag image to initialize evaluation.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. ANALYZING SCREEN */}
          {view === 'analyzing' && (
             <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12 glass-deep rounded-[3rem] p-16 max-w-3xl mx-auto shadow-elevated">
               <div className="w-20 h-20 border-[2px] border-transparent border-t-[var(--text-primary)] border-r-[var(--text-primary)] rounded-full animate-spin-slow opacity-80" />
               <h2 className="font-serif text-5xl font-normal text-[var(--text-primary)]">Executing Evaluation</h2>
               <div className="space-y-6 text-left max-w-sm mx-auto text-[var(--text-muted)] text-sm uppercase tracking-widest font-medium glass-soft p-8 rounded-[2rem] w-full">
                 <p className="flex items-center justify-between"><span>Categorizing Garment</span> <span className="text-[var(--text-primary)] font-numeric">100%</span></p>
                 <p className="flex items-center justify-between"><span>Scanning Inventory</span> <span className="text-[var(--text-primary)] font-numeric">100%</span></p>
                 <p className="flex items-center justify-between text-[var(--text-primary)] animate-pulse"><span>Computing Matrix</span> <span className="font-numeric">Wait...</span></p>
               </div>
             </motion.div>
          )}

          {/* 3. DECISION SCREEN */}
          {view === 'decision' && shoppingItem && score && (
            <motion.div key="decision" initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="space-y-12 max-w-6xl mx-auto mt-8">
               <div className="flex justify-between items-center border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-8">
                 <h2 className="font-serif text-5xl font-normal">Acquisition Matrix</h2>
                 <button onClick={() => setView('landing')} className="text-sm uppercase tracking-widest font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-4 transition-colors">Cancel</button>
               </div>

               <div className="grid md:grid-cols-2 gap-12">
                 {/* Garment Details */}
                 <div className="glass-deep p-10 rounded-[3rem] flex flex-col space-y-10 group overflow-hidden">
                   <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden glass-soft p-2">
                     <img src={shoppingItem.imageUrl} alt="Garment" className="w-full h-full object-cover rounded-[1.5rem] group-hover:scale-[1.03] transition-transform duration-[2000ms]" />
                   </div>
                   <div className="border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-6">
                     <h3 className="font-serif text-4xl font-normal mb-3">{shoppingItem.color} {shoppingItem.category}</h3>
                     <p className="text-[var(--text-muted)] text-sm uppercase tracking-widest font-medium glass-soft px-4 py-2 inline-block rounded-full">{shoppingItem.formality} · {shoppingItem.pattern}</p>
                   </div>
                   <GlassButton variant="primary" onClick={handleVto} className="w-full py-5 text-base shadow-elevated">
                     Execute Virtual Try-On
                   </GlassButton>
                 </div>

                 {/* Score Breakdown */}
                 <div className="space-y-8 flex flex-col justify-center">
                   <div className="glass-soft p-12 rounded-[3rem] text-center space-y-8 relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000" />
                     <h4 className="text-xs uppercase tracking-widest font-medium text-[var(--text-muted)] relative z-10 glass-crystal px-4 py-2 inline-block rounded-full">Definitive Score</h4>
                     <div className="font-numeric text-9xl font-light text-[var(--text-primary)] tracking-tighter relative z-10">{score.totalScore}</div>
                     <p className="text-[var(--text-muted)] text-base leading-relaxed max-w-md mx-auto relative z-10">{score.explanation}</p>
                   </div>

                   <div className="glass-frosted p-12 rounded-[3rem] space-y-10">
                     <h4 className="font-medium text-sm uppercase tracking-widest border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-4">Metrics Breakdown</h4>
                     <div className="space-y-8">
                       {[
                         { label: 'Inventory Integration', val: score.wardrobeCompatibilityScore },
                         { label: 'Occasion Viability', val: score.occasionFitScore },
                         { label: 'Color Theory Harmony', val: score.colorHarmonyScore },
                         { label: 'Aesthetic Alignment', val: score.styleMatchScore },
                       ].map((metric, idx) => (
                         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={metric.label} className="space-y-4">
                           <div className="flex justify-between text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">
                             <span>{metric.label}</span>
                             <span className="text-[var(--text-primary)] font-numeric">{metric.val}/100</span>
                           </div>
                           <div className="h-2 w-full glass-deep rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: \`\${metric.val}%\` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-[var(--text-primary)]"></motion.div>
                           </div>
                         </motion.div>
                       ))}
                     </div>
                   </div>
                 </div>
               </div>
            </motion.div>
          )}

          {/* 4. VIRTUAL TRY ON SCREEN */}
          {view === 'vto' && shoppingItem && (
             <motion.div key="vto" initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-5xl mx-auto space-y-12 mt-8">
               <div className="flex justify-between items-center border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-8">
                 <h2 className="font-serif text-5xl font-normal">Visualization Result</h2>
                 <button onClick={() => setView('decision')} className="text-sm uppercase tracking-widest font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-4 transition-colors">Return</button>
               </div>

               {vtoResult?.status === 'pending' ? (
                 <div className="glass-deep rounded-[3rem] p-24 aspect-[4/3] flex flex-col items-center justify-center text-center space-y-10 shadow-elevated">
                   <div className="w-20 h-20 border-[2px] border-transparent border-t-[var(--text-primary)] border-r-[var(--text-primary)] rounded-full animate-spin-slow opacity-80" />
                   <h3 className="font-serif text-4xl font-normal">Processing Virtual Model</h3>
                   <div className="text-[var(--text-muted)] text-sm uppercase tracking-widest font-medium glass-soft px-6 py-3 rounded-full">
                     <p className="animate-pulse">Interfacing with Visualization API</p>
                   </div>
                 </div>
               ) : (
                 <div className="glass-soft p-4 rounded-[3rem] flex flex-col items-center relative overflow-hidden shadow-elevated aspect-[4/5] max-w-3xl mx-auto">
                   <img src={vtoResult?.resultImageUrl} className="w-full h-full object-cover rounded-[2.5rem]" alt="Try On Result" />
                   <div className="absolute top-12 left-12">
                     <div className="glass-crystal text-[var(--text-primary)] px-6 py-3 text-xs uppercase tracking-widest font-medium rounded-full shadow-subtle">
                       VTO Output
                     </div>
                   </div>
                   <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center glass-crystal p-8 rounded-[2rem] shadow-elevated backdrop-blur-xl">
                     <div className="text-left text-[var(--text-primary)]">
                       <h4 className="font-serif text-3xl font-normal mb-2">{shoppingItem.color} {shoppingItem.category}</h4>
                       <p className="text-[10px] uppercase tracking-widest opacity-80 font-medium">Verified Context Integration</p>
                     </div>
                     <button onClick={() => router.push('/test-look')} className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-10 py-5 text-sm uppercase tracking-widest font-medium transition-transform hover:scale-105 rounded-full shadow-subtle">
                       Proceed to Evaluation
                     </button>
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
