import { BookingWizard } from '@/components/booking/BookingWizard'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import '@/styles/blissoria-services-scope.css'
import { safeInternalPath } from '@/lib/safe-redirect'

export const metadata: Metadata = { title: 'Book Your Glow Up | Lumin MedSpa' }

interface BookingPageProps {
  searchParams: Promise<{ service?: string; next?: string }>
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const [params, session] = await Promise.all([searchParams, auth()])

  let prefillData: { name?: string; email?: string; phone?: string } = {}

  if (session?.user?.email) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { fullName: true, phone: true },
      })
      prefillData = {
        name: dbUser?.fullName ?? session.user.name ?? undefined,
        email: session.user.email,
        phone: dbUser?.phone ?? undefined,
      }
    } catch {
      prefillData = {
        name: session.user.name ?? undefined,
        email: session.user.email,
      }
    }
  }

  const returnTo = safeInternalPath(params.next)

  return (
    <div className="blissoria-services-scope min-h-screen">
      <section className="services bliss-booking-section overflow-hidden">
        <div className="container">
          <div className="services-wrapper">
            <div className="services-title-wrap !mb-4 !mt-0 md:!mb-5">
              <p className="service-card-kicker">Book online</p>
              <h1 className="services-title !text-[clamp(1.65rem,4vw,2.85rem)]">Book your visit</h1>
              <p className="service-card-text mt-2 max-w-2xl text-[15px] md:mt-3 md:text-[17px]">
                No deposit required. Confirmation is sent by email and SMS once you choose a time and confirm your
                details.
              </p>
            </div>
            <div className="services-cards-wrap w-full !mt-0 !pt-0">
              <BookingWizard
                preselectedServiceId={params.service}
                prefillData={prefillData}
                returnTo={returnTo}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
