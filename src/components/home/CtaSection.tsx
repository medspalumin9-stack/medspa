'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })

  return (
    <section ref={ref} className="py-28 md:py-48 border-t overflow-hidden" style={{ backgroundColor: '#2A1F14', borderColor: 'rgba(214,200,176,0.15)' }}>
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {[['Book Your', false], ['Glow Up', true], ['Today.', false]].map(([line, accent], i) => (
          <div key={String(line)} className="clip-reveal">
            <motion.h2
              className={accent ? 'pl-[6vw]' : ''}
              style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300,
                fontSize: 'clamp(3.5rem, 9vw, 9rem)', lineHeight: 0.88,
                color: accent ? '#B8A48A' : '#F8F2EA', fontStyle: accent ? 'italic' : 'normal' }}
              initial={{ y: '110%' }} animate={inView ? { y: 0 } : {}}
              transition={{ duration: 1.05, delay: i * 0.09, ease: [0.76, 0, 0.24, 1] }}>
              {line}
            </motion.h2>
          </div>
        ))}

        <motion.div className="flex flex-col sm:flex-row gap-4 mt-12"
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.45 }}>
          <Link href="/booking"
            className="inline-flex items-center justify-center px-8 py-3.5 text-[11px] tracking-[0.22em] uppercase font-medium transition-colors"
            style={{ backgroundColor: '#B8A48A', color: '#2A1F14' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8F2EA')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#B8A48A')}>
            Book a Session
          </Link>
          <Link href="/services"
            className="inline-flex items-center justify-center px-8 py-3.5 border text-[11px] tracking-[0.22em] uppercase transition-all"
            style={{ borderColor: 'rgba(184,164,138,0.3)', color: 'rgba(248,242,234,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(184,164,138,0.7)'; e.currentTarget.style.color = '#F8F2EA' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,164,138,0.3)'; e.currentTarget.style.color = 'rgba(248,242,234,0.5)' }}>
            Explore Treatments
          </Link>
        </motion.div>

        <motion.div className="mt-24 pt-12 border-t max-w-sm"
          style={{ borderColor: 'rgba(214,200,176,0.12)' }}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}>
          <p className="text-[10px] tracking-[0.25em] uppercase mb-4" style={{ color: 'rgba(184,164,138,0.4)' }}>Stay Radiant</p>
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(248,242,234,0.4)' }}>
            Get skincare tips, exclusive offers, and early access to new treatments.
          </p>
          <form onSubmit={e => e.preventDefault()} className="flex">
            <input type="email" placeholder="your@email.com"
              className="flex-1 px-4 py-3 text-sm focus:outline-none"
              style={{ backgroundColor: 'rgba(248,242,234,0.05)', border: '1px solid rgba(214,200,176,0.2)', borderRight: 'none', color: '#F8F2EA' }} />
            <button type="submit"
              className="px-5 py-3 flex-shrink-0 text-[10px] tracking-[0.18em] uppercase transition-colors"
              style={{ backgroundColor: '#B8A48A', color: '#2A1F14' }}>
              Join
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
