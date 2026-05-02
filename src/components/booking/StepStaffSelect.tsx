'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

type StaffOption = {
  id: string
  name: string
  role: string
  bio: string
  avatarUrl?: string
}

export function StepStaffSelect({
  serviceId,
  onNext,
  onBack,
}: {
  serviceId: string
  onNext: (s: { id: string; name: string }) => void
  onBack: () => void
}) {
  const [staff, setStaff] = useState<StaffOption[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/staff?serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((d) => { setStaff(d.staff || []); setLoading(false) })
  }, [serviceId])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#4A4A4A] mb-2">Choose Your Specialist</h2>
      <p className="text-[#4A4A4A]/60 mb-8">Select who you'd like to see for this treatment.</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-[#E0DCD9]/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {staff.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`text-left p-5 rounded-xl border flex items-center gap-4 transition-all ${
                selected === s.id
                  ? 'border-[#F4D1C5] bg-[#F4D1C5]/5'
                  : 'border-[#E0DCD9] bg-white hover:border-[#F4D1C5]/50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#F4D1C5]/40 shrink-0 flex items-center justify-center font-semibold text-[#4A4A4A] text-lg">
                {s.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-[#4A4A4A]">{s.name}</p>
                <p className="text-sm text-[#4A4A4A]/60">{s.role}</p>
                {s.bio && (
                  <p className="text-xs text-[#4A4A4A]/40 mt-1 line-clamp-1">{s.bio}</p>
                )}
              </div>
            </button>
          ))}
          {staff.length === 0 && !loading && (
            <p className="text-center text-[#4A4A4A]/50 py-8">
              No specialists available. Please check back soon.
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <button
          disabled={!selected}
          onClick={() => {
            const s = staff.find((s) => s.id === selected)!
            onNext({ id: s.id, name: s.name })
          }}
          className="flex-1 py-3 rounded-[4px] bg-[#F4D1C5] hover:bg-[#E8B8A8] disabled:opacity-40 font-medium tracking-[0.05em] uppercase text-sm transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
