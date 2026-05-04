import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: session.user.email, mode: 'insensitive' } },
      include: {
        profile: {
          include: {
            recommendedProducts: { include: { product: true } },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ appointments: [], profile: null })
    }

    const rows = await prisma.appointment.findMany({
      where: {
        OR: [
          { userId: user.id },
          { clientEmail: { equals: user.email, mode: 'insensitive' } },
        ],
      },
      include: { service: true, staff: true },
      orderBy: { startTime: 'asc' },
      take: 40,
    })
    const byId = new Map(rows.map((a) => [a.id, a]))
    const appointments = Array.from(byId.values()).sort(
      (a, b) => +new Date(a.startTime) - +new Date(b.startTime)
    )

    return NextResponse.json({
      appointments,
      profile: user.profile ?? null,
    })
  } catch {
    return NextResponse.json({ appointments: [], profile: null })
  }
}
