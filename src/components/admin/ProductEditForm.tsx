'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/admin/ImageUpload'

const CATEGORIES = ['moisturizer', 'serum', 'cleanser', 'spf', 'treatment', 'other']

export type ProductFormState = {
  id?: string
  name: string
  description: string
  price: number
  imageUrl: string
  category?: string
  isAvailable: boolean
}

type Props = {
  form: ProductFormState
  setForm: Dispatch<SetStateAction<ProductFormState>>
  loading: boolean
  onSave: () => void | Promise<void>
  onCancel: () => void
  variant?: 'card' | 'panel'
}

export function ProductEditForm({ form, setForm, loading, onSave, onCancel, variant = 'panel' }: Props) {
  const wrap = variant === 'card' ? 'pt-2 border-t border-[#1e211e]/10 mt-3' : ''
  return (
    <div className={wrap}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 cursor-auto">
        <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <Input
          label="Price ($)"
          type="number"
          value={String(form.price)}
          onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
        />
        <div className="sm:col-span-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50 block mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-[#1e211e]/12 rounded-xl bg-[#faf9f7] text-[#1e211e] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20 resize-none"
          />
        </div>
        <div className="sm:col-span-2">
          <ImageUpload label="Product Photo" value={form.imageUrl} onChange={(url) => setForm((p) => ({ ...p, imageUrl: url }))} />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50 block mb-2">
            Category
          </label>
          <select
            value={form.category || ''}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="w-full px-4 py-3 border border-[#1e211e]/12 rounded-xl bg-[#faf9f7] text-[#1e211e] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2.5 sm:col-span-2">
          <input
            type="checkbox"
            id={`avail-${form.id ?? 'new'}`}
            checked={form.isAvailable}
            onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))}
            className="rounded accent-[#6b5344]"
          />
          <label htmlFor={`avail-${form.id ?? 'new'}`} className="text-sm text-[#1e211e]">
            Available in shop
          </label>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-5">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={loading}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1e211e] px-5 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Saving…' : form.id ? 'Save changes' : 'Save Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#1e211e]/15 bg-white px-5 py-2.5 text-sm font-medium text-[#1e211e] transition-colors hover:bg-[#f4e6cd]/40"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
