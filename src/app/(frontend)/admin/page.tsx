import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { requireAdminSection, type SessionUserWithAdmin } from '@/lib/admin-guard'
import { userHasAdminSection, type AdminSection } from '@/lib/admin-sections'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import {
  BLISSORIA_BTN_ICON_ALT,
  BLISSORIA_BTN_ICON_PRIMARY,
} from '@/lib/blissoria-cdn'

export const metadata: Metadata = { title: 'Admin | Lumin MedSpa' }

const QUICK_LINKS: { title: string; description: string; href: string; section: AdminSection }[] = [
  {
    title: 'Bookings',
    description: 'Requests, contact details, status, and notes.',
    href: '/admin/bookings',
    section: 'bookings',
  },
  {
    title: 'Clients',
    description: 'Registered clients, profiles, and history.',
    href: '/admin/clients',
    section: 'clients',
  },
  {
    title: 'Services',
    description: 'Treatments, pricing, duration, and imagery.',
    href: '/admin/services',
    section: 'services',
  },
  {
    title: 'Shop',
    description: 'Products on the public shop.',
    href: '/admin/products',
    section: 'products',
  },
  {
    title: 'Users',
    description: 'Emails, passwords, and admin vs customer portal access.',
    href: '/admin/users',
    section: 'users',
  },
]

function statusPill(status: string) {
  if (status === 'CONFIRMED') return 'bg-emerald-50 text-emerald-800'
  if (status === 'CANCELLED') return 'bg-red-50 text-red-700'
  if (status === 'COMPLETED') return 'bg-[#e8e4dc] text-[#1e211e]/65'
  return 'bg-[#f4e6cd] text-[#6b5344]'
}

