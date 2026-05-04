import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const serviceId = searchParams.get('serviceId')

  try {
    const staff = await prisma.staff.findMany({
      where: {
        isActive: true,
        ...(serviceId
          ? { staffServices: { some: { serviceId } } }
          : {}),
      },
      orderBy: { name: 'asc' },
    })

    // If no staff linked to this service, return all active staff
    const result = staff.length > 0
      ? staff
      : await prisma.staff.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })

    return NextResponse.json({ staff: result })
  } catch {
    return NextResponse.json({ staff: [] })
  }
}
