'use client'
import { useEffect, useState } from 'react'

type ServiceOption = {
  id: string
  name: string
  price: number
  durationMinutes: number
  description: string
}

export function StepServiceSelect({
  onNext,
  preselectedId,
}: {
  onNext: (s: { id: string; name: string }) => void
  preselectedId?: string
}) {
  const [services, setServices] = useState<ServiceOption[]>([])
  const [selected, setSelected] = useState<string | null>(preselectedId || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((d) => { setServices(d.services || []); setLoading(false) })
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#4A4A4A] mb-2">Choose Your Treatment</h2>
      <p className="text-[#4A4A4A]/60 mb-8">Select the service you'd like to book.</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#E0DCD9]/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`text-left p-5 rounded-xl border transition-all ${
                selected === s.id
                  ? 'border-[#F4D1C5] bg-[#F4D1C5]/5'
                  : 'border-[#E0DCD9] bg-white hover:border-[#F4D1C5]/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <p className="font-medium text-[#4A4A4A]">{s.name}</p>
                  <p className="text-sm text-[#4A4A4A]/60 mt-1 line-clamp-2">
                    {s.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-[#4A4A4A]">${s.price}</p>
                  <p className="text-xs text-[#4A4A4A]/50">{s.durationMinutes} min</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        disabled={!selected}
        onClick={() => {
          const s = services.find((s) => s.id === selected)!
          onNext({ id: s.id, name: s.name })
        }}
        className="mt-8 w-full py-3 rounded-[4px] bg-[#F4D1C5] hover:bg-[#E8B8A8] disabled:opacity-40 font-medium tracking-[0.05em] uppercase text-sm transition-colors"
      >
        Continue
      </button>
    </div>
  )
}
