'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider'
import { UploadZone } from '@/components/ui/UploadZone'
import { ScrollReveal, StaggerReveal, staggerChildVariants } from '@/components/ui/ScrollReveal'
import { getSkinProvider, isDemoMode } from '@/lib/youcam'
import {
  getGeneralCareGuidance,
  rankConcernsByPriority,
  getSkinHistory,
  logSkinHistory,
  DAILY_BASIC_ROUTINE,
  GENERAL_PRECAUTIONS,
  WHEN_TO_SEE_DERMATOLOGIST,
} from '@/lib/skincareEngine'
import { getStoredProfile, saveProfile } from '@/lib/profileEngine'
import type { SkinResult } from '@/lib/youcam/types'
import type { SkinHistoryEntry } from '@/lib/skincareEngine'

/* ── Animated Score Counter ─────────────────────────── */
function AnimatedScore({ score, delay = 0 }: { score: number; delay?: number }) {
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  useEffect(() => {
    if (!started) return
    let current = 0
    const dur = 800
    const step = 20
    const inc = score / (dur / step)
    const timer = setInterval(() => {
      current += inc
      if (current >= score) { setDisplay(score); clearInterval(timer) }
      else setDisplay(Math.round(current))
    }, step)
    return () => clearInterval(timer)
  }, [score, started])

  return <>{display}</>
}

