'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import {
  BLISSORIA_BTN_ICON_ALT,
  BLISSORIA_BTN_ICON_PRIMARY,
} from '@/lib/blissoria-cdn'

export function BlissoriaLandingSections() {
  const ctaRef = useRef(null)
  const ctaInView = useInView(ctaRef, { once: true, margin: '-10% 0px' })

  return (
    <section ref={ctaRef} className="bliss-spot-awaits">
      <div className="bliss-container">
        <motion.div
          className="bliss-spot-awaits-card"
          initial={{ opacity: 0, y: 28 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div>
            <span className="bliss-about-eyebrow">Your Spot Awaits</span>
            <h3 className="bliss-spot-awaits-title">Book your session today</h3>
            <p className="bliss-spot-awaits-copy">
              Choose your service and time online, we&apos;ll confirm by email and text so you can arrive
              relaxed and ready.
            </p>
          </div>
          <div className="bliss-spot-awaits-actions">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/booking" className="bliss-secondary-button">
                <span className="bliss-secondary-button-bg" aria-hidden />
                <span className="bliss-secondary-button-icon-wrap">
                  <Image
                    src={BLISSORIA_BTN_ICON_PRIMARY}
                    alt=""
                    width={22}
                    height={22}
                    className="bliss-secondary-button-icon"
                  />
                  <Image
                    src={BLISSORIA_BTN_ICON_ALT}
                    alt=""
                    width={22}
                    height={22}
                    className="bliss-secondary-button-icon bliss-icon-hover"
                  />
                </span>
                <span className="bliss-secondary-button-text">Book Appointment</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/services" className="bliss-about-cta">
                View Services
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
