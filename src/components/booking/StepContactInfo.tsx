'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type ContactData = {
  clientName: string
  clientEmail: string
  clientPhone: string
}

export function StepContactInfo({
  onSubmit,
  onBack,
  loading,
}: {
  onSubmit: (d: ContactData) => void
  onBack: () => void
  loading: boolean
}) {
  const [form, setForm] = useState<ContactData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
  })
  const [errors, setErrors] = useState<Partial<ContactData>>({})

  const validate = () => {
    const e: Partial<ContactData> = {}
    if (!form.clientName.trim()) e.clientName = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail))
      e.clientEmail = 'Valid email required'
    if (!form.clientPhone.trim()) e.clientPhone = 'Phone number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#4A4A4A] mb-2">Your Details</h2>
      <p className="text-[#4A4A4A]/60 mb-8">
        We'll send your confirmation to these contacts. No deposit required.
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

      <p className="text-xs text-[#4A4A4A]/50 mt-4">
        ✦ You'll receive an email and SMS confirmation immediately after booking.
      </p>

      <div className="flex gap-3 mt-8">
        <Button variant="secondary" onClick={onBack} className="flex-1" disabled={loading}>
          Back
        </Button>
        <button
          onClick={() => {
            if (validate()) onSubmit(form)
          }}
          disabled={loading}
          className="flex-1 py-3 rounded-[4px] bg-[#F4D1C5] hover:bg-[#E8B8A8] disabled:opacity-40 font-medium tracking-[0.05em] uppercase text-sm transition-colors"
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  )
}
