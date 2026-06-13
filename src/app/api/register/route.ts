import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password, fullName, phone } = await req.json()

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      phone: phone || null,
      passwordHash,
      role: 'CLIENT',
      canAccessAdminPortal: false,
      canAccessClientPortal: true,
    },
  })

  await prisma.profile.create({ data: { userId: user.id } })

  return NextResponse.json({ success: true })
}
