import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function makePrisma() {
  const url = process.env.DATABASE_URI
  if (url && url.startsWith('postgres')) {
    const { Pool } = require('pg') as typeof import('pg')
    const pool = new Pool({ connectionString: url })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter } as any)
  }
  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? makePrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
