import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import Link from 'next/link'
import type { Metadata } from 'next'
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

function statusPill(status: string) {
  switch (status) {
    case 'CONFIRMED':  return 'sara-pill sara-pill--green'
    case 'SCHEDULED':  return 'sara-pill sara-pill--amber'
    case 'COMPLETED':  return 'sara-pill sara-pill--grey'
    case 'CANCELLED':  return 'sara-pill sara-pill--red'
    default:           return 'sara-pill sara-pill--grey'
  }
}

function statusLabel(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase()
}

/* ─── Arrow icon ────────────────────────────────────────────────────────────── */
function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/auth/signin?callbackUrl=/dashboard')

  const portal = session.user as { canAccessClientPortal?: boolean }
  if (!portal.canAccessClientPortal) redirect('/auth/signin?error=no-client-portal')

  let user: DashboardUser | null = null
  let appointments: AppointmentWithRelations[] = []

  try {
    user = await prisma.user.findFirst({
      where: { email: { equals: session.user.email, mode: 'insensitive' } },
      include: {
        profile: {
          include: { recommendedProducts: { include: { product: true } } },
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
      appointments = Array.from(new Map(rows.map((a) => [a.id, a])).values())
    }
  } catch { /* DB unavailable */ }

  const profile    = user?.profile ?? null
  const sortedAsc  = [...appointments].sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))
  const upcoming   = sortedAsc.filter((a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
  const history    = sortedAsc.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED')
  const firstName  = session.user.name?.split(' ')[0] || 'there'
  const nextAppt   = upcoming[0] ?? null

  const hasTechContent  = !!(profile?.technicianRecommendations?.trim() || profile?.practitionerComments?.trim())
  const hasRoadmap      = !!(profile?.glowRoadmap?.trim() || profile?.skinGoals?.trim() || profile?.cosmeticNotes?.trim() || (profile?.recommendedProducts?.length ?? 0) > 0)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="sara-dashboard-bg">
      {/* ── Greeting hero ─────────────────────────────────────────────────── */}
      <div className="sara-greeting-hero">
        <div className="sara-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p className="sara-kicker" style={{ color: 'rgba(245,240,232,0.55)' }}>Client portal</p>
              <h1 className="sara-h1" style={{ color: 'var(--sara-bg)', fontFamily: 'Instrument Serif, Georgia, serif' }}>
                {greeting},{' '}
                <em style={{ fontStyle: 'italic', opacity: 0.75 }}>{firstName}</em>
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Initials avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(245,240,232,0.15)',
                border: '1px solid rgba(245,240,232,0.2)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'Instrument Serif, serif', fontSize: '18px',
                color: 'var(--sara-bg)',
              }}>
                {firstName.charAt(0).toUpperCase()}
              </div>
              <Link
                href="/booking?next=/dashboard"
                className="sara-btn"
                style={{ padding: '10px 20px', fontSize: '13px', gap: '8px' }}
              >
                <span className="sara-btn-arrow"><Arrow /></span>
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="sara-container" style={{ paddingTop: '40px', paddingBottom: '96px' }}>

        {/* Next appointment card */}
        {nextAppt && (
          <div className="sara-next-appt-card" style={{ marginBottom: '40px' }}>
            <div className="sara-date-block">
              <span className="sara-month">{format(new Date(nextAppt.startTime), 'MMM')}</span>
              <span className="sara-day">{format(new Date(nextAppt.startTime), 'd')}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="sara-kicker">Your next visit</p>
              <h2 className="sara-h3" style={{ marginBottom: '4px' }}>
                {nextAppt.service?.name ?? 'Treatment'}
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(30,27,24,0.55)', marginBottom: '12px' }}>
                With {nextAppt.staff?.name ?? 'your specialist'}&nbsp;·&nbsp;
                {format(new Date(nextAppt.startTime), 'EEEE, MMMM d · h:mm a')}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={statusPill(nextAppt.status)}>{statusLabel(nextAppt.status)}</span>
                <a href="#upcoming" style={{ fontSize: '13px', color: 'var(--sara-accent)', textDecoration: 'underline' }}>
                  View details
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab navigation */}
        <nav className="sara-tab-bar">
          {[['Upcoming', 'upcoming'], ['History', 'history'], ['Recommendations', 'recommendations'], ['Glow Roadmap', 'glow-roadmap']].map(([label, id]) => (
            <a key={id} href={`#${id}`} className="sara-tab">{label}</a>
          ))}
        </nav>

        {/* ── Upcoming ────────────────────────────────────────────────────── */}
        <section id="upcoming" style={{ marginBottom: '56px', scrollMarginTop: '24px' }}>
          <h2 className="sara-h3" style={{ marginBottom: '24px' }}>Upcoming visits</h2>
          {upcoming.length === 0 ? (
            <div className="sara-card" style={{ padding: '40px', textAlign: 'center' }}>
              <p className="sara-kicker" style={{ marginBottom: '8px' }}>Nothing scheduled</p>
              <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.50)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                Bookings made with this email appear here—even before you linked an account.
              </p>
              <Link href="/booking?next=/dashboard" className="sara-btn sara-btn--dark" style={{ display: 'inline-flex', justifyContent: 'center' }}>
                <span className="sara-btn-arrow"><Arrow /></span>Book a visit
              </Link>
            </div>
          ) : (
            <div className="sara-2col">
              {upcoming.map((appt) => (
                <div key={appt.id} className="sara-card" style={{ padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="sara-date-block" style={{ width: 52, minWidth: 52, height: 60 }}>
                    <span className="sara-month">{format(new Date(appt.startTime), 'MMM')}</span>
                    <span className="sara-day" style={{ fontSize: '22px' }}>{format(new Date(appt.startTime), 'd')}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p className="sara-h3" style={{ fontSize: '1rem', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {appt.service?.name ?? 'Treatment'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(30,27,24,0.50)', marginBottom: '8px' }}>
                      {appt.staff?.name ?? 'Your specialist'}&nbsp;·&nbsp;{format(new Date(appt.startTime), 'h:mm a')}
                    </p>
                    <span className={statusPill(appt.status)}>{statusLabel(appt.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── History ─────────────────────────────────────────────────────── */}
        <section id="history" style={{ marginBottom: '56px', scrollMarginTop: '24px' }}>
          <h2 className="sara-h3" style={{ marginBottom: '24px' }}>Booking history</h2>
          {history.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.45)' }}>
              Past and cancelled visits will appear here. Upcoming visits are listed above.
            </p>
          ) : (
            <div className="sara-table-wrap">
              <div style={{ overflowX: 'auto' }}>
                <table className="sara-table" style={{ minWidth: '400px' }}>
                  <thead>
                    <tr>
                      {['Date', 'Service', 'Staff', 'Status'].map((h) => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((appt) => (
                      <tr key={appt.id} style={{ opacity: appt.status === 'CANCELLED' ? 0.6 : 1 }}>
                        <td style={{ fontSize: '12px', color: 'rgba(30,27,24,0.60)' }}>
                          {format(new Date(appt.startTime), 'MMM d, yyyy · h:mm a')}
                        </td>
                        <td style={{ fontWeight: 500 }}>{appt.service?.name ?? '—'}</td>
                        <td style={{ fontSize: '12px', color: 'rgba(30,27,24,0.55)' }}>{appt.staff?.name ?? '—'}</td>
                        <td><span className={statusPill(appt.status)}>{statusLabel(appt.status)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ── Recommendations ─────────────────────────────────────────────── */}
        <section id="recommendations" style={{ marginBottom: '56px', scrollMarginTop: '24px' }}>
          <h2 className="sara-h3" style={{ marginBottom: '8px' }}>Technician recommendations</h2>
          <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.50)', marginBottom: '24px' }}>
            Personalized notes from your treatment team appear here.
          </p>
          <div className="sara-card" style={{ padding: '32px' }}>
            {hasTechContent ? (
              <>
                {profile?.technicianRecommendations?.trim() && (
                  <div style={{ marginBottom: '24px' }}>
                    <p className="sara-kicker">Personalized for you</p>
                    <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.75)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {profile.technicianRecommendations.trim()}
                    </p>
                  </div>
                )}
                {profile?.practitionerComments?.trim() && (
                  <div>
                    <p className="sara-kicker">Clinical notes</p>
                    <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {profile.practitionerComments.trim()}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.40)' }}>
                No recommendations yet. They&apos;ll appear here after your provider adds notes to your profile.
              </p>
            )}
          </div>
        </section>

        {/* ── Glow Roadmap ────────────────────────────────────────────────── */}
        <section id="glow-roadmap" style={{ marginBottom: '56px', scrollMarginTop: '24px' }}>
          <h2 className="sara-h3" style={{ marginBottom: '8px' }}>Your glow roadmap</h2>
          <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.50)', marginBottom: '24px' }}>
            Your long-term plan, goals, and home-care picks in one place.
          </p>
          <div className="sara-card" style={{ padding: '32px' }}>
            {hasRoadmap ? (
              <>
                {profile?.glowRoadmap?.trim() && (
                  <div style={{ marginBottom: '24px' }}>
                    <p className="sara-kicker">Your plan</p>
                    <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.75)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {profile.glowRoadmap.trim()}
                    </p>
                  </div>
                )}
                {profile?.skinGoals?.trim() && (
                  <div style={{ marginBottom: '24px' }}>
                    <p className="sara-kicker">Skin goals</p>
                    <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.75)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {profile.skinGoals.trim()}
                    </p>
                  </div>
                )}
                {profile?.cosmeticNotes?.trim() && (
                  <div style={{ marginBottom: '24px' }}>
                    <p className="sara-kicker">Care preferences</p>
                    <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {profile.cosmeticNotes.trim()}
                    </p>
                  </div>
                )}
                {(profile?.recommendedProducts?.length ?? 0) > 0 && (
                  <div>
                    <p className="sara-kicker">Recommended for you</p>
                    <div className="sara-2col" style={{ gap: '12px' }}>
                      {profile!.recommendedProducts!.map((pp) => (
                        <Link
                          key={pp.productId}
                          href="/shop"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px', borderRadius: '12px',
                            border: '1px solid var(--sara-border)', background: 'var(--sara-bg)',
                            fontSize: '13px', fontWeight: 500, color: 'var(--sara-dark)', textDecoration: 'none',
                            transition: 'background 0.2s',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pp.product?.name}
                          </span>
                          {pp.product?.price && (
                            <span style={{ marginLeft: '12px', flexShrink: 0, fontSize: '12px', color: 'var(--sara-accent)', fontWeight: 600 }}>
                              ${pp.product.price}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.40)' }}>
                Your roadmap will appear when your provider adds goals, notes, or product recommendations.
              </p>
            )}
          </div>
        </section>

        {/* Closing note */}
        <div style={{ borderTop: '1px solid var(--sara-border)', paddingTop: '40px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.50)', maxWidth: '36rem' }}>
            Questions about your plan? We&apos;re here to help before or after your visit.
          </p>
        </div>
      </div>
    </div>
  )
}
