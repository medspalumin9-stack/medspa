import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Users } from './collections/Users'
import { Clients } from './collections/Clients'
import { Services } from './collections/Services'
import { Products } from './collections/Products'
import { Staff } from './collections/Staff'
import { Appointments } from './collections/Appointments'
import { Profiles } from './collections/Profiles'
import { fileURLToPath } from 'url'
import path from 'path'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Lumin MedSpa Admin',
    },
  },
  collections: [Users, Clients, Services, Products, Staff, Appointments, Profiles],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  serverURL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
})
