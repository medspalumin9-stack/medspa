import { prisma } from '@/lib/prisma'
import { ServiceCard } from '@/components/services/ServiceCard'
import { AdminCatalogBar } from '@/components/admin/AdminCatalogBar'
import Link from 'next/link'
import type { Metadata } from 'next'
import '@/styles/blissoria-services-scope.css'
import '@/styles/admin-blissoria.css'

export const metadata: Metadata = { title: 'Services | Lumin MedSpa' }

const PLACEHOLDER_SERVICES = [
  {
    id: '1',
    name: 'HydraFacial',
    description:
      'A multi-step facial treatment that cleanses, exfoliates, and hydrates the skin using vortex-fusion technology. Ideal for all skin types.',
    durationMinutes: 60,
    price: 195,
    imageUrl: null as string | null,
    benefits: ['Deep cleansing', '72-hour hydration', 'Reduces fine lines'],
  },
  {
    id: '2',
    name: 'LED Light Therapy',
    description:
      'Non-invasive photobiomodulation using red wavelengths to stimulate collagen production and reduce inflammation.',
    durationMinutes: 30,
    price: 85,
    imageUrl: null,
    benefits: ['Boosts collagen', 'Reduces redness'],
  },
  {
    id: '3',
    name: 'Microneedling',
    description:
      "Controlled micro-injuries stimulate the skin's natural healing, boosting collagen and elastin for smoother, firmer skin.",
    durationMinutes: 75,
    price: 299,
    imageUrl: null,
    benefits: ['Natural collagen boost', 'Reduces scars'],
  },
  {
    id: '4',
    name: 'Chemical Peel',
    description:
      'Precisely formulated exfoliation to remove damaged cells and reveal brighter, more even-toned skin.',
    durationMinutes: 45,
    price: 145,
    imageUrl: null,
    benefits: ['Brightens skin', 'Reduces pigmentation'],
  },
]

export default async function ServicesPage() {
  let services: any[] = []
  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })
  } catch {
    services = PLACEHOLDER_SERVICES
  }

  const displayServices = services.length > 0 ? services : PLACEHOLDER_SERVICES

  return (
    <div className="blissoria-services-scope min-h-screen">
      <AdminCatalogBar
        adminHref="/admin/services"
        ctaLabel="Edit or delete services"
        message="Manage treatments, pricing, and visibility in admin — changes appear on this page."
      />
      <section className="services services-tight-nav">
        <div className="container">
          <div className="services-wrapper">
            <div className="services-title-wrap">
              <h1 className="services-title">My Services</h1>
            </div>
            <div className="services-cards-wrap">
              <div className="service-list-wrapper">
                <div role="list" className="service-list">
                  {displayServices.map((service, i) => (
                    <ServiceCard
                      key={service.id}
                      service={{
                        id: service.id,
                        name: service.name,
                        description: service.description,
                        durationMinutes: service.durationMinutes,
                        price: service.price,
                        imageUrl: service.imageUrl ?? null,
                        benefits: service.benefits,
                      }}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="services-page-bottom">
        <p>
          Not sure which treatment fits your goals? We&apos;ll guide you during booking.
        </p>
        <Link href="/booking" className="bliss-primary-cta">
          Book your visit
        </Link>
      </div>
    </div>
  )
}
