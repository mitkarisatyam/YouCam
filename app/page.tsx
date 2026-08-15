'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { ScrollReveal, StaggerReveal, staggerChildVariants } from '@/components/ui/ScrollReveal'

const HEADLINE = "See how your look works"
const SUBHEAD = "before the real world does."

const INSIGHT_CARDS = [
  { top: '10%', left: '-15%', delay: 1.5, content: '✨ 92 Context Score' },
  { top: '40%', right: '-20%', delay: 1.7, content: '🧴 4 Skin Signals Detected' },
  { top: '70%', left: '-10%', delay: 1.9, content: '👗 Evening Look Match' },
]

export default function LandingPage() {
  const [heroLoaded, setHeroLoaded] = useState(false)
  const { scrollY } = useScroll()
  const yHeroText = useTransform(scrollY, [0, 500], [0, 150])
  const yHeroImage = useTransform(scrollY, [0, 500], [0, 50])

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen pb-24 font-ui text-[var(--text-primary)]">
      <GlassNav />

      {/* ═══ CINEMATIC HERO ═══════════════════════════════════════════════ */}
      <section className="relative max-w-[90rem] mx-auto px-6 pt-12 pb-32 grid lg:grid-cols-2 gap-16 items-center min-h-[90vh]">
        
        {/* TEXT CONTENT */}
        <motion.div style={{ y: yHeroText }} className="space-y-10 z-10">
          <h1 className="font-serif text-6xl lg:text-8xl font-normal leading-[1.05] tracking-tight text-[var(--text-primary)]">
            <span className="block overflow-hidden">
              {HEADLINE.split(' ').map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.25em]"
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  animate={heroLoaded ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block overflow-hidden mt-2">
              <motion.em
                className="font-serif italic font-normal text-[var(--text-muted)] inline-block"
                initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                animate={heroLoaded ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              >
                {SUBHEAD}
              </motion.em>
            </span>
          </h1>

          <motion.p
            className="text-[var(--text-muted)] text-xl max-w-lg leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            Skin intelligence. Hair intelligence. Wardrobe intelligence. Virtual try-on. Context-aware decisions.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-6 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={heroLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <Link href="/test-look">
              <GlassButton variant="primary" className="px-8 py-4 text-base">
                ✦ Test My Look
              </GlassButton>
            </Link>
            <Link href="/looks">
              <GlassButton variant="secondary" className="px-8 py-4 text-base border-transparent hover:border-[var(--border-strong)]">
                Explore Your Style
              </GlassButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* CINEMATIC IMAGE / VIDEO AREA */}
        <motion.div
          style={{ y: yHeroImage }}
          initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
          animate={heroLoaded ? { opacity: 1, filter: 'blur(0px)', scale: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl group mx-auto w-full max-w-md lg:max-w-full z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80"
            alt="Cinematic Fashion Editorial"
            className="w-full h-full object-cover grayscale-[10%] contrast-[1.1] brightness-[0.95] group-hover:scale-[1.03] transition-transform duration-[3000ms] ease-out"
          />

          {/* FLOATING MICRO CARDS */}
          {INSIGHT_CARDS.map((card, i) => (
            <motion.div
              key={i}
              className="absolute glass-crystal px-4 py-2 rounded-full text-xs font-medium text-[var(--text-primary)] shadow-elevated whitespace-nowrap hidden md:block"
              style={{ top: card.top, left: card.left, right: card.right }}
              initial={{ opacity: 0, x: card.left ? -20 : 20, y: 10 }}
              animate={heroLoaded ? { opacity: 1, x: 0, y: [0, -5, 0] } : {}}
              transition={{
                opacity: { duration: 0.8, delay: card.delay },
                x: { duration: 0.8, delay: card.delay, ease: "easeOut" },
                y: { duration: 4, repeat: Infinity, delay: card.delay, ease: "easeInOut" }
              }}
            >
              {card.content}
            </motion.div>
          ))}
          
          {/* Glass overlay reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[rgba(255,255,255,0.05)] to-transparent pointer-events-none" />
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer className="text-center py-12 text-xs text-[var(--text-muted)] font-numeric max-w-[85rem] mx-auto px-6 border-t border-[var(--border-color)]">
        <span className="opacity-80">ContextMirror 2026. Living Digital Fashion Studio.</span>
      </footer>
    </div>
  )
}
