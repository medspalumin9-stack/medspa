'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLS = 9

export function LoadingScreen() {
  const [done, setDone] = useState(false)
  useEffect(() => { const t = setTimeout(() => setDone(true), 2200); return () => clearTimeout(t) }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="fixed inset-0 z-[300] pointer-events-none flex" exit={{ opacity: 1 }}>
          {Array.from({ length: COLS }).map((_, i) => (
            <motion.div key={i} className="flex-1 h-full origin-top"
              style={{ backgroundColor: i % 2 === 0 ? '#1a1714' : '#2c2620' }}
              initial={{ scaleY: 1 }} animate={{ scaleY: 0 }}
              transition={{ duration: 0.75, delay: 1.1 + i * 0.045, ease: [0.76, 0, 0.24, 1] }} />
          ))}
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
            initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.35, delay: 0.9 }}>
            <span className="font-display text-[clamp(1.35rem,4vw,1.85rem)] font-normal text-[#C4B5A0] tracking-[0.06em]">
              Lumin Medspa
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
