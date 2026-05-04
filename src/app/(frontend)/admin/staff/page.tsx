'use client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/Input'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { ImageUpload } from '@/components/admin/ImageUpload'

type Staff = {
  id: string
  name: string
  role: string
  bio?: string
  avatarUrl?: string
  isActive: boolean
  staffServices?: { service: { id: string; name: string } }[]
}
type Service = { id: string; name: string }
const EMPTY = { name: '', role: '', bio: '', avatarUrl: '', isActive: true, serviceIds: [] as string[] }

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState<typeof EMPTY & { id?: string }>(EMPTY)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = () =>
    fetch('/api/admin/staff').then(r => r.json()).then(d => setStaff(d.staff || []))

  useEffect(() => {
    load()
    fetch('/api/services').then(r => r.json()).then(d => setServices(d.services || []))
  }, [])

  const save = async () => {
    setLoading(true)
    await fetch('/api/admin/staff', {
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
    await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' })
    await load()
  }

  const editStaff = (s: Staff) => {
    setForm({
      id: s.id,
      name: s.name,
      role: s.role,
      bio: s.bio || '',
      avatarUrl: s.avatarUrl || '',
      isActive: s.isActive,
      serviceIds: s.staffServices?.map(ss => ss.service.id) || [],
    })
    setEditing(true)
  }

  return (
    <div className="bliss-admin-dash">
      <AdminPageHeader
        eyebrow="Team"
        title="Staff"
        description="Manage your team members and the services they perform. Staff availability drives the booking calendar."
        actions={
          <button
            type="button"
            onClick={() => { setForm(EMPTY); setEditing(true) }}
            className="inline-flex items-center justify-center rounded-full bg-[#1e211e] px-4 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90"
          >
            + Add Staff
          </button>
        }
      />

      {editing && (
        <div className="bliss-admin-card p-6 mb-8">
          <h2 className="font-display text-lg font-normal text-[#1e211e] mb-5">
            {form.id ? 'Edit Staff Member' : 'New Staff Member'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="Job Title"
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            />
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50 block mb-2">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 border border-[#1e211e]/12 rounded-xl bg-[#faf9f7] text-[#1e211e] text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20 resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                label="Avatar Photo"
                value={form.avatarUrl || ''}
                onChange={url => setForm(p => ({ ...p, avatarUrl: url }))}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50 block mb-2">
                Offered Services
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto border border-[#1e211e]/12 rounded-xl p-3 bg-[#faf9f7]">
                {services.length === 0 && (
                  <p className="text-xs text-[#1e211e]/40">No services yet — add some first.</p>
                )}
                {services.map(s => (
                  <label key={s.id} className="flex items-center gap-2.5 text-sm text-[#1e211e] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.serviceIds.includes(s.id)}
                      onChange={e => setForm(p => ({
                        ...p,
                        serviceIds: e.target.checked
                          ? [...p.serviceIds, s.id]
                          : p.serviceIds.filter(id => id !== s.id),
                      }))}
                      className="rounded accent-[#6b5344]"
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2.5 mt-2">
              <input
                type="checkbox"
                id="sActive"
                checked={form.isActive}
                onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                className="rounded accent-[#6b5344]"
              />
              <label htmlFor="sActive" className="text-sm text-[#1e211e]">Active (visible in booking)</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={save}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-[#1e211e] px-5 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save Staff Member'}
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
        {staff.length === 0 ? (
          <p className="text-center text-[#1e211e]/40 py-14 text-sm">
            No staff yet. Add your first team member above.
          </p>
        ) : (
          <div className="bliss-admin-table-wrap">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-[#f4e6cd]/35">
                <tr>
                  {['Member', 'Role', 'Services', 'Status', ''].map(h => (
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
                {staff.map(s => (
                  <tr key={s.id} className="border-t border-[#1e211e]/8 transition-colors hover:bg-[#faf8f4]/90">
                    <td className="px-4 py-3.5 sm:px-5 sm:py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#edddc3]">
                          {s.avatarUrl ? (
                            <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-[#6b5344]">
                              {s.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-[#1e211e]">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#1e211e]/70 sm:px-5 sm:py-4">{s.role}</td>
                    <td className="px-4 py-3.5 text-[#1e211e]/55 text-xs sm:px-5 sm:py-4">
                      {s.staffServices?.map(ss => ss.service.name).join(', ') || '—'}
                    </td>
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
                        onClick={() => editStaff(s)}
                        className="text-xs text-[#6b5344] hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deactivate(s.id)}
                        className="text-xs text-[#1e211e]/35 hover:text-amber-700"
                      >
                        Deactivate
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
