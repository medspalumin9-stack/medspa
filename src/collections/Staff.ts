import type { CollectionConfig } from 'payload'

export const Staff: CollectionConfig = {
  slug: 'staff',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true, label: 'Job Title' },
    { name: 'bio', type: 'textarea' },
    { name: 'avatarUrl', type: 'text', label: 'Avatar Image URL' },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      label: 'Offered Services',
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
