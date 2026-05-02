import type { CollectionConfig } from 'payload'

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  admin: { useAsTitle: 'clientName', description: 'Booking records' },
  fields: [
    { name: 'clientEmail', type: 'email', required: true },
    { name: 'clientName', type: 'text', required: true },
    { name: 'clientPhone', type: 'text', required: true },
    {
      name: 'service',
      type: 'relationship',
      relationTo: 'services',
      required: true,
    },
    {
      name: 'staff',
      type: 'relationship',
      relationTo: 'staff',
      required: true,
    },
    {
      name: 'startTime',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'endTime',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'status',
      type: 'select',
      options: ['scheduled', 'confirmed', 'completed', 'cancelled'],
      defaultValue: 'scheduled',
      required: true,
    },
    {
      name: 'reminderSent24h',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true },
    },
    {
      name: 'reminderSent1h',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true },
    },
    {
      name: 'confirmationSent',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true },
    },
    { name: 'notes', type: 'textarea', label: 'Internal Notes' },
  ],
}
