import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminApi } from '@/lib/admin-guard'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminApi()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const {
    practitionerComments,
    skinGoals,
    cosmeticNotes,
    technicianRecommendations,
    glowRoadmap,
    recommendedProductIds,
  } = await req.json()

  const profile = await prisma.profile.upsert({
    where: { userId: id },
    create: {
      userId: id,
      practitionerComments: practitionerComments || null,
      skinGoals: skinGoals || null,
      cosmeticNotes: cosmeticNotes || null,
      technicianRecommendations: technicianRecommendations || null,
      glowRoadmap: glowRoadmap || null,
    },
    update: {
      practitionerComments: practitionerComments || null,
      skinGoals: skinGoals || null,
      cosmeticNotes: cosmeticNotes || null,
      technicianRecommendations: technicianRecommendations || null,
      glowRoadmap: glowRoadmap || null,
    },
  })

  if (recommendedProductIds !== undefined) {
    await prisma.profileProduct.deleteMany({ where: { profileId: profile.id } })
    if (recommendedProductIds.length > 0) {
      await prisma.profileProduct.createMany({
        data: recommendedProductIds.map((productId: string) => ({ profileId: profile.id, productId })),
      })
    }
  }

  return NextResponse.json({ success: true })
}
