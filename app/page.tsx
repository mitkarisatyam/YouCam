'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassNav } from '@/components/ui/GlassNav'
import { GlassButton } from '@/components/ui/GlassButton'
import { CinematicAtmosphere } from '@/components/ui/CinematicAtmosphere'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export default function Home() {
  return (
    <div className="min-h-screen pb-32 font-ui text-[var(--text-primary)]">
      <GlassNav />

      {/* Cinematic styling environment background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-50">
        <CinematicAtmosphere />
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)] mix-blend-overlay" />
      </div>

      <main className="space-y-32">
        {/* 1. HERO */}
        <section className="max-w-[90rem] mx-auto px-6 pt-16 md:pt-24 grid lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
          <div className="space-y-8 z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-4">
              <span className="premium-badge">ContextMirror</span>
              <h1 className="font-serif text-6xl lg:text-8xl font-normal leading-[1.05] tracking-tight">
                Your personal<br/>
                <span className="italic text-[var(--text-muted)]">decision studio.</span>
              </h1>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-[var(--text-muted)] text-xl leading-relaxed max-w-lg">
              Understand your skin, define your hairstyle, organize your wardrobe, and stress-test your outfits in real-world contexts before you even step outside.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-wrap items-center gap-6 pt-4">
              <Link href="/test-look">
                <GlassButton variant="primary" className="px-8 py-4 text-lg">
                  Test My Look ✦
                </GlassButton>
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[4/5] lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl group w-full max-w-2xl mx-auto"
          >
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80" 
              alt="Fashion styling mirror environment" 
              className="w-full h-full object-cover grayscale-[20%] group-hover:scale-[1.03] transition-transform duration-[3000ms]" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-10 left-10 glass-deep p-6 rounded-2xl max-w-xs">
               <p className="font-serif text-xl">"Your beauty. Your wardrobe. Your moment."</p>
            </div>
          </motion.div>
        </section>

        {/* 2. CORE FEATURES */}
        <ScrollReveal>
          <section className="max-w-[90rem] mx-auto px-6 space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="premium-badge">What You Can Do</span>
              <h2 className="font-serif text-5xl font-normal">Everything in one place.</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Skin Intelligence', icon: '🧴', link: '/skin-insights', img: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=80', desc: 'Biometric scan for personalized skincare routines.' },
                { title: 'Hair Studio', icon: '💇', link: '/hair-studio', img: 'https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?w=600&q=80', desc: 'Discover and try on new hairstyles.' },
                { title: 'Personal Wardrobe', icon: '👗', link: '/wardrobe', img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80', desc: 'Digitize your closet and track what works.' },
                { title: 'Shopping Assistant', icon: '🛍️', link: '/shopping', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', desc: 'Find missing pieces to complete your style.' },
                { title: 'Test My Look', icon: '⚡', link: '/test-look', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', desc: 'Stress-test your outfit for occasion and lighting.' }
              ].map((feat, i) => (
                <Link href={feat.link} key={feat.title} className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] flex flex-col justify-end p-8 tilt-card">
                  <div className="absolute inset-0 z-[-1]">
                    <img src={feat.img} alt={feat.title} className="w-full h-full object-cover grayscale-[30%] opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  </div>
                  <div className="relative z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-3xl mb-4 block">{feat.icon}</span>
                    <h3 className="font-serif text-3xl font-normal text-white mb-2">{feat.title}</h3>
                    <p className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{feat.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* 3. HOW IT WORKS */}
        <ScrollReveal>
          <section className="max-w-[90rem] mx-auto px-6 py-24 glass-soft rounded-[3rem] text-center space-y-16">
             <div className="space-y-4 max-w-3xl mx-auto">
               <span className="premium-badge">How It Works</span>
               <h2 className="font-serif text-5xl font-normal">A seamless styling flow.</h2>
             </div>
             
             <div className="grid md:grid-cols-4 gap-8">
               {[
                 { step: '1', title: 'Understand', desc: 'Scan your skin and hair to build your baseline profile.' },
                 { step: '2', title: 'Explore', desc: 'Upload your garments and explore personalized recommendations.' },
                 { step: '3', title: 'Visualize', desc: 'Try on hairstyles and apparel using AI virtual rendering.' },
                 { step: '4', title: 'Decide', desc: 'Stress-test the final look against the target occasion.' },
               ].map((item) => (
                 <div key={item.step} className="space-y-4 relative">
                    <div className="text-[var(--text-muted)] font-serif text-6xl opacity-20 absolute -top-10 left-1/2 -translate-x-1/2">{item.step}</div>
                    <h3 className="font-medium text-xl relative z-10">{item.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] relative z-10">{item.desc}</p>
                 </div>
               ))}
             </div>
          </section>
        </ScrollReveal>

        {/* 4. WHY CONTEXTMIRROR */}
        <ScrollReveal>
          <section className="max-w-[90rem] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
             <div className="space-y-8">
               <span className="premium-badge">Why ContextMirror?</span>
               <h2 className="font-serif text-5xl font-normal">Beyond the mirror.</h2>
               <div className="space-y-6">
                 <div className="glass-deep p-6 rounded-2xl">
                   <h4 className="font-medium text-lg mb-2">Personalized</h4>
                   <p className="text-[var(--text-muted)]">Everything is tailored to your unique skin architecture, hair profile, and existing wardrobe.</p>
                 </div>
                 <div className="glass-deep p-6 rounded-2xl">
                   <h4 className="font-medium text-lg mb-2">Context-Aware</h4>
                   <p className="text-[var(--text-muted)]">We evaluate looks based on time of day, lighting, formality, and occasion context.</p>
                 </div>
                 <div className="glass-deep p-6 rounded-2xl">
                   <h4 className="font-medium text-lg mb-2">Visual & Practical</h4>
                   <p className="text-[var(--text-muted)]">See actual visual renderings instead of guessing, minimizing outfit regret.</p>
                 </div>
               </div>
             </div>
             <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80" alt="Wardrobe details" className="w-full h-full object-cover" />
             </div>
          </section>
        </ScrollReveal>

        {/* 5. FINAL CTA */}
        <ScrollReveal>
          <section className="max-w-4xl mx-auto px-6 text-center space-y-10 py-32">
            <h2 className="font-serif text-6xl font-normal">Ready to see what works for you?</h2>
            <p className="text-[var(--text-muted)] text-xl">Start building your profile today.</p>
            <div className="pt-8">
              <Link href="/test-look">
                <GlassButton variant="primary" className="px-12 py-5 text-xl">
                  Test My Look ✦
                </GlassButton>
              </Link>
            </div>
          </section>
        </ScrollReveal>

      </main>
    </div>
  )
}
