'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#F9F7F5]">
      {/* Glow radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(244,209,197,0.35) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-medium uppercase tracking-[0.1em] text-[#E8B8A8] mb-6 block"
          >
            Non-Invasive Skin Rejuvenation
          </motion.span>

          <h1 className="text-5xl md:text-6xl font-bold tracking-[-0.02em] text-[#4A4A4A] leading-tight mb-6">
            Your
            <br />
            <span className="relative inline-block">
              Glow Up
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#F4D1C5]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />
            </span>
            <br />
            Starts Here.
          </h1>

          <p className="text-lg text-[#4A4A4A]/60 leading-relaxed mb-10 max-w-md">
            Science-backed, non-invasive treatments designed to restore, refresh,
            and reveal your most radiant skin — with zero downtime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/booking">
              <Button variant="primary" size="lg">
                Book Your Glow Up
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="secondary" size="lg">
                Explore Services
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="relative hidden lg:block"
        >
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#F4D1C5]/20 border border-[#E0DCD9] flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl opacity-15 mb-4">✦</div>
              <p className="text-sm text-[#4A4A4A]/30 uppercase tracking-[0.1em]">
                Your glow awaits
              </p>
            </div>
          </div>

          {/* Floating stat card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -bottom-6 -left-6 bg-white border border-[#E0DCD9] rounded-xl p-4 shadow-sm"
          >
            <p className="text-xs text-[#4A4A4A]/50 uppercase tracking-[0.05em]">
              Visible results in
            </p>
            <p className="text-2xl font-bold text-[#4A4A4A]">1 Session</p>
          </motion.div>

          {/* Floating tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -top-4 -right-4 bg-[#F4D1C5] rounded-xl px-4 py-2"
          >
            <p className="text-xs font-medium text-[#4A4A4A] uppercase tracking-[0.05em]">
              Zero Downtime
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
