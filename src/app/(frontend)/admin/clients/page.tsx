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

      {loading ? (
        <div className="bliss-admin-card py-14 flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-[#1e211e]/15 border-t-[#6b5344] animate-spin" />
          <p className="text-sm text-[#1e211e]/40">Loading clients…</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[#1e211e]/40 py-14 text-sm">
          {search ? 'No clients match that search.' : 'No registered clients yet.'}
        </p>
      ) : (
        <div className="services-cards-wrap">
          <div className="service-list-wrapper">
            <div role="list" className="service-list">
              {filtered.map((c) => (
                <div key={c.id} role="listitem">
                  <Link
                    href={`/admin/clients/${c.id}`}
                    className="service-card-wrap group/scard flex h-full flex-col no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#6b5344]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#edddc3]"
                  >
                    <div className="service-card-image-wrap relative overflow-hidden" aria-hidden>
                      <div className="absolute inset-0 bg-gradient-to-br from-[#edddc3] via-[#f4e6cd] to-[#6b5344]/15" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-5xl text-[#1e211e]/20">{c.fullName.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="service-card-content-wrapper">
                      <p className="service-card-kicker">
                        {c._count.appointments} {c._count.appointments === 1 ? 'visit' : 'visits'} · joined {format(new Date(c.createdAt), 'MMM yyyy')}
                      </p>
                      <div className="service-card-title-wrap">
                        <div className="service-card-title">{c.fullName}</div>
                      </div>
                      <div className="service-card-text-wrap">
                        <p className="service-card-text break-all">{c.email}</p>
                        {c.phone ? (
                          <p className="service-card-text mt-1 !text-[15px] opacity-75">{c.phone}</p>
                        ) : null}
                      </div>
                      <span className="tertiary-button mt-2">
                        <span className="tertiary-button-text-wrap">
                          <span className="tertiary-button-slide">
                            <span className="tertiary-button-text">View profile</span>
                            <span className="tertiary-button-text">View profile</span>
                          </span>
                        </span>
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
