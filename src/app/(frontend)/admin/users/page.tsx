'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { DEFAULT_ADMIN_SECTION_FLAGS, type AdminSectionFlags } from '@/lib/admin-sections'

type UserRow = {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: string
  canAccessAdminPortal: boolean
  canAccessClientPortal: boolean
  createdAt: string
} & AdminSectionFlags

const EMPTY_FORM = {
  id: '' as string | undefined,
  email: '',
  fullName: '',
  phone: '',
  password: '',
  canAccessAdminPortal: false,
  canAccessClientPortal: true,
  canAdminOverview: false,
  canAdminBookings: false,
  canAdminClients: false,
  canAdminServices: false,
  canAdminProducts: false,
  canAdminStaff: false,
  canAdminUsers: false,
}

const inputClass =
  'w-full min-h-[44px] rounded-xl border border-[#1e211e]/12 bg-[#faf9f7] px-3 py-2.5 text-base text-[#1e211e] sm:px-4 sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20'

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
      canAdminOverview: u.canAdminOverview,
      canAdminBookings: u.canAdminBookings,
      canAdminClients: u.canAdminClients,
      canAdminServices: u.canAdminServices,
      canAdminProducts: u.canAdminProducts,
      canAdminStaff: u.canAdminStaff,
      canAdminUsers: u.canAdminUsers,
    })
    setEditing(true)
    setError('')
  }

  const setSection = (key: keyof AdminSectionFlags, value: boolean) => {
    setForm((p) => ({ ...p, [key]: value }))
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
          canAdminOverview: form.canAdminOverview,
          canAdminBookings: form.canAdminBookings,
          canAdminClients: form.canAdminClients,
          canAdminServices: form.canAdminServices,
          canAdminProducts: form.canAdminProducts,
          canAdminStaff: form.canAdminStaff,
          canAdminUsers: form.canAdminUsers,
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

  const adminPages: { key: keyof AdminSectionFlags; label: string }[] = [
    { key: 'canAdminOverview', label: 'Overview' },
    { key: 'canAdminBookings', label: 'Bookings' },
    { key: 'canAdminClients', label: 'Clients' },
    { key: 'canAdminServices', label: 'Services' },
    { key: 'canAdminProducts', label: 'Shop' },
    { key: 'canAdminStaff', label: 'Staff' },
    { key: 'canAdminUsers', label: 'Users' },
  ]

  const portalKicker = (u: UserRow) => {
    const bits: string[] = []
    if (u.canAccessAdminPortal) bits.push('Admin console')
    if (u.canAccessClientPortal) bits.push('Customer portal')
    return bits.length ? bits.join(' · ') : 'No portal access'
  }

  const pagePills = (u: UserRow) => {
    if (!u.canAccessAdminPortal) return null
    const tags = [
      u.canAdminOverview && 'Overview',
      u.canAdminBookings && 'Bookings',
      u.canAdminClients && 'Clients',
      u.canAdminServices && 'Services',
      u.canAdminProducts && 'Shop',
      u.canAdminStaff && 'Staff',
      u.canAdminUsers && 'Users',
    ].filter(Boolean) as string[]
    if (!tags.length) {
      return <span className="text-[13px] text-[#1e211e]/45">No admin pages selected</span>
    }
    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex rounded-full border border-[#1e211e]/10 bg-[#f4e6cd]/50 px-2.5 py-1 text-[11px] font-medium text-[#1e211e]/80"
          >
            {t}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="bliss-admin-dash">
      <AdminPageHeader
        eyebrow="Access"
        title="Users"
        description="Create sign-in accounts, set email and password, and choose the customer portal, the admin console, and which admin pages each person may open."
        actions={
          <button
            type="button"
            onClick={openNew}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#1e211e] px-4 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90 sm:w-auto"
          >
            + Add user
          </button>
        }
      />

      {editing && (
        <div className="bliss-admin-card mx-auto mb-8 max-w-full px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="mb-4 font-display text-lg font-normal text-[#1e211e] sm:mb-5">
            {form.id ? 'Edit user' : 'New user'}
          </h2>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
                Email
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className={inputClass}
                autoComplete="email"
              />
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
                Full name
              </span>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                className={inputClass}
                autoComplete="name"
              />
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
                Phone (optional)
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className={inputClass}
                autoComplete="tel"
              />
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
                {form.id ? 'New password (leave blank to keep current)' : 'Password'}
              </span>
              <input
                type="password"
                required={!form.id}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className={inputClass}
                placeholder={form.id ? '••••••••' : 'At least 8 characters'}
              />
            </label>
            <div className="flex flex-col gap-3 sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
                Portals
              </span>
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm text-[#1e211e]">
                <input
                  type="checkbox"
                  checked={form.canAccessAdminPortal}
                  onChange={(e) => {
                    const on = e.target.checked
                    setForm((p) => {
                      if (!on) {
                        return {
                          ...p,
                          canAccessAdminPortal: false,
                          canAdminOverview: false,
                          canAdminBookings: false,
                          canAdminClients: false,
                          canAdminServices: false,
                          canAdminProducts: false,
                          canAdminStaff: false,
                          canAdminUsers: false,
                        }
                      }
                      const anyOn =
                        p.canAdminOverview
                        || p.canAdminBookings
                        || p.canAdminClients
                        || p.canAdminServices
                        || p.canAdminProducts
                        || p.canAdminStaff
                        || p.canAdminUsers
                      return {
                        ...p,
                        canAccessAdminPortal: true,
                        ...(anyOn ? {} : DEFAULT_ADMIN_SECTION_FLAGS),
                      }
                    })
                  }}
                  className="h-4 w-4 shrink-0 rounded accent-[#6b5344]"
                />
                Admin console (/admin)
              </label>
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm text-[#1e211e]">
                <input
                  type="checkbox"
                  checked={form.canAccessClientPortal}
                  onChange={(e) => setForm((p) => ({ ...p, canAccessClientPortal: e.target.checked }))}
                  className="h-4 w-4 shrink-0 rounded accent-[#6b5344]"
                />
                Customer portal (/dashboard)
              </label>
            </div>

            <div
              className={`sm:col-span-2 ${!form.canAccessAdminPortal ? 'pointer-events-none opacity-40' : ''}`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
                Admin pages (when admin console is on)
              </span>
              <p className="mb-3 text-xs leading-snug text-[#1e211e]/55">
                Pick at least one page. Users only see nav links they are allowed to open.
              </p>
              <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                {adminPages.map(({ key, label }) => (
                  <label key={key} className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm text-[#1e211e]">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      disabled={!form.canAccessAdminPortal}
                      onChange={(e) => setSection(key, e.target.checked)}
                      className="h-4 w-4 shrink-0 rounded accent-[#6b5344]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#1e211e] px-5 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
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
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[#1e211e]/15 bg-white px-5 py-2.5 text-sm font-medium text-[#1e211e] transition-colors hover:bg-[#f4e6cd]/40 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1e211e]/15 border-t-[#6b5344]" />
          <p className="text-sm text-[#1e211e]/40">Loading users…</p>
        </div>
      ) : users.length === 0 ? (
        <p className="py-16 text-center text-sm text-[#1e211e]/40">No users yet.</p>
      ) : (
        <div className="services-cards-wrap bliss-admin-user-cards">
          <div className="service-list-wrapper">
            <div role="list" className="service-list">
              {users.map((u) => (
                <div key={u.id} role="listitem">
                  <div className="service-card-wrap group/scard flex h-full flex-col !cursor-default">
                    <div
                      className="service-card-image-wrap relative flex items-center justify-center overflow-hidden"
                      aria-hidden
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#f4e6cd] via-[#edddc3] to-[#6b5344]/18" />
                      <span className="relative font-display text-[clamp(2.5rem,8vw,3.5rem)] leading-none text-[#1e211e]/22">
                        {u.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="service-card-content-wrapper">
                      <p className="service-card-kicker">
                        Joined {format(new Date(u.createdAt), 'MMM d, yyyy')}
                      </p>
                      <p className="service-card-kicker !-mt-1 !mb-1 !text-[12px] !font-medium !normal-case !tracking-normal !text-[#6b5344]">
                        {portalKicker(u)}
                      </p>
                      <div className="service-card-title-wrap">
                        <div className="service-card-title">{u.fullName}</div>
                      </div>
                      <div className="service-card-text-wrap">
                        <p className="service-card-text break-words text-[15px]">{u.email}</p>
                        {u.phone ? (
                          <p className="service-card-text mt-1 !text-[14px] !leading-snug opacity-80">{u.phone}</p>
                        ) : null}
                        {pagePills(u)}
                      </div>
                      <button type="button" onClick={() => openEdit(u)} className="tertiary-button mt-3">
                        <span className="tertiary-button-text-wrap">
                          <span className="tertiary-button-slide">
                            <span className="tertiary-button-text">Edit user</span>
                            <span className="tertiary-button-text">Edit user</span>
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
