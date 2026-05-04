'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

type Appointment = {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  status: string
  startTime: string
  createdAt: string
  service?: { name: string } | null
  staff?: { name: string } | null
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#1e211e]/8 bg-[#faf8f4]/90 px-4 py-3">
      <p className="font-display text-2xl text-[#1e211e] leading-none tabular-nums">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text/45 mt-2">{label}</p>
    </div>
  )
}

export function AdminClientsBookingsDashboard() {
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then((r) => r.json())
      .then((d) => {
        setItems(d.appointments || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const scheduled = items.filter((a) => a.status === 'SCHEDULED').length
  const confirmed = items.filter((a) => a.status === 'CONFIRMED').length
  const completed = items.filter((a) => a.status === 'COMPLETED').length
  const cancelled = items.filter((a) => a.status === 'CANCELLED').length

  const recent = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 18)

  return (
    <div className="bliss-admin-card mb-8 overflow-hidden">
      <div className="bliss-admin-card-header flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="services-title !text-[clamp(1.15rem,2.5vw,1.35rem)] !leading-tight">All bookings activity</h2>
          <p className="text-xs text-text/55 mt-1 max-w-xl">
            Live snapshot from your calendar (up to 100 records). Status changes from the{' '}
            <Link href="/admin/bookings" className="text-[#6b5344] font-medium hover:underline">
              Bookings
            </Link>{' '}
            page sync here on refresh.
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="inline-flex rounded-full border border-[#1e211e]/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#1e211e] hover:bg-[#f4e6cd]/40 transition-colors"
        >
          Manage bookings
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-text/45 py-10 text-sm">Loading bookings…</p>
      ) : (
        <>
          <div className="p-4 md:p-5 grid grid-cols-2 lg:grid-cols-5 gap-3 border-b border-[#1e211e]/8">
            <MiniStat label="Total (loaded)" value={items.length} />
            <MiniStat label="Scheduled" value={scheduled} />
            <MiniStat label="Confirmed" value={confirmed} />
            <MiniStat label="Completed" value={completed} />
            <MiniStat label="Cancelled" value={cancelled} />
          </div>

          {recent.length === 0 ? (
            <p className="text-center text-text/45 py-10 text-sm">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-[#f4e6cd]/25 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-text/45">
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Appointment</th>
                    <th className="px-4 py-3">Booked</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((a) => (
                    <tr key={a.id} className="border-t border-[#1e211e]/8 hover:bg-[#faf8f4]/90">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1e211e]">{a.clientName}</p>
                        <a
                          href={`mailto:${a.clientEmail}`}
                          className="text-[11px] text-[#6b5344] hover:underline"
                        >
                          {a.clientEmail}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-text/70">{a.service?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-text/70 text-xs whitespace-nowrap">
                        {format(new Date(a.startTime), 'MMM d, yyyy')}
                        <span className="text-text/45">
                          {' '}
                          · {format(new Date(a.startTime), 'h:mm a')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text/50 text-xs whitespace-nowrap">
                        {format(new Date(a.createdAt), 'MMM d, h:mm a')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                            a.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-800'
                              : a.status === 'CANCELLED'
                                ? 'bg-red-50 text-red-600'
                                : a.status === 'COMPLETED'
                                  ? 'bg-[#e8e4dc] text-text/60'
                                  : 'bg-[#f4e6cd] text-[#6b5344]'
                          }`}
                        >
                          {a.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
