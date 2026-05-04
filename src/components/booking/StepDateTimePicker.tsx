'use client'
import { useState, useEffect } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  startOfToday,
  isSameDay,
  getYear,
  getMonth,
  setMonth,
  setYear,
  parseISO,
} from 'date-fns'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type SlotItem = { startTime: string; staffId: string }

const WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function StepDateTimePicker({
  serviceId,
  onNext,
  onBack,
}: {
  serviceId: string
  onNext: (t: { startTime: string; staffId: string }) => void
  onBack: () => void
}) {
  const today = startOfToday()
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<SlotItem[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const leadBlank = monthStart.getDay()

  const yearMin = getYear(today)
  const yearMax = yearMin + 3
  const years = Array.from({ length: yearMax - yearMin + 1 }, (_, i) => yearMin + i)

  useEffect(() => {
    if (!selectedDate) return
    setSlots([])
    setSelectedSlot(null)
    setLoadingSlots(true)
    const d = format(selectedDate, 'yyyy-MM-dd')
    fetch(`/api/booking/availability?serviceId=${encodeURIComponent(serviceId)}&date=${d}`)
      .then((r) => r.json())
      .then((data: { slots?: SlotItem[] }) => {
        const raw = data.slots || []
        setSlots(
          raw.map((s) =>
            typeof s === 'string'
              ? { startTime: s, staffId: '' }
              : { startTime: s.startTime, staffId: s.staffId }
          )
        )
      })
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, serviceId])

  return (
    <div>
      <h2 className="service-card-title !mb-2 !text-[1.65rem] md:!text-[1.85rem]">Pick a date & time</h2>
      <p className="service-card-text mb-6 !text-[15px] opacity-80">
        Choose any available day—browse by month and year—then pick a time slot.
      </p>

      <div className="mb-5 rounded-[var(--bliss-radius-s)] border border-[#1e211e]/12 bg-white/90 p-4 shadow-[0_8px_24px_rgba(30,33,30,0.06)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setViewMonth(subMonths(viewMonth, 1))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1e211e]/12 bg-white text-lg text-[#1e211e] transition-colors hover:border-[#1e211e]/25 hover:bg-[#faf9f7]"
          >
            ‹
          </button>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <label className="sr-only" htmlFor="booking-cal-month">
              Month
            </label>
            <select
              id="booking-cal-month"
              className="rounded-full border border-[#1e211e]/15 bg-[#faf9f7] py-2 pl-3 pr-8 text-sm font-medium text-[#1e211e]"
              value={getMonth(viewMonth)}
              onChange={(e) => setViewMonth(setMonth(viewMonth, Number(e.target.value)))}
            >
              {Array.from({ length: 12 }, (_, m) => (
                <option key={m} value={m}>
                  {format(setMonth(viewMonth, m), 'MMMM')}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="booking-cal-year">
              Year
            </label>
            <select
              id="booking-cal-year"
              className="rounded-full border border-[#1e211e]/15 bg-[#faf9f7] py-2 pl-3 pr-8 text-sm font-medium text-[#1e211e]"
              value={getYear(viewMonth)}
              onChange={(e) => setViewMonth(setYear(viewMonth, Number(e.target.value)))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1e211e]/12 bg-white text-lg text-[#1e211e] transition-colors hover:border-[#1e211e]/25 hover:bg-[#faf9f7]"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#8a7b6a]">
          {WEEK_LABELS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: leadBlank }, (_, i) => (
            <div key={`pad-${i}`} className="aspect-square min-h-[2.25rem]" />
          ))}
          {daysInMonth.map((day) => {
            const disabled = isBefore(day, today)
            const sel = selectedDate && isSameDay(day, selectedDate)
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setSelectedDate(day)}
                className={cn(
                  'aspect-square min-h-[2.25rem] rounded-[var(--bliss-radius-s)] text-sm font-medium transition-all',
                  disabled && 'cursor-not-allowed text-[#1e211e]/20',
                  !disabled && !sel && 'text-[#1e211e] hover:bg-[#edddc3]/80',
                  sel && 'bg-[#1e211e] text-[#f4e6cd] shadow-[0_4px_12px_rgba(30,33,30,0.2)]'
                )}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="mb-6">
          <p className="service-card-kicker mb-3">
            Available times for {format(selectedDate, 'MMMM d, yyyy')}
          </p>
          {loadingSlots ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-11 animate-pulse rounded-[var(--bliss-radius-s)] bg-[#1e211e]/[0.06]" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#1e211e]/50">
              No slots available for this date. Try another day.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={`${slot.startTime}-${slot.staffId}`}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    'rounded-[var(--bliss-radius-s)] border py-2.5 text-sm font-medium transition-all',
                    selectedSlot?.startTime === slot.startTime
                      ? 'border-[#1e211e] bg-[#1e211e] text-[#f4e6cd]'
                      : 'border-[#1e211e]/12 bg-white text-[#1e211e]/80 hover:border-[#1e211e]/30'
                  )}
                >
                  {format(parseISO(slot.startTime), 'h:mm a')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="py-2 text-center text-sm text-[#1e211e]/45">
          Select a day on the calendar to see available times.
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1 rounded-full border-[#1e211e]/15">
          Back
        </Button>
        <button
          type="button"
          disabled={!selectedSlot}
          onClick={() => selectedSlot && onNext(selectedSlot)}
          className="tertiary-button flex-1 !w-auto min-w-0 hover:!bg-[#1e211e] hover:!text-[#f4e6cd] disabled:pointer-events-none disabled:opacity-35"
        >
          <span className="tertiary-button-text-wrap">
            <span className="tertiary-button-slide">
              <span className="tertiary-button-text">Continue</span>
              <span className="tertiary-button-text">Continue</span>
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
