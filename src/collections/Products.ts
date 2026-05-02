import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea', required: true },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'imageUrl', type: 'text', required: true, label: 'Product Image URL' },
    {
      name: 'category',
      type: 'select',
      options: ['moisturizer', 'serum', 'cleanser', 'spf', 'treatment', 'other'],
    },
    { name: 'isAvailable', type: 'checkbox', defaultValue: true },
  ],
}
