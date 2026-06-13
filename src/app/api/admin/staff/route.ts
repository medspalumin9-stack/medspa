import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-guard'

export async function GET() {
  const session = await requireAdminApi('staff')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const staff = await prisma.staff.findMany({
    orderBy: { name: 'asc' },
    include: { staffServices: { include: { service: true } } },
  })
  return NextResponse.json({ staff })
}

export async function POST(req: NextRequest) {
  const session = await requireAdminApi('staff')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, role, bio, avatarUrl, serviceIds, isActive } = await req.json()
  if (!name || !role) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  const staff = await prisma.staff.create({
    data: {
      name, role, bio: bio || null, avatarUrl: avatarUrl || null, isActive: isActive !== false,
      staffServices: serviceIds?.length
        ? { create: serviceIds.map((serviceId: string) => ({ serviceId })) }
        : undefined,
    },
  })
  return NextResponse.json({ staff })
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminApi('staff')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, name, role, bio, avatarUrl, serviceIds, isActive } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.staffService.deleteMany({ where: { staffId: id } })

  const staff = await prisma.staff.update({
    where: { id },
    data: {
      name, role, bio: bio || null, avatarUrl: avatarUrl || null, isActive: !!isActive,
      staffServices: serviceIds?.length
        ? { create: serviceIds.map((serviceId: string) => ({ serviceId })) }
        : undefined,
    },
  })
  return NextResponse.json({ staff })
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdminApi('staff')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.staff.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
