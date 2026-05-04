'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type ContactFormData = {
  clientName: string
  clientEmail: string
  clientPhone: string
  createAccount: boolean
  reminderChannel: 'EMAIL' | 'SMS'
}

export function StepContactInfo({
  onSubmit,
  onBack,
  loading,
  initialData,
}: {
  onSubmit: (d: ContactFormData) => void
  onBack: () => void
  loading: boolean
  initialData?: { clientName?: string; clientEmail?: string; clientPhone?: string }
}) {
  const [form, setForm] = useState<ContactFormData>({
    clientName: initialData?.clientName ?? '',
    clientEmail: initialData?.clientEmail ?? '',
    clientPhone: initialData?.clientPhone ?? '',
    createAccount: false,
    reminderChannel: 'EMAIL',
  })
  const [errors, setErrors] = useState<Partial<Pick<ContactFormData, 'clientName' | 'clientEmail' | 'clientPhone'>>>(
    {}
  )

  const validate = () => {
    const e: Partial<Pick<ContactFormData, 'clientName' | 'clientEmail' | 'clientPhone'>> = {}
    if (!form.clientName.trim()) e.clientName = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail))
      e.clientEmail = 'Valid email required'
    if (!form.clientPhone.trim()) e.clientPhone = 'Phone number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div>
      <h2 className="service-card-title !mb-2 !text-[1.65rem] md:!text-[1.85rem]">Your details</h2>
      <p className="service-card-text mb-8 !text-[15px] opacity-80">
        We&apos;ll send your confirmation by email and SMS. Reminders before your visit will use only the channel you
        choose below.
      </p>

      <div className="flex flex-col gap-5">
        <Input
          label="Full Name"
          value={form.clientName}
          onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
          error={errors.clientName}
          placeholder="Jane Doe"
          autoComplete="name"
        />
        <Input
          label="Email Address"
          type="email"
          value={form.clientEmail}
          onChange={(e) => setForm((p) => ({ ...p, clientEmail: e.target.value }))}
          error={errors.clientEmail}
          placeholder="jane@email.com"
          autoComplete="email"
        />
        <Input
          label="Phone Number"
          type="tel"
          value={form.clientPhone}
          onChange={(e) => setForm((p) => ({ ...p, clientPhone: e.target.value }))}
          error={errors.clientPhone}
          placeholder="+1 555 000 0000"
          autoComplete="tel"
        />
      </div>

      <fieldset className="mt-8 space-y-3 border-0 p-0">
        <legend className="service-card-kicker mb-3 w-full">Reminder channel (24h &amp; 1h before)</legend>
        <p className="mb-4 text-sm text-[#1e211e]/60">
          Appointment reminders are sent only through your choice—not both.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {(
            [
              { value: 'EMAIL' as const, title: 'Email', hint: 'Send reminders to my inbox' },
              { value: 'SMS' as const, title: 'SMS', hint: 'Text reminders to my phone' },
            ] as const
          ).map(({ value, title, hint }) => (
            <label
              key={value}
              className={cn(
                'flex flex-1 cursor-pointer items-start gap-3 rounded-[var(--bliss-radius-s)] border p-4 transition-colors',
                form.reminderChannel === value
                  ? 'border-[#1e211e] bg-white shadow-[0_8px_24px_rgba(30,33,30,0.08)]'
                  : 'border-[#1e211e]/12 bg-white/70 hover:border-[#1e211e]/20'
              )}
            >
              <input
                type="radio"
                name="reminderChannel"
                value={value}
                checked={form.reminderChannel === value}
                onChange={() => setForm((p) => ({ ...p, reminderChannel: value }))}
                className="mt-1"
              />
              <span>
                <span className="block font-medium text-[#1e211e]">{title}</span>
                <span className="mt-0.5 block text-sm text-[#1e211e]/55">{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-[var(--bliss-radius-s)] border border-[#1e211e]/12 bg-white/80 p-4 transition-colors hover:border-[#1e211e]/20">
        <input
          type="checkbox"
          checked={form.createAccount}
          onChange={(e) => setForm((p) => ({ ...p, createAccount: e.target.checked }))}
          className="mt-1"
        />
        <span>
          <span className="block font-medium text-[#1e211e]">Create an account with us</span>
          <span className="mt-1 block text-sm text-[#1e211e]/55">
            After you finish booking, we&apos;ll open a quick step to set a password for the email above and save this
            visit to your portal.
          </span>
        </span>
      </label>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1 rounded-full border-[#1e211e]/15" disabled={loading}>
          Back
        </Button>
        <button
          type="button"
          onClick={() => {
            if (validate()) onSubmit(form)
          }}
          disabled={loading}
          className="tertiary-button flex-1 !w-auto min-w-0 hover:!bg-[#1e211e] hover:!text-[#f4e6cd] disabled:opacity-40"
        >
          <span className="tertiary-button-text-wrap">
            <span className="tertiary-button-slide">
              <span className="tertiary-button-text">{loading ? 'Booking…' : 'Confirm booking'}</span>
              <span className="tertiary-button-text">{loading ? 'Booking…' : 'Confirm booking'}</span>
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
