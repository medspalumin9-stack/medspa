'use client'
import { Fragment, useEffect, useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'

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
    case 'CONFIRMED':  return 'sara-pill sara-pill--green'
    case 'CANCELLED':  return 'sara-pill sara-pill--red'
    case 'COMPLETED':  return 'sara-pill sara-pill--grey'
    default:           return 'sara-pill sara-pill--amber'
  }
}

const DT_LABEL = 'sara-label'
const DT_VALUE = 'text-sm text-[var(--sara-dark)]'

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

  useEffect(() => { void load() }, [])

  useEffect(() => {
    if (expandedId) {
      const appt = appointments.find((a) => a.id === expandedId)
      setNoteDraft(appt?.notes ?? '')
    }
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
  const totalBookings  = appointments.length
  const todaysVisits   = appointments.filter((a) => format(new Date(a.startTime), 'yyyy-MM-dd') === today).length
  const confirmed      = appointments.filter((a) => a.status === 'CONFIRMED').length
  const cancelled      = appointments.filter((a) => a.status === 'CANCELLED').length

  const displayed =
    filter !== 'ALL'
      ? appointments.filter((a) => a.status === filter)
      : appointments.filter((a) => tabStatuses(activeTab).includes(a.status))

  const expandedAppt = appointments.find((a) => a.id === expandedId) ?? null
  const toggleRow = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <div className="sara-admin-page">
      <div className="sara-container">

        {/* ── Page header ────────────────────────────────────────────────── */}
        <div className="sara-page-header">
          <div>
            <p className="sara-kicker">Operations</p>
            <h1 className="sara-h2">Bookings</h1>
            <p style={{ fontSize: '15px', color: 'rgba(30,27,24,0.55)', marginTop: '6px' }}>
              Guest contact details and internal notes. Link clients from the{' '}
              <Link href="/admin/clients" style={{ color: 'var(--sara-accent)', textDecoration: 'underline' }}>Clients</Link>{' '}
              page.
            </p>
          </div>
          {/* Status filter pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['ALL', ...STATUSES].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={filter === s ? 'sara-pill sara-pill--dark' : 'sara-pill sara-pill--grey'}
                style={{ cursor: 'pointer', border: 'none', padding: '5px 14px', fontSize: '11px' }}
              >
                {s.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="sara-stats-row">
          {[
            { label: 'Total bookings', value: totalBookings },
            { label: "Today's visits",  value: todaysVisits },
            { label: 'Confirmed',       value: confirmed },
            { label: 'Cancelled',       value: cancelled },
          ].map(({ label, value }) => (
            <div key={label} className="sara-stat-card">
              <p className="sara-stat-label">{label}</p>
              <p className="sara-stat-value">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Tab bar ────────────────────────────────────────────────────── */}
        <div className="sara-tab-bar">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setActiveTab(key); setFilter('ALL'); setExpandedId(null) }}
              className={`sara-tab ${activeTab === key && filter === 'ALL' ? 'is-active' : ''}`}
            >
              {label}
              <span style={{
                marginLeft: '6px', fontSize: '10px', fontWeight: 700,
                background: 'rgba(30,27,24,0.07)', borderRadius: '10px', padding: '1px 6px',
              }}>
                {appointments.filter((a) => tabStatuses(key).includes(a.status)).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="sara-table-wrap">
          {displayed.length === 0 ? (
            <div className="sara-empty">No bookings in this view.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="sara-table" style={{ minWidth: '760px' }}>
                <thead>
                  <tr>
                    {['Client', 'Email', 'Service', 'When', 'Staff', 'Status', ''].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((a) => (
                    <Fragment key={a.id}>
                      {/* Main row */}
                      <tr
                        style={{ background: expandedId === a.id ? 'var(--sara-bg)' : undefined }}
                        onClick={() => toggleRow(a.id)}
                      >
                        <td>
                          <p style={{ fontWeight: 500 }}>{a.clientName}</p>
                          <p style={{ fontSize: '11px', color: 'rgba(30,27,24,0.45)', marginTop: '2px' }}>{a.clientPhone}</p>
                        </td>
                        <td>
                          <a
                            href={`mailto:${a.clientEmail}`}
                            style={{ color: 'var(--sara-accent)', fontSize: '12px' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {a.clientEmail}
                          </a>
                        </td>
                        <td style={{ color: 'rgba(30,27,24,0.70)' }}>{a.service?.name}</td>
                        <td style={{ fontSize: '12px', color: 'rgba(30,27,24,0.65)', whiteSpace: 'nowrap' }}>
                          {format(new Date(a.startTime), 'MMM d, yyyy')}
                          <br />
                          <span style={{ color: 'rgba(30,27,24,0.45)' }}>
                            {format(new Date(a.startTime), 'h:mm a')} – {format(new Date(a.endTime), 'h:mm a')}
                          </span>
                        </td>
                        <td style={{ color: 'rgba(30,27,24,0.70)' }}>{a.staff?.name}</td>
                        <td><span className={statusPill(a.status)}>{a.status.toLowerCase()}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 24, height: 24, borderRadius: '50%',
                              background: expandedId === a.id ? 'var(--sara-dark)' : 'rgba(30,27,24,0.07)',
                              color: expandedId === a.id ? 'var(--sara-bg)' : 'rgba(30,27,24,0.50)',
                              transition: 'all 0.2s',
                            }}
                            aria-label={expandedId === a.id ? 'Collapse' : 'Expand'}
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                              style={{ transform: expandedId === a.id ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}>
                              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </td>
                      </tr>

                      {/* Detail panel */}
                      {expandedId === a.id && expandedAppt && (
                        <tr>
                          <td colSpan={7} className="sara-accordion-td">
                            <div style={{ padding: '24px 16px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
                              {/* Booking details */}
                              <div>
                                <p className="sara-kicker" style={{ marginBottom: '16px' }}>
                                  Booking #{expandedAppt.id.slice(0, 8)}…
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
                                  {[
                                    { label: 'Guest', value: expandedAppt.clientName },
                                    { label: 'Phone', value: <a href={`tel:${expandedAppt.clientPhone}`} style={{ color: 'var(--sara-accent)' }}>{expandedAppt.clientPhone}</a> },
                                    { label: 'Email', value: <a href={`mailto:${expandedAppt.clientEmail}`} style={{ color: 'var(--sara-accent)', wordBreak: 'break-all' }}>{expandedAppt.clientEmail}</a> },
                                    { label: 'Service', value: expandedAppt.service?.name ?? '—' },
                                    { label: 'Staff', value: expandedAppt.staff?.name ?? '—' },
                                    {
                                      label: 'Schedule',
                                      value: (
                                        <>
                                          {format(new Date(expandedAppt.startTime), 'EEE, MMM d')}
                                          <br />
                                          <span style={{ color: 'rgba(30,27,24,0.50)', fontSize: '11px' }}>
                                            {format(new Date(expandedAppt.startTime), 'h:mm a')} – {format(new Date(expandedAppt.endTime), 'h:mm a')}
                                          </span>
                                        </>
                                      ),
                                    },
                                  ].map(({ label, value }) => (
                                    <div key={label}>
                                      <span className={DT_LABEL}>{label}</span>
                                      <span className={DT_VALUE} style={{ fontWeight: label === 'Guest' ? 500 : 400 }}>{value}</span>
                                    </div>
                                  ))}
                                  <div>
                                    <span className={DT_LABEL}>Status</span>
                                    <select
                                      value={expandedAppt.status}
                                      onChange={(e) => { e.stopPropagation(); void updateStatus(expandedAppt.id, e.target.value) }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="sara-input sara-select"
                                      style={{ padding: '6px 32px 6px 10px', fontSize: '12px', borderRadius: '8px' }}
                                    >
                                      {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                                    </select>
                                  </div>
                                </div>
                              </div>

                              {/* Notes editor */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                                  className="sara-input"
                                  style={{ borderRadius: '12px', resize: 'vertical', minHeight: '100px', fontSize: '13px' }}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); void saveNotes() }}
                                  disabled={savingNotes}
                                  className="sara-btn sara-btn--dark"
                                  style={{ justifyContent: 'center', padding: '10px 20px', fontSize: '12px' }}
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
    </div>
  )
}
