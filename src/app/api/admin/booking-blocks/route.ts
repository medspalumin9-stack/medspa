import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-guard'

export async function GET() {
  const session = await requireAdminApi('bookings')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocks = await prisma.bookingBlock.findMany({
    orderBy: { startAt: 'asc' },
    take: 200,
  })
  return NextResponse.json({ blocks })
}

export async function POST(req: NextRequest) {
  const session = await requireAdminApi('bookings')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const startAt = body.startAt ? new Date(body.startAt) : null
  const endAt = body.endAt ? new Date(body.endAt) : null
  const note = typeof body.note === 'string' ? body.note.trim() || null : null

  if (!startAt || !endAt || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return NextResponse.json({ error: 'startAt and endAt are required (ISO date strings)' }, { status: 400 })
  }
  if (startAt >= endAt) {
    return NextResponse.json({ error: 'End must be after start' }, { status: 400 })
  }

  const block = await prisma.bookingBlock.create({
    data: { startAt, endAt, note },
  })
  return NextResponse.json({ block })
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdminApi('bookings')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    await prisma.bookingBlock.delete({ where: { id } })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
