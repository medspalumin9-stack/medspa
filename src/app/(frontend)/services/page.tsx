import { getPayloadClient } from '@/lib/payload'
import { ServiceCard } from '@/components/services/ServiceCard'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Services | Lumin MedSpa' }

export default async function ServicesPage() {
  let services: any[] = []
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'services',
      where: { isActive: { equals: true } },
      limit: 50,
    })
    services = docs
  } catch {
    // DB not connected — show placeholder
  }

  return (
    <div className="min-h-screen bg-[#F9F7F5]">
      {/* Hero */}
      <div className="border-b border-[#E0DCD9]">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center max-w-2xl mx-auto">
          <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#E8B8A8] block mb-4">
            Our Treatments
          </span>
          <h1 className="text-5xl font-bold tracking-[-0.02em] text-[#4A4A4A] mb-4">
            Non-Invasive Glow Treatments
          </h1>
          <p className="text-lg text-[#4A4A4A]/60 leading-relaxed">
            Science-backed procedures with zero downtime, designed for busy
            professionals who demand results.
          </p>
        </div>
      </div>

      {/* Services grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {services.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'HydraFacial', duration: 60, price: 195, desc: 'A multi-step facial treatment that cleanses, exfoliates, and hydrates the skin using vortex-fusion technology.' },
              { name: 'LED Light Therapy', duration: 30, price: 85, desc: 'Non-invasive photobiomodulation using red wavelengths to stimulate collagen and reduce inflammation.' },
              { name: 'Microneedling', duration: 75, price: 299, desc: 'Controlled micro-injuries stimulate healing, boosting collagen and elastin for smoother, firmer skin.' },
              { name: 'Chemical Peel', duration: 45, price: 145, desc: 'Precisely formulated exfoliation to reveal brighter, more even-toned skin underneath.' },
            ].map((s, i) => (
              <ServiceCard
                key={s.name}
                service={{ id: i.toString(), name: s.name, description: s.desc, durationMinutes: s.duration, price: s.price }}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-[#4A4A4A]/60 mb-6 text-lg">
            Ready to start your glow up journey?
          </p>
          <Link href="/booking">
            <Button variant="primary" size="lg">Book Your Appointment</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
