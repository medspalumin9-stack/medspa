import type { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    useAsTitle: 'email',
    description: 'Customer accounts (authenticated via NextAuth)',
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'fullName', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'passwordHash', type: 'text', admin: { hidden: true } },
  ],
}
