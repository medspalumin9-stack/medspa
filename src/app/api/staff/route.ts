import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const serviceId = searchParams.get('serviceId')

  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'staff',
      where: { isActive: { equals: true } },
      limit: 50,
    })

    const filtered = serviceId
      ? docs.filter((s) =>
          Array.isArray(s.services) &&
          s.services.some(
            (sv: any) => (typeof sv === 'string' ? sv : sv.id) === serviceId
          )
        )
      : docs

    // If no staff linked to this service, return all active staff
    const result = filtered.length > 0 ? filtered : docs

    return NextResponse.json({
      staff: result.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        bio: s.bio,
        avatarUrl: s.avatarUrl,
      })),
    })
  } catch {
    return NextResponse.json({ staff: [] })
  }
}
