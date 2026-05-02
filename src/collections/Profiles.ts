import type { CollectionConfig } from 'payload'

export const Profiles: CollectionConfig = {
  slug: 'profiles',
  admin: {
    useAsTitle: 'id',
    description: "Personalized glow-up journey per client",
  },
  fields: [
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
      unique: true,
    },
    {
      name: 'cosmeticNotes',
      type: 'richText',
      label: 'Cosmetic Recommendations (Admin Only)',
    },
    {
      name: 'practitionerComments',
      type: 'textarea',
      label: 'Skin Progression Notes',
    },
    {
      name: 'skinGoals',
      type: 'textarea',
      label: 'Skin Goals',
    },
    {
      name: 'recommendedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: 'Recommended Products',
    },
  ],
}
