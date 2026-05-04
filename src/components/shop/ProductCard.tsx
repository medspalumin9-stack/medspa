'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { generateWhatsAppLink } from '@/lib/whatsapp'
import { BLISSORIA_CARD_SIZES, blissoriaServiceThumbForIndex } from '@/lib/blissoria-card'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  category?: string
}

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-8% 0px' })

  const excerpt =
    product.description.length > 140
      ? `${product.description.slice(0, 137).trim()}…`
      : product.description

  const kicker = product.category ? `${product.category} · Boutique` : 'Boutique'
  const src = product.imageUrl?.trim()
  const fallback = blissoriaServiceThumbForIndex(index)

  return (
    <motion.div
      ref={ref}
      role="listitem"
      className="service-list-item"
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.07,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <div className="service-card-wrap group/scard block h-full">
        <div className="service-card-image-wrap relative aspect-[4/3] w-full overflow-hidden rounded-[var(--bliss-radius-s)] bg-[#1e211e]/5">
          {src ? (
            <Image
              src={src}
              alt={product.name}
              fill
              sizes={BLISSORIA_CARD_SIZES}
              className="service-card-image object-cover"
            />
          ) : (
            <img
              src={fallback.src}
              srcSet={fallback.srcSet}
              sizes={BLISSORIA_CARD_SIZES}
              alt=""
              loading="lazy"
              decoding="async"
              className="service-card-image absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        <div className="service-card-content-wrapper">
          <p className="service-card-kicker capitalize">{kicker}</p>
          <div className="service-card-title-wrap">
            <div className="service-card-title">{product.name}</div>
          </div>
          <div className="service-card-text-wrap">
            <p className="service-card-text">{excerpt}</p>
          </div>
          <div className="service-card-price">${product.price}</div>
          <a
            href={generateWhatsAppLink(product.name, String(product.price))}
            target="_blank"
            rel="noopener noreferrer"
            className="tertiary-button mt-2"
          >
            <span className="tertiary-button-text-wrap">
              <span className="tertiary-button-slide">
                <span className="tertiary-button-text">Order via WhatsApp</span>
                <span className="tertiary-button-text">Order via WhatsApp</span>
              </span>
            </span>
          </a>
        </div>
      </div>
    </motion.div>
  )
}
