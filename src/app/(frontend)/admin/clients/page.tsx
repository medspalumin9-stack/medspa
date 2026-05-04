'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { AdminClientsBookingsDashboard } from '@/components/admin/AdminClientsBookingsDashboard'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

type Client = {
  id: string
  fullName: string
  email: string
  phone?: string
  createdAt: string
  _count: { appointments: number }
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.json())
      .then(d => { setClients(d.clients || []); setLoading(false) })
  }, [])

  const filtered = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bliss-admin-dash">
      <AdminClientsBookingsDashboard />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <AdminPageHeader
          className="!mb-0 flex-1"
          eyebrow="Directory"
          title="Clients"
          description="Registered client accounts. Guest bookings appear in Bookings — clients show here once they create an account."
        />
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-4 py-2.5 text-sm border border-[#1e211e]/12 rounded-full bg-white text-[#1e211e] focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20 placeholder:text-[#1e211e]/30 shrink-0"
        />
      </div>

      <div className="bliss-admin-card overflow-hidden">
        {loading ? (
          <div className="py-14 flex flex-col items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-[#1e211e]/15 border-t-[#6b5344] animate-spin" />
            <p className="text-sm text-[#1e211e]/40">Loading clients…</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[#1e211e]/40 py-14 text-sm">
            {search ? 'No clients match that search.' : 'No registered clients yet.'}
          </p>
        ) : (
          <div className="bliss-admin-table-wrap">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-[#f4e6cd]/35">
                <tr>
                  {['Client', 'Email', 'Phone', 'Bookings', 'Joined', ''].map(h => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-semibold text-[#1e211e]/50 uppercase tracking-[0.12em] sm:px-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t border-[#1e211e]/8 transition-colors hover:bg-[#faf8f4]/90">
                    <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#edddc3] flex items-center justify-center text-sm font-semibold text-[#6b5344] flex-shrink-0">
                          {c.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#1e211e]">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#1e211e]/60 sm:px-5 sm:py-4">
                      <a href={`mailto:${c.email}`} className="hover:text-[#6b5344] hover:underline transition-colors">
                        {c.email}
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-[#1e211e]/55 sm:px-5 sm:py-4">
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} className="hover:text-[#6b5344] hover:underline transition-colors">
                          {c.phone}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f4e6cd]/80 text-[#6b5344]">
                        {c._count.appointments} {c._count.appointments === 1 ? 'visit' : 'visits'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#1e211e]/50 text-xs sm:px-5 sm:py-4 whitespace-nowrap">
                      {format(new Date(c.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="text-xs font-medium text-[#6b5344] hover:underline"
                      >
                        View profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
