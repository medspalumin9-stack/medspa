'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

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

export default function AdminBookingsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState<Appointment | null>(null)
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
    void load()
  }, [])

  useEffect(() => {
    if (selected) setNoteDraft(selected.notes ?? '')
  }, [selected])

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    const list = await load()
    setSelected((s) => {
      if (!s || s.id !== id) return s
      return list.find((a) => a.id === id) ?? { ...s, status }
    })
  }

  const saveNotes = async () => {
    if (!selected) return
    setSavingNotes(true)
    await fetch('/api/admin/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, notes: noteDraft }),
    })
    const list = await load()
    setSavingNotes(false)
    setSelected((s) => {
      if (!s) return null
      return list.find((a) => a.id === s.id) ?? { ...s, notes: noteDraft }
    })
  }

  const displayed = filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter)

  return (
    <div className="bliss-admin-dash">
      <AdminPageHeader
        eyebrow="Operations"
        title="Bookings"
        description={
          <>
            Full guest contact details and internal notes. Link clients from the{' '}
            <Link href="/admin/clients" className="font-medium text-[#6b5344] underline-offset-2 hover:underline">
              Clients
            </Link>{' '}
            page when they have an account.
          </>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {['ALL', ...STATUSES].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  filter === s
                    ? 'bg-[#1e211e] text-[#f4e6cd]'
                    : 'border border-[#1e211e]/10 bg-white text-text/50 hover:text-[#1e211e]'
                }`}
              >
                {s.toLowerCase()}
              </button>
            ))}
          </div>
        }
        className="!mb-8"
      />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_minmax(280px,360px)]">
        <div className="bg-white border border-[#1e211e]/10 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(30,33,30,0.05)]">
          {displayed.length === 0 ? (
            <p className="text-center text-text/40 py-12 text-sm">No bookings in this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="bg-[#f4e6cd]/35">
                  <tr>
                    {['Client', 'Email', 'Service', 'When', 'Staff', 'Status', ''].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[10px] font-semibold text-text/45 uppercase tracking-[0.12em]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((a) => (
                    <tr
                      key={a.id}
                      className={`border-t border-[#1e211e]/8 cursor-pointer transition-colors ${
                        selected?.id === a.id ? 'bg-[#f4e6cd]/40' : 'hover:bg-[#faf8f4]'
                      }`}
                      onClick={() => setSelected(a)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1e211e]">{a.clientName}</p>
                        <p className="text-[11px] text-text/45 mt-0.5">{a.clientPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${a.clientEmail}`}
                          className="text-[#6b5344] hover:underline text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {a.clientEmail}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-text/70">{a.service?.name}</td>
                      <td className="px-4 py-3 text-text/70 text-xs whitespace-nowrap">
                        {format(new Date(a.startTime), 'MMM d, yyyy')}
                        <br />
                        <span className="text-text/50">
                          {format(new Date(a.startTime), 'h:mm a')} – {format(new Date(a.endTime), 'h:mm a')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text/70">{a.staff?.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                            a.status === 'CONFIRMED'
                              ? 'bg-[#8FA896]/20 text-[#3d5c45]'
                              : a.status === 'CANCELLED'
                                ? 'bg-red-50 text-red-600'
                                : a.status === 'COMPLETED'
                                  ? 'bg-[#e8e4dc] text-text/60'
                                  : 'bg-[#f4e6cd]/80 text-[#6b5344]'
                          }`}
                        >
                          {a.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={a.status}
                          onChange={(e) => updateStatus(a.id, e.target.value)}
                          className="text-xs border border-[#1e211e]/15 rounded-lg px-2 py-1.5 bg-white text-[#1e211e] focus:outline-none focus:ring-1 focus:ring-[#6b5344]/30"
                          aria-label={`Update status for ${a.clientName}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0) + s.slice(1).toLowerCase()}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="bg-white border border-[#1e211e]/10 rounded-2xl p-6 shadow-[0_8px_30px_rgba(30,33,30,0.05)] xl:sticky xl:top-6">
          {!selected ? (
            <p className="text-sm text-text/50 leading-relaxed">
              Select a row to view full booking details, email the guest, and add internal notes for your team.
            </p>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg text-[#1e211e]">Booking details</h2>
                <p className="text-[11px] text-text/40 mt-1 uppercase tracking-wider">
                  Reference · {selected.id.slice(0, 8)}…
                </p>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text/40">Guest</dt>
                  <dd className="text-[#1e211e] font-medium mt-0.5">{selected.clientName}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text/40">Email</dt>
                  <dd className="mt-0.5">
                    <a
                      href={`mailto:${selected.clientEmail}`}
                      className="text-[#6b5344] hover:underline break-all"
                    >
                      {selected.clientEmail}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text/40">Phone</dt>
                  <dd className="mt-0.5">
                    <a href={`tel:${selected.clientPhone}`} className="text-[#6b5344] hover:underline">
                      {selected.clientPhone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text/40">Service</dt>
                  <dd className="text-text/80 mt-0.5">{selected.service?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text/40">Schedule</dt>
                  <dd className="text-text/80 mt-0.5">
                    {format(new Date(selected.startTime), 'EEEE, MMM d, yyyy')}
                    <br />
                    {format(new Date(selected.startTime), 'h:mm a')} –{' '}
                    {format(new Date(selected.endTime), 'h:mm a')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text/40">Staff</dt>
                  <dd className="text-text/80 mt-0.5">{selected.staff?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text/40">Status</dt>
                  <dd className="mt-1">
                    <select
                      value={selected.status}
                      onChange={(e) => updateStatus(selected.id, e.target.value)}
                      className="text-sm border border-[#1e211e]/15 rounded-lg px-3 py-2 w-full bg-white text-[#1e211e]"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0) + s.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </dd>
                </div>
              </dl>

              <div>
                <label
                  htmlFor="booking-notes"
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text/40 block mb-2"
                >
                  Internal notes
                </label>
                <textarea
                  id="booking-notes"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={4}
                  placeholder="Private notes for staff (not shown to clients)…"
                  className="w-full px-3 py-2.5 text-sm border border-[#1e211e]/15 rounded-xl bg-[#faf8f4] text-[#1e211e] placeholder:text-text/30 focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20 resize-y min-h-[100px]"
                />
                <button
                  type="button"
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="mt-2 w-full rounded-full bg-[#1e211e] py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#f4e6cd] hover:opacity-90 disabled:opacity-50"
                >
                  {savingNotes ? 'Saving…' : 'Save notes'}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
