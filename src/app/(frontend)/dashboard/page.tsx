import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Account | Lumin MedSpa' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/auth/signin')

  let appointments: any[] = []
  let profile: any = null

  try {
    const payload = await getPayloadClient()

    const { docs } = await payload.find({
      collection: 'appointments',
      where: { clientEmail: { equals: session.user.email } },
      sort: 'startTime',
      limit: 20,
      depth: 2,
    })
    appointments = docs

    const { docs: clients } = await payload.find({
      collection: 'clients',
      where: { email: { equals: session.user.email } },
      limit: 1,
    })

    if (clients[0]) {
      const { docs: profiles } = await payload.find({
        collection: 'profiles',
        where: { client: { equals: clients[0].id } },
        depth: 2,
        limit: 1,
      })
      profile = profiles[0] || null
    }
  } catch {
    // DB not connected
  }

  const upcoming = appointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed'
  )
  const past = appointments.filter((a) => a.status === 'completed')

  const firstName = session.user.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-[#F9F7F5]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#E8B8A8] mb-3">
            Client Portal
          </p>
          <h1 className="text-4xl font-bold tracking-[-0.02em] text-[#4A4A4A] mb-2">
            Welcome, {firstName}.
          </h1>
          <p className="text-[#4A4A4A]/60">Your glow up journey at a glance.</p>
        </div>

        <div className="space-y-8">
          {/* Upcoming Appointments */}
          <section>
            <h2 className="text-lg font-semibold text-[#4A4A4A] mb-4">
              Upcoming Appointments
            </h2>
            {upcoming.length === 0 ? (
              <div className="bg-white border border-[#E0DCD9] rounded-xl p-10 text-center">
                <div className="text-4xl mb-4 opacity-30">✦</div>
                <p className="text-[#4A4A4A]/50 mb-4">
                  No upcoming appointments.
                </p>
                <Link href="/booking">
                  <Button variant="primary">Book Your Glow Up</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-white border border-[#E0DCD9] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium text-[#4A4A4A]">
                        {typeof appt.service === 'object'
                          ? appt.service.name
                          : 'Service'}
                      </p>
                      <p className="text-sm text-[#4A4A4A]/60 mt-1">
                        {format(
                          parseISO(String(appt.startTime)),
                          "MMMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                      <p className="text-sm text-[#4A4A4A]/50">
                        with{' '}
                        {typeof appt.staff === 'object'
                          ? appt.staff.name
                          : 'our specialist'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        appt.status === 'confirmed'
                          ? 'bg-[#8FA896]/20 text-[#8FA896]'
                          : 'bg-[#F4D1C5]/40 text-[#E8B8A8]'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Glow Up Roadmap */}
          {profile && (profile.practitionerComments || profile.skinGoals || (profile.recommendedProducts && profile.recommendedProducts.length > 0)) && (
            <section>
              <h2 className="text-lg font-semibold text-[#4A4A4A] mb-4">
                Your Glow Up Roadmap
              </h2>
              <div className="bg-white border border-[#F4D1C5] rounded-xl p-8">
                <p className="text-xs font-medium uppercase tracking-[0.05em] text-[#E8B8A8] mb-6">
                  Curated by your Lumin specialist
                </p>

                {profile.practitionerComments && (
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.05em] text-[#4A4A4A]/50 mb-2">
                      Practitioner Notes
                    </p>
                    <p className="text-[#4A4A4A]/80 leading-relaxed text-sm">
                      {profile.practitionerComments}
                    </p>
                  </div>
                )}

                {profile.skinGoals && (
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.05em] text-[#4A4A4A]/50 mb-2">
                      Your Skin Goals
                    </p>
                    <p className="text-[#4A4A4A]/80 leading-relaxed text-sm">
                      {profile.skinGoals}
                    </p>
                  </div>
                )}

                {profile.recommendedProducts && profile.recommendedProducts.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.05em] text-[#4A4A4A]/50 mb-4">
                      Recommended For You
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {profile.recommendedProducts.map((product: any) => (
                        <a
                          key={typeof product === 'string' ? product : product.id}
                          href="/shop"
                          className="p-4 bg-[#F9F7F5] border border-[#E0DCD9] rounded-xl hover:border-[#F4D1C5] transition-colors group"
                        >
                          <p className="text-sm font-medium text-[#4A4A4A] group-hover:text-[#E8B8A8] transition-colors">
                            {typeof product === 'object' ? product.name : 'Product'}
                          </p>
                          {typeof product === 'object' && product.price && (
                            <p className="text-xs text-[#4A4A4A]/50 mt-1">
                              ${product.price}
                            </p>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Past Appointments */}
          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-[#4A4A4A] mb-4">
                Past Appointments
              </h2>
              <div className="space-y-3">
                {past.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-white border border-[#E0DCD9] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-60"
                  >
                    <div>
                      <p className="font-medium text-[#4A4A4A]">
                        {typeof appt.service === 'object'
                          ? appt.service.name
                          : 'Service'}
                      </p>
                      <p className="text-sm text-[#4A4A4A]/60">
                        {format(
                          parseISO(String(appt.startTime)),
                          'MMMM d, yyyy'
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-[#4A4A4A]/40 capitalize">
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Quick actions */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/booking">
              <div className="bg-[#F4D1C5]/20 border border-[#F4D1C5] rounded-xl p-6 hover:bg-[#F4D1C5]/30 transition-colors cursor-pointer">
                <p className="font-medium text-[#4A4A4A] mb-1">Book Again</p>
                <p className="text-sm text-[#4A4A4A]/60">Schedule your next treatment</p>
              </div>
            </Link>
            <Link href="/shop">
              <div className="bg-white border border-[#E0DCD9] rounded-xl p-6 hover:border-[#F4D1C5] transition-colors cursor-pointer">
                <p className="font-medium text-[#4A4A4A] mb-1">Shop Products</p>
                <p className="text-sm text-[#4A4A4A]/60">Browse our curated skincare</p>
              </div>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
