import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-guard'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi('clients')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const client = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      createdAt: true,
      appointments: {
        orderBy: { startTime: 'desc' },
        select: {
          id: true,
          startTime: true,
          status: true,
          service: { select: { name: true } },
          staff: { select: { name: true } },
        },
      },
      profile: {
        select: {
          practitionerComments: true,
          skinGoals: true,
          cosmeticNotes: true,
          technicianRecommendations: true,
          glowRoadmap: true,
          recommendedProducts: {
            select: {
              product: { select: { id: true, name: true, price: true, category: true } },
            },
          },
        },
      },
    },
  })

  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ client })
}
