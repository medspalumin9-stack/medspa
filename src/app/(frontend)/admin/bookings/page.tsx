'use client'

import { Fragment, useEffect, useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { BookingBlocksPanel } from '@/components/admin/BookingBlocksPanel'

type Appointment = {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string
  status: string
  startTime: string
  endTime: string
  notes?: string | null
  createdAt?: string
  service?: { name: string }
  staff?: { name: string }
}

const STATUSES = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const
type Tab = 'requests' | 'upcoming' | 'completed'

const TABS: { key: Tab; label: string }[] = [
  { key: 'requests', label: 'Booking requests' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
]

function tabStatuses(tab: Tab): string[] {
  if (tab === 'requests') return ['SCHEDULED']
  if (tab === 'upcoming') return ['CONFIRMED']
  return ['COMPLETED', 'CANCELLED']
}

function statusPill(status: string) {
  switch (status) {
    case 'CONFIRMED': return 'bg-emerald-50 text-emerald-800'
    case 'CANCELLED': return 'bg-red-50 text-red-700'
    case 'COMPLETED': return 'bg-[#e8e4dc] text-[#1e211e]/65'
    default: return 'bg-[#f4e6cd] text-[#6b5344]'
  }
}

const DT_LABEL = 'block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/45 mb-1'
const DT_VALUE = 'text-sm text-[#1e211e]'

export default function AdminBookingsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState('ALL')
  const [activeTab, setActiveTab] = useState<Tab>('requests')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const load = async (): Promise<Appointment[]> => {
    const r = await fetch('/api/admin/bookings')
    const d = await r.json()
    const list = (d.appointments || []) as Appointment[]
    setAppointments(list)
    return list
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void load()
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!expandedId) return
    const frame = requestAnimationFrame(() => {
      const appt = appointments.find((a) => a.id === expandedId)
      setNoteDraft(appt?.notes ?? '')
    })
    return () => cancelAnimationFrame(frame)
  }, [expandedId, appointments])

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await load()
  }

  const saveNotes = async () => {
    if (!expandedId) return
    setSavingNotes(true)
    await fetch('/api/admin/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: expandedId, notes: noteDraft }),
    })
    await load()
    setSavingNotes(false)
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const totalBookings = appointments.length
  const todaysVisits = appointments.filter((a) => format(new Date(a.startTime), 'yyyy-MM-dd') === today).length
  const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length
  const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length

  const displayed =
    filter !== 'ALL'
      ? appointments.filter((a) => a.status === filter)
      : appointments.filter((a) => tabStatuses(activeTab).includes(a.status))

  const expandedAppt = appointments.find((a) => a.id === expandedId) ?? null
  const toggleRow = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  const statCards = [
    { label: 'Total bookings', value: totalBookings },
    { label: "Today's visits", value: todaysVisits },
    { label: 'Confirmed', value: confirmed },
    { label: 'Cancelled', value: cancelled },
  ]

  return (
    <div className="bliss-admin-dash">
      <AdminPageHeader
        eyebrow="Operations"
        title="Bookings"
        description={
          <>
            Guest contact details and internal notes. Link clients from the{' '}
            <Link href="/admin/clients" className="font-medium text-[#6b5344] underline-offset-2 hover:underline">
              Clients
            </Link>{' '}
            page.
          </>
        }
      />

      <BookingBlocksPanel />

      <section aria-labelledby="bookings-stats-heading" className="mb-10">
        <h2 id="bookings-stats-heading" className="sr-only">Booking statistics</h2>
        <div className="bliss-admin-stat-grid" role="list">
          {statCards.map((s) => (
            <div role="listitem" key={s.label}>
              <div className="service-card-wrap group/scard flex h-full flex-col !cursor-default">
                <div className="service-card-image-wrap relative overflow-hidden rounded-[var(--bliss-radius-s)] bg-[#edddc3]/50" aria-hidden>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f4] to-[#6b5344]/10" />
                </div>
                <div className="service-card-content-wrapper !py-4">
                  <p className="font-display text-[1.85rem] leading-none tracking-tight text-[#1e211e] tabular-nums md:text-[2rem]">
                    {s.value}
                  </p>
                  <p className="service-card-kicker mt-auto !text-[11px] !font-semibold !uppercase !tracking-[0.12em]">
                    {s.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['ALL', ...STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={
                filter === st
                  ? 'rounded-full bg-[#1e211e] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#f4e6cd]'
                  : 'rounded-full border border-[#1e211e]/10 bg-white px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[#1e211e]/55 transition-colors hover:border-[#1e211e]/20 hover:text-[#1e211e]'
              }
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-[#1e211e]/10 pb-4">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setActiveTab(key); setFilter('ALL'); setExpandedId(null) }}
            className={
              activeTab === key && filter === 'ALL'
                ? 'rounded-full bg-[#f4e6cd] px-4 py-2 text-sm font-medium text-[#1e211e] ring-1 ring-[#1e211e]/10'
                : 'rounded-full px-4 py-2 text-sm font-medium text-[#1e211e]/50 transition-colors hover:text-[#1e211e]'
            }
          >
            {label}
            <span className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[#1e211e]/[0.06] px-1.5 py-0.5 text-[10px] font-bold text-[#1e211e]/70">
              {appointments.filter((a) => tabStatuses(key).includes(a.status)).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bliss-admin-card overflow-hidden">
        {displayed.length === 0 ? (
          <p className="py-14 text-center text-sm text-[#1e211e]/45">No bookings in this view.</p>
        ) : (
          <div className="bliss-admin-table-wrap">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#f4e6cd]/35">
                <tr>
                  {['Client', 'Email', 'Service', 'When', 'Staff', 'Status', ''].map((h) => (
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
                {displayed.map((a) => (
                  <Fragment key={a.id}>
                    <tr
                      className={`cursor-pointer border-t border-[#1e211e]/8 transition-colors hover:bg-[#faf8f4]/90 ${expandedId === a.id ? 'bg-[#faf8f4]/90' : ''}`}
                      onClick={() => toggleRow(a.id)}
                    >
                      <td className="px-4 py-3.5 sm:px-6 sm:py-4">
                        <p className="font-medium text-[#1e211e]">{a.clientName}</p>
                        <p className="mt-0.5 text-[11px] text-[#1e211e]/45">{a.clientPhone}</p>
                      </td>
                      <td className="px-4 py-3.5 sm:px-6 sm:py-4">
                        <a
                          href={`mailto:${a.clientEmail}`}
                          className="text-xs text-[#6b5344] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {a.clientEmail}
                        </a>
                      </td>
                      <td className="px-4 py-3.5 text-[#1e211e]/70 sm:px-6 sm:py-4">{a.service?.name}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[#1e211e]/70 sm:px-6 sm:py-4">
                        {format(new Date(a.startTime), 'MMM d, yyyy')}
                        <br />
                        <span className="text-[#1e211e]/45">
                          {format(new Date(a.startTime), 'h:mm a')} – {format(new Date(a.endTime), 'h:mm a')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#1e211e]/70 sm:px-6 sm:py-4">{a.staff?.name}</td>
                      <td className="px-4 py-3.5 sm:px-6 sm:py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${statusPill(a.status)}`}>
                          {a.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right sm:px-6 sm:py-4">
                        <span
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#1e211e]/50 transition-all"
                          style={{
                            background: expandedId === a.id ? '#1e211e' : 'rgba(30,33,30,0.07)',
                            color: expandedId === a.id ? '#f4e6cd' : undefined,
                          }}
                          aria-label={expandedId === a.id ? 'Collapse' : 'Expand'}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: expandedId === a.id ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}>
                            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </td>
                    </tr>

                    {expandedId === a.id && expandedAppt && (
                      <tr>
                        <td colSpan={7} className="border-t border-[#1e211e]/8 bg-[#faf8f4]/50 px-0">
                          <div className="grid gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_280px]">
                            <div>
                              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b5344]">
                                Booking #{expandedAppt.id.slice(0, 8)}…
                              </p>
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                  { label: 'Guest', value: expandedAppt.clientName },
                                  { label: 'Phone', value: <a href={`tel:${expandedAppt.clientPhone}`} className="text-[#6b5344] hover:underline">{expandedAppt.clientPhone}</a> },
                                  { label: 'Email', value: <a href={`mailto:${expandedAppt.clientEmail}`} className="break-all text-[#6b5344] hover:underline">{expandedAppt.clientEmail}</a> },
                                  { label: 'Service', value: expandedAppt.service?.name ?? '—' },
                                  { label: 'Staff', value: expandedAppt.staff?.name ?? '—' },
                                  {
                                    label: 'Schedule',
                                    value: (
                                      <>
                                        {format(new Date(expandedAppt.startTime), 'EEE, MMM d')}
                                        <br />
                                        <span className="text-[11px] text-[#1e211e]/50">
                                          {format(new Date(expandedAppt.startTime), 'h:mm a')} – {format(new Date(expandedAppt.endTime), 'h:mm a')}
                                        </span>
                                      </>
                                    ),
                                  },
                                ].map(({ label, value }) => (
                                  <div key={label}>
                                    <span className={DT_LABEL}>{label}</span>
                                    <span className={`${DT_VALUE} ${label === 'Guest' ? 'font-medium' : ''}`}>{value}</span>
                                  </div>
                                ))}
                                <div>
                                  <span className={DT_LABEL}>Status</span>
                                  <select
                                    value={expandedAppt.status}
                                    onChange={(e) => { e.stopPropagation(); void updateStatus(expandedAppt.id, e.target.value) }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-1 w-full max-w-[200px] rounded-lg border border-[#1e211e]/12 bg-white px-3 py-2 text-xs text-[#1e211e] focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20"
                                  >
                                    {STATUSES.map((st) => (
                                      <option key={st} value={st}>{st.charAt(0) + st.slice(1).toLowerCase()}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <label htmlFor={`notes-${expandedAppt.id}`} className={DT_LABEL}>
                                Internal notes
                              </label>
                              <textarea
                                id={`notes-${expandedAppt.id}`}
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                rows={5}
                                placeholder="Private notes for staff (not shown to clients)…"
                                className="min-h-[100px] w-full resize-y rounded-xl border border-[#1e211e]/12 bg-white px-3 py-2.5 text-sm text-[#1e211e] focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20"
                              />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); void saveNotes() }}
                                disabled={savingNotes}
                                className="inline-flex items-center justify-center rounded-full bg-[#1e211e] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#f4e6cd] transition-opacity hover:opacity-90 disabled:opacity-50"
                              >
                                {savingNotes ? 'Saving…' : 'Save notes'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
