import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function normalizeEmail(raw: unknown) {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
}

export async function POST(req: NextRequest) {
  const { appointmentId, email, password } = await req.json()

  if (!appointmentId || !email || !password || String(password).length < 8) {
    return NextResponse.json(
      { error: 'Appointment, email, and password (min 8 characters) are required.' },
      { status: 400 }
    )
  }

  const norm = normalizeEmail(email)

  try {
    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } })
    if (!appt) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }
    if (normalizeEmail(appt.clientEmail) !== norm) {
      return NextResponse.json({ error: 'Email does not match this booking.' }, { status: 403 })
    }
    if (appt.userId) {
      return NextResponse.json({ error: 'This booking is already linked to an account.' }, { status: 400 })
    }

    const existing = await prisma.user.findFirst({
      where: { email: { equals: norm, mode: 'insensitive' } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Sign in to see your visits.' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(String(password), 12)

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: appt.clientEmail.trim(),
          fullName: appt.clientName,
          phone: appt.clientPhone || null,
          passwordHash,
          role: 'CLIENT',
        },
      })
      await tx.profile.create({ data: { userId: user.id } })
      await tx.appointment.updateMany({
        where: {
          userId: null,
          clientEmail: { equals: appt.clientEmail, mode: 'insensitive' },
        },
        data: { userId: user.id },
      })
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('complete-account', e)
    return NextResponse.json({ error: 'Could not create account.' }, { status: 500 })
  }
}