export default function SkinInsightsPage() {
  const [selfiePreview, setSelfiePreview] = useState<string>('')
  const [analyzing, setAnalyzing] = useState<boolean>(false)
  const [skinResult, setSkinResult] = useState<SkinResult | null>(null)
  const [history, setHistory] = useState<SkinHistoryEntry[]>([])

  const isMock = isDemoMode()

  useEffect(() => {
    setHistory(getSkinHistory())
  }, [])

  async function handleSelfieUpload(file: File) {
    const previewUrl = URL.createObjectURL(file)
    setSelfiePreview(previewUrl)
    setAnalyzing(true)
    setSkinResult(null)

    try {
      const provider = getSkinProvider()
      const result = await provider.analyze(file)
      setSkinResult(result)

      if (result.signals.concerns.length > 0) {
        logSkinHistory({
          concerns: result.signals.concerns,
          selfieUrl: previewUrl,
        })
        setHistory(getSkinHistory())
      }

      const currentProfile = getStoredProfile()
      saveProfile({
        ...currentProfile,
        selfieUrl: previewUrl,
        skinSignals: {
          clarityScore: result.signals.clarityScore,
          hydrationLevel: result.signals.hydrationLevel,
          undertone: result.signals.undertone,
          textureNotes: result.signals.textureNotes,
        },
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const prioritizedConcerns = skinResult?.signals.concerns
    ? rankConcernsByPriority(skinResult.signals.concerns)
    : []

  return (
    <div className="min-h-screen pb-24">
      {/* Floating Glass Header Nav */}
      <GlassNav />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 pt-2 space-y-14">
        {/* ═══ PAGE HEADER ════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="inline-flex items-center gap-2 glass-liquid px-5 py-2 rounded-full text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-mono">
            🧴 YouCam Skin AI + Skincare Guidance Engine
          </span>
          <h1 className="font-serif text-4xl lg:text-5xl text-[var(--text-primary)] font-normal">
            Understand your skin.
          </h1>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-lg mx-auto">
            Explore what your skin analysis reveals, discover possible contributing factors, and receive safe general care guidance & verified product category suggestions.
          </p>
        </motion.div>

        {/* ═══ SAFETY DISCLAIMER ═══════════════════════════════════════ */}
        <ScrollReveal>
          <div className="glass-card rounded-[1.5rem] p-5 text-xs flex items-start gap-3 border-l-4 border-amber-400/60">
            <span className="text-xl mt-0.5">ℹ️</span>
            <div className="text-[var(--text-muted)]">
              <strong className="block mb-0.5 font-bold text-[var(--text-primary)]">AI Skin Information & Guidance Disclaimer</strong>
              This feature provides AI-assisted visual skin observations and general skincare routine guidance. It is <strong>not a medical diagnosis or treatment prescription</strong>. For persistent, severe, or painful skin concerns, always consult a qualified dermatologist.
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ SELFIE UPLOAD & GUIDELINES ══════════════════════════════ */}
        <ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Upload Dropzone */}
            <UploadZone
              label="Reference Selfie"
              sublabel="Upload photo for YouCam Skin AI"
              currentPreview={selfiePreview}
              loading={analyzing}
              onFileSelect={handleSelfieUpload}
            />

            {/* Guidelines */}
            <div className="glass-card p-6 rounded-[1.5rem] md:col-span-2 space-y-4">
              <h3 className="font-serif text-xl text-[var(--text-primary)] font-bold">Photo Requirements</h3>
              <div className="grid grid-cols-2 gap-3 text-xs text-[var(--text-muted)]">
                {[
                  { icon: '💡', text: 'Good, natural lighting' },
                  { icon: '👤', text: 'Clear, unobstructed face' },
                  { icon: '🧘', text: 'Neutral facial expression' },
                  { icon: '📷', text: 'Single person in frame' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 p-3 glass-pill rounded-xl">
                    <span>{item.icon}</span> <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {!skinResult && !analyzing && (
                <div className="p-5 glass-pill rounded-xl text-xs text-[var(--text-muted)] text-center italic">
                  Upload a selfie above to view your skin signals, concern scores, possible contributors, daily routine, and verified product categories.
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ RESULTS & 9 STRUCTURED SECTIONS ════════════════════════ */}
        {skinResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-14"
          >
            {/* ── SECTION 1: WHAT WE FOUND ─────────────────────────── */}
            <ScrollReveal>
              <div>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest block font-mono">
                      Section 1 of 9
                    </span>
                    <h2 className="font-serif text-3xl font-normal text-[var(--text-primary)]">What We Found</h2>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-mono glass-pill px-3 py-1 rounded-full">Ranked by visual signal score</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {prioritizedConcerns.map((c, idx) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: idx * 0.08 }}
                      className="glass-card glass-reflection p-5 rounded-[1.25rem] text-center group"
                    >
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest block mb-2 truncate font-mono">
                        {c.name}
                      </span>
                      <div className="font-numeric text-3xl font-bold text-[var(--text-primary)]">
                        <AnimatedScore score={c.score} delay={idx * 100} />
                        <span className="text-xs font-normal text-[var(--text-muted)] ml-1">/ 100</span>
                      </div>
                      <span className={`text-[10px] uppercase font-semibold px-3 py-1 rounded-full inline-block mt-3 font-mono ${
                        c.level === 'high' ? 'bg-amber-100/80 text-amber-900' : 'bg-emerald-100/80 text-emerald-900'
                      }`}>
                        {c.level} signal
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* ── INTERACTIVE BEFORE/AFTER OVERLAY SLIDER ────────── */}
            <ScrollReveal>
              <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-5">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                  <h3 className="font-serif text-2xl font-normal text-[var(--text-primary)]">Skin Overlay Visualizer</h3>
                  <span className="text-xs font-mono text-[var(--text-muted)] glass-pill px-3 py-1 rounded-full">Interactive Before/After</span>
                </div>

                <BeforeAfterSlider
                  beforeImage={selfiePreview}
                  afterImage={skinResult.overlays?.[0] || selfiePreview}
                  beforeLabel="Original Photo"
                  afterLabel="YouCam Skin Overlay"
                />
              </div>
            </ScrollReveal>

            {/* ── SECTION 2 & 3: WHAT IT COULD MEAN & CONTRIBUTORS ── */}
            <ScrollReveal>
              <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-7">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest block font-mono mb-1">
                    Sections 2 & 3
                  </span>
                  <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">What It Could Mean & Possible Contributors</h3>
                </div>

                <div className="space-y-6">
                  {prioritizedConcerns.map((c, idx) => {
                    const guidance = getGeneralCareGuidance(c)
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="p-6 glass-pill rounded-[1.25rem] space-y-4 glass-reflection"
                      >
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-bold flex items-center justify-center font-numeric">
                              {idx + 1}
                            </span>
                            <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">{guidance.concernName}</h4>
                          </div>
                          <span className="text-xs font-semibold text-[var(--text-primary)] font-numeric glass-pill px-3 py-1 rounded-full">Score: {c.score}/100</span>
                        </div>

                        <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                          <strong className="text-[var(--text-primary)] block mb-1.5 text-sm">What does this mean?</strong>
                          {guidance.explanation}
                        </div>

                        <div className="text-xs text-[var(--text-muted)]">
                          <strong className="text-[var(--text-primary)] block mb-1.5 text-sm">What can contribute to this?</strong>
                          <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                            {guidance.possibleContributors.map((factor, fIdx) => (
                              <li key={fIdx}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </ScrollReveal>

            {/* ── SECTION 4: WHAT YOU CAN DO ────────────────────── */}
            <ScrollReveal>
              <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-7">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest block font-mono mb-1">
                    Section 4 of 9
                  </span>
                  <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">What You Can Do</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">General safe-care guidelines for detected concerns.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {prioritizedConcerns.slice(0, 2).map(c => {
                    const guidance = getGeneralCareGuidance(c)
                    return (
                      <div key={c.id} className="p-6 glass-pill rounded-[1.25rem] space-y-4 glass-reflection">
                        <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">{guidance.concernName}</h4>

                        <div className="text-xs text-[var(--text-muted)] space-y-2">
                          <strong className="text-[var(--text-primary)] block text-sm">General Care Guidance:</strong>
                          <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                            {guidance.generalSuggestions.map((sug, i) => (
                              <li key={i}>{sug}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="text-xs text-rose-900 bg-rose-50/80 p-4 rounded-xl border border-rose-100 space-y-1.5">
                          <strong className="block font-bold text-sm">Things to Avoid:</strong>
                          <ul className="list-disc list-inside space-y-1 leading-relaxed">
                            {guidance.thingsToAvoid.map((avoid, aIdx) => (
                              <li key={aIdx}>{avoid}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </ScrollReveal>

            {/* ── SECTION 5: DAILY BASIC ROUTINE ────────────────── */}
            <ScrollReveal>
              <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-7">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest block font-mono mb-1">
                    Section 5 of 9
                  </span>
                  <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">Daily Basic Routine</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    AAD-aligned basic skincare foundation focusing on gentle cleansing, moisturizing, and broad-spectrum SPF 30+.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-7">
                  {/* Morning */}
                  <div className="p-6 glass-pill rounded-[1.25rem] space-y-4">
                    <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">☀️ Morning Routine</h4>
                    <div className="space-y-3 text-xs">
                      {DAILY_BASIC_ROUTINE.morning.map(step => (
                        <div key={step.step} className="p-4 glass-card rounded-xl glass-reflection">
                          <span className="font-bold text-[var(--text-primary)] block mb-1 font-numeric text-sm">
                            Step {step.step}: {step.title}
                          </span>
                          <span className="text-[var(--text-muted)] leading-relaxed block">{step.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evening */}
                  <div className="p-6 glass-pill rounded-[1.25rem] space-y-4">
                    <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">🌙 Evening Routine</h4>
                    <div className="space-y-3 text-xs">
                      {DAILY_BASIC_ROUTINE.evening.map(step => (
                        <div key={step.step} className="p-4 glass-card rounded-xl glass-reflection">
                          <span className="font-bold text-[var(--text-primary)] block mb-1 font-numeric text-sm">
                            Step {step.step}: {step.title}
                          </span>
                          <span className="text-[var(--text-muted)] leading-relaxed block">{step.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* ── SECTION 6: PRODUCT CATEGORIES & VERIFIED PRODUCTS ── */}
            <ScrollReveal>
              <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-7">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest block font-mono mb-1">
                    Section 6 of 9
                  </span>
                  <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">Product Recommendations</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Matched from a verified skincare product database based on category relevance.
                  </p>
                </div>

                {prioritizedConcerns.slice(0, 2).map(c => {
                  const guidance = getGeneralCareGuidance(c)
                  return (
                    <div key={c.id} className="space-y-5">
                      <h4 className="font-serif text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
                        For {guidance.concernName}
                      </h4>

                      <div className="grid md:grid-cols-2 gap-5">
                        {guidance.matchedProducts.map(prod => (
                          <motion.div
                            key={prod.id}
                            whileHover={{ y: -3 }}
                            className="p-5 glass-card rounded-[1.25rem] space-y-3 text-xs glass-reflection group"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest block font-mono">
                                  {prod.brand}
                                </span>
                                <h5 className="font-bold text-[var(--text-primary)] text-sm mt-0.5">{prod.productName}</h5>
                              </div>
                              <span className="text-[10px] glass-pill px-3 py-1 rounded-full font-semibold text-[var(--text-primary)]">
                                {prod.category}
                              </span>
                            </div>

                            <p className="text-[var(--text-muted)] italic glass-pill p-3 rounded-xl leading-relaxed">
                              <strong>Why this product?</strong> {prod.whyRelevant}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-1">
                              {prod.fragranceFree && (
                                <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-100 font-medium">
                                  Fragrance-Free
                                </span>
                              )}
                              {prod.nonComedogenic && (
                                <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-100 font-medium">
                                  Non-comedogenic
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollReveal>

            {/* ── SECTION 7: PRECAUTIONS ─────────────────────────── */}
            <ScrollReveal>
              <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest block font-mono mb-1">
                    Section 7 of 9
                  </span>
                  <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">Precautions</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-xs text-[var(--text-muted)]">
                  {GENERAL_PRECAUTIONS.map((rule, rIdx) => (
                    <div key={rIdx} className="p-4 glass-card rounded-xl flex items-start gap-3 glass-reflection">
                      <span className="text-amber-600 font-bold text-base">⚠️</span>
                      <span className="leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* ── SECTION 8: WHEN TO SEE A DERMATOLOGIST ──────────── */}
            <ScrollReveal>
              <div className="glass-level-3 p-7 rounded-[1.5rem] space-y-5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest block font-mono mb-1">
                    Section 8 of 9
                  </span>
                  <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">When to Get Professional Help</h3>
                </div>

                <div className="p-6 bg-rose-50/60 border border-rose-200/60 rounded-[1.25rem] space-y-3 text-xs text-rose-900">
                  <strong className="block font-bold text-sm">Consider Consulting a Dermatologist If:</strong>
                  <ul className="list-disc list-inside space-y-2 leading-relaxed">
                    {WHEN_TO_SEE_DERMATOLOGIST.map((item, dIdx) => (
                      <li key={dIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>

            {/* ── SECTION 9: TRACK 3 INTEGRATION ──────────────────── */}
            <ScrollReveal>
              <div className="glass-level-3 p-10 rounded-[2rem] text-center max-w-xl mx-auto space-y-5 relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent-glow),transparent_70%)] opacity-40 pointer-events-none" />

                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest font-mono relative z-10">
                  Section 9 of 9 · Track 3 Integration
                </span>
                <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)] relative z-10">Connect Skin AI to ContextMirror</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed relative z-10">
                  Your skin signals and undertone have been saved to your <strong>Personal Visual Profile</strong>. Use them to evaluate real-world candidate looks in <strong>Test My Look</strong>.
                </p>

                <div className="relative z-10">
                  <Link href="/test-look">
                    <GlassButton variant="primary" className="text-sm py-4 px-10 shadow-2xl">
                      ⭐ Continue to Test My Look →
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </motion.div>
        )}
      </main>
    </div>
  )
}
