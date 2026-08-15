'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { getStoredProfile, saveProfile, generateProfileFromSelfie } from '@/lib/profileEngine'
import { getHairPreferences, getHairHistory, getWardrobe } from '@/lib/memory'
import type { PersonalProfile, HairPreferences, HairProfile, WardrobeItem } from '@/types'
import { GlassButton } from '@/components/ui/GlassButton'

export default function ProfilePage() {
  const [profile, setProfile] = useState<PersonalProfile | null>(null)
  const [hairPrefs, setHairPrefs] = useState<HairPreferences | null>(null)
  const [hairHistory, setHairHistory] = useState<HairProfile[]>([])
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    setProfile(getStoredProfile())
    setHairPrefs(getHairPreferences())
    setHairHistory(getHairHistory())
    setWardrobe(getWardrobe())
  }, [])

  const handleSelfieUpload = async () => {
    setIsAnalyzing(true)
    const updated = await generateProfileFromSelfie('mock_new_selfie_id')
    setProfile(updated)
    setIsAnalyzing(false)
  }

  if (!profile || !hairPrefs) return null

  const latestHair = hairHistory[0]

  return (
    <div className="min-h-screen pb-32 text-[var(--text-primary)] relative">
      {/* Editorial Background Atmosphere */}
      <div className="fixed inset-0 -z-10 bg-[var(--bg-primary)] overflow-hidden">
        <div className="absolute top-[5%] -left-[10%] w-[50%] h-[70%] bg-color-mix(in_srgb,var(--text-primary)_5%,transparent) blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[60%] bg-[color-mix(in_srgb,var(--accent-glow)_10%,transparent)] blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512496015851-a1e127db8fb5?q=80&w=2000')] opacity-5 mix-blend-overlay object-cover pointer-events-none" />
      </div>
      
      <GlassNav />

      <main className="max-w-[85rem] mx-auto px-6 pt-16">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row gap-12"
        >
          {/* LEFT: Large Portrait Column */}
          <div className="w-full lg:w-[45%] flex flex-col gap-6">
            <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-elevated group">
              {profile.selfieUrl ? (
                <img src={profile.selfieUrl} alt="Identity" className="w-full h-full object-cover grayscale-[20%] transition-transform duration-[2000ms] group-hover:scale-105" />
              ) : (
                <div className="w-full h-full glass-deep flex items-center justify-center">
                  <span className="text-[var(--text-muted)] font-serif text-2xl">Awaiting Portrait</span>
                </div>
              )}

              {/* Upload Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                <p className="text-white mb-6 font-serif text-2xl">Update your profile parameters</p>
                <GlassButton variant="primary" onClick={handleSelfieUpload} disabled={isAnalyzing} className="px-8 py-4">
                  {isAnalyzing ? 'Scanning...' : 'Capture Portrait ✦'}
                </GlassButton>
              </div>

              {/* Status Tags */}
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <span className="glass-crystal px-4 py-2 rounded-full text-[10px] uppercase tracking-widest text-white backdrop-blur-md">
                  Identity Verified
                </span>
              </div>
              <div className="absolute bottom-8 left-8">
                <h1 className="font-serif text-5xl text-white drop-shadow-lg tracking-tight">Your Identity.</h1>
              </div>
            </div>
            
            <div className="glass-soft p-8 rounded-[2rem] flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Wardrobe Volume</p>
                <p className="font-serif text-3xl">{wardrobe.length}</p>
              </div>
              <div className="h-10 w-px bg-[color-mix(in_srgb,var(--text-muted)_30%,transparent)]" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Skin Clarity</p>
                <p className="font-serif text-3xl">{profile.skinSignals.clarityScore}</p>
              </div>
              <div className="h-10 w-px bg-[color-mix(in_srgb,var(--text-muted)_30%,transparent)]" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Lookbook</p>
                <p className="font-serif text-3xl">12</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Layered Information */}
          <div className="w-full lg:w-[55%] flex flex-col gap-8 lg:pt-10">
            <div className="space-y-4 mb-8">
              <h2 className="font-serif text-4xl font-normal">ContextMirror Profile</h2>
              <p className="text-[var(--text-muted)] text-lg leading-relaxed max-w-lg">
                Your unified digital aesthetic. We use these precise biological and stylistic signals to calculate compatibility across every garment and hairstyle.
              </p>
            </div>

            {/* Grid of Attributes */}
            <div className="grid sm:grid-cols-2 gap-6">
              
              {/* Skin Architecture */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-deep p-8 rounded-[2rem] group hover:shadow-elevated transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xs uppercase tracking-widest font-medium">Skin Architecture</h3>
                  <span className="text-xl">🧴</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-3">
                    <span className="text-[var(--text-muted)] text-sm">Undertone</span>
                    <span className="font-serif text-xl capitalize">{profile.skinSignals.undertone}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-3">
                    <span className="text-[var(--text-muted)] text-sm">Hydration</span>
                    <span className="font-serif text-xl capitalize">{profile.skinSignals.hydrationLevel}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-2">
                    {profile.skinSignals.textureNotes}
                  </p>
                </div>
              </motion.div>

              {/* Hair Profile */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-deep p-8 rounded-[2rem] group hover:shadow-elevated transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xs uppercase tracking-widest font-medium">Hair Profile</h3>
                  <span className="text-xl">💇</span>
                </div>
                {latestHair ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-3">
                      <span className="text-[var(--text-muted)] text-sm">Type</span>
                      <span className="font-serif text-xl capitalize">{latestHair.hairType}</span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-3">
                      <span className="text-[var(--text-muted)] text-sm">Texture</span>
                      <span className="font-serif text-xl capitalize">{latestHair.texture}</span>
                    </div>
                    <div className="flex justify-between items-baseline border-b border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pb-3">
                      <span className="text-[var(--text-muted)] text-sm">Pattern</span>
                      <span className="font-serif text-xl capitalize">{latestHair.curlPattern}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-[var(--text-muted)] text-center">No hair analysis completed. Visit the Hair Studio.</p>
                  </div>
                )}
              </motion.div>

              {/* Style DNA */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-soft p-8 rounded-[2rem] sm:col-span-2">
                <h3 className="text-xs uppercase tracking-widest font-medium mb-8">Aesthetic Footprint</h3>
                
                <div className="grid md:grid-cols-2 gap-10">
                  <div>
                    <h4 className="text-[var(--text-muted)] text-sm mb-4">Core Preferences</h4>
                    <div className="flex flex-wrap gap-3">
                      {profile.stylePreferences.map(s => (
                        <span key={s} className="glass-frosted px-5 py-2.5 rounded-full text-sm capitalize border border-[color-mix(in_srgb,var(--text-primary)_20%,transparent)]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[var(--text-muted)] text-sm mb-4">Color Palette</h4>
                    <div className="flex gap-4">
                      {profile.colorSignals.bestColors.map(c => (
                         <div key={c} className="flex flex-col items-center gap-2">
                           <div className="w-12 h-12 rounded-full shadow-subtle border border-[color-mix(in_srgb,var(--text-primary)_10%,transparent)]" style={{ backgroundColor: c }}></div>
                           <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{c}</span>
                         </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
