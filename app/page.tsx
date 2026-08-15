'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { ScrollReveal, StaggerReveal, staggerChildVariants } from '@/components/ui/ScrollReveal'

/* ── Animated Counter Hook ──────────────────────────── */
function useCounter(target: number, duration = 1200, trigger = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const steps = duration / 20
    const increment = target / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.round(start))
    }, 20)
    return () => clearInterval(timer)
  }, [target, duration, trigger])
  return value
}

const STATS = [
  { value: 92, label: 'average Context Stability Score on tested looks', suffix: '/ 100', icon: '⭐' },
  { value: 7, label: 'real-world context stress dimensions evaluated', suffix: 'dims', icon: '⚡' },
  { value: 14, label: 'YouCam Perfect Corp API integrations supported', suffix: 'APIs', icon: '✦' },
  { value: 90, label: 'seconds decision time vs 15 min morning paralysis', suffix: 'sec', icon: '⏱' },
]

const STEPS = [
  {
    step: '01',
    title: 'Analyze Visual Profile',
    desc: 'YouCam Skin AI reads skin signals, facial contrast, and undertones to set your personal color harmony baseline.',
    icon: '✨',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
  },
  {
    step: '02',
    title: 'Virtual Try-On',
    desc: 'YouCam Apparel VTO renders candidate outfits directly on your selfie with high-fidelity garment visualization.',
    icon: '👗',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
  },
  {
    step: '03',
    title: 'Context Stress Test',
    desc: 'Evaluates candidate looks against occasion, time, environment, photography lighting, and formality.',
    icon: '⚡',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  },
]

const FEATURES = [
  { icon: '⚡', title: 'Context Stress Test', body: 'Evaluates occasion fit, time of day, environment, lighting, color harmony, and photography suitability.' },
  { icon: '✦', title: 'ContextMirror Score', body: 'Weighted 30/25/20/15/10 scoring engine providing clear, explainable look decisions.' },
  { icon: '◈', title: 'Change One Thing', body: 'Fashion experiment mode allowing controlled single-variable adjustments with instant score deltas.' },
  { icon: '♪', title: 'Contextual Smart 3', body: 'Generates Classic (Safe), Modern (Fresh), and Bold (Remix) options for every situation.' },
  { icon: '▶', title: '14 YouCam APIs', body: 'Full-spectrum Virtual Try-On across clothes, shoes, bags, jewelry, makeup, hair, and skin.' },
  { icon: '🧴', title: 'Skin Insight & Care', body: 'AI skin analysis, safe skincare routine guidance, verified product recommendations, and dermatologist escalation rules.' },
]

/* ── Floating Hero Cards ──────────────────────────── */
const HERO_CARDS = [
  { label: 'Context Score', value: '92', badge: '⭐ BEST MATCH', y: [0, -10, 0], dur: 6, x: 'top-6 left-6' },
  { label: 'Color Harmony', value: 'Strong', badge: '🎨 Warm Neutral', y: [0, 8, 0], dur: 7.5, x: 'bottom-24 right-6' },
  { label: 'Occasion', value: 'Evening', badge: '🌙 Ready', y: [0, -7, 0], dur: 5.5, x: 'bottom-6 left-6' },
]

