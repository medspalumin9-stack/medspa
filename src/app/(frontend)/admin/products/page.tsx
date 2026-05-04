'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
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
const EMPTY: Omit<Product, 'id'> = { name: '', description: '', price: 0, imageUrl: '', category: '', isAvailable: true }

const CATEGORIES = ['moisturizer', 'serum', 'cleanser', 'spf', 'treatment', 'other']

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<Omit<Product, 'id'> & { id?: string }>(EMPTY)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = () => fetch('/api/admin/products').then(r => r.json()).then(d => setProducts(d.products || []))
  useEffect(() => { load() }, [])

  const save = async () => {
    setLoading(true)
    await fetch('/api/admin/products', {
      method: form.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    await load()
    setForm(EMPTY)
    setEditing(false)
    setLoading(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
    await load()
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
            . Manage copy, pricing, and photos.
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => { setForm(EMPTY); setEditing(true) }}
            className="inline-flex items-center justify-center rounded-full bg-[#1e211e] px-4 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90"
          >
            + Add Product
          </button>
        }
      />

      {editing && (
        <div className="bliss-admin-card p-6 mb-8">
          <h2 className="font-display text-lg font-normal text-[#1e211e] mb-5">
            {form.id ? 'Edit Product' : 'New Product'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <Input
              label="Price ($)"
              type="number"
              value={String(form.price)}
              onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
            />
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50 block mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 border border-[#1e211e]/12 rounded-xl bg-[#faf9f7] text-[#1e211e] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20 resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload label="Product Photo" value={form.imageUrl} onChange={url => setForm(p => ({ ...p, imageUrl: url }))} />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50 block mb-2">
                Category
              </label>
              <select
                value={form.category || ''}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 border border-[#1e211e]/12 rounded-xl bg-[#faf9f7] text-[#1e211e] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2.5 mt-5">
              <input
                type="checkbox"
                id="available"
                checked={form.isAvailable}
                onChange={e => setForm(p => ({ ...p, isAvailable: e.target.checked }))}
                className="rounded accent-[#6b5344]"
              />
              <label htmlFor="available" className="text-sm text-[#1e211e]">Available in shop</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={save}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-[#1e211e] px-5 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save Product'}
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

      {products.length === 0 ? (
        <p className="text-[#1e211e]/40 text-sm py-14 text-center">No products yet. Add one above.</p>
      ) : (
        <div className="services-cards-wrap">
          <div className="service-list-wrapper">
            <div role="list" className="service-list">
              {products.map((p, i) => {
                const fallback = blissoriaServiceThumbForIndex(i + 2)
                const excerpt =
                  p.description.length > 100 ? `${p.description.slice(0, 97).trim()}…` : p.description
                return (
                  <div key={p.id} role="listitem">
                    <div className="service-card-wrap group/scard flex h-full flex-col !cursor-default">
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
                        <p className="service-card-kicker">
                          {p.category ? `${p.category} · ` : ''}{p.isAvailable ? 'Live in shop' : 'Hidden'}
                        </p>
                        <div className="service-card-title-wrap">
                          <div className="service-card-title">{p.name}</div>
                        </div>
                        <div className="service-card-text-wrap">
                          <p className="service-card-text">{excerpt || '—'}</p>
                        </div>
                        <div className="service-card-price">${p.price}</div>
                        <div className="mt-1 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => { setForm(p); setEditing(true) }}
                            className="tertiary-button"
                          >
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
