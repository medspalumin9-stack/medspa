import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAdminApi } from '@/lib/admin-guard'

function normalizeEmail(raw: unknown) {
  return String(raw ?? '').trim().toLowerCase()
}

export async function GET() {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      canAccessAdminPortal: true,
      canAccessClientPortal: true,
      createdAt: true,
    },
  })
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const email = normalizeEmail(body.email)
  const password = String(body.password ?? '')
  const fullName = String(body.fullName ?? '').trim()
  const phone = body.phone ? String(body.phone).trim() : null
  const canAccessAdminPortal = Boolean(body.canAccessAdminPortal)
  const canAccessClientPortal = Boolean(body.canAccessClientPortal)

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Email and password (min 8 characters) are required.' }, { status: 400 })
  }
  if (!fullName) {
    return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })
  }
  if (!canAccessAdminPortal && !canAccessClientPortal) {
    return NextResponse.json({ error: 'Select at least one portal.' }, { status: 400 })
  }

  const exists = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
  if (exists) return NextResponse.json({ error: 'Email already in use.' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const role = canAccessAdminPortal ? 'ADMIN' : 'CLIENT'

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      phone,
      role,
      passwordHash,
      canAccessAdminPortal,
      canAccessClientPortal,
    },
  })

  if (canAccessClientPortal) {
    await prisma.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    })
  }

  return NextResponse.json({ user: { id: user.id, email: user.email } })
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const id = String(body.id ?? '')
  if (!id) return NextResponse.json({ error: 'User id required.' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

  const canAccessAdminPortal = Boolean(body.canAccessAdminPortal)
  const canAccessClientPortal = Boolean(body.canAccessClientPortal)
  if (!canAccessAdminPortal && !canAccessClientPortal) {
    return NextResponse.json({ error: 'Select at least one portal.' }, { status: 400 })
  }

  const email = body.email !== undefined ? normalizeEmail(body.email) : existing.email
  if (email !== existing.email) {
    const taken = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, NOT: { id } },
    })
    if (taken) return NextResponse.json({ error: 'Email already in use.' }, { status: 409 })
  }

  const password = body.password !== undefined && String(body.password).length > 0 ? String(body.password) : null
  if (password && password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const fullName = body.fullName !== undefined ? String(body.fullName).trim() : existing.fullName
  const phone = body.phone !== undefined ? (body.phone ? String(body.phone).trim() : null) : existing.phone

  const role = canAccessAdminPortal ? 'ADMIN' : 'CLIENT'
  const passwordHash = password ? await bcrypt.hash(password, 12) : undefined

  const selfId = (session.user as { id?: string }).id
  if (id === selfId && !canAccessAdminPortal) {
    return NextResponse.json({ error: 'You cannot remove your own admin portal access.' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id },
    data: {
      email,
      fullName,
      phone,
      canAccessAdminPortal,
      canAccessClientPortal,
      role,
      ...(passwordHash ? { passwordHash } : {}),
    },
  })

  if (canAccessClientPortal) {
    await prisma.profile.upsert({
      where: { userId: id },
      create: { userId: id },
      update: {},
    })
  }

  return NextResponse.json({ ok: true })
}
