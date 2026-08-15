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
        id: `shop-${Date.now()}`,
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
    <div className="min-h-screen pb-24 text-[var(--text-primary)]">
      {/* Animated Shopping Background */}
      <div className="fixed inset-0 -z-10 bg-[var(--bg-primary)] overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[60%] h-[70%] bg-[var(--accent-gold)] rounded-full blur-[150px] opacity-10 animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[10%] w-[70%] h-[70%] bg-[#b89f89] rounded-full blur-[120px] opacity-[0.15]"></div>
      </div>
      
      <GlassNav />

      <main className="max-w-6xl mx-auto px-6 pt-4">
        <AnimatePresence mode="wait">

          {/* 1. LANDING SCREEN */}
          {view === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center text-center mt-12 space-y-8">
              <div className="w-full max-w-4xl rounded-[3rem] overflow-hidden aspect-[21/9] relative shadow-2xl mb-8">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80" className="w-full h-full object-cover" alt="Shopping Assistant" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center pb-12">
                  <h1 className="font-serif text-5xl md:text-6xl text-white font-normal tracking-tight">Shop Smarter.<br/>Decide with Confidence.</h1>
                </div>
              </div>
              
              <p className="max-w-2xl text-lg text-[var(--text-muted)] font-medium">
                Upload a photo or screenshot of a garment you want to buy. See how it fits your current wardrobe, test it virtually, and get a compatibility score.
              </p>

              <div className="glass-card p-12 rounded-[3rem] w-full max-w-2xl border-2 border-dashed border-[var(--text-muted)] flex flex-col items-center justify-center space-y-6">
                <div className="text-5xl">🛍️</div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl">Upload Garment Image</h3>
                  <p className="text-sm text-[var(--text-muted)]">Drag and drop, or click to browse</p>
                </div>
                <GlassButton variant="primary" onClick={handleUpload} className="px-10 py-4 text-lg">
                  Test This Purchase ✦
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* 2. ANALYZING SCREEN */}
          {view === 'analyzing' && (
             <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
               <div className="w-24 h-24 border-4 border-[var(--text-muted)] border-t-[var(--text-primary)] rounded-full animate-spin"></div>
               <h2 className="font-serif text-4xl font-bold text-[var(--text-primary)]">Evaluating Garment...</h2>
               <div className="space-y-3 text-left max-w-xs mx-auto text-[var(--text-muted)] font-medium">
                 <p className="flex items-center gap-2 text-[var(--text-primary)]"><span>✓</span> Analyzing product category</p>
                 <p className="flex items-center gap-2 text-[var(--text-primary)]"><span>✓</span> Checking your wardrobe</p>
                 <p className="flex items-center gap-2 animate-pulse"><span>●</span> Calculating compatibility score</p>
               </div>
             </motion.div>
          )}

          {/* 3. DECISION SCREEN */}
          {view === 'decision' && shoppingItem && score && (
            <motion.div key="decision" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-8">
               <div className="flex justify-between items-center">
                 <h2 className="font-serif text-4xl font-bold">Purchase Decision</h2>
                 <button onClick={() => setView('landing')} className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]">← Back to Upload</button>
               </div>

               <div className="grid md:grid-cols-2 gap-8">
                 {/* Garment Details */}
                 <div className="glass-card p-6 rounded-[3rem] flex flex-col items-center text-center space-y-6">
                   <div className="w-full aspect-square rounded-[2rem] overflow-hidden">
                     <img src={shoppingItem.imageUrl} alt="Garment" className="w-full h-full object-cover" />
                   </div>
                   <div>
                     <h3 className="font-bold text-2xl">{shoppingItem.color} {shoppingItem.category}</h3>
                     <p className="text-[var(--text-muted)] text-sm uppercase tracking-wider mt-2">{shoppingItem.formality} • {shoppingItem.pattern}</p>
                   </div>
                   <GlassButton variant="primary" onClick={handleVto} className="w-full py-4 text-lg">
                     Virtual Try-On ✦
                   </GlassButton>
                 </div>

                 {/* Score Breakdown */}
                 <div className="space-y-6 flex flex-col justify-center">
                   <div className="glass-card p-8 rounded-[3rem] text-center space-y-4 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--accent-gold)]/10">
                     <h4 className="text-sm uppercase tracking-wider font-bold text-[var(--text-muted)]">Outfit Compatibility Score</h4>
                     <div className="font-numeric text-8xl font-bold text-[var(--text-primary)]">{score.totalScore}</div>
                     <p className="text-[var(--text-muted)] text-sm px-4">{score.explanation}</p>
                   </div>

                   <div className="glass-card p-6 rounded-[2rem] space-y-4">
                     <h4 className="font-bold text-lg mb-4">Breakdown</h4>
                     {[
                       { label: 'Wardrobe Compatibility', val: score.wardrobeCompatibilityScore },
                       { label: 'Occasion Fit', val: score.occasionFitScore },
                       { label: 'Color Harmony', val: score.colorHarmonyScore },
                       { label: 'Style Match', val: score.styleMatchScore },
                     ].map(metric => (
                       <div key={metric.label} className="space-y-1">
                         <div className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
                           <span>{metric.label}</span>
                           <span>{metric.val}/100</span>
                         </div>
                         <div className="h-2 w-full bg-[var(--text-muted)]/20 rounded-full overflow-hidden">
                           <div className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-1000" style={{ width: `${metric.val}%` }}></div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            </motion.div>
          )}

          {/* 4. VIRTUAL TRY ON SCREEN */}
          {view === 'vto' && shoppingItem && (
             <motion.div key="vto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-8">
               <div className="flex justify-between items-center">
                 <h2 className="font-serif text-3xl font-bold">Virtual Try-On</h2>
                 <button onClick={() => setView('decision')} className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]">← Back to Score</button>
               </div>

               {vtoResult?.status === 'pending' ? (
                 <div className="glass-card rounded-[3rem] p-12 aspect-[4/3] flex flex-col items-center justify-center text-center space-y-6">
                   <div className="w-16 h-16 border-4 border-[var(--text-muted)] border-t-[var(--text-primary)] rounded-full animate-spin"></div>
                   <h3 className="font-serif text-2xl font-bold">Creating your look...</h3>
                   <div className="text-[var(--text-muted)] text-sm space-y-2">
                     <p className="animate-pulse">Applying garment using YouCam API...</p>
                   </div>
                 </div>
               ) : (
                 <div className="glass-card rounded-[3rem] p-4 flex flex-col items-center relative overflow-hidden bg-black aspect-[3/4]">
                   <img src={vtoResult?.resultImageUrl} className="w-full h-full object-cover rounded-[2.5rem]" alt="Try On Result" />
                   <div className="absolute top-6 left-6 flex gap-2">
                     <div className="glass-pill bg-white/90 text-black px-4 py-2 font-bold text-sm shadow-xl">
                       Virtual Result
                     </div>
                   </div>
                   <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center glass-pill px-6 py-4 shadow-2xl backdrop-blur-xl">
                     <div className="text-left">
                       <h4 className="font-bold text-lg">{shoppingItem.color} {shoppingItem.category}</h4>
                       <p className="text-xs opacity-80">Fits great with your current wardrobe!</p>
                     </div>
                     <button onClick={() => router.push('/test-look')} className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
                       Take to Test My Look →
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
