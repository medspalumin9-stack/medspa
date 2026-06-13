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
      prefillData = { name: session.user.name ?? undefined, email: session.user.email }
    }
  }

  const returnTo = safeInternalPath(params.next)

  return (
    /* Sarasvvati booking layout */
    <div
      style={{
        minHeight: '100svh',
        background: 'var(--sara-bg, #f5f0e8)',
        paddingTop: '100px',
        paddingBottom: '80px',
      }}
    >
      {/* Hero heading */}
      <div className="sara-container" style={{ marginBottom: '40px' }}>
        <p
          className="sara-kicker"
          style={{ marginBottom: '12px' }}
        >
          Book online
        </p>
        <h1
          className="sara-h1"
          style={{ marginBottom: '12px', maxWidth: '640px' }}
        >
          Book your visit
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(30,27,24,0.55)',
            maxWidth: '500px',
            lineHeight: 1.6,
          }}
        >
          No deposit required. Confirmation sent by email &amp; SMS once you
          choose a time and confirm your details.
        </p>
      </div>

      {/* Wizard */}
      <div className="sara-container blissoria-services-scope">
        <div className="services-cards-wrap w-full" style={{ padding: 0 }}>
          <BookingWizard
            preselectedServiceId={params.service}
            prefillData={prefillData}
            returnTo={returnTo}
          />
        </div>
      </div>
    </div>
  )
}
