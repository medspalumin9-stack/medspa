'use client'

import { motion } from 'framer-motion'

export function BlissoriaPageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="px-6 sm:px-10 lg:px-14 pt-28 md:pt-32 pb-14 md:pb-20 max-w-6xl mx-auto text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.55 }}
        className="font-sans text-sm font-medium text-tan mb-5"
      >
        {eyebrow}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.65 }}
        className="font-display font-normal text-dark text-[clamp(2.15rem,4.8vw,3.5rem)] leading-[1.12] mb-6 tracking-[-0.02em]"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.55 }}
        className="font-sans font-light text-text/80 text-[15px] md:text-[17px] max-w-2xl mx-auto leading-[1.7]"
      >
        {description}
      </motion.p>
    </motion.div>
  )
}
