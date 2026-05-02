import type { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'richText', required: true },
    { name: 'durationMinutes', type: 'number', required: true, min: 15 },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'imageUrl', type: 'text', label: 'Hero Image URL' },
    {
      name: 'benefits',
      type: 'array',
      fields: [{ name: 'benefit', type: 'text' }],
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
