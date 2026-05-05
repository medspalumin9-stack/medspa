'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/admin/ImageUpload'

export type ServiceFormState = {
  id?: string
  name: string
  description: string
  durationMinutes: number
  price: number
  imageUrl?: string
  benefits: string[]
  isActive: boolean
}

type Props = {
  form: ServiceFormState
  setForm: Dispatch<SetStateAction<ServiceFormState>>
  loading: boolean
  onSave: () => void | Promise<void>
  onCancel: () => void
  variant?: 'card' | 'panel'
}

export function ServiceEditForm({ form, setForm, loading, onSave, onCancel, variant = 'panel' }: Props) {
  const wrap = variant === 'card' ? 'pt-2 border-t border-[#1e211e]/10 mt-3' : ''
  return (
    <div className={wrap}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 cursor-auto">
        <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <div className="flex gap-3">
          <Input
            label="Price (GHS)"
            type="number"
            value={String(form.price)}
            onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
          />
          <Input
            label="Duration (min)"
            type="number"
            value={String(form.durationMinutes)}
            onChange={(e) => setForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))}
          />
        </div>
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
          <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50 block mb-2">
            Benefits (one per line)
          </label>
          <textarea
            value={(form.benefits ?? []).join('\n')}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                benefits: e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
            rows={3}
            className="w-full px-4 py-3 border border-[#1e211e]/12 rounded-xl bg-[#faf9f7] text-[#1e211e] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20 resize-none"
          />
        </div>
        <div className="sm:col-span-2">
          <ImageUpload
            label="Service Photo"
            value={form.imageUrl || ''}
            onChange={(url) => setForm((p) => ({ ...p, imageUrl: url }))}
          />
        </div>
        <div className="flex items-center gap-2.5 sm:col-span-2">
          <input
            type="checkbox"
            id={`active-${form.id ?? 'new'}`}
            checked={form.isActive}
            onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
            className="rounded accent-[#6b5344]"
          />
          <label htmlFor={`active-${form.id ?? 'new'}`} className="text-sm text-[#1e211e]">
            Active (visible on site)
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
          {loading ? 'Saving…' : form.id ? 'Save changes' : 'Save Service'}
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
