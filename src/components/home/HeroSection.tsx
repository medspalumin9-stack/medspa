'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

const DELAY = 2.4

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-16"
      style={{ backgroundColor: '#1a1714' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(176,144,96,0.08) 0%, transparent 70%)',
        }}
      />

      <motion.span
        className="absolute top-32 left-auto right-6 md:right-12 lg:right-20 text-right text-[10px] md:text-[11px] tracking-[0.28em] uppercase font-sans font-medium text-[#C4B5A0] max-w-[min(100%-7rem,20rem)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: DELAY + 0.2, duration: 0.8 }}
      >
        Non-invasive skin rejuvenation
      </motion.span>

      <div className="absolute left-4 md:left-10 lg:left-16 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="clip-reveal">
          <motion.h1
            className="font-display font-normal text-[#FAF8F5] leading-[0.88]"
            style={{
              fontSize: 'clamp(4rem, 8vw, 8rem)',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: DELAY + 0.5, duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Your Skin
          </motion.h1>
        </div>
      </div>

      <div className="absolute right-4 md:right-10 lg:right-16 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="clip-reveal">
          <motion.h1
            className="font-display italic font-normal text-[#FAF8F5] leading-[0.88]"
            style={{
              fontSize: 'clamp(4rem, 8vw, 8rem)',
              writingMode: 'vertical-rl',
            }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: DELAY + 0.6, duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Glow
          </motion.h1>
        </div>
      </div>

      <motion.div
        className="relative z-20"
        initial={{ scale: 0.65, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{
          scale: { delay: DELAY, duration: 1.4, ease: [0.16, 1, 0.3, 1] },
          opacity: { delay: DELAY, duration: 1 },
          rotate: { delay: DELAY, duration: 1.4, ease: [0.16, 1, 0.3, 1] },
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear', delay: DELAY + 1.4 }}
        >
          <div
            style={{
              width: 'clamp(220px, 32vw, 460px)',
              height: 'clamp(310px, 46vw, 660px)',
              borderRadius: '50%',
              border: '1px solid rgba(196,181,160,0.45)',
              padding: '7px',
              position: 'relative',
            }}
          >
            <motion.div
              className="relative w-full h-full overflow-hidden"
              style={{ borderRadius: '50%' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear', delay: DELAY + 1.4 }}
            >
              <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src="/hero.mp4" type="video/mp4" />
              </video>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 55%, rgba(42,34,25,0.52) 100%)',
                }}
              />
            </motion.div>
            <div
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: '#C4B5A0' }}
            />
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-24 md:bottom-28 left-auto right-4 md:right-10 lg:right-16 xl:right-24 text-right z-10 pointer-events-none w-[min(100%-1.5rem,28rem)] pl-8 ml-auto">
        <p className="clip-reveal font-sans text-sm md:text-base font-normal text-white/40 mb-5 tracking-wide">
          
        </p>
        <div className="clip-reveal">
          <motion.h2
            className="font-display font-normal text-[#FAF8F5] leading-[0.88] text-right"
            style={{ fontSize: 'clamp(3rem, 7vw, 7rem)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ delay: DELAY + 0.7, duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          >
            Awaits.
          </motion.h2>
        </div>
      </div>

      <motion.div
        className="absolute bottom-6 left-auto right-4 md:right-10 lg:right-16 xl:right-24 flex items-center justify-end gap-6 md:gap-10 z-10 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: DELAY + 1.2, duration: 0.8 }}
      >
        <Link
          href="/booking"
          className="inline-flex items-center justify-center rounded-full px-8 py-3 bg-[#FAF8F5] text-[#2A2219] text-[10px] font-semibold tracking-[0.18em] uppercase hover:bg-[#EDE8E0] transition-colors font-sans"
        >
          
        </Link>
        <Link
          href="/services"
          className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/45 hover:text-white transition-colors font-sans"
        >
          
        </Link>
      </motion.div>

      <motion.div
        className="absolute right-5 bottom-1/2 translate-y-1/2 hidden sm:flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: DELAY + 1.5, duration: 0.8 }}
      >
        <span
          className="text-[9px] tracking-[0.22em] uppercase font-sans text-[#C4B5A0]/50"
          style={{ writingMode: 'vertical-rl' }}
        >
          Scroll
        </span>
        <div className="w-px h-14 relative overflow-hidden bg-white/10">
          <motion.div
            className="absolute inset-x-0 top-0 bg-[#C4B5A0]"
            animate={{ height: ['0%', '100%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
