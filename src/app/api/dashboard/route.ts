import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayloadClient()

    const { docs: appointments } = await payload.find({
      collection: 'appointments',
      where: { clientEmail: { equals: session.user.email } },
      sort: '-startTime',
      limit: 20,
      depth: 2,
    })

    const { docs: clients } = await payload.find({
      collection: 'clients',
      where: { email: { equals: session.user.email } },
      limit: 1,
    })

    let profile = null
    if (clients[0]) {
      const { docs: profiles } = await payload.find({
        collection: 'profiles',
        where: { client: { equals: clients[0].id } },
        limit: 1,
        depth: 2,
      })
      profile = profiles[0] || null
    }

    return NextResponse.json({ appointments, profile })
  } catch {
    return NextResponse.json({ appointments: [], profile: null })
  }
}
