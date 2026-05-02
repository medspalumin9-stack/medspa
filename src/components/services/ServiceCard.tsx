'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ServiceCardProps {
  service: {
    id: string
    name: string
    description: any
    durationMinutes: number
    price: number
    benefits?: Array<{ benefit: string }>
  }
  index: number
}

export function ServiceCard({ service, index }: ServiceCardProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-white border border-[#E0DCD9] rounded-xl p-8 hover:border-[#F4D1C5] transition-all duration-200 group flex flex-col"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-full bg-[#F4D1C5]/30 group-hover:bg-[#F4D1C5]/50 transition-colors" />
        <span className="text-xs font-medium uppercase tracking-[0.05em] text-[#4A4A4A]/40">
          {service.durationMinutes} min
        </span>
      </div>

      <h3 className="text-xl font-semibold text-[#4A4A4A] mb-3">{service.name}</h3>

      <p className="text-sm text-[#4A4A4A]/60 leading-relaxed mb-6 flex-1 line-clamp-4">
        {descriptionText}
      </p>

      {service.benefits && service.benefits.length > 0 && (
        <ul className="mb-6 space-y-1">
          {service.benefits.slice(0, 3).map((b, i) => (
            <li key={i} className="text-xs text-[#4A4A4A]/60 flex items-center gap-2">
              <span className="text-[#F4D1C5]">✦</span>
              {b.benefit}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[#E0DCD9] mt-auto">
        <span className="text-lg font-semibold text-[#4A4A4A]">${service.price}</span>
        <Link href={`/booking?service=${service.id}`}>
          <Button variant="primary" size="sm">Book Now</Button>
        </Link>
      </div>
    </motion.div>
  )
}
