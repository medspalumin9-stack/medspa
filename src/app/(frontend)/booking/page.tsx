import { BookingWizard } from '@/components/booking/BookingWizard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Book Your Glow Up | Lumin MedSpa' }

interface BookingPageProps {
  searchParams: Promise<{ service?: string }>
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams
  return (
    <div className="min-h-screen bg-[#F9F7F5]">
      <div className="border-b border-[#E0DCD9]">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#E8B8A8] block mb-4">
            Book Online
          </span>
          <h1 className="text-5xl font-bold tracking-[-0.02em] text-[#4A4A4A] mb-4">
            Book Your Glow Up
          </h1>
          <p className="text-lg text-[#4A4A4A]/60">
            No deposit required. Confirmation sent instantly via email and SMS.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <BookingWizard preselectedServiceId={params.service} />
      </div>
    </div>
  )
}
