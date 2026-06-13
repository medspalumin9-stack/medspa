import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-guard'

export async function GET() {
  const session = await requireAdminApi('services')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const services = await prisma.service.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json({ services })
}

export async function POST(req: NextRequest) {
  const session = await requireAdminApi('services')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, durationMinutes, price, imageUrl, benefits, isActive } = await req.json()
  if (!name || !description || !durationMinutes || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = await prisma.service.create({
    data: {
      name,
      description,
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      imageUrl: imageUrl || null,
      benefits: benefits || [],
      isActive: isActive !== false,
    },
  })
  return NextResponse.json({ service })
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminApi('services')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, name, description, durationMinutes, price, imageUrl, benefits, isActive } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const service = await prisma.service.update({
    where: { id },
    data: {
      name,
      description,
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      imageUrl: imageUrl || null,
      benefits: benefits || [],
      isActive: !!isActive,
    },
  })
  return NextResponse.json({ service })
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdminApi('services')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const hard = searchParams.get('hard') === '1'
  if (hard) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.staffService.deleteMany({ where: { serviceId: id } })
        await tx.service.delete({ where: { id } })
      })
      return NextResponse.json({ success: true, mode: 'deleted' })
    } catch {
      return NextResponse.json(
        {
          error:
            'Cannot delete: this service still has appointments. Cancel or complete those first, or deactivate the service instead.',
        },
        { status: 409 }
      )
    }
  }

  await prisma.service.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true, mode: 'deactivated' })
}
