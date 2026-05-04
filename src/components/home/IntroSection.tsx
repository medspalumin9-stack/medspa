'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const PARAS = [
  'Lumin Medspa is a professional aesthetic practice focused on non-invasive skin rejuvenation. We pair evidence-based treatments with unhurried, attentive care, so each visit is as reassuring as it is results-focused.',
  'Our team offers advanced facials, light-based therapies, and collagen-supporting protocols tailored to your goals prioritizing safety, comfort, and minimal downtime.',
]

export function IntroSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })

  return (
    <section id="about" ref={ref} className="bliss-about-section intro-about">
      <div className="bliss-container">
        <div className="bliss-about-grid">
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
            }}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
          >
            <motion.span
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bliss-about-eyebrow"
            >
              Wellness Packages
            </motion.span>
            <motion.h2
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bliss-about-title"
            >
              Rejuvenate your body &amp; soul
            </motion.h2>

            {PARAS.map((text, i) => (
              <motion.p
                key={i}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bliss-about-copy"
              >
                {text}
              </motion.p>
            ))}

            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              className="bliss-about-cta-wrap"
            >
              <Link href="/services" className="bliss-about-cta">
                More about Our Services
                <span aria-hidden>→</span>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="bliss-about-image-wrap"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.85, delay: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Image
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900&q=80"
              alt="Calm treatment room at Lumin Medspa"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 42vw, 100vw"
              priority={false}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, transparent 55%, rgba(30, 33, 30, 0.1) 100%)',
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
