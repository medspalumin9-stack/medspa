'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { generateWhatsAppLink } from '@/lib/whatsapp'

interface Props {
  product: { id: string; name: string; price: number; imageUrl: string }
  index: number
}

export function ProductCard({ product, index }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })

  return (
    <motion.div ref={ref} className="group"
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: index * 0.1 }}>
      <div className="aspect-[3/4] overflow-hidden relative rounded-sm" style={{ backgroundColor: '#F0E8DA' }}>
        <Image src={product.imageUrl} alt={product.name} fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(42,31,20,0.5) 0%, transparent 60%)' }}>
          <a href={generateWhatsAppLink(product.name, String(product.price))}
            target="_blank" rel="noopener noreferrer"
            className="w-full py-2.5 text-center text-[10px] tracking-[0.2em] uppercase transition-colors"
            style={{ backgroundColor: '#F8F2EA', color: '#2A1F14' }}>
            Order via WhatsApp
          </a>
        </div>
      </div>
      <div className="flex items-start justify-between mt-3 px-0.5">
        <div>
          <h3 className="text-sm font-light" style={{ color: '#2A1F14' }}>{product.name}</h3>
          <p className="text-[11px] tracking-[0.08em] uppercase mt-0.5" style={{ color: '#9C8060' }}>Skincare</p>
        </div>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 300, color: '#3D2E1E' }}>
          ${product.price}
        </span>
      </div>
    </motion.div>
  )
}
