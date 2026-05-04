import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import '@/styles/blissoria-services-scope.css'
import {
  BLISSORIA_BTN_ICON_ALT,
  BLISSORIA_BTN_ICON_PRIMARY,
} from '@/lib/blissoria-cdn'

import type { Prisma } from '@prisma/client'

type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: { service: true; staff: true }
}>

type DashboardUser = Prisma.UserGetPayload<{
  include: {
    profile: { include: { recommendedProducts: { include: { product: true } } } }
  }
}>

export const metadata: Metadata = { title: 'My Portal | Lumin MedSpa' }

function statusLabel(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmed'
    case 'SCHEDULED':
      return 'Scheduled'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status
  }
}

function statusPill(status: string) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize'
  switch (status) {
    case 'CONFIRMED':
      return `${base} bg-[#8FA896]/20 text-[#4d7a60]`
    case 'SCHEDULED':
      return `${base} bg-[#edddc3]/60 text-[#6b5344]`
    case 'COMPLETED':
      return `${base} bg-[#1e211e]/8 text-[#1e211e]/60`
    case 'CANCELLED':
      return `${base} bg-red-50 text-red-400`
    default:
      return `${base} bg-[#1e211e]/8 text-[#1e211e]/60`
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/auth/signin?callbackUrl=/dashboard')

  let user: DashboardUser | null = null
  let appointments: AppointmentWithRelations[] = []

  try {
    user = await prisma.user.findFirst({
      where: { email: { equals: session.user.email, mode: 'insensitive' } },
      include: {
        profile: {
          include: {
            recommendedProducts: { include: { product: true } },
          },
        },
      },
    })

    if (user) {
      const rows = await prisma.appointment.findMany({
        where: {
          OR: [
            { userId: user.id },
            { clientEmail: { equals: user.email, mode: 'insensitive' } },
          ],
        },
        include: { service: true, staff: true },
        orderBy: { startTime: 'desc' },
        take: 60,
      })
      const byId = new Map(rows.map((a) => [a.id, a]))
      appointments = Array.from(byId.values())
    }
  } catch {
    // DB not connected
  }

  const profile = user?.profile ?? null
  const sortedAsc = [...appointments].sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))

  const upcoming = sortedAsc.filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
  const history = sortedAsc.filter(
    (a) => a.status === 'COMPLETED' || a.status === 'CANCELLED'
  )
  const firstName = session.user.name?.split(' ')[0] || 'there'

  const hasTechnicianContent =
    !!(profile?.technicianRecommendations?.trim() || profile?.practitionerComments?.trim())

  const hasRoadmapContent =
    !!(
      profile?.glowRoadmap?.trim() ||
      profile?.skinGoals?.trim() ||
      profile?.cosmeticNotes?.trim() ||
      (profile?.recommendedProducts?.length ?? 0) > 0
    )

  return (
    <div className="blissoria-services-scope min-h-screen">
      <section className="services">
        <div className="container">
          <div className="services-wrapper">

            <div className="services-title-wrap">
              <p className="service-card-kicker">Client portal</p>
              <h1 className="services-title">
                Welcome back,&nbsp;{firstName}.
              </h1>
              <p className="service-card-text mt-4 max-w-2xl" style={{ opacity: 0.82 }}>
                Your visits, technician notes, and glow roadmap—book again anytime from here.
              </p>
            </div>

            <div className="services-cards-wrap mb-10 flex flex-wrap items-center justify-center gap-3 md:mb-12 md:gap-4">
              <Link
                href="/booking?next=/dashboard"
                className="bliss-secondary-button"
              >
                <span className="bliss-secondary-button-bg" aria-hidden />
                <span className="bliss-secondary-button-icon-wrap">
                  <Image
                    src={BLISSORIA_BTN_ICON_PRIMARY}
                    alt=""
                    width={22}
                    height={22}
                    className="bliss-secondary-button-icon"
                  />
                  <Image
                    src={BLISSORIA_BTN_ICON_ALT}
                    alt=""
                    width={22}
                    height={22}
                    className="bliss-secondary-button-icon bliss-icon-hover"
                  />
                </span>
                <span className="bliss-secondary-button-text">Book appointment</span>
              </Link>
            </div>

            {/* Upcoming */}
            <div className="mb-14">
              <div className="services-title-wrap !mb-6">
                <h2 className="font-display text-[clamp(1.55rem,3vw,2rem)] font-normal tracking-tight text-[#1e211e]">
                  Upcoming visits
                </h2>
              </div>

              <div className="services-cards-wrap">
                <div className="service-list-wrapper">
                  <div role="list" className="service-list">
                    {upcoming.length === 0 ? (
                      <div role="listitem" className="service-list-item">
                        <Link
                          href="/booking?next=/dashboard"
                          className="service-card-wrap group/scard block text-inherit no-underline"
                        >
                          <div className="service-card-content-wrapper">
                            <p className="service-card-kicker">Nothing scheduled</p>
                            <div className="service-card-title-wrap">
                              <div className="service-card-title !text-[1.75rem] md:!text-[2rem] !leading-snug">
                                Book your next visit
                              </div>
                            </div>
                            <div className="service-card-text-wrap">
                              <p className="service-card-text">
                                Guest bookings made with this email appear here after you sign in—even before an account
                                is linked.
                              </p>
                            </div>
                            <span className="tertiary-button">
                              <span className="tertiary-button-text-wrap">
                                <span className="tertiary-button-slide">
                                  <span className="tertiary-button-text">Choose a time</span>
                                  <span className="tertiary-button-text">Choose a time</span>
                                </span>
                              </span>
                            </span>
                          </div>
                        </Link>
                      </div>
                    ) : (
                      upcoming.map((appt) => (
                        <div key={appt.id} role="listitem" className="service-list-item">
                          <div className="service-card-wrap !cursor-default">
                            <div className="service-card-image-wrap">
                              <div
                                className="flex aspect-[4/3] flex-col items-center justify-center rounded-[var(--bliss-radius-s)] bg-[#1e211e]/[0.055]"
                                aria-hidden
                              >
                                <span className="font-display text-5xl font-normal leading-none text-[#1e211e]/25 md:text-6xl">
                                  {format(new Date(appt.startTime), 'd')}
                                </span>
                                <span className="mt-1 text-[11px] font-medium uppercase tracking-widest text-[#1e211e]/30">
                                  {format(new Date(appt.startTime), 'MMM')}
                                </span>
                              </div>
                            </div>
                            <div className="service-card-content-wrapper">
                              <p className="service-card-kicker">
                                {format(new Date(appt.startTime), 'EEEE, MMMM d · h:mm a')}
                              </p>
                              <div className="service-card-title-wrap">
                                <div className="service-card-title !text-[1.65rem] md:!text-[1.85rem] !leading-tight">
                                  {appt.service?.name ?? 'Treatment'}
                                </div>
                              </div>
                              <div className="service-card-text-wrap">
                                <p className="service-card-text">
                                  With {appt.staff?.name ?? 'your specialist'}
                                </p>
                              </div>
                              <span className={statusPill(appt.status)}>
                                {statusLabel(appt.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Technician recommendations — always visible */}
            <div className="mb-14">
              <div className="services-title-wrap !mb-6">
                <h2 className="font-display text-[clamp(1.55rem,3vw,2rem)] font-normal tracking-tight text-[#1e211e]">
                  Recommendations from your technicians
                </h2>
                <p className="service-card-text mt-2 max-w-2xl text-[15px] opacity-75">
                  After your visits, your team can leave personalized notes here.
                </p>
              </div>

              <div className="service-card-wrap !cursor-default hover:!shadow-none mx-auto max-w-3xl">
                <div className="service-card-content-wrapper !px-6 !py-8 sm:!px-8">
                  {hasTechnicianContent ? (
                    <>
                      {profile?.technicianRecommendations?.trim() && (
                        <div className="mb-7">
                          <p className="service-card-kicker mb-3">Personalized for you</p>
                          <p className="service-card-text whitespace-pre-wrap leading-relaxed">
                            {profile.technicianRecommendations.trim()}
                          </p>
                        </div>
                      )}
                      {profile?.practitionerComments?.trim() && (
                        <div>
                          <p className="service-card-kicker mb-3">Clinical notes</p>
                          <p className="service-card-text whitespace-pre-wrap leading-relaxed opacity-85">
                            {profile.practitionerComments.trim()}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="service-card-text opacity-70">
                      No recommendations yet. They&apos;ll show up here after your provider adds notes to your profile.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Glow roadmap — always visible */}
            <div className="mb-14">
              <div className="services-title-wrap !mb-6">
                <h2 className="font-display text-[clamp(1.55rem,3vw,2rem)] font-normal tracking-tight text-[#1e211e]">
                  Your glow roadmap
                </h2>
                <p className="service-card-text mt-2 max-w-2xl text-[15px] opacity-75">
                  Your long-term plan, goals, and home-care picks in one place.
                </p>
              </div>

              <div className="service-card-wrap !cursor-default hover:!shadow-none mx-auto max-w-3xl">
                <div className="service-card-content-wrapper !px-6 !py-8 sm:!px-8">
                  {hasRoadmapContent ? (
                    <>
                      {profile?.glowRoadmap?.trim() && (
                        <div className="mb-7">
                          <p className="service-card-kicker mb-3">Your plan</p>
                          <p className="service-card-text whitespace-pre-wrap leading-relaxed">
                            {profile.glowRoadmap.trim()}
                          </p>
                        </div>
                      )}
                      {profile?.skinGoals?.trim() && (
                        <div className="mb-7">
                          <p className="service-card-kicker mb-3">Skin goals</p>
                          <p className="service-card-text whitespace-pre-wrap leading-relaxed">
                            {profile.skinGoals.trim()}
                          </p>
                        </div>
                      )}
                      {profile?.cosmeticNotes?.trim() && (
                        <div className="mb-7">
                          <p className="service-card-kicker mb-3">Care preferences</p>
                          <p className="service-card-text whitespace-pre-wrap leading-relaxed opacity-85">
                            {profile.cosmeticNotes.trim()}
                          </p>
                        </div>
                      )}
                      {(profile?.recommendedProducts?.length ?? 0) > 0 && (
                        <div>
                          <p className="service-card-kicker mb-4">Recommended for you</p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {profile!.recommendedProducts!.map((pp) => (
                              <Link
                                key={pp.productId}
                                href="/shop"
                                className="tertiary-button !w-full"
                              >
                                <span className="tertiary-button-text-wrap">
                                  <span className="tertiary-button-slide">
                                    <span className="tertiary-button-text">
                                      {pp.product?.name} · ${pp.product?.price}
                                    </span>
                                    <span className="tertiary-button-text">
                                      {pp.product?.name} · ${pp.product?.price}
                                    </span>
                                  </span>
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="service-card-text opacity-70">
                      Your roadmap will appear when your provider adds goals, notes, or product recommendations.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* History */}
            <div className="mb-4">
              <div className="services-title-wrap !mb-6">
                <h2 className="font-display text-[clamp(1.55rem,3vw,2rem)] font-normal tracking-tight text-[#1e211e]">
                  Booking history
                </h2>
              </div>

              {history.length === 0 ? (
                <p className="service-card-text opacity-70">
                  Past and cancelled visits will show here. Upcoming visits are listed above.
                </p>
              ) : (
                <div className="bliss-admin-card overflow-hidden !p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[320px] text-sm">
                      <thead>
                        <tr className="border-b border-[#1e211e]/8 bg-[#f4e6cd]/35">
                          {['Date', 'Service', 'Status'].map((h) => (
                            <th
                              key={h}
                              className="px-5 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.06em] text-[#1e211e]/50"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((appt) => (
                          <tr
                            key={appt.id}
                            className={`border-b border-[#1e211e]/8 last:border-0 transition-colors hover:bg-[#f4e6cd]/20 ${appt.status === 'CANCELLED' ? 'opacity-60' : ''}`}
                          >
                            <td className="px-5 py-3.5 text-xs text-[#1e211e]/65">
                              {format(new Date(appt.startTime), 'MMM d, yyyy · h:mm a')}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-[#1e211e]/80">
                              {appt.service?.name ?? '—'}
                              {appt.staff?.name && (
                                <span className="ml-1.5 text-xs font-normal text-[#1e211e]/40">
                                  · {appt.staff.name}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={statusPill(appt.status)}>
                                {statusLabel(appt.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      <div className="services-page-bottom">
        <p>Questions about your plan? We are here to help before or after your visit.</p>
        <Link href="/contact" className="bliss-primary-cta">
          Contact the studio
        </Link>
      </div>
    </div>
  )
}