export default async function AdminOverviewPage() {
  await requireAdminSection('overview')
  const session = await auth()
  const u = session?.user as SessionUserWithAdmin | undefined

  let stats = { bookings: 0, clients: 0, services: 0, products: 0, todayBookings: 0 }
  let recentBookings: Array<{
    id: string
    clientName: string
    startTime: Date
    status: string
    service: { name: string } | null
    staff: { name: string } | null
  }> = []

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [bookings, clients, services, products, todayBookings, recent] = await Promise.all([
      prisma.appointment.count({ where: { status: { notIn: ['CANCELLED'] } } }),
      prisma.user.count({ where: { role: 'CLIENT', canAccessClientPortal: true } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isAvailable: true } }),
      prisma.appointment.count({
        where: { startTime: { gte: today, lt: tomorrow }, status: { notIn: ['CANCELLED'] } },
      }),
      prisma.appointment.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { service: true, staff: true },
      }),
    ])
    stats = { bookings, clients, services, products, todayBookings }
    recentBookings = recent
  } catch {
    /* DB not connected */
  }

  const statCards: {
    label: string
    value: number
    href: string
    sub: string
    section: AdminSection
  }[] = [
    { label: 'Today', value: stats.todayBookings, href: '/admin/bookings', sub: 'appointments', section: 'bookings' },
    { label: 'All bookings', value: stats.bookings, href: '/admin/bookings', sub: 'active', section: 'bookings' },
    { label: 'Clients', value: stats.clients, href: '/admin/clients', sub: 'accounts', section: 'clients' },
    { label: 'Services', value: stats.services, href: '/admin/services', sub: 'live', section: 'services' },
    { label: 'Shop items', value: stats.products, href: '/admin/products', sub: 'in stock', section: 'products' },
  ]

  const statCardsVisible = statCards.filter((s) => userHasAdminSection(u, s.section))
  const quickLinksVisible = QUICK_LINKS.filter((q) => userHasAdminSection(u, q.section))
  const canBookings = userHasAdminSection(u, 'bookings')
  const canServices = userHasAdminSection(u, 'services')

  return (
    <div className="bliss-admin-dash">
      <AdminPageHeader
        eyebrow="Lumin Medspa"
        title="Dashboard"
        description={format(new Date(), 'EEEE, MMMM d, yyyy')}
        actions={
          <>
            {canBookings ? (
              <Link href="/admin/bookings" className="bliss-secondary-button">
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
                <span className="bliss-secondary-button-text">Open bookings</span>
              </Link>
            ) : null}
            {canServices ? (
              <Link
                href="/admin/services"
                className="inline-flex items-center justify-center rounded-full border border-[#1e211e]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#1e211e] transition-colors hover:bg-[#f4e6cd]/40"
              >
                Edit services
              </Link>
            ) : null}
          </>
        }
      />

      <section aria-labelledby="admin-stats-heading" className="mb-12">
        <h2 id="admin-stats-heading" className="sr-only">
          Overview statistics
        </h2>
        <div className="bliss-admin-stat-grid" role="list">
          {statCardsVisible.map((s) => {
            const inner = (
              <>
                <div className="service-card-image-wrap relative overflow-hidden rounded-[var(--bliss-radius-s)] bg-[#edddc3]/60" aria-hidden>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f4e6cd] via-transparent to-[#6b5344]/12" />
                </div>
                <div className="service-card-content-wrapper flex min-h-[9rem] flex-1 flex-col !py-5">
                  <p className="font-display text-[1.85rem] leading-none tracking-tight text-[#1e211e] tabular-nums md:text-[2rem]">
                    {s.value}
                  </p>
                  <p className="service-card-kicker mt-auto !text-[11px] !font-semibold !uppercase !tracking-[0.12em]">
                    {s.label}
                  </p>
                  <p className="service-card-text mt-1 !text-[10px] capitalize opacity-60">{s.sub}</p>
                  <span className="tertiary-button mt-3">
                    <span className="tertiary-button-text-wrap">
                      <span className="tertiary-button-slide">
                        <span className="tertiary-button-text">Manage →</span>
                        <span className="tertiary-button-text">Manage →</span>
                      </span>
                    </span>
                  </span>
                </div>
              </>
            )
            return (
              <div role="listitem" key={`${s.label}-${s.href}`}>
                <Link
                  href={s.href}
                  className="service-card-wrap group/scard flex h-full !cursor-pointer flex-col no-underline"
                >
                  {inner}
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="admin-shortcuts-heading" className="mb-12">
        <div className="services-title-wrap mb-6">
          <h2
            id="admin-shortcuts-heading"
            className="services-title !text-[clamp(1.35rem,3vw,2rem)] !leading-[1.15]"
          >
            Where to next
          </h2>
          <p className="service-card-text mt-2 max-w-2xl text-[15px] opacity-80">
            Quick jumps into each admin area.
          </p>
        </div>
        <div className="bliss-admin-quick-grid" role="list">
          {quickLinksVisible.map((item) => (
            <div role="listitem" key={item.href}>
              <Link
                href={item.href}
                className="service-card-wrap group/scard flex h-full min-h-[12rem] flex-col justify-between !cursor-pointer no-underline"
              >
                <div className="service-card-image-wrap relative overflow-hidden rounded-[var(--bliss-radius-s)] bg-[#1e211e]/[0.06]" aria-hidden>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#edddc3]/90 via-[#f4e6cd]/40 to-[#faf8f4]" />
                </div>
                <div className="service-card-content-wrapper">
                  <h3 className="service-card-title !text-[1.35rem] md:!text-[1.5rem]">{item.title}</h3>
                  <p className="service-card-text mt-2 text-[15px] opacity-85">{item.description}</p>
                  <span className="tertiary-button mt-6">
                    <span className="tertiary-button-text-wrap">
                      <span className="tertiary-button-slide">
                        <span className="tertiary-button-text">Open →</span>
                        <span className="tertiary-button-text">Open →</span>
                      </span>
                    </span>
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="admin-recent-heading" className="bliss-admin-card overflow-hidden">
        <div className="bliss-admin-card-header flex flex-wrap items-center justify-between gap-3">
          <h2 id="admin-recent-heading" className="font-display text-lg font-normal text-[#1e211e]">
            Recent bookings
          </h2>
          {canBookings ? (
            <Link
              href="/admin/bookings"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b5344] transition-colors hover:text-[#1e211e]"
            >
              View all
            </Link>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1e211e]/30">View all</span>
          )}
        </div>
        {recentBookings.length === 0 ? (
          <p className="py-14 text-center text-sm text-[#1e211e]/45">
            No bookings yet. Guest bookings appear here automatically.
          </p>
        ) : (
          <div className="bliss-admin-table-wrap">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-[#f4e6cd]/35">
                <tr>
                  {['Client', 'Service', 'Date', 'Staff', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1e211e]/50 sm:px-6"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-[#1e211e]/8 transition-colors hover:bg-[#faf8f4]/90"
                  >
                    <td className="px-4 py-3.5 font-medium text-[#1e211e] sm:px-6 sm:py-4">{b.clientName}</td>
                    <td className="px-4 py-3.5 text-[#1e211e]/75 sm:px-6 sm:py-4">{b.service?.name}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[#1e211e]/70 sm:px-6 sm:py-4">
                      {format(new Date(b.startTime), 'MMM d, h:mm a')}
                    </td>
                    <td className="px-4 py-3.5 text-[#1e211e]/70 sm:px-6 sm:py-4">{b.staff?.name}</td>
                    <td className="px-4 py-3.5 sm:px-6 sm:py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${statusPill(b.status)}`}
                      >
                        {b.status.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
