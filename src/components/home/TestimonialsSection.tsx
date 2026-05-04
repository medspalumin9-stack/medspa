'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TESTIMONIALS = [
  {
    id: 1,
    quote: 'My skin has never looked better. After just three HydraFacial sessions at Lumin, people keep asking what I changed. The results are genuinely transformative.',
    author: 'Amara K.',
    treatment: 'HydraFacial',
  },
  {
    id: 2,
    quote: 'The microneedling session was incredible. Zero downtime, and my skin texture improved dramatically within a week. The practitioners are world-class.',
    author: 'Sofia R.',
    treatment: 'Microneedling',
  },
  {
    id: 3,
    quote: "I've tried many medspas but Lumin is on another level. The personalized approach and LED therapy gave me results I didn't think were possible.",
    author: 'James O.',
    treatment: 'LED Light Therapy',
  },
]

export function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const current = TESTIMONIALS[active]

  return (
    <section className="bg-[#1A1614] py-36 md:py-52 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="flex flex-col md:flex-row gap-16 md:gap-24">

          {/* Left */}
          <div className="md:w-56 flex-shrink-0">
            <span className="text-[#D4A898] text-[10px] tracking-[0.28em] uppercase block mb-12">
              Testimonials
            </span>
            <div className="flex flex-col gap-4">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setActive(i)}
                  className={`text-left text-sm transition-all duration-300 flex items-center gap-3 ${
                    i === active ? 'text-white' : 'text-white/25 hover:text-white/50'
                  }`}
                >
                  <span className={`h-px transition-all duration-300 flex-shrink-0 ${i === active ? 'w-8 bg-[#D4A898]' : 'w-3 bg-white/20'}`} />
                  <span className="text-[11px] tracking-[0.08em] uppercase">{t.author}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right — quote */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <p
                  className="text-white/80 leading-[1.35]"
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(1.6rem, 3.5vw, 3rem)' }}
                >
                  &ldquo;{current.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4 mt-10">
                  <div className="w-8 h-px bg-[#D4A898]" />
                  <div>
                    <p className="text-white/60 text-xs tracking-[0.12em] uppercase">{current.author}</p>
                    <p className="text-white/25 text-[10px] tracking-[0.1em] uppercase mt-0.5">{current.treatment}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  )
}
