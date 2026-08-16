'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassButton } from '@/components/ui/GlassButton'
import { getWardrobe, addMultipleItems, toggleFavoriteItem, getRediscoveries, deleteItem, updateItem, hybridSearch } from '@/lib/memory'
import { generateWardrobeOutfits } from '@/lib/wardrobeEngine'
import { UploadZone } from '@/components/ui/UploadZone'
import type { WardrobeItem, LookCandidate } from '@/types'
import { useRouter } from 'next/navigation'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Traditional', 'One-Piece', 'Footwear', 'Accessories']

export default function WardrobePage() {
  const router = useRouter()
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([])
  const [rediscoveries, setRediscoveries] = useState<WardrobeItem[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
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

  const filteredWardrobe = searchQuery 
    ? hybridSearch(searchQuery).map(r => r.item)
    : activeCategory === 'All' 
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
    <div className="min-h-screen pb-24 font-ui text-[var(--text-primary)]">

      <main className="max-w-[90rem] mx-auto px-6 pt-12 space-y-16">
        
        {/* HERO SECTION */}
        <div className="text-center space-y-6 pt-8 pb-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <span className="glass-crystal px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest inline-block shadow-subtle text-[var(--text-primary)]">
              Digital Wardrobe
            </span>
            <h1 className="font-serif text-6xl md:text-8xl text-[var(--text-primary)] font-normal tracking-tight">
              Personal Collection.
            </h1>
            <p className="text-[var(--text-muted)] text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              Curate, evaluate, and compose. An intelligent architectural perspective on your daily presentation.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap justify-center gap-6 pt-8"
          >
            <GlassButton variant="secondary" onClick={() => setView('upload')} className="px-10 py-4 text-base">
              Add Inventory
            </GlassButton>
            <GlassButton variant="primary" onClick={() => setView('generate')} className="px-10 py-4 text-base">
              Compose Outfit
            </GlassButton>
          </motion.div>
        </div>

        {/* WARDROBE INSIGHTS */}
        {view === 'grid' && (
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="glass-deep rounded-[2rem] p-8 flex flex-col justify-center items-center text-center shadow-subtle group hover:scale-[1.02] transition-transform duration-500">
                <div className="font-numeric text-6xl font-light text-[var(--text-primary)] mb-2 tracking-tighter">{stats.total}</div>
                <div className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-widest">Total Items</div>
              </div>
              <div className="glass-soft rounded-[2rem] p-10 flex flex-col justify-center text-sm md:col-span-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--text-primary)] to-transparent opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500" />
                <div className="flex justify-between items-center h-full relative z-10">
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">Composition</div>
                    <div className="flex gap-8 text-[var(--text-primary)] font-medium tracking-wide text-base">
                      <span>{stats.tops} Tops</span>
                      <span>{stats.bottoms} Bottoms</span>
                      <span>{stats.shoes} Footwear</span>
                      <span>{stats.outerwear} Outerwear</span>
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-3">Most Utilized</div>
                    <div className="text-[var(--text-primary)] font-serif text-2xl font-normal">{wardrobe.length > 0 ? wardrobe.sort((a,b)=>b.wearCount - a.wearCount)[0].name : 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* CATEGORY NAV & SEARCH */}
        {view === 'grid' && (
          <div className="flex flex-col md:flex-row gap-4 sticky top-24 z-30">
            <div className="glass-crystal rounded-[2rem] p-2 flex overflow-x-auto hide-scrollbar gap-2 shadow-elevated flex-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
                  className={`relative px-8 py-3 text-sm tracking-widest uppercase font-medium transition-all whitespace-nowrap rounded-[1.5rem] ${
                    activeCategory === cat && !searchQuery ? 'text-[var(--bg-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {activeCategory === cat && !searchQuery && (
                    <motion.div layoutId="wardrobeCat" className="absolute inset-0 bg-[var(--text-primary)] -z-10 shadow-md rounded-[1.5rem]" />
                  )}
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="glass-crystal rounded-[2rem] p-2 shadow-elevated w-full md:w-96 flex">
               <input 
                 type="text" 
                 placeholder="Search e.g. 'formal black dress'..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="bg-transparent border-none outline-none px-6 py-3 w-full text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] tracking-wide"
               />
            </div>
          </div>
        )}

        {/* MAIN VIEWS */}
        <AnimatePresence mode="wait">
          
          {/* GRID VIEW */}
          {view === 'grid' && (
            <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="space-y-16">
              
              {/* Rediscoveries Section */}
              {rediscoveries.length > 0 && activeCategory === 'All' && (
                <ScrollReveal>
                  <div className="space-y-8 glass-soft p-10 rounded-[2rem]">
                    <h2 className="font-serif text-3xl font-normal text-[var(--text-primary)] border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-4">Dormant Inventory</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {rediscoveries.slice(0, 4).map((item, i) => (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={item.id} className="glass-frosted rounded-3xl p-4 flex gap-4 items-center transition-all hover:scale-105 group cursor-pointer">
                          <img src={item.imageUrl} className="w-20 h-20 object-cover rounded-2xl" />
                          <div>
                            <div className="text-base font-medium text-[var(--text-primary)]">{item.name}</div>
                            <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mt-1 bg-[var(--bg-muted)] px-2 py-1 inline-block rounded-md">Inactive &gt; 90d</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Masonry Grid */}
              <div className="columns-2 md:columns-3 lg:columns-4 gap-8 space-y-8">
                {filteredWardrobe.map((item, idx) => (
                  <ScrollReveal key={item.id}>
                    <div className="break-inside-avoid relative group overflow-hidden glass-deep rounded-[2rem] transition-all duration-700 hover:shadow-elevated transform hover:-translate-y-2">
                      <img src={item.imageUrl} className="w-full object-cover transition-transform duration-[2000ms] group-hover:scale-[1.03]" loading="lazy" />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-500" />
                      
                      <button 
                        onClick={() => { toggleFavoriteItem(item.id); setWardrobe([...getWardrobe()]); }}
                        className="absolute top-6 right-6 text-2xl drop-shadow-md z-10 transition-transform hover:scale-125 text-[var(--text-primary)] glass-crystal w-10 h-10 flex items-center justify-center rounded-full"
                      >
                        {item.favorite ? '♥' : '♡'}
                      </button>

                      {/* Delete button top left */}
                      <button 
                        onClick={() => { deleteItem(item.id); setWardrobe([...getWardrobe()]); }}
                        className="absolute top-6 left-6 text-xl drop-shadow-md z-10 transition-transform hover:scale-110 text-red-400 glass-crystal w-10 h-10 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100"
                        title="Remove from Wardrobe"
                      >
                        ✕
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="text-[var(--text-primary)] font-serif text-2xl font-normal mb-2">{item.name}</div>
                        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-medium text-[var(--text-muted)]">
                          <span className="glass-soft px-2 py-1 rounded-md">{item.category}</span>
                          <span className="glass-soft px-2 py-1 rounded-md">{item.formality}</span>
                        </div>
                        <div className="mt-6 flex gap-3">
                          <button 
                            onClick={() => {
                              const newCat = window.prompt('Update category (tops, bottoms, outerwear, footwear, accessories, one-piece, traditional):', item.category)
                              if (newCat) {
                                updateItem(item.id, { category: newCat.toLowerCase() })
                                setWardrobe([...getWardrobe()])
                              }
                            }}
                            className="flex-1 py-3 text-xs font-medium uppercase tracking-widest text-[var(--text-primary)] glass-crystal hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors rounded-full"
                          >
                            Edit
                          </button>
                          <button onClick={() => setView('generate')} className="flex-1 py-3 text-xs font-medium uppercase tracking-widest text-[var(--text-primary)] glass-crystal hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors rounded-full">Compose</button>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {filteredWardrobe.length === 0 && (
                <ScrollReveal>
                  <div className="text-center py-32 glass-deep rounded-[3rem] px-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-1000" />
                    <h3 className="font-serif text-4xl mb-6 text-[var(--text-primary)] font-normal relative z-10">Digital Void</h3>
                    <p className="text-[var(--text-muted)] text-lg mb-10 max-w-lg mx-auto leading-relaxed relative z-10">Your collection awaits initialization. Ingest garments to establish your foundational wardrobe architecture.</p>
                    <div className="relative z-10">
                      <GlassButton variant="primary" onClick={() => setView('upload')} className="px-12 py-5 shadow-elevated">
                        Initialize Inventory
                      </GlassButton>
                    </div>
                  </div>
                </ScrollReveal>
              )}
            </motion.div>
          )}

          {/* UPLOAD VIEW */}
          {view === 'upload' && (
             <motion.div key="upload" initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto space-y-10 glass-deep p-12 rounded-[3rem]">
               <div className="flex justify-between items-center border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-6">
                 <h2 className="font-serif text-4xl font-normal text-[var(--text-primary)]">Inventory Ingestion</h2>
                 <button onClick={() => setView('grid')} className="text-sm uppercase tracking-widest font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-4">Cancel</button>
               </div>
               
               <div className="border-[2px] border-dashed border-[var(--text-muted)] rounded-[2rem] p-16 text-center relative hover:border-[var(--text-primary)] transition-colors cursor-pointer bg-[color-mix(in_srgb,var(--bg-primary)_50%,transparent)] group overflow-hidden">
                 <input type="file" multiple accept="image/*" onChange={(e) => handleMultiUpload(e.target.files)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                 <div className="text-5xl mb-6 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:-translate-y-2 transition-all duration-500 font-serif font-light">↑</div>
                 <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3 uppercase tracking-widest">Select Files</h3>
                 <p className="text-[var(--text-muted)] text-base">Drag & drop or click to ingest items into your digital closet.</p>
               </div>

               {uploadPreviews.length > 0 && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-8 pt-4">
                   <h3 className="font-medium text-sm text-[var(--text-muted)] uppercase tracking-widest border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-4">Pending Ingestion ({uploadPreviews.length})</h3>
                   <div className="grid grid-cols-4 md:grid-cols-6 gap-6">
                     {uploadPreviews.map((src, i) => (
                       <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} key={i} className="aspect-square overflow-hidden rounded-[1.5rem] glass-soft p-1">
                         <img src={src} className="w-full h-full object-cover rounded-[1.25rem]" />
                       </motion.div>
                     ))}
                   </div>
                   <GlassButton variant="primary" onClick={commitUploads} disabled={isUploading} className="w-full py-5 text-base">
                     {isUploading ? 'Processing and Tagging...' : `Commit ${uploadPreviews.length} Items`}
                   </GlassButton>
                 </motion.div>
               )}
             </motion.div>
          )}

          {/* GENERATE OUTFIT VIEW */}
          {view === 'generate' && (
             <motion.div key="generate" initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="space-y-12 max-w-6xl mx-auto">
               <div className="flex justify-between items-center border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-8">
                 <h2 className="font-serif text-5xl font-normal text-[var(--text-primary)]">Composition Engine</h2>
                 <button onClick={() => setView('grid')} className="text-sm uppercase tracking-widest font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-4">Cancel</button>
               </div>

               {!generatedOutfits.length && !isGenerating && (
                 <div className="glass-deep rounded-[3rem] p-12 space-y-12">
                   <div className="grid md:grid-cols-2 gap-12">
                     <div className="space-y-6">
                       <label className="block text-sm font-medium text-[var(--text-primary)] uppercase tracking-widest">Target Context</label>
                       <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full p-5 rounded-2xl glass-soft border border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] focus:outline-none focus:border-[var(--text-primary)] text-base text-[var(--text-primary)] uppercase tracking-wider appearance-none cursor-pointer">
                         <option value="Office">Corporate / Office</option>
                         <option value="Wedding">Wedding / Formal</option>
                         <option value="Party">Social Event / Party</option>
                         <option value="College">Academic / College</option>
                         <option value="Date">Date / Evening</option>
                         <option value="Travel">Transit / Travel</option>
                         <option value="Casual">Everyday / Casual</option>
                       </select>
                     </div>
                     <div className="space-y-6">
                       <label className="block text-sm font-medium text-[var(--text-primary)] uppercase tracking-widest">Environmental Condition</label>
                       <select value={weather} onChange={e => setWeather(e.target.value)} className="w-full p-5 rounded-2xl glass-soft border border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] focus:outline-none focus:border-[var(--text-primary)] text-base text-[var(--text-primary)] uppercase tracking-wider appearance-none cursor-pointer">
                         <option value="">Unspecified</option>
                         <option value="hot">High Temp (Hot)</option>
                         <option value="cold">Low Temp (Cold)</option>
                         <option value="rainy">Precipitation (Rainy)</option>
                       </select>
                     </div>
                   </div>
                   
                   <div className="pt-8 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                     <GlassButton variant="primary" onClick={handleGenerate} className="w-full py-5 text-base shadow-elevated">
                       Execute Composition
                     </GlassButton>
                   </div>
                 </div>
               )}

               {isGenerating && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 space-y-10 glass-soft rounded-[3rem]">
                   <div className="w-20 h-20 border-[2px] border-transparent border-t-[var(--text-primary)] border-r-[var(--text-primary)] rounded-full animate-spin-slow opacity-80 mx-auto" />
                   <h3 className="font-serif text-4xl font-normal text-[var(--text-primary)]">Synthesizing Configurations</h3>
                   <div className="space-y-4 text-base text-[var(--text-muted)] font-medium text-center mx-auto bg-[var(--surface)] inline-block p-6 rounded-[2rem] shadow-subtle border border-[var(--border-color)]">
                     <p className="uppercase tracking-widest text-xs flex items-center justify-between gap-8"><span>Evaluating parameters</span> <span className="font-numeric">100%</span></p>
                     <p className="uppercase tracking-widest text-xs flex items-center justify-between gap-8"><span>Scanning inventory</span> <span className="font-numeric">100%</span></p>
                     <p className="uppercase tracking-widest text-xs flex items-center justify-between gap-8 text-[var(--text-primary)] animate-pulse"><span>Compiling looks</span> <span className="font-numeric">Wait...</span></p>
                   </div>
                 </motion.div>
               )}

               {generatedOutfits.length > 0 && !isGenerating && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-12">
                   <div className="grid lg:grid-cols-2 gap-10">
                     {generatedOutfits.map((look, idx) => (
                       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} key={look.id} className="glass-deep rounded-[3rem] p-10 flex flex-col group overflow-hidden">
                         <div className="flex justify-between items-start mb-8 border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-6">
                           <div>
                             <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-3 glass-soft px-3 py-1 rounded-full inline-block">Configuration {idx + 1}</div>
                             <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">{look.name}</h3>
                           </div>
                           <div className="text-right">
                             <div className="text-5xl font-numeric font-light text-[var(--text-primary)] tracking-tighter">{look.contextMirrorScore}</div>
                             <div className="text-[10px] uppercase font-medium text-[var(--text-muted)] tracking-widest mt-1">Viability Score</div>
                           </div>
                         </div>
                         
                         {/* Fashion Lookbook Composition - Wardrobe Assembly Animation */}
                         <div className="flex-1 flex gap-6 mb-10">
                           {/* Main item (Top/Outerwear) */}
                           <motion.div 
                             initial={{ x: -100, y: -50, opacity: 0, rotate: -10 }} 
                             animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }} 
                             transition={{ type: 'spring', damping: 15, delay: idx * 0.1 + 0.3 }} 
                             className="w-1/2 glass-soft p-2 rounded-[2rem] overflow-hidden group/item cursor-pointer relative tilt-card"
                           >
                             <img src={look.items[0]?.imageUrl} className="w-full h-full object-cover rounded-[1.5rem] grayscale-[10%] group-hover/item:scale-105 transition-transform duration-[2000ms]" />
                           </motion.div>
                           <div className="w-1/2 flex flex-col gap-6">
                             {/* Bottom */}
                             <motion.div 
                               initial={{ x: 100, y: 50, opacity: 0, rotate: 10 }} 
                               animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }} 
                               transition={{ type: 'spring', damping: 15, delay: idx * 0.1 + 0.5 }} 
                               className="flex-1 glass-soft p-2 rounded-[2rem] overflow-hidden group/item cursor-pointer relative tilt-card tilt-reverse"
                             >
                               <img src={look.items[1]?.imageUrl} className="w-full h-full object-cover rounded-[1.5rem] grayscale-[10%] group-hover/item:scale-105 transition-transform duration-[2000ms]" />
                             </motion.div>
                             {/* Shoes/Accessories */}
                             <div className="h-32 flex gap-6">
                               {look.items.slice(2).map((item, i) => (
                                 <motion.div 
                                   initial={{ y: 100, opacity: 0 }} 
                                   animate={{ y: 0, opacity: 1 }} 
                                   transition={{ type: 'spring', damping: 15, delay: idx * 0.1 + 0.7 + (i * 0.1) }} 
                                   key={i} 
                                   className="flex-1 glass-soft p-1 rounded-3xl overflow-hidden group/item cursor-pointer relative tilt-card"
                                 >
                                   <img src={item.imageUrl} className="w-full h-full object-cover rounded-[1.25rem] grayscale-[10%] group-hover/item:scale-105 transition-transform duration-[2000ms]" />
                                 </motion.div>
                               ))}
                             </div>
                           </div>
                         </div>

                         <div className="glass-soft p-8 rounded-3xl mb-10 relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02]" />
                           <div className="text-xs uppercase tracking-widest font-medium text-[var(--text-primary)] mb-3 relative z-10">Rationale</div>
                           <p className="text-base text-[var(--text-muted)] leading-relaxed relative z-10">{look.explanation}</p>
                         </div>

                         <div className="grid grid-cols-2 gap-6 mt-auto">
                           <button className="py-4 text-xs uppercase tracking-widest font-medium text-[var(--text-primary)] glass-crystal hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors rounded-full shadow-subtle hover:shadow-elevated">Modify Component</button>
                           <button onClick={() => router.push('/test-look')} className="bg-[var(--text-primary)] text-[var(--bg-primary)] py-4 text-xs uppercase tracking-widest font-medium transition-transform hover:bg-[var(--text-primary)]/90 rounded-full shadow-subtle hover:shadow-elevated">
                             Evaluate Look
                           </button>
                         </div>
                       </motion.div>
                     ))}
                   </div>
                   
                   <div className="text-center pt-10 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)]">
                     <GlassButton variant="secondary" onClick={() => setGeneratedOutfits([])} className="text-sm uppercase tracking-widest px-8 py-4">
                       Reset Generator
                     </GlassButton>
                   </div>
                 </motion.div>
               )}
             </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}
