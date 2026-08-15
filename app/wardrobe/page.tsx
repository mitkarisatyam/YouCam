'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { getWardrobe, addMultipleItems, toggleFavoriteItem, getRediscoveries } from '@/lib/memory'
import { generateWardrobeOutfits } from '@/lib/wardrobeEngine'
import { UploadZone } from '@/components/ui/UploadZone'
import type { WardrobeItem, LookCandidate } from '@/types'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Traditional', 'One-Piece', 'Footwear', 'Accessories']

export default function WardrobePage() {
  const router = useRouter()
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([])
  const [rediscoveries, setRediscoveries] = useState<WardrobeItem[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [view, setView] = useState<'grid' | 'upload' | 'generate'>('grid')
  
  // Upload State
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Generate State
  const [occasion, setOccasion] = useState('Office')
  const [weather, setWeather] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedOutfits, setGeneratedOutfits] = useState<LookCandidate[]>([])

  useEffect(() => {
    setWardrobe(getWardrobe())
    setRediscoveries(getRediscoveries())
  }, [view])

  const filteredWardrobe = activeCategory === 'All' 
    ? wardrobe 
    : wardrobe.filter(i => {
        if (activeCategory === 'Tops') return ['tops', 'clothing'].includes(i.category) && !i.subcategory.includes('pant')
        if (activeCategory === 'Bottoms') return ['bottoms', 'clothing'].includes(i.category) && i.subcategory.includes('pant')
        if (activeCategory === 'Outerwear') return i.category === 'outerwear'
        if (activeCategory === 'Traditional') return i.category === 'traditional'
        if (activeCategory === 'One-Piece') return i.category === 'one-piece'
        if (activeCategory === 'Footwear') return i.category === 'footwear'
        if (activeCategory === 'Accessories') return ['accessories', 'jewelry', 'bag'].includes(i.category)
        return true
      })

  const stats = {
    total: wardrobe.length,
    tops: wardrobe.filter(i => ['tops', 'clothing'].includes(i.category) && !i.subcategory.includes('pant')).length,
    bottoms: wardrobe.filter(i => ['bottoms', 'clothing'].includes(i.category) && i.subcategory.includes('pant')).length,
    shoes: wardrobe.filter(i => i.category === 'footwear').length,
    outerwear: wardrobe.filter(i => i.category === 'outerwear').length,
  }

  // --- Upload Flow ---
  function handleMultiUpload(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files)
    setUploadFiles(prev => [...prev, ...newFiles])
    setUploadPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))])
  }

  function commitUploads() {
    setIsUploading(true)
    setTimeout(() => {
      const newItems: WardrobeItem[] = uploadFiles.map((file, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        name: `New Item ${idx + 1}`,
        category: 'clothing',
        subcategory: 'Unknown',
        color: 'Unknown',
        pattern: 'solid',
        fabric: 'Unknown',
        season: ['spring', 'summer', 'fall', 'winter'],
        formality: 'casual',
        imageUrl: uploadPreviews[idx],
        wearCount: 0,
        tags: [],
        addedAt: new Date().toISOString(),
      }))
      addMultipleItems(newItems)
      setUploadFiles([])
      setUploadPreviews([])
      setIsUploading(false)
      setView('grid')
    }, 1500)
  }

  // --- Generate Flow ---
  function handleGenerate() {
    setIsGenerating(true)
    setTimeout(() => {
      const outfits = generateWardrobeOutfits(occasion, weather, wardrobe, 4)
      setGeneratedOutfits(outfits)
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Animated Fashion Background */}
      <div className="fixed inset-0 -z-10 bg-[#f7f4ed] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#e8e4da] rounded-full blur-[100px] opacity-60 animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#f0ebd8] rounded-full blur-[120px] opacity-50"></div>
      </div>
      
      <GlassNav />

      <main className="max-w-7xl mx-auto px-6 pt-4 space-y-12">
        
        {/* HERO SECTION */}
        <div className="text-center space-y-6 pt-8 pb-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-6xl text-[#191919] font-normal tracking-tight"
          >
            Your Digital Wardrobe
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#6b6b6b] text-lg font-medium tracking-wide"
          >
            Everything you own. Endless ways to wear it.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 pt-6"
          >
            <GlassButton variant="secondary" onClick={() => setView('upload')} className="px-8 shadow-sm">
              + Add Clothing
            </GlassButton>
            <GlassButton variant="primary" onClick={() => setView('generate')} className="px-8 shadow-md">
              ✨ Generate Outfit
            </GlassButton>
          </motion.div>
        </div>

        {/* WARDROBE INSIGHTS */}
        {view === 'grid' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center items-center text-center shadow-sm">
              <div className="font-serif text-3xl font-bold text-[#191919] mb-1">{stats.total}</div>
              <div className="text-xs text-[#6b6b6b] font-bold uppercase tracking-wider">Total Items</div>
            </div>
            <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center text-sm shadow-sm md:col-span-4 bg-white/40">
              <div className="flex justify-between items-center h-full">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#6b6b6b] uppercase tracking-wider">Composition</div>
                  <div className="flex gap-4 text-[#191919] font-medium">
                    <span>{stats.tops} Tops</span>
                    <span>{stats.bottoms} Bottoms</span>
                    <span>{stats.shoes} Shoes</span>
                    <span>{stats.outerwear} Outerwear</span>
                  </div>
                </div>
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-[#6b6b6b] uppercase tracking-wider mb-1">Most Worn</div>
                  <div className="text-[#191919] font-medium">{wardrobe.length > 0 ? wardrobe.sort((a,b)=>b.wearCount - a.wearCount)[0].name : 'N/A'}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CATEGORY NAV */}
        {view === 'grid' && (
          <div className="glass-level-1 p-2 rounded-full flex overflow-x-auto hide-scrollbar gap-1 shadow-sm sticky top-24 z-30">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat ? 'text-white' : 'text-[#6b6b6b] hover:text-[#191919]'
                }`}
              >
                {activeCategory === cat && (
                  <motion.div layoutId="wardrobeCat" className="absolute inset-0 bg-[#191919] rounded-full -z-10 shadow-md" />
                )}
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* MAIN VIEWS */}
        <AnimatePresence mode="wait">
          
          {/* GRID VIEW */}
          {view === 'grid' && (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
              
              {/* Rediscoveries Section */}
              {rediscoveries.length > 0 && activeCategory === 'All' && (
                <div className="space-y-6">
                  <h2 className="font-serif text-2xl font-bold text-[#191919]">Give These Another Life</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {rediscoveries.slice(0, 4).map(item => (
                      <div key={item.id} className="glass-card rounded-[1.5rem] p-4 flex gap-4 items-center shadow-sm">
                        <img src={item.imageUrl} className="w-16 h-16 rounded-xl object-cover" />
                        <div>
                          <div className="text-sm font-bold text-[#191919]">{item.name}</div>
                          <div className="text-xs text-[#6b6b6b]">Not worn in 90+ days</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Masonry Grid */}
              <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                {filteredWardrobe.map((item, idx) => (
                  <div key={item.id} className="break-inside-avoid relative group rounded-[2rem] overflow-hidden bg-white/50 shadow-sm hover:shadow-xl transition-all duration-500">
                    <img src={item.imageUrl} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <button 
                      onClick={() => { toggleFavoriteItem(item.id); setWardrobe([...wardrobe]); }}
                      className="absolute top-4 right-4 text-2xl drop-shadow-md z-10 transition-transform hover:scale-110"
                    >
                      {item.favorite ? '♥' : '♡'}
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="text-white font-serif text-xl font-bold mb-1">{item.name}</div>
                      <div className="flex flex-wrap gap-2 text-xs font-medium text-white/80">
                        <span className="capitalize">{item.category}</span>
                        <span>·</span>
                        <span className="capitalize">{item.formality}</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="glass-liquid flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-sm backdrop-blur-md bg-white/20 hover:bg-white/30">Edit</button>
                        <button className="glass-liquid flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-sm backdrop-blur-md bg-white/20 hover:bg-white/30">Build Outfit</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* UPLOAD VIEW */}
          {view === 'upload' && (
             <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-8 bg-white/60 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl border border-white/50">
               <div className="flex justify-between items-center">
                 <h2 className="font-serif text-4xl font-normal text-[#191919]">Add to Wardrobe</h2>
                 <button onClick={() => setView('grid')} className="text-[#6b6b6b] hover:text-[#191919] font-bold">✕ Close</button>
               </div>
               
               <div className="border-2 border-dashed border-[#d4cfc4] rounded-[2rem] p-12 text-center relative hover:border-[#191919] transition-colors cursor-pointer bg-white/30">
                 <input type="file" multiple accept="image/*" onChange={(e) => handleMultiUpload(e.target.files)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                 <div className="text-6xl mb-4">📸</div>
                 <h3 className="text-xl font-bold text-[#191919] mb-2">Upload Multiple Items</h3>
                 <p className="text-[#6b6b6b] text-sm">Drag & drop or click to select files.</p>
               </div>

               {uploadPreviews.length > 0 && (
                 <div className="space-y-6">
                   <h3 className="font-serif text-2xl text-[#191919]">{uploadPreviews.length} NEW ITEMS</h3>
                   <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                     {uploadPreviews.map((src, i) => (
                       <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-sm">
                         <img src={src} className="w-full h-full object-cover" />
                       </div>
                     ))}
                   </div>
                   <GlassButton variant="primary" onClick={commitUploads} disabled={isUploading} className="w-full py-4 text-lg shadow-lg">
                     {isUploading ? 'Adding to Wardrobe...' : `Add ${uploadPreviews.length} Items ✦`}
                   </GlassButton>
                 </div>
               )}
             </motion.div>
          )}

          {/* GENERATE OUTFIT VIEW */}
          {view === 'generate' && (
             <motion.div key="generate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
               <div className="flex justify-between items-center max-w-4xl mx-auto">
                 <h2 className="font-serif text-4xl font-normal text-[#191919]">Generate Outfits</h2>
                 <button onClick={() => setView('grid')} className="text-[#6b6b6b] hover:text-[#191919] font-bold">✕ Close</button>
               </div>

               {!generatedOutfits.length && !isGenerating && (
                 <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl border border-white/50 space-y-8">
                   <div className="grid md:grid-cols-2 gap-8">
                     <div>
                       <label className="block text-sm font-bold text-[#6b6b6b] uppercase tracking-wider mb-3">What are you dressing for?</label>
                       <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full p-4 rounded-2xl glass-pill focus:outline-none text-lg">
                         <option value="Office">Office</option>
                         <option value="Wedding">Wedding</option>
                         <option value="Party">Party</option>
                         <option value="College">College</option>
                         <option value="Date">Date</option>
                         <option value="Travel">Travel</option>
                         <option value="Casual">Casual Day</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-[#6b6b6b] uppercase tracking-wider mb-3">Weather (Optional)</label>
                       <select value={weather} onChange={e => setWeather(e.target.value)} className="w-full p-4 rounded-2xl glass-pill focus:outline-none text-lg">
                         <option value="">Any</option>
                         <option value="hot">Hot</option>
                         <option value="cold">Cold</option>
                         <option value="rainy">Rainy</option>
                       </select>
                     </div>
                   </div>
                   
                   <GlassButton variant="primary" onClick={handleGenerate} className="w-full py-5 text-xl shadow-lg">
                     ✨ Generate from my Wardrobe
                   </GlassButton>
                 </div>
               )}

               {isGenerating && (
                 <div className="max-w-md mx-auto text-center py-20 space-y-6">
                   <div className="text-6xl animate-pulse">✨</div>
                   <h3 className="font-serif text-2xl font-bold text-[#191919]">Building looks from your wardrobe...</h3>
                   <div className="space-y-2 text-sm text-[#6b6b6b] font-medium text-left max-w-xs mx-auto pl-8">
                     <p>✓ Checking occasion requirements</p>
                     <p>✓ Finding compatible items</p>
                     <p>✓ Matching color harmony</p>
                     <p className="animate-pulse">● Assembling outfits</p>
                   </div>
                 </div>
               )}

               {generatedOutfits.length > 0 && !isGenerating && (
                 <div className="space-y-12">
                   <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                     {generatedOutfits.map((look, idx) => (
                       <div key={look.id} className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-8 shadow-2xl border border-white flex flex-col group">
                         <div className="flex justify-between items-start mb-6 border-b border-[#e8e4da] pb-6">
                           <div>
                             <div className="text-xs font-bold text-[#6b6b6b] uppercase tracking-widest mb-1">Look {idx + 1}</div>
                             <h3 className="font-serif text-3xl font-bold text-[#191919]">{look.name}</h3>
                           </div>
                           <div className="text-right">
                             <div className="text-3xl font-numeric font-bold text-[#191919]">{look.contextMirrorScore}</div>
                             <div className="text-[10px] uppercase font-bold text-[#6b6b6b]">Match Score</div>
                           </div>
                         </div>
                         
                         {/* Fashion Lookbook Composition */}
                         <div className="flex-1 flex gap-4 mb-8">
                           {/* Main item (Top/Outerwear) */}
                           <div className="w-1/2 rounded-[2rem] overflow-hidden shadow-md relative">
                             <img src={look.items[0]?.imageUrl} className="w-full h-full object-cover" />
                           </div>
                           <div className="w-1/2 flex flex-col gap-4">
                             {/* Bottom */}
                             <div className="flex-1 rounded-[1.5rem] overflow-hidden shadow-sm relative">
                               <img src={look.items[1]?.imageUrl} className="w-full h-full object-cover" />
                             </div>
                             {/* Shoes/Accessories */}
                             <div className="h-24 flex gap-4">
                               {look.items.slice(2).map((item, i) => (
                                 <div key={i} className="flex-1 rounded-xl overflow-hidden shadow-sm relative">
                                   <img src={item.imageUrl} className="w-full h-full object-cover" />
                                 </div>
                               ))}
                             </div>
                           </div>
                         </div>

                         <div className="glass-pill p-5 rounded-2xl mb-6">
                           <div className="text-xs font-bold text-[#191919] mb-1">Why this outfit?</div>
                           <p className="text-sm text-[#6b6b6b] leading-relaxed">{look.explanation}</p>
                         </div>

                         <div className="grid grid-cols-2 gap-4 mt-auto">
                           <button className="glass-pill py-3 rounded-xl font-bold text-[#191919] shadow-sm hover:shadow-md transition-shadow">Change One Item</button>
                           <button onClick={() => router.push('/test-look')} className="bg-[#191919] text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-shadow">
                             Test This Look →
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   <div className="text-center">
                     <GlassButton variant="secondary" onClick={() => setGeneratedOutfits([])}>
                       ← Back to Generator Options
                     </GlassButton>
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
