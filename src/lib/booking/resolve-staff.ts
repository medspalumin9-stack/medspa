import { prisma } from '@/lib/prisma'

/** First active staff qualified for the service, or any active staff. */
export async function getStaffIdForService(serviceId: string): Promise<string | null> {
  const qualified = await prisma.staff.findFirst({
    where: {
      isActive: true,
      staffServices: { some: { serviceId } },
    },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })
  if (qualified) return qualified.id

  const fallback = await prisma.staff.findFirst({
    where: { isActive: true },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })
  return fallback?.id ?? null
}

/** All active staff IDs who can perform the service (for slot merging). */
export async function getStaffIdsForService(serviceId: string): Promise<string[]> {
  const qualified = await prisma.staff.findMany({
    where: {
      isActive: true,
      staffServices: { some: { serviceId } },
    },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })
  if (qualified.length > 0) return qualified.map((s) => s.id)

  const any = await prisma.staff.findMany({
    where: { isActive: true },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })
  return any.map((s) => s.id)
}
