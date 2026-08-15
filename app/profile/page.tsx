'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { getStoredProfile, saveProfile, generateProfileFromSelfie } from '@/lib/profileEngine'
import { getHairPreferences, getHairHistory } from '@/lib/memory'
import type { PersonalProfile, HairPreferences, HairProfile } from '@/types'
import { GlassButton } from '@/components/ui/GlassButton'

export default function ProfilePage() {
  const [profile, setProfile] = useState<PersonalProfile | null>(null)
  const [hairPrefs, setHairPrefs] = useState<HairPreferences | null>(null)
  const [hairHistory, setHairHistory] = useState<HairProfile[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    setProfile(getStoredProfile())
    setHairPrefs(getHairPreferences())
    setHairHistory(getHairHistory())
  }, [])

  const handleSelfieUpload = async () => {
    setIsAnalyzing(true)
    // Simulate analyzing a new uploaded photo
    const updated = await generateProfileFromSelfie('mock_new_selfie_id')
    setProfile(updated)
    setIsAnalyzing(false)
  }

  if (!profile || !hairPrefs) return null

  const latestHair = hairHistory[0]

  return (
    <div className="min-h-screen pb-24 text-[var(--text-primary)]">
      <div className="fixed inset-0 -z-10 bg-[var(--bg-primary)] overflow-hidden">
        <div className="absolute top-[10%] left-[30%] w-[40%] h-[50%] bg-[#b89f89] rounded-full blur-[120px] opacity-20"></div>
      </div>
      
      <GlassNav />

      <main className="max-w-5xl mx-auto px-6 pt-12 space-y-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="font-serif text-5xl font-bold">Personal Profile</h1>
          <p className="text-[var(--text-muted)] text-lg">Your unified ecosystem for Skin, Hair, and Style.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* LEFT: Identity / Photo */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="glass-card rounded-[3rem] p-6 text-center space-y-6">
              <div className="w-full aspect-square rounded-[2rem] bg-black overflow-hidden relative border border-[var(--text-muted)]/20 shadow-xl">
                {profile.selfieUrl ? (
                  <img src={profile.selfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">No Photo</div>
                )}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              <GlassButton variant="primary" onClick={handleSelfieUpload} className="w-full py-3" disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze New Photo ✦'}
              </GlassButton>
              <p className="text-xs text-[var(--text-muted)]">Updates your skin, facial, and color signals.</p>
            </div>
          </div>

          {/* RIGHT: Signals */}
          <div className="w-full md:w-2/3 space-y-8">
            
            <div className="grid grid-cols-2 gap-4">
              {/* Skin */}
              <div className="glass-card p-6 rounded-[2rem] space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2">🧴 Skin</h3>
                <div className="space-y-2 text-sm text-[var(--text-muted)]">
                  <p><span className="font-bold text-[var(--text-primary)]">Clarity:</span> {profile.skinSignals.clarityScore}/100</p>
                  <p><span className="font-bold text-[var(--text-primary)]">Hydration:</span> <span className="capitalize">{profile.skinSignals.hydrationLevel}</span></p>
                  <p><span className="font-bold text-[var(--text-primary)]">Undertone:</span> <span className="capitalize">{profile.skinSignals.undertone}</span></p>
                  <p className="pt-2 italic text-xs">{profile.skinSignals.textureNotes}</p>
                </div>
              </div>

              {/* Hair */}
              <div className="glass-card p-6 rounded-[2rem] space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2">💇 Hair</h3>
                <div className="space-y-2 text-sm text-[var(--text-muted)]">
                  {latestHair ? (
                    <>
                      <p><span className="font-bold text-[var(--text-primary)]">Type:</span> {latestHair.hairType}</p>
                      <p><span className="font-bold text-[var(--text-primary)]">Texture:</span> {latestHair.texture}</p>
                      <p><span className="font-bold text-[var(--text-primary)]">Pattern:</span> {latestHair.curlPattern}</p>
                      <p className="pt-2 italic text-xs">Based on your latest Hair Studio analysis.</p>
                    </>
                  ) : (
                    <p>No hair analysis on record. Visit the Hair Studio.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Colors & Style */}
            <div className="glass-card p-8 rounded-[3rem] space-y-6">
              <h3 className="font-serif text-2xl font-bold">Colors & Style</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-sm mb-3">Best Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.colorSignals.bestColors.map(c => (
                       <span key={c} className="px-3 py-1 text-xs border border-[var(--text-muted)] rounded-full capitalize">{c}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-3">Style Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.stylePreferences.map(s => (
                       <span key={s} className="px-3 py-1 text-xs bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-bold capitalize">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}
