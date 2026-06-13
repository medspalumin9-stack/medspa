'use client'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { useParams, useRouter } from 'next/navigation'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { formatGhs } from '@/lib/format-currency'

type Appointment = {
  id: string
  startTime: string
  status: string
  service?: { name: string }
  staff?: { name: string }
}

type Product = { id: string; name: string; price: number; category?: string }

type ClientDetail = {
  id: string
  fullName: string
  email: string
  phone?: string
  createdAt: string
  appointments: Appointment[]
  profile?: {
    practitionerComments?: string
    skinGoals?: string
    cosmeticNotes?: string
    technicianRecommendations?: string
    glowRoadmap?: string
    recommendedProducts?: { product: Product }[]
  }
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-[#8FA896]/20 text-[#8FA896]',
  SCHEDULED: 'bg-[#F4D1C5]/40 text-[#E8B8A8]',
  COMPLETED: 'bg-[#E0DCD9] text-text/60',
  CANCELLED: 'bg-red-50 text-red-400',
}

export default function AdminClientProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    practitionerComments: '',
    skinGoals: '',
    cosmeticNotes: '',
    technicianRecommendations: '',
    glowRoadmap: '',
    recommendedProductIds: [] as string[],
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/clients/${id}`).then(r => r.json()),
      fetch('/api/admin/products').then(r => r.json()),
    ]).then(([clientData, prodData]) => {
      const c: ClientDetail = clientData.client
      setClient(c)
      setProducts(prodData.products || [])
      if (c?.profile) {
        setForm({
          practitionerComments: c.profile.practitionerComments || '',
          skinGoals: c.profile.skinGoals || '',
          cosmeticNotes: c.profile.cosmeticNotes || '',
          technicianRecommendations: c.profile.technicianRecommendations || '',
          glowRoadmap: c.profile.glowRoadmap || '',
          recommendedProductIds: c.profile.recommendedProducts?.map(rp => rp.product.id) ?? [],
        })
      }
      setLoading(false)
    })
  }, [id])

  const save = async () => {
    setSaving(true)
    await fetch(`/api/admin/clients/${id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
  }

  if (loading) return <p className="py-10 text-center text-sm text-[#1e211e]/40">Loading…</p>
  if (!client) return <p className="py-10 text-center text-sm text-[#1e211e]/40">Client not found.</p>

  return (
    <div className="bliss-admin-dash">
      <AdminPageHeader
        eyebrow="Client profile"
        title={client.fullName}
        actions={
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-[#1e211e]/12 bg-white px-4 py-2 text-xs font-medium text-[#1e211e] hover:bg-[#f4e6cd]/40"
          >
            ← Back
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: client info + appointments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic info card */}
          <div className="bliss-admin-card p-6">
            <h2 className="font-display text-lg font-normal text-[#1e211e] mb-4">Client Info</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#1e211e]/40 text-xs mb-1">Email</p>
                <p className="text-[#1e211e]">{client.email}</p>
              </div>
              <div>
                <p className="text-[#1e211e]/40 text-xs mb-1">Phone</p>
                <p className="text-[#1e211e]">{client.phone || '—'}</p>
              </div>
              <div>
                <p className="text-[#1e211e]/40 text-xs mb-1">Member Since</p>
                <p className="text-[#1e211e]">{format(new Date(client.createdAt), 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-[#1e211e]/40 text-xs mb-1">Total Bookings</p>
                <p className="text-[#1e211e]">{client.appointments.length}</p>
              </div>
            </div>
          </div>

          {/* Appointments history */}
          <div className="bliss-admin-card overflow-hidden !p-0">
            <div className="px-6 py-4 border-b border-[#1e211e]/10">
              <h2 className="font-display text-lg font-normal text-[#1e211e]">Appointment History</h2>
            </div>
            {client.appointments.length === 0 ? (
              <p className="text-center text-[#1e211e]/40 py-8 text-sm">No appointments yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#f4e6cd]/35">
                  <tr>
                    {['Date', 'Service', 'Staff', 'Status'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-[#1e211e]/50 uppercase tracking-[0.05em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {client.appointments.map(a => (
                    <tr key={a.id} className="border-t border-[#1e211e]/8 hover:bg-[#f4e6cd]/15 transition-colors">
                      <td className="px-5 py-3 text-xs text-[#1e211e]/60">
                        {format(new Date(a.startTime), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-5 py-3 text-[#1e211e]/75">{a.service?.name || '—'}</td>
                      <td className="px-5 py-3 text-[#1e211e]/55">{a.staff?.name || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[a.status] || ''}`}>
                          {a.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Glow Up Roadmap editor */}
        <div className="space-y-6">
          <div className="bliss-admin-card p-6">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6b5344]">Visible in client portal</p>
            <h2 className="font-display text-lg font-normal text-[#1e211e] mb-1">Glow Up Roadmap</h2>
            <p className="text-xs text-[#1e211e]/40 mb-5">Technician recommendations and roadmap are visible in the client portal.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#1e211e] block mb-1.5">Technician recommendations</label>
                <textarea
                  value={form.technicianRecommendations}
                  onChange={e => setForm(p => ({ ...p, technicianRecommendations: e.target.value }))}
                  rows={4}
                  placeholder="Treatments to try next, home-care habits, follow-up timing…"
                  className="w-full px-3 py-2 border border-[#1e211e]/10 rounded-[4px] bg-white text-[#1e211e] text-sm focus:outline-none focus:border-[#6b5344] resize-none placeholder:text-[#1e211e]/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#1e211e] block mb-1.5">Glow up roadmap (client view)</label>
                <textarea
                  value={form.glowRoadmap}
                  onChange={e => setForm(p => ({ ...p, glowRoadmap: e.target.value }))}
                  rows={4}
                  placeholder="Phase 1–3 plan, milestones, what to expect between visits…"
                  className="w-full px-3 py-2 border border-[#1e211e]/10 rounded-[4px] bg-white text-[#1e211e] text-sm focus:outline-none focus:border-[#6b5344] resize-none placeholder:text-[#1e211e]/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#1e211e] block mb-1.5">Skin Goals</label>
                <textarea
                  value={form.skinGoals}
                  onChange={e => setForm(p => ({ ...p, skinGoals: e.target.value }))}
                  rows={2}
                  placeholder="e.g. Reduce hyperpigmentation, improve hydration…"
                  className="w-full px-3 py-2 border border-[#1e211e]/10 rounded-[4px] bg-white text-[#1e211e] text-sm focus:outline-none focus:border-[#6b5344] resize-none placeholder:text-[#1e211e]/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#1e211e] block mb-1.5">Practitioner Notes</label>
                <textarea
                  value={form.practitionerComments}
                  onChange={e => setForm(p => ({ ...p, practitionerComments: e.target.value }))}
                  rows={3}
                  placeholder="Clinical observations, treatment response…"
                  className="w-full px-3 py-2 border border-[#1e211e]/10 rounded-[4px] bg-white text-[#1e211e] text-sm focus:outline-none focus:border-[#6b5344] resize-none placeholder:text-[#1e211e]/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#1e211e] block mb-1.5">Cosmetic Notes</label>
                <textarea
                  value={form.cosmeticNotes}
                  onChange={e => setForm(p => ({ ...p, cosmeticNotes: e.target.value }))}
                  rows={2}
                  placeholder="Product sensitivities, preferences…"
                  className="w-full px-3 py-2 border border-[#1e211e]/10 rounded-[4px] bg-white text-[#1e211e] text-sm focus:outline-none focus:border-[#6b5344] resize-none placeholder:text-[#1e211e]/20"
                />
              </div>

              {/* Recommended products */}
              <div>
                <label className="text-xs font-medium text-[#1e211e] block mb-1.5">Recommended Products</label>
                {products.length === 0 ? (
                  <p className="text-xs text-[#1e211e]/40">No products in catalogue yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border border-[#1e211e]/10 rounded-[4px] p-2">
                    {products.map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-sm text-[#1e211e] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.recommendedProductIds.includes(p.id)}
                          onChange={e => setForm(prev => ({
                            ...prev,
                            recommendedProductIds: e.target.checked
                              ? [...prev.recommendedProductIds, p.id]
                              : prev.recommendedProductIds.filter(x => x !== p.id),
                          }))}
                          className="accent-[#6b5344]"
                        />
                        <span className="flex-1 truncate">{p.name}</span>
                        <span className="text-xs text-[#1e211e]/40 flex-shrink-0">{formatGhs(p.price)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="w-full mt-5 py-2.5 rounded-full bg-[#1e211e] text-[#f4e6cd] text-sm font-medium hover:bg-[#1e211e]/85 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : 'Save Roadmap'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
