/**
 * Ensures an ADMIN user exists and matches ADMIN_EMAIL / ADMIN_PASSWORD from .env.local.
 * Safe to run anytime — does not delete other data (unlike seed.ts).
 *
 * Usage: npm run sync-admin
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URI })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

function isMissingDbSchemaError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === 'P2021'
  )
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@luminmedspa.com').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'lumin-admin-2024'

  if (!process.env.DATABASE_URI) {
    console.error('DATABASE_URI is missing. Set it in .env.local')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    })

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          email,
          passwordHash,
          role: 'ADMIN',
          fullName: existing.fullName || 'Lumin Admin',
        },
      })
      console.log(`Updated admin user: ${email}`)
    } else {
      await prisma.user.create({
        data: {
          email,
          fullName: 'Lumin Admin',
          passwordHash,
          role: 'ADMIN',
        },
      })
      console.log(`Created admin user: ${email}`)
    }

    console.log('You can sign in at /auth/signin with this email and password.')
  } catch (e) {
    if (isMissingDbSchemaError(e)) {
      console.error(
        '\nDatabase tables are missing. Apply the Prisma schema first, then run this script again:\n' +
          '  npx prisma db push\n' +
          '  (or: npx prisma migrate deploy)\n' +
          'Then: npm run sync-admin   or   npm run seed\n'
      )
      process.exit(1)
    }
    throw e
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
