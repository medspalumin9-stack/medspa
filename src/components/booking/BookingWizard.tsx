'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepServiceSelect } from './StepServiceSelect'
import { StepStaffSelect } from './StepStaffSelect'
import { StepDateTimePicker } from './StepDateTimePicker'
import { StepContactInfo } from './StepContactInfo'
import { motion, AnimatePresence } from 'framer-motion'

type BookingState = {
  serviceId: string
  serviceName: string
  staffId: string
  staffName: string
  startTime: string
}

const STEPS = ['Service', 'Specialist', 'Date & Time', 'Your Details']

export function BookingWizard({
  preselectedServiceId,
}: {
  preselectedServiceId?: string
}) {
  const [step, setStep] = useState(preselectedServiceId ? 1 : 0)
  const [booking, setBooking] = useState<Partial<BookingState>>({
    serviceId: preselectedServiceId,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const next = (data: Partial<BookingState>) => {
    setBooking((prev) => ({ ...prev, ...data }))
    setStep((s) => s + 1)
  }
  const back = () => setStep((s) => s - 1)

  const submit = async (contactData: {
    clientName: string
    clientEmail: string
    clientPhone: string
  }) => {
    setLoading(true)
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...booking, ...contactData }),
      })
      if (!res.ok) throw new Error('Booking failed')
      router.push('/booking/confirmation')
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  i < step
                    ? 'bg-[#8FA896] text-white'
                    : i === step
                    ? 'bg-[#F4D1C5] text-[#4A4A4A]'
                    : 'bg-[#E0DCD9] text-[#4A4A4A]/40'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  i <= step ? 'text-[#4A4A4A]' : 'text-[#4A4A4A]/40'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 transition-colors ${
                  i < step ? 'bg-[#8FA896]' : 'bg-[#E0DCD9]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white border border-[#E0DCD9] rounded-2xl p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <StepServiceSelect
                onNext={(s) => next({ serviceId: s.id, serviceName: s.name })}
                preselectedId={preselectedServiceId}
              />
            )}
            {step === 1 && (
              <StepStaffSelect
                serviceId={booking.serviceId!}
                onNext={(s) => next({ staffId: s.id, staffName: s.name })}
                onBack={back}
              />
            )}
            {step === 2 && (
              <StepDateTimePicker
                staffId={booking.staffId!}
                onNext={(t) => next({ startTime: t })}
                onBack={back}
              />
            )}
            {step === 3 && (
              <StepContactInfo onSubmit={submit} onBack={back} loading={loading} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
