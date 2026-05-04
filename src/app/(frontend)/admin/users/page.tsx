'use client'

import { useEffect, useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

type UserRow = {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: string
  canAccessAdminPortal: boolean
  canAccessClientPortal: boolean
  createdAt: string
}

const EMPTY_FORM = {
  id: '' as string | undefined,
  email: '',
  fullName: '',
  phone: '',
  password: '',
  canAccessAdminPortal: false,
  canAccessClientPortal: true,
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = () =>
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setForm(EMPTY_FORM)
    setEditing(true)
    setError('')
  }

  const openEdit = (u: UserRow) => {
    setForm({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone ?? '',
      password: '',
      canAccessAdminPortal: u.canAccessAdminPortal,
      canAccessClientPortal: u.canAccessClientPortal,
    })
    setEditing(true)
    setError('')
  }

  const save = async () => {
    setError('')
    setSaving(true)
    try {
      const isNew = !form.id
      const res = await fetch('/api/admin/users', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          email: form.email,
          fullName: form.fullName,
          phone: form.phone || null,
          password: form.password || undefined,
          canAccessAdminPortal: form.canAccessAdminPortal,
          canAccessClientPortal: form.canAccessClientPortal,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Save failed.')
        setSaving(false)
        return
      }
      setEditing(false)
      setForm(EMPTY_FORM)
      await load()
    } catch {
      setError('Network error.')
    }
    setSaving(false)
  }

  return (
    <div className="bliss-admin-dash">
      <AdminPageHeader
        eyebrow="Access"
        title="Users"
        description="Create sign-in accounts, set email and password, and choose whether each person may use the admin console, the customer portal, or both."
        actions={
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center justify-center rounded-full bg-[#1e211e] px-4 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90"
          >
            + Add user
          </button>
        }
      />

      {editing && (
        <div className="bliss-admin-card mb-8 p-6">
          <h2 className="mb-5 font-display text-lg font-normal text-[#1e211e]">
            {form.id ? 'Edit user' : 'New user'}
          </h2>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
                Email
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-xl border border-[#1e211e]/12 bg-[#faf9f7] px-4 py-3 text-sm text-[#1e211e] focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
                Full name
              </span>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full rounded-xl border border-[#1e211e]/12 bg-[#faf9f7] px-4 py-3 text-sm text-[#1e211e] focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
                Phone (optional)
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-xl border border-[#1e211e]/12 bg-[#faf9f7] px-4 py-3 text-sm text-[#1e211e] focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
                {form.id ? 'New password (leave blank to keep current)' : 'Password'}
              </span>
              <input
                type="password"
                required={!form.id}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full rounded-xl border border-[#1e211e]/12 bg-[#faf9f7] px-4 py-3 text-sm text-[#1e211e] focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20"
                placeholder={form.id ? '••••••••' : 'At least 8 characters'}
              />
            </label>
            <div className="flex flex-col gap-3 sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
                Portal access
              </span>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#1e211e]">
                <input
                  type="checkbox"
                  checked={form.canAccessAdminPortal}
                  onChange={(e) => setForm((p) => ({ ...p, canAccessAdminPortal: e.target.checked }))}
                  className="rounded accent-[#6b5344]"
                />
                Admin console (/admin)
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#1e211e]">
                <input
                  type="checkbox"
                  checked={form.canAccessClientPortal}
                  onChange={(e) => setForm((p) => ({ ...p, canAccessClientPortal: e.target.checked }))}
                  className="rounded accent-[#6b5344]"
                />
                Customer portal (/dashboard)
              </label>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-[#1e211e] px-5 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save user'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setForm(EMPTY_FORM)
                setError('')
              }}
              className="inline-flex items-center justify-center rounded-full border border-[#1e211e]/15 bg-white px-5 py-2.5 text-sm font-medium text-[#1e211e] transition-colors hover:bg-[#f4e6cd]/40"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bliss-admin-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1e211e]/15 border-t-[#6b5344]" />
            <p className="text-sm text-[#1e211e]/40">Loading users…</p>
          </div>
        ) : users.length === 0 ? (
          <p className="py-14 text-center text-sm text-[#1e211e]/40">No users yet.</p>
        ) : (
          <div className="bliss-admin-table-wrap">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-[#f4e6cd]/35">
                <tr>
                  {['Name', 'Email', 'Admin', 'Customer', 'Joined', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50 sm:px-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-[#1e211e]/8 transition-colors hover:bg-[#faf8f4]/90">
                    <td className="px-4 py-3.5 font-medium text-[#1e211e] sm:px-5 sm:py-4">{u.fullName}</td>
                    <td className="px-4 py-3.5 text-[#1e211e]/65 sm:px-5 sm:py-4">{u.email}</td>
                    <td className="px-4 py-3.5 sm:px-5 sm:py-4">{u.canAccessAdminPortal ? 'Yes' : '—'}</td>
                    <td className="px-4 py-3.5 sm:px-5 sm:py-4">{u.canAccessClientPortal ? 'Yes' : '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-[#1e211e]/50 sm:px-5 sm:py-4">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right sm:px-5 sm:py-4">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="text-xs font-medium text-[#6b5344] hover:underline"
                      >
                        Edit
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
