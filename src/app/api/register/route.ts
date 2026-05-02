import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password, fullName, phone } = await req.json()

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  const existing = await payload.find({
    collection: 'clients',
    where: { email: { equals: email } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const client = await payload.create({
    collection: 'clients',
    data: { email, fullName, phone: phone || '', passwordHash },
  })

  await payload.create({
    collection: 'profiles',
    data: { client: client.id },
  })

  return NextResponse.json({ success: true })
}
