'use client'
import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

export function PhilosophySection() {
  const ref = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })

  const { scrollYProgress } = useScroll({ target: imgRef, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section className="bg-[#F7F4F1] overflow-hidden">
      {/* Top strip */}
      <div className="px-6 md:px-16 pt-28 pb-0 max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-[#1A1614]/30 text-[10px] tracking-[0.28em] uppercase">Our Philosophy</span>
        <span className="text-[#1A1614]/30 text-[10px] tracking-[0.28em] uppercase">Est. 2019</span>
      </div>

      {/* Giant heading */}
      <div ref={ref} className="px-6 md:px-16 pt-10 max-w-7xl mx-auto">
        {['Science', 'Backed', 'Beauty.'].map((word, i) => (
          <div key={word} className="clip-reveal">
            <motion.h2
              className={`leading-[0.85] tracking-[-0.03em] text-[#1A1614] ${i === 1 ? 'pl-[15vw] italic' : ''}`}
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: 300,
                fontSize: 'clamp(4.5rem, 13vw, 13rem)',
              }}
              initial={{ y: '105%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ duration: 1.1, delay: i * 0.1, ease: [0.76, 0, 0.24, 1] }}
            >
              {word}
            </motion.h2>
          </div>
        ))}
      </div>

      {/* Parallax image + description */}
      <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Image */}
        <div ref={imgRef} className="aspect-[4/5] relative overflow-hidden bg-[#EDD5CB]/30">
          <motion.div
            className="absolute inset-[-10%] w-[120%] h-[120%]"
            style={{
              y,
              backgroundImage: 'url(https://images.unsplash.com/photo-1570194065650-d99fb4b38796?w=800)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        {/* Text */}
        <motion.div
          className="bg-[#1A1614] flex flex-col justify-end p-12 md:p-20"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <p className="text-white/40 text-sm leading-relaxed mb-10 max-w-sm">
            Every treatment at Lumin is grounded in clinical research and delivered
            by certified practitioners. We combine the latest technology with the
            artistry of aesthetic medicine to create personalized experiences that
            deliver real, measurable results.
          </p>
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
            {[['98%', 'Client satisfaction'], ['15+', 'Treatment types']].map(([v, l]) => (
              <div key={l}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: '3rem' }} className="text-white/90">{v}</p>
                <p className="text-white/30 text-[10px] tracking-[0.18em] uppercase mt-1">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