export default function LandingPage() {
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen pb-24">
      {/* Floating Glass Header Nav */}
      <GlassNav />

      {/* ═══ CINEMATIC HERO ═══════════════════════════════════════════════ */}
      <section className="relative max-w-6xl mx-auto px-6 pt-4 pb-24 grid md:grid-cols-2 gap-12 items-center min-h-[80vh]">
        {/* Left Editorial Typography — Staggered Reveal */}
        <div className="space-y-7">
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={heroLoaded ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 glass-liquid px-5 py-2 rounded-full text-xs font-medium text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Skin AI + Apparel VTO Decision Simulator
            </span>
          </motion.div>

          {/* Hero headline — word-by-word reveal */}
          <motion.h1
            className="font-serif text-5xl lg:text-[3.5rem] xl:text-6xl font-normal leading-[1.08] text-[var(--text-primary)] tracking-tight"
            initial={{ opacity: 0 }}
            animate={heroLoaded ? { opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 25 }}
              animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              See how your look works
            </motion.span>
            <motion.em
              className="font-serif italic font-normal text-[var(--accent-gold)] block"
              initial={{ opacity: 0, y: 25 }}
              animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              before the real world does.
            </motion.em>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-[var(--text-muted)] text-base md:text-lg max-w-lg leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            Skin intelligence. Virtual try-on. Context-aware styling decisions.
            <span className="block text-sm mt-2 opacity-75">
              Personalized fashion + beauty AI in one unified Track 3 experience.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap items-center gap-4 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <Link href="/test-look">
              <GlassButton variant="primary" className="text-base px-9 py-4 shadow-2xl">
                ✨ Test My Look
              </GlassButton>
            </Link>
            <Link href="/skin-insights">
              <GlassButton variant="secondary" className="text-base px-8 py-4">
                🧴 Explore Skin Insights
              </GlassButton>
            </Link>
          </motion.div>
        </div>

        {/* Right — Editorial Image with Floating Glass Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
          animate={heroLoaded ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] rounded-[2rem] overflow-hidden glass-level-3 shadow-2xl group"
        >
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
            alt="ContextMirror Editorial Fashion"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[1200ms] ease-out"
          />

          {/* Dark gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

          {/* Floating Glass Insight Cards */}
          {HERO_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              animate={{ y: card.y }}
              transition={{ duration: card.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`absolute ${card.x} glass-liquid rounded-2xl p-4 shadow-2xl`}
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                {card.label}
              </div>
              <div className="font-numeric text-2xl font-bold text-[var(--text-primary)] mt-0.5">
                {card.value}
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full inline-block mt-1.5">
                {card.badge}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══ STATS GRID ═══════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-5"
          onViewportEnter={() => setStatsVisible(true)}
          viewport={{ once: true }}
        >
          {STATS.map((s, idx) => (
            <ScrollReveal key={s.label} delay={idx * 0.1}>
              <div className="glass-card glass-reflection p-7 text-center rounded-[1.5rem] group">
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <div className="font-numeric text-4xl font-bold text-[var(--text-primary)] mb-1.5">
                  <AnimatedNumber value={s.value} active={statsVisible} />{' '}
                  <span className="text-xs text-[var(--text-muted)] font-normal">{s.suffix}</span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] leading-snug">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </motion.div>
      </section>

      {/* ═══ 3 VISUAL STEPS ═══════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-mono">
              End-to-End Visual Workflow
            </span>
            <h2 className="font-serif text-4xl font-normal text-[var(--text-primary)] mt-2">
              Three Visual Steps
            </h2>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid md:grid-cols-3 gap-7">
          {STEPS.map((step) => (
            <motion.div
              key={step.step}
              variants={staggerChildVariants}
              className="glass-card glass-reflection p-0 rounded-[1.5rem] overflow-hidden group"
            >
              {/* Step image */}
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <span className="text-[10px] font-numeric font-bold uppercase tracking-widest opacity-80">
                    STEP {step.step}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <span className="text-2xl">{step.icon}</span>
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">{step.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </StaggerReveal>
      </section>

      {/* ═══ INNOVATION FEATURES ══════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-mono">
              Track 3 Architecture
            </span>
            <h2 className="font-serif text-4xl font-normal text-[var(--text-primary)] mt-2">
              Fashion & Beauty Intelligence
            </h2>
          </div>
        </ScrollReveal>

        <StaggerReveal className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={staggerChildVariants}
              className="glass-card glass-reflection p-7 rounded-[1.5rem] group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </StaggerReveal>
      </section>

      {/* ═══ FINAL CTA ════════════════════════════════════════════════════ */}
      <ScrollReveal>
        <section className="max-w-3xl mx-auto px-6 py-24 text-center glass-level-3 rounded-[2rem] space-y-7 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent-glow),transparent_70%)] opacity-40 pointer-events-none" />

          <h2 className="font-serif text-4xl lg:text-5xl font-normal text-[var(--text-primary)] relative z-10">
            Ready to test your look?
          </h2>
          <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto leading-relaxed relative z-10">
            Set your context, upload a selfie, and receive your ContextMirror decision in under 90 seconds.
          </p>
          <div className="relative z-10">
            <Link href="/test-look">
              <GlassButton variant="primary" className="text-base px-12 py-4.5 shadow-2xl">
                ✨ Test My Look →
              </GlassButton>
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer className="text-center py-12 text-xs text-[var(--text-muted)] border-t border-[var(--border-color)] mt-24 font-mono max-w-4xl mx-auto px-6">
        <span className="opacity-60">ContextMirror 2026 · Built with Perfect Corp YouCam API for Track 3 Hackathon</span>
      </footer>
    </div>
  )
}

/* ── Animated Number Component ─────────────────────── */
function AnimatedNumber({ value, active }: { value: number; active: boolean }) {
  const display = useCounter(value, 1000, active)
  return <>{display}</>
}
