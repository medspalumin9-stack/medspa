import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { getPayloadClient } from '@/lib/payload'

export async function ServicesPreview() {
  let services: any[] = []
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'services',
      where: { isActive: { equals: true } },
      limit: 3,
    })
    services = docs
  } catch {
    // DB not connected yet — render empty state
  }

  return (
    <section className="py-24 bg-[#F9F7F5]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#E8B8A8] block mb-3">
              What We Offer
            </span>
            <h2 className="text-4xl font-semibold tracking-[-0.02em] text-[#4A4A4A]">
              Our Treatments
            </h2>
          </div>
          <Link href="/services">
            <Button variant="outline">View All Services</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.length === 0 ? (
            // Placeholder cards when no DB data
            ['HydraFacial', 'LED Light Therapy', 'Microneedling'].map((name) => (
              <div
                key={name}
                className="bg-white border border-[#E0DCD9] rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-full bg-[#F4D1C5]/50 mb-4" />
                <h3 className="text-lg font-semibold text-[#4A4A4A] mb-2">{name}</h3>
                <p className="text-sm text-[#4A4A4A]/50 leading-relaxed mb-4">
                  Premium non-invasive skin treatment with visible results.
                </p>
                <Link href="/services">
                  <span className="text-sm font-medium text-[#E8B8A8] hover:underline">
                    Learn more →
                  </span>
                </Link>
              </div>
            ))
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-[#E0DCD9] rounded-xl p-6 hover:border-[#F4D1C5] transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-[#F4D1C5]/30 mb-4" />
                <h3 className="text-lg font-semibold text-[#4A4A4A] mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-[#4A4A4A]/60 leading-relaxed mb-4 line-clamp-3">
                  {typeof service.description === 'string'
                    ? service.description
                    : 'Premium non-invasive treatment.'}
                </p>
                <p className="text-sm font-medium text-[#4A4A4A]">
                  ${service.price} · {service.durationMinutes} min
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
