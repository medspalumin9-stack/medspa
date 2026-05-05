'use client'

import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'

type Block = { id: string; startAt: string; endAt: string; note: string | null }

export function BookingBlocksPanel() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(false)
  const [startLocal, setStartLocal] = useState('')
  const [endLocal, setEndLocal] = useState('')
  const [note, setNote] = useState('')

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/booking-blocks', { credentials: 'include' })
    const d = await r.json()
    if (r.ok) setBlocks(d.blocks || [])
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addBlock = async () => {
    if (!startLocal || !endLocal) {
      alert('Choose a start and end date/time.')
      return
    }
    const startAt = new Date(startLocal)
    const endAt = new Date(endLocal)
    if (startAt >= endAt) {
      alert('End must be after start.')
      return
    }
    setLoading(true)
    const r = await fetch('/api/admin/booking-blocks', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        note: note.trim() || undefined,
      }),
    })
    const d = await r.json().catch(() => ({}))
    setLoading(false)
    if (!r.ok) {
      alert(typeof d.error === 'string' ? d.error : 'Could not add block.')
      return
    }
    setStartLocal('')
    setEndLocal('')
    setNote('')
    await load()
  }

  const remove = async (id: string) => {
    if (!confirm('Remove this blocked period? Clients will be able to book it again.')) return
    const r = await fetch(`/api/admin/booking-blocks?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!r.ok) {
      const d = await r.json().catch(() => ({}))
      alert(typeof d.error === 'string' ? d.error : 'Could not remove.')
      return
    }
    await load()
  }

  return (
    <section className="bliss-admin-card mb-10 p-5 sm:p-6" aria-labelledby="booking-blocks-heading">
      <h2 id="booking-blocks-heading" className="font-display text-lg font-normal text-[#1e211e] mb-1">
        Block days &amp; times
      </h2>
      <p className="mb-5 text-sm text-[#1e211e]/60">
        Closed hours, holidays, or maintenance. These windows are removed from the public booking calendar for all
        specialists. Existing appointments are unchanged—cancel or move them separately if needed.
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
            Start
          </label>
          <input
            type="datetime-local"
            value={startLocal}
            onChange={(e) => setStartLocal(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-[#1e211e]/12 bg-[#faf9f7] px-3 py-2 text-sm text-[#1e211e] focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
            End
          </label>
          <input
            type="datetime-local"
            value={endLocal}
            onChange={(e) => setEndLocal(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-[#1e211e]/12 bg-[#faf9f7] px-3 py-2 text-sm text-[#1e211e] focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20"
          />
        </div>
        <div className="lg:col-span-4">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1e211e]/50">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Public holiday"
            className="w-full rounded-xl border border-[#1e211e]/12 bg-[#faf9f7] px-3 py-2 text-sm text-[#1e211e] focus:outline-none focus:ring-2 focus:ring-[#6b5344]/20"
          />
        </div>
        <div className="lg:col-span-4">
          <button
            type="button"
            onClick={() => void addBlock()}
            disabled={loading}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#1e211e] px-5 py-2.5 text-sm font-medium text-[#f4e6cd] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Add blocked period'}
          </button>
        </div>
      </div>

      {blocks.length === 0 ? (
        <p className="text-sm text-[#1e211e]/45">No custom blocks yet.</p>
      ) : (
        <ul className="divide-y divide-[#1e211e]/10 border-t border-[#1e211e]/10">
          {blocks.map((b) => (
            <li key={b.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#1e211e]">
                  {format(new Date(b.startAt), 'MMM d, yyyy · h:mm a')} →{' '}
                  {format(new Date(b.endAt), 'MMM d, yyyy · h:mm a')}
                </p>
                {b.note && <p className="text-xs text-[#1e211e]/50">{b.note}</p>}
              </div>
              <button
                type="button"
                onClick={() => void remove(b.id)}
                className="shrink-0 text-xs font-medium text-red-600/90 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
