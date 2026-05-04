'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { StepServiceSelect } from './StepServiceSelect'
import { StepDateTimePicker } from './StepDateTimePicker'
import { StepContactInfo, type ContactFormData } from './StepContactInfo'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type BookingState = {
  serviceId: string
  serviceName: string
  staffId: string
  startTime: string
}

const STEPS = ['Service', 'Date & Time', 'Your Details']

export function BookingWizard({
  preselectedServiceId,
  prefillData,
  returnTo,
}: {
  preselectedServiceId?: string
  prefillData?: { name?: string; email?: string; phone?: string }
  /** After booking (no new account), redirect here if set — e.g. `/dashboard` from portal. */
  returnTo?: string
}) {
  const [step, setStep] = useState(0)
  const [booking, setBooking] = useState<Partial<BookingState>>({
    serviceId: preselectedServiceId,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const wizardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wizardRef.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  const next = (data: Partial<BookingState>) => {
    setBooking((prev) => ({ ...prev, ...data }))
    setStep((s) => s + 1)
  }
  const back = () => setStep((s) => s - 1)

  const submit = async (contactData: ContactFormData) => {
    setLoading(true)
    try {
      const { createAccount, reminderChannel, clientName, clientEmail, clientPhone } = contactData
      if (!booking.serviceId || !booking.startTime) {
        alert('Please go back and choose a service, date, and time.')
        return
      }
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: booking.serviceId,
          staffId: booking.staffId || undefined,
          startTime: booking.startTime,
          clientName,
          clientEmail,
          clientPhone,
          reminderChannel,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        appointmentId?: string
        confirmationEmailSent?: boolean
        confirmationEmailError?: string
      }
      if (!res.ok) throw new Error(data.error || 'Booking failed')

      if (data.confirmationEmailSent === false && data.confirmationEmailError) {
        alert(
          `Your booking is confirmed, but we could not send the confirmation email.\n\n${data.confirmationEmailError}\n\nCheck RESEND_API_KEY and RESEND_FROM_EMAIL in .env.local.`
        )
      }

      if (createAccount && data.appointmentId) {
        try {
          sessionStorage.setItem(
            'lumin_booking_setup',
            JSON.stringify({
              appointmentId: data.appointmentId,
              email: contactData.clientEmail.trim(),
              returnTo: returnTo ?? null,
            })
          )
        } catch {
          /* ignore */
        }
        router.push('/auth/complete-registration')
      } else {
        router.push(returnTo ?? '/booking/confirmation')
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={wizardRef}
      className="mx-auto w-full max-w-2xl scroll-mt-24 md:scroll-mt-28"
    >
      <div className="service-card-wrap !cursor-default shadow-[0_24px_48px_rgba(30,33,30,0.1)] hover:!shadow-[0_24px_48px_rgba(30,33,30,0.12)]">
        <div className="service-card-content-wrapper !px-4 !py-5 sm:!px-8 sm:!py-7">
          <div className="mb-5 flex items-center sm:mb-6">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors',
                      i < step && 'bg-[#1e211e] text-[#f4e6cd]',
                      i === step && 'bg-[#edddc3] text-[#1e211e] ring-2 ring-[#1e211e]/15',
                      i > step && 'bg-white text-[#8a7b6a] ring-1 ring-[#1e211e]/12'
                    )}
                  >
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span
                    className={cn(
                      'hidden min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.12em] sm:block',
                      i <= step ? 'text-[#1e211e]' : 'text-[#8a7b6a]'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-1.5 h-px flex-1 sm:mx-3',
                      i < step ? 'bg-[#1e211e]/35' : 'bg-[#1e211e]/12'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <StepServiceSelect
                  onNext={(s) => next({ serviceId: s.id, serviceName: s.name })}
                  preselectedId={preselectedServiceId}
                />
              )}
              {step === 1 && (
                <StepDateTimePicker
                  serviceId={booking.serviceId!}
                  onNext={(t) => next({ startTime: t.startTime, staffId: t.staffId })}
                  onBack={back}
                />
              )}
              {step === 2 && (
                <StepContactInfo
                  onSubmit={submit}
                  onBack={back}
                  loading={loading}
                  initialData={
                    prefillData
                      ? {
                          clientName: prefillData.name,
                          clientEmail: prefillData.email,
                          clientPhone: prefillData.phone,
                        }
                      : undefined
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
