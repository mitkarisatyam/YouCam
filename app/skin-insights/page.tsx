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
    <div className="min-h-screen pb-24 font-ui text-[var(--text-primary)]">
      <GlassNav />

      <main className="max-w-[85rem] mx-auto px-6 pt-12 space-y-16">
        {/* ═══ PAGE HEADER ════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl space-y-4"
        >
          <span className="premium-badge">
            YouCam Skin Intelligence
          </span>
          <h1 className="font-serif text-5xl lg:text-6xl text-[var(--text-primary)] font-normal tracking-tight">
            Analyze your skin.
          </h1>
          <p className="text-[var(--text-muted)] text-lg leading-relaxed max-w-2xl">
            A visual diagnostic assessing hydration, clarity, and undertone. Receive specialized care regimens and verifiable aesthetic recommendations.
          </p>
        </motion.div>

        {/* ═══ SAFETY DISCLAIMER ═══════════════════════════════════════ */}
        <ScrollReveal>
          <div className="glass-soft p-6 flex items-start gap-4 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--text-primary)] to-transparent opacity-[0.02] group-hover:translate-x-full transition-transform duration-[2000ms] ease-in-out" />
            <span className="font-bold uppercase tracking-widest text-xs mt-0.5 z-10">Notice</span>
            <div className="text-[var(--text-muted)] leading-relaxed text-sm z-10">
              This system provides AI-assisted visual skin observations and general skincare routine guidance. It is <strong>not a medical diagnosis or treatment prescription</strong>. For persistent, severe, or painful skin concerns, always consult a qualified dermatologist.
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ SELFIE UPLOAD & GUIDELINES ══════════════════════════════ */}
        <ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 h-full">
              <UploadZone
                label="Reference Portrait"
                sublabel="Upload photo for Skin Analysis"
                currentPreview={selfiePreview}
                loading={analyzing}
                onFileSelect={handleSelfieUpload}
              />
            </div>

            <div className="glass-soft p-8 md:col-span-2 space-y-6 rounded-3xl relative overflow-hidden">
              <h3 className="font-serif text-3xl text-[var(--text-primary)] font-normal relative z-10">Capture Requirements</h3>
              <div className="grid grid-cols-2 gap-6 text-sm text-[var(--text-muted)] relative z-10">
                {[
                  { label: 'Lighting', text: 'Diffuse, natural daylight' },
                  { label: 'Subject', text: 'Clear, unobstructed face' },
                  { label: 'Expression', text: 'Neutral facial musculature' },
                  { label: 'Framing', text: 'Single individual centered' },
                ].map(item => (
                  <div key={item.text} className="flex flex-col border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] pt-4">
                    <span className="text-xs uppercase tracking-widest font-medium mb-1 text-[var(--text-primary)]">{item.label}</span> 
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {!skinResult && !analyzing && (
                <div className="mt-8 pt-6 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] text-sm text-[var(--text-muted)] italic relative z-10">
                  Upload a reference image to initiate diagnostics and populate your aesthetic profile.
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ RESULTS ════════════════════════════════════════════════ */}
        {skinResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-20 pt-10"
          >
            {/* ── SECTION 1: WHAT WE FOUND ─────────────────────────── */}
            <ScrollReveal>
              <div>
                <div className="flex justify-between items-end border-b border-[var(--border-color)] pb-4 mb-8">
                  <div>
                    <h2 className="font-serif text-4xl font-normal text-[var(--text-primary)]">Diagnostic Summary</h2>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-medium">Ranked by severity</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {prioritizedConcerns.map((c, idx) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="glass-frosted p-6 text-center rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-[var(--text-primary)] to-transparent opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500" />
                      <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest block mb-4 truncate relative z-10">
                        {c.name}
                      </span>
                      <div className="font-numeric text-5xl font-light text-[var(--text-primary)] relative z-10 tracking-tighter">
                        <AnimatedScore score={c.score} delay={idx * 100} />
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] mt-1 block uppercase tracking-widest font-medium relative z-10">out of 100</span>
                      <div className={`mt-4 pt-4 border-t border-[color-mix(in_srgb,var(--border-color)_50%,transparent)] text-[10px] uppercase tracking-widest font-bold relative z-10 ${
                        c.level === 'high' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {c.level} signal
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* ── INTERACTIVE BEFORE/AFTER OVERLAY SLIDER ────────── */}
            <ScrollReveal>
              <div className="space-y-6">
                <div className="flex items-end justify-between border-b border-[var(--border-color)] pb-4">
                  <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">Visual Mapping</h3>
                  <span className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">Interactive Overlay</span>
                </div>

                <div className="aspect-[16/9] md:aspect-[21/9] bg-[var(--surface)] border border-[var(--border-color)] p-2">
                  <BeforeAfterSlider
                    beforeImage={selfiePreview}
                    afterImage={skinResult.overlays?.[0] || selfiePreview}
                    beforeLabel="Source"
                    afterLabel="Analysis"
                  />
                </div>
              </div>
            </ScrollReveal>

            {/* ── SECTION 2 & 3: WHAT IT COULD MEAN & CONTRIBUTORS ── */}
            <ScrollReveal>
              <div className="space-y-8">
                <div className="border-b border-[var(--border-color)] pb-4">
                  <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">Pathology & Contributors</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {prioritizedConcerns.map((c, idx) => {
                    const guidance = getGeneralCareGuidance(c)
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="p-8 glass-soft rounded-3xl space-y-6"
                      >
                        <div className="flex items-end justify-between border-b border-[var(--border-color)] pb-4">
                          <h4 className="font-serif text-2xl font-normal text-[var(--text-primary)]">{guidance.concernName}</h4>
                          <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Score: {c.score}</span>
                        </div>

                        <div className="text-sm text-[var(--text-muted)] leading-relaxed space-y-4">
                          <div>
                            <strong className="text-[var(--text-primary)] block mb-1 uppercase tracking-widest text-xs font-medium">Mechanism</strong>
                            {guidance.explanation}
                          </div>

                          <div>
                            <strong className="text-[var(--text-primary)] block mb-2 uppercase tracking-widest text-xs font-medium">Environmental & Internal Factors</strong>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {guidance.possibleContributors.map((factor, fIdx) => (
                                <li key={fIdx}>{factor}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </ScrollReveal>

            {/* ── SECTION 4: WHAT YOU CAN DO ────────────────────── */}
            <ScrollReveal>
              <div className="space-y-8">
                <div className="border-b border-[var(--border-color)] pb-4">
                  <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">Treatment Directives</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-2">Safe clinical parameters for managing observed concerns.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {prioritizedConcerns.slice(0, 2).map(c => {
                    const guidance = getGeneralCareGuidance(c)
                    return (
                      <div key={c.id} className="space-y-6">
                        <h4 className="font-serif text-2xl font-normal text-[var(--text-primary)]">{guidance.concernName}</h4>

                        <div className="text-sm text-[var(--text-muted)] space-y-3 border-l border-[var(--border-color)] pl-4">
                          <strong className="text-[var(--text-primary)] block text-xs uppercase tracking-widest">Protocol</strong>
                          <ul className="space-y-2 leading-relaxed">
                            {guidance.generalSuggestions.map((sug, i) => (
                              <li key={i}>— {sug}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="text-sm text-[var(--text-muted)] space-y-3 border-l border-[var(--border-color)] pl-4">
                          <strong className="text-[var(--text-primary)] block text-xs uppercase tracking-widest">Contraindications</strong>
                          <ul className="space-y-2 leading-relaxed">
                            {guidance.thingsToAvoid.map((avoid, aIdx) => (
                              <li key={aIdx}>— {avoid}</li>
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
              <div className="space-y-8">
                <div className="border-b border-[var(--border-color)] pb-4">
                  <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">Baseline Regimen</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-2">
                    AAD-aligned clinical foundation.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="font-serif text-2xl font-normal text-[var(--text-primary)]">AM Protocol</h4>
                    <div className="space-y-4 text-sm">
                      {DAILY_BASIC_ROUTINE.morning.map(step => (
                        <div key={step.step} className="glass-soft p-6 rounded-2xl">
                          <span className="uppercase tracking-widest text-[var(--text-primary)] block mb-2 text-xs font-medium">
                            0{step.step} // {step.title}
                          </span>
                          <span className="text-[var(--text-muted)] leading-relaxed block">{step.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-serif text-2xl font-normal text-[var(--text-primary)]">PM Protocol</h4>
                    <div className="space-y-4 text-sm">
                      {DAILY_BASIC_ROUTINE.evening.map(step => (
                        <div key={step.step} className="glass-soft p-6 rounded-2xl">
                          <span className="uppercase tracking-widest text-[var(--text-primary)] block mb-2 text-xs font-medium">
                            0{step.step} // {step.title}
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
              <div className="space-y-12">
                <div className="border-b border-[var(--border-color)] pb-4">
                  <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">Verified Formulations</h3>
                </div>

                {prioritizedConcerns.slice(0, 2).map(c => {
                  const guidance = getGeneralCareGuidance(c)
                  return (
                    <div key={c.id} className="space-y-6">
                      <h4 className="font-medium text-sm text-[var(--text-primary)] uppercase tracking-widest">
                        Target: {guidance.concernName}
                      </h4>

                      <div className="grid md:grid-cols-2 gap-6">
                        {guidance.matchedProducts.map(prod => (
                          <motion.div
                            key={prod.id}
                            whileHover={{ y: -4, scale: 1.01 }}
                            className="p-6 glass-frosted rounded-3xl space-y-4 text-sm group"
                          >
                            <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-4">
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] block mb-1">
                                  {prod.brand}
                                </span>
                                <h5 className="font-medium text-[var(--text-primary)] text-lg">{prod.productName}</h5>
                              </div>
                              <span className="text-xs uppercase tracking-widest text-[var(--text-primary)] font-medium">
                                {prod.category}
                              </span>
                            </div>

                            <p className="text-[var(--text-muted)] leading-relaxed">
                              {prod.whyRelevant}
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                              {prod.fragranceFree && (
                                <span className="text-[10px] uppercase tracking-widest font-medium text-[var(--text-muted)] border border-[var(--border-color)] px-2 py-1">
                                  Fragrance-Free
                                </span>
                              )}
                              {prod.nonComedogenic && (
                                <span className="text-[10px] uppercase tracking-widest font-medium text-[var(--text-muted)] border border-[var(--border-color)] px-2 py-1">
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

            {/* ── SECTION 7 & 8: PRECAUTIONS & DERMATOLOGIST ──────────── */}
            <div className="grid md:grid-cols-2 gap-8">
              <ScrollReveal>
                <div className="space-y-6">
                  <div className="border-b border-[var(--border-color)] pb-4">
                    <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">Clinical Precautions</h3>
                  </div>

                  <div className="space-y-4 text-sm text-[var(--text-muted)] border-l border-[var(--border-color)] pl-4">
                    {GENERAL_PRECAUTIONS.map((rule, rIdx) => (
                      <div key={rIdx} className="leading-relaxed">
                        — {rule}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="space-y-6">
                  <div className="border-b border-[var(--border-color)] pb-4">
                    <h3 className="font-serif text-3xl font-normal text-[var(--text-primary)]">Professional Evaluation</h3>
                  </div>

                  <div className="space-y-4 text-sm text-[var(--text-muted)] border-l border-[var(--border-color)] pl-4">
                    {WHEN_TO_SEE_DERMATOLOGIST.map((item, dIdx) => (
                      <div key={dIdx} className="leading-relaxed">
                        — {item}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* ── SECTION 9: TRACK 3 INTEGRATION ──────────────────── */}
            <ScrollReveal>
              <div className="glass-deep rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6 mt-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--text-primary)] to-transparent opacity-[0.03] pointer-events-none" />
                <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium block relative z-10">
                  System Integration
                </span>
                <h3 className="font-serif text-4xl font-normal text-[var(--text-primary)] relative z-10">Compile Visual Profile</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed relative z-10">
                  Your biometric data has been logged. Incorporate this analysis into ContextMirror to evaluate comprehensive aesthetics.
                </p>

                <div className="pt-4 relative z-10">
                  <Link href="/test-look">
                    <GlassButton variant="primary" className="text-sm py-4 px-10">
                      Proceed to Context Evaluation
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
