'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

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

      <div className="bliss-admin-card overflow-hidden">
        {services.length === 0 ? (
          <p className="text-center text-[#1e211e]/40 py-14 text-sm">No services yet. Add one above.</p>
        ) : (
          <div className="bliss-admin-table-wrap">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-[#f4e6cd]/35">
                <tr>
                  {['', 'Name', 'Duration', 'Price', 'Status', ''].map((h, i) => (
                    <th
                      key={i}
                      className="text-left px-4 py-3 text-[10px] font-semibold text-[#1e211e]/50 uppercase tracking-[0.12em] sm:px-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id} className="border-t border-[#1e211e]/8 transition-colors hover:bg-[#faf8f4]/90">
                    <td className="px-4 py-3 sm:px-5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#edddc3]/50 relative flex-shrink-0">
                        {s.imageUrl ? (
                          <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[#bda06e]">✦</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-[#1e211e] sm:px-5 sm:py-4">{s.name}</td>
                    <td className="px-4 py-3.5 text-[#1e211e]/60 sm:px-5 sm:py-4">{s.durationMinutes} min</td>
                    <td className="px-4 py-3.5 text-[#1e211e]/70 sm:px-5 sm:py-4">${s.price}</td>
                    <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          s.isActive
                            ? 'bg-[#8FA896]/20 text-[#3d5c45]'
                            : 'bg-[#e8e4dc] text-[#1e211e]/50'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap sm:px-5 sm:py-4">
                      <button
                        type="button"
                        onClick={() => { setForm(s); setEditing(true) }}
                        className="text-xs text-[#6b5344] hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deactivate(s.id)}
                        className="text-xs text-[#1e211e]/35 hover:text-amber-700 mr-3"
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
                        className="text-xs text-red-500/80 hover:text-red-600 hover:underline"
                      >
                        Delete
                      </button>
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
