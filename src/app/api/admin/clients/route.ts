import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-guard'

export async function GET() {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT', canAccessClientPortal: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { appointments: true } },
    },
  })

  return NextResponse.json({ clients })
}
