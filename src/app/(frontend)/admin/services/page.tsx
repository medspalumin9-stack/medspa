'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { BLISSORIA_CARD_SIZES, blissoriaServiceThumbForIndex } from '@/lib/blissoria-card'

type Service = {
  id: string
  name: string
  description: string
  durationMinutes: number
  price: number
  imageUrl?: string
  isActive: boolean
}
const EMPTY: Omit<Service, 'id'> = { name: '', description: '', durationMinutes: 60, price: 0, imageUrl: '', isActive: true }

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState<Omit<Service, 'id'> & { id?: string }>(EMPTY)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = () => fetch('/api/admin/services').then(r => r.json()).then(d => setServices(d.services || []))
  useEffect(() => { load() }, [])

  const save = async () => {
    setLoading(true)
    await fetch('/api/admin/services', {
      method: form.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    await load()
    setForm(EMPTY)
    setEditing(false)
    setLoading(false)
  }

  const deactivate = async (id: string) => {
    await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="bliss-admin-dash">
      <AdminPageHeader
        eyebrow="Treatments"
        title="Services"
        description={
          <>
            These drive the public{' '}
            <Link href="/services" className="font-medium text-[#6b5344] underline-offset-2 hover:underline">
              services page
            </Link>{' '}
            and the booking flow.{' '}
            <Link href="/admin/bookings" className="font-medium text-[#6b5344] underline-offset-2 hover:underline">
              Bookings
            </Link>{' '}
            shows live requests.
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => { setForm(EMPTY); setEditing(true) }}
            className="inline-flex items-center justify-center rounded-full bg-[#1e211e] px-4 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90"
          >
            + Add Service
          </button>
        }
      />

      {editing && (
        <div className="bliss-admin-card p-6 mb-8">
          <h2 className="font-display text-lg font-normal text-[#1e211e] mb-5">
            {form.id ? 'Edit Service' : 'New Service'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <div className="flex gap-3">
              <Input
                label="Price ($)"
                type="number"
                value={String(form.price)}
                onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
              />
              <Input
                label="Duration (min)"
                type="number"
                value={String(form.durationMinutes)}
                onChange={e => setForm(p => ({ ...p, durationMinutes: Number(e.target.value) }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50 block mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-[#1e211e]/12 rounded-xl bg-[#faf9f7] text-[#1e211e] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20 resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                label="Service Photo"
                value={form.imageUrl || ''}
                onChange={url => setForm(p => ({ ...p, imageUrl: url }))}
              />
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                className="rounded accent-[#6b5344]"
              />
              <label htmlFor="isActive" className="text-sm text-[#1e211e]">Active (visible on site)</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={save}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-[#1e211e] px-5 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save Service'}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setForm(EMPTY) }}
              className="inline-flex items-center justify-center rounded-full border border-[#1e211e]/15 bg-white px-5 py-2.5 text-sm font-medium text-[#1e211e] transition-colors hover:bg-[#f4e6cd]/40"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <p className="text-center text-[#1e211e]/40 py-14 text-sm">No services yet. Add one above.</p>
      ) : (
        <div className="services-cards-wrap">
          <div className="service-list-wrapper">
            <div role="list" className="service-list">
              {services.map((s, i) => {
                const fallback = blissoriaServiceThumbForIndex(i)
                const excerpt =
                  s.description.length > 120 ? `${s.description.slice(0, 117).trim()}…` : s.description
                return (
                  <div key={s.id} role="listitem">
                    <div className="service-card-wrap group/scard flex h-full flex-col !cursor-default">
                      <div className="service-card-image-wrap">
                        {s.imageUrl ? (
                          <Image
                            src={s.imageUrl}
                            alt={s.name}
                            fill
                            sizes={BLISSORIA_CARD_SIZES}
                            className="service-card-image"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element -- Blissoria CDN responsive srcSet
                          <img
                            src={fallback.src}
                            srcSet={fallback.srcSet}
                            sizes={BLISSORIA_CARD_SIZES}
                            alt={s.name}
                            className="service-card-image"
                          />
                        )}
                      </div>
                      <div className="service-card-content-wrapper">
                        <p className="service-card-kicker">{s.durationMinutes} minutes · {s.isActive ? 'Live' : 'Hidden'}</p>
                        <div className="service-card-title-wrap">
                          <div className="service-card-title">{s.name}</div>
                        </div>
                        <div className="service-card-text-wrap">
                          <p className="service-card-text">{excerpt || '—'}</p>
                        </div>
                        <div className="service-card-price">${s.price}</div>
                        <div className="mt-1 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => { setForm(s); setEditing(true) }}
                            className="tertiary-button"
                          >
                            <span className="tertiary-button-text-wrap">
                              <span className="tertiary-button-slide">
                                <span className="tertiary-button-text">Edit service</span>
                                <span className="tertiary-button-text">Edit service</span>
                              </span>
                            </span>
                          </button>
                          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1">
                            <button
                              type="button"
                              onClick={() => deactivate(s.id)}
                              className="text-xs text-[#1e211e]/35 transition-colors hover:text-amber-800"
                            >
                              Deactivate
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!confirm('Permanently delete this service? This only works if no appointments reference it.')) return
                                const r = await fetch(`/api/admin/services?id=${encodeURIComponent(s.id)}&hard=1`, { method: 'DELETE' })
                                const j = await r.json().catch(() => ({}))
                                if (!r.ok) { alert(typeof j.error === 'string' ? j.error : 'Could not delete service.'); return }
                                await load()
                              }}
                              className="text-xs text-red-500/80 transition-colors hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
