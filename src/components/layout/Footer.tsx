'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { BLISSORIA_FOOTER_BG } from '@/lib/blissoria-cdn'

export function Footer() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-8% 0px' })

  return (
    <footer ref={ref} className="bliss-footer footer">
      <img
        className="footer-bg footer-bg-desktop"
        src={BLISSORIA_FOOTER_BG.desktop.src}
        srcSet={BLISSORIA_FOOTER_BG.desktop.srcSet}
        sizes={BLISSORIA_FOOTER_BG.desktop.sizes}
        alt=""
        aria-hidden
      />
      <img
        className="footer-bg footer-bg-tab"
        src={BLISSORIA_FOOTER_BG.tab.src}
        srcSet={BLISSORIA_FOOTER_BG.tab.srcSet}
        sizes={BLISSORIA_FOOTER_BG.tab.sizes}
        alt=""
        aria-hidden
      />
      <img className="footer-bg footer-bg-mobile" src={BLISSORIA_FOOTER_BG.mobile.src} alt="" aria-hidden />

      <div className="bliss-container footer-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="footer-top-wrap"
        >
          <div className="footer-info-wrap">
            <div className="footer-info-title-wrap">
              <h4 className="footer-info-title">Address</h4>
            </div>
            <div className="footer-info-text">
              Your studio address
              <br />
              City, ST 00000
            </div>
          </div>
          <div className="footer-info-wrap">
            <div className="footer-info-title-wrap">
              <h4 className="footer-info-title">Work hours</h4>
            </div>
            <div className="footer-info-text-wrap">
              <div className="footer-info-text">Monday – Saturday 10AM – 7PM</div>
              <div className="footer-info-text">Sunday by appointment</div>
            </div>
          </div>
          <div className="footer-info-wrap">
            <div className="footer-info-title-wrap">
              <h4 className="footer-info-title">Contact</h4>
            </div>
            <div className="footer-info-text-wrap">
              <a href="tel:+10000000000" className="footer-info-link-wrap">
                <span className="footer-info-icon" aria-hidden>
                  ☎
                </span>
                <span className="footer-link-text">+1 (000) 000-0000</span>
              </a>
              <a href="mailto:hello@luminmedspa.com" className="footer-info-link-wrap">
                <span className="footer-info-icon" aria-hidden>
                  ✉
                </span>
                <span className="footer-link-text">hello@luminmedspa.com</span>
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="footer-bottom-wrap"
        >
          <div className="footer-link-wrap">
            <Link href="/services" className="footer-link">
              Services
            </Link>
            <Link href="/shop" className="footer-link">
              Shop
            </Link>
            <Link href="/booking" className="footer-link">
              Book
            </Link>
          </div>
          <div className="copyright-wrap">
            <p className="copyright-text">© {new Date().getFullYear()} Lumin Medspa. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
