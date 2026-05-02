import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'services',
      where: { isActive: { equals: true } },
      limit: 50,
    })
    return NextResponse.json({
      services: docs.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        durationMinutes: s.durationMinutes,
        description:
          typeof s.description === 'string'
            ? s.description
            : Array.isArray((s.description as any)?.root?.children)
            ? (s.description as any).root.children
                .map((b: any) =>
                  b.children?.map((c: any) => c.text || '').join('') || ''
                )
                .join(' ')
            : '',
      })),
    })
  } catch {
    return NextResponse.json({ services: [] })
  }
}
