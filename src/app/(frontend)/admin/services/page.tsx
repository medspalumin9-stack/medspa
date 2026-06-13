'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ServiceEditForm, type ServiceFormState } from '@/components/admin/ServiceEditForm'
import { BLISSORIA_CARD_SIZES, blissoriaServiceThumbForIndex } from '@/lib/blissoria-card'
import { formatGhs } from '@/lib/format-currency'

type Service = {
  id: string
  name: string
  description: string
  durationMinutes: number
  price: number
  imageUrl?: string
  isActive: boolean
  benefits: string[]
}

const EMPTY: ServiceFormState = {
  name: '',
  description: '',
  durationMinutes: 60,
  price: 0,
  imageUrl: '',
  benefits: [],
  isActive: true,
}

const fetchJson = async (input: RequestInfo, init?: RequestInit) => {
  const r = await fetch(input, { ...init, credentials: 'include' })
  const j = await r.json().catch(() => ({}))
  return { r, j }
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState<ServiceFormState>(EMPTY)
  const [editingId, setEditingId] = useState<string | '__new__' | null>(null)
  const [loading, setLoading] = useState(false)
  const newPanelRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const { r, j } = await fetchJson('/api/admin/services')
    if (!r.ok) return
    const list = (j.services || []) as Service[]
    setServices(
      list.map((s) => ({
        ...s,
        benefits: Array.isArray(s.benefits) ? s.benefits : [],
      })),
    )
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (editingId === '__new__' && newPanelRef.current) {
      newPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editingId])

  const toForm = (s: Service): ServiceFormState => ({
    id: s.id,
    name: s.name,
    description: s.description,
    durationMinutes: s.durationMinutes,
    price: s.price,
    imageUrl: s.imageUrl || '',
    benefits: [...(s.benefits ?? [])],
    isActive: s.isActive,
  })

  const save = async () => {
    setLoading(true)
    const method = form.id ? 'PUT' : 'POST'
    const body = {
      ...form,
      imageUrl: form.imageUrl?.trim() || null,
      benefits: form.benefits ?? [],
    }
    const { r, j } = await fetchJson('/api/admin/services', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (!r.ok) {
      alert(typeof j.error === 'string' ? j.error : 'Could not save service.')
      return
    }
    await load()
    setForm(EMPTY)
    setEditingId(null)
  }

  const deactivate = async (id: string) => {
    const { r } = await fetchJson(`/api/admin/services?id=${id}`, { method: 'DELETE' })
    if (!r.ok) return
    await load()
    if (editingId === id) {
      setEditingId(null)
      setForm(EMPTY)
    }
  }

  const startNew = () => {
    setForm(EMPTY)
    setEditingId('__new__')
  }

  const startEdit = (s: Service) => {
    setForm(toForm(s))
    setEditingId(s.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY)
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
            shows live requests. Click <strong className="font-medium">Edit service</strong> on a card to change it
            in place.
          </>
        }
        actions={
          <button
            type="button"
            onClick={startNew}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1e211e] px-4 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90"
          >
            + Add Service
          </button>
        }
      />

      {editingId === '__new__' && (
        <div ref={newPanelRef} className="bliss-admin-card p-6 mb-8">
          <h2 className="font-display text-lg font-normal text-[#1e211e] mb-4">New Service</h2>
          <ServiceEditForm form={form} setForm={setForm} loading={loading} onSave={save} onCancel={cancelEdit} variant="panel" />
        </div>
      )}

      {services.length === 0 && editingId !== '__new__' ? (
        <p className="text-center text-[#1e211e]/40 py-14 text-sm">No services yet. Add one with the button above.</p>
      ) : (
        <div className="services-cards-wrap">
          <div className="service-list-wrapper">
            <div role="list" className="service-list">
              {services.map((s, i) => {
                const fallback = blissoriaServiceThumbForIndex(i)
                const excerpt =
                  s.description.length > 120 ? `${s.description.slice(0, 117).trim()}…` : s.description
                const isEditing = editingId === s.id
                return (
                  <div key={s.id} role="listitem">
                    <div
                      className={`service-card-wrap group/scard flex h-full flex-col ${isEditing ? '!cursor-auto' : '!cursor-default'}`}
                    >
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
                        {isEditing ? (
                          <div className="text-left">
                            <p className="service-card-kicker mb-2">Editing</p>
                            <ServiceEditForm
                              form={form}
                              setForm={setForm}
                              loading={loading}
                              onSave={save}
                              onCancel={cancelEdit}
                              variant="card"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="service-card-kicker">
                              {s.durationMinutes} minutes · {s.isActive ? 'Live' : 'Hidden'}
                            </p>
                            <div className="service-card-title-wrap">
                              <div className="service-card-title">{s.name}</div>
                            </div>
                            <div className="service-card-text-wrap">
                              <p className="service-card-text">{excerpt || '—'}</p>
                            </div>
                            <div className="service-card-price">{formatGhs(s.price)}</div>
                            <div className="mt-1 flex flex-col gap-2">
                              <button type="button" onClick={() => startEdit(s)} className="tertiary-button">
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
                                    if (
                                      !confirm(
                                        'Permanently delete this service? This only works if no appointments reference it.',
                                      )
                                    )
                                      return
                                    const { r, j } = await fetchJson(
                                      `/api/admin/services?id=${encodeURIComponent(s.id)}&hard=1`,
                                      { method: 'DELETE' },
                                    )
                                    if (!r.ok) {
                                      alert(typeof j.error === 'string' ? j.error : 'Could not delete service.')
                                      return
                                    }
                                    await load()
                                  }}
                                  className="text-xs text-red-500/80 transition-colors hover:text-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
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
