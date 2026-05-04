import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-guard'

export async function GET() {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, price, imageUrl, category, isAvailable } = await req.json()
  if (!name || description === undefined || description === null || price === undefined || price === null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: Number(price),
      imageUrl: imageUrl && String(imageUrl).trim() ? String(imageUrl).trim() : '',
      category: category || null,
      isAvailable: isAvailable !== false,
    },
  })
  return NextResponse.json({ product })
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, name, description, price, imageUrl, category, isAvailable } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price: Number(price),
      imageUrl: imageUrl && String(imageUrl).trim() ? String(imageUrl).trim() : '',
      category: category || null,
      isAvailable: !!isAvailable,
    },
  })
  return NextResponse.json({ product })
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
