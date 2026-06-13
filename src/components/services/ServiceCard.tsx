'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BLISSORIA_CARD_SIZES, blissoriaServiceThumbForIndex } from '@/lib/blissoria-card'
import { formatGhs } from '@/lib/format-currency'

interface ServiceCardProps {
  service: {
    id: string
    name: string
    description: any
    durationMinutes: number
    price: number
    imageUrl?: string | null
    benefits?: Array<string | { benefit: string }>
  }
  index: number
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-8% 0px' })
  const bookingHref = `/booking?service=${service.id}`
  const fallback = blissoriaServiceThumbForIndex(index)

  const descriptionText =
    typeof service.description === 'string'
      ? service.description
      : Array.isArray(service.description?.root?.children)
        ? service.description.root.children
            .map((block: any) =>
              block.children?.map((child: any) => child.text || '').join('') || ''
            )
            .join(' ')
        : 'Premium non-invasive treatment.'

  const excerpt =
    descriptionText.length > 140 ? `${descriptionText.slice(0, 137).trim()}…` : descriptionText

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
      <Link
        href={bookingHref}
        className="service-card-wrap group/scard block text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#6b5344]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#edddc3]"
      >
        <div className="service-card-image-wrap">
          {service.imageUrl ? (
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              sizes={BLISSORIA_CARD_SIZES}
              className="service-card-image"
            />
          ) : (
            <img
              src={fallback.src}
              srcSet={fallback.srcSet}
              sizes={BLISSORIA_CARD_SIZES}
              alt={service.name}
              loading="lazy"
              decoding="async"
              className="service-card-image"
            />
          )}
        </div>
        <div className="service-card-content-wrapper">
          <p className="service-card-kicker">{service.durationMinutes} minutes session</p>
          <div className="service-card-title-wrap">
            <div className="service-card-title">{service.name}</div>
          </div>
          <div className="service-card-text-wrap">
            <p className="service-card-text">{excerpt}</p>
          </div>
          <div className="service-card-price">{formatGhs(service.price)}</div>
          <span className="tertiary-button">
            <span className="tertiary-button-text-wrap">
              <span className="tertiary-button-slide">
                <span className="tertiary-button-text">Book session</span>
                <span className="tertiary-button-text">Book session</span>
              </span>
            </span>
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
