'use client'
import { useState, useEffect } from 'react'
import { format, addDays, startOfToday, parseISO } from 'date-fns'
import { Button } from '@/components/ui/Button'

export function StepDateTimePicker({
  staffId,
  onNext,
  onBack,
}: {
  staffId: string
  onNext: (t: string) => void
  onBack: () => void
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const today = startOfToday()
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i + 1))

  useEffect(() => {
    if (!selectedDate) return
    setSlots([])
    setSelectedSlot(null)
    setLoadingSlots(true)
    const d = format(selectedDate, 'yyyy-MM-dd')
    fetch(`/api/booking/availability?staffId=${staffId}&date=${d}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, staffId])

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#4A4A4A] mb-2">Pick a Date & Time</h2>
      <p className="text-[#4A4A4A]/60 mb-6">Choose from available slots below.</p>

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-1 px-1">
        {dates.map((d) => (
          <button
            key={d.toISOString()}
            onClick={() => setSelectedDate(d)}
            className={`shrink-0 w-14 py-3 rounded-xl border text-center transition-all ${
              selectedDate?.toDateString() === d.toDateString()
                ? 'border-[#F4D1C5] bg-[#F4D1C5]/10'
                : 'border-[#E0DCD9] bg-white hover:border-[#F4D1C5]/50'
            }`}
          >
            <p className="text-xs text-[#4A4A4A]/50">{format(d, 'EEE')}</p>
            <p className="font-semibold text-[#4A4A4A] mt-0.5">{format(d, 'd')}</p>
            <p className="text-[10px] text-[#4A4A4A]/40">{format(d, 'MMM')}</p>
          </button>
        ))}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-[#4A4A4A]/50 mb-3">
            Available times for {format(selectedDate, 'MMMM d')}
          </p>
          {loadingSlots ? (
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-10 bg-[#E0DCD9]/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-center text-[#4A4A4A]/50 py-6 text-sm">
              No slots available for this date. Try another day.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    selectedSlot === slot
                      ? 'border-[#F4D1C5] bg-[#F4D1C5]/10 text-[#4A4A4A]'
                      : 'border-[#E0DCD9] bg-white hover:border-[#F4D1C5]/50 text-[#4A4A4A]/70'
                  }`}
                >
                  {format(parseISO(slot), 'h:mm a')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-center text-[#4A4A4A]/40 text-sm py-6">
          Select a date above to see available times.
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <button
          disabled={!selectedSlot}
          onClick={() => onNext(selectedSlot!)}
          className="flex-1 py-3 rounded-[4px] bg-[#F4D1C5] hover:bg-[#E8B8A8] disabled:opacity-40 font-medium tracking-[0.05em] uppercase text-sm transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
