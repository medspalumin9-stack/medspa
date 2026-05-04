'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ProductEditForm, type ProductFormState } from '@/components/admin/ProductEditForm'
import { BLISSORIA_CARD_SIZES, blissoriaServiceThumbForIndex } from '@/lib/blissoria-card'

type Product = {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category?: string
  isAvailable: boolean
}

const EMPTY: ProductFormState = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  category: '',
  isAvailable: true,
}

const fetchJson = async (input: RequestInfo, init?: RequestInit) => {
  const r = await fetch(input, { ...init, credentials: 'include' })
  const j = await r.json().catch(() => ({}))
  return { r, j }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<ProductFormState>(EMPTY)
  const [editingId, setEditingId] = useState<string | '__new__' | null>(null)
  const [loading, setLoading] = useState(false)
  const newPanelRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const { r, j } = await fetchJson('/api/admin/products')
    if (!r.ok) return
    setProducts(j.products || [])
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (editingId === '__new__' && newPanelRef.current) {
      newPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editingId])

  const toForm = (p: Product): ProductFormState => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl || '',
    category: p.category || '',
    isAvailable: p.isAvailable,
  })

  const save = async () => {
    setLoading(true)
    const method = form.id ? 'PUT' : 'POST'
    const body = {
      ...form,
      imageUrl: form.imageUrl?.trim() || '',
      category: form.category?.trim() || null,
    }
    const { r, j } = await fetchJson('/api/admin/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (!r.ok) {
      alert(typeof j.error === 'string' ? j.error : 'Could not save product.')
      return
    }
    await load()
    setForm(EMPTY)
    setEditingId(null)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return
    const { r, j } = await fetchJson(`/api/admin/products?id=${id}`, { method: 'DELETE' })
    if (!r.ok) {
      alert(typeof j.error === 'string' ? j.error : 'Could not delete product.')
      return
    }
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

  const startEdit = (p: Product) => {
    setForm(toForm(p))
    setEditingId(p.id)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY)
  }

  return (
    <div className="bliss-admin-dash">
      <AdminPageHeader
        eyebrow="Boutique"
        title="Shop"
        description={
          <>
            Products listed here appear on the public{' '}
            <Link href="/shop" className="font-medium text-[#6b5344] underline-offset-2 hover:underline">
              shop page
            </Link>
            . Click <strong className="font-medium">Edit product</strong> on a card to update copy, price, photo, and
            availability in place.
          </>
        }
        actions={
          <button
            type="button"
            onClick={startNew}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1e211e] px-4 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90"
          >
            + Add Product
          </button>
        }
      />

      {editingId === '__new__' && (
        <div ref={newPanelRef} className="bliss-admin-card p-6 mb-8">
          <h2 className="font-display text-lg font-normal text-[#1e211e] mb-4">New Product</h2>
          <ProductEditForm form={form} setForm={setForm} loading={loading} onSave={save} onCancel={cancelEdit} variant="panel" />
        </div>
      )}

      {products.length === 0 && editingId !== '__new__' ? (
        <p className="text-[#1e211e]/40 text-sm py-14 text-center">No products yet. Add one with the button above.</p>
      ) : (
        <div className="services-cards-wrap">
          <div className="service-list-wrapper">
            <div role="list" className="service-list">
              {products.map((p, i) => {
                const fallback = blissoriaServiceThumbForIndex(i + 2)
                const excerpt =
                  p.description.length > 100 ? `${p.description.slice(0, 97).trim()}…` : p.description
                const isEditing = editingId === p.id
                return (
                  <div key={p.id} role="listitem">
                    <div
                      className={`service-card-wrap group/scard flex h-full flex-col ${isEditing ? '!cursor-auto' : '!cursor-default'}`}
                    >
                      <div className="service-card-image-wrap">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
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
                            alt={p.name}
                            className="service-card-image"
                          />
                        )}
                      </div>
                      <div className="service-card-content-wrapper">
                        {isEditing ? (
                          <div className="text-left">
                            <p className="service-card-kicker mb-2">Editing</p>
                            <ProductEditForm
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
                              {p.category ? `${p.category} · ` : ''}
                              {p.isAvailable ? 'Live in shop' : 'Hidden'}
                            </p>
                            <div className="service-card-title-wrap">
                              <div className="service-card-title">{p.name}</div>
                            </div>
                            <div className="service-card-text-wrap">
                              <p className="service-card-text">{excerpt || '—'}</p>
                            </div>
                            <div className="service-card-price">${p.price}</div>
                            <div className="mt-1 flex flex-col gap-2">
                              <button type="button" onClick={() => startEdit(p)} className="tertiary-button">
                                <span className="tertiary-button-text-wrap">
                                  <span className="tertiary-button-slide">
                                    <span className="tertiary-button-text">Edit product</span>
                                    <span className="tertiary-button-text">Edit product</span>
                                  </span>
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(p.id)}
                                className="text-center text-xs text-[#1e211e]/35 transition-colors hover:text-red-600"
                              >
                                Delete
                              </button>
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
