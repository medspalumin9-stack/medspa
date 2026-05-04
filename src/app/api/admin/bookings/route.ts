import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi, requireAdminApiBookingsOrClientsRead } from '@/lib/admin-guard'

export async function GET() {
  const session = await requireAdminApiBookingsOrClientsRead()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const appointments = await prisma.appointment.findMany({
    orderBy: { startTime: 'desc' },
    include: { service: true, staff: true },
    take: 100,
  })
  return NextResponse.json({ appointments })
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminApi('bookings')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, staffId, startTime, notes } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(staffId && { staffId }),
      ...(startTime && { startTime: new Date(startTime) }),
      ...(notes !== undefined && { notes }),
    },
    include: { service: true, staff: true },
  })
  return NextResponse.json({ appointment })
}
