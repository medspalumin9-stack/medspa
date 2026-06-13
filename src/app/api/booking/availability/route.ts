import type { Appointment } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStaffIdsForService } from '@/lib/booking/resolve-staff'
import {
  addMinutes,
  parseISO,
  setHours,
  setMinutes,
  isAfter,
  startOfDay,
  endOfDay,
} from 'date-fns'

const BUSINESS_START = 9
const BUSINESS_END = 18
/** Start times are on a 1-hour grid (e.g. 9:00, 10:00, …). */
const SLOT_STEP_MINUTES = 60

function intervalsOverlap(s1: Date, e1: Date, s2: Date, e2: Date): boolean {
  return s1 < e2 && e1 > s2
}

function slotsForDay(
  date: Date,
  appointments: Appointment[],
  blocks: { startAt: Date; endAt: Date }[],
  serviceDurationMin: number,
): string[] {
  const dayStart = setMinutes(setHours(date, BUSINESS_START), 0)
  const dayEnd = setMinutes(setHours(date, BUSINESS_END), 0)

  const busy = [
    ...appointments.map((a) => ({ s: a.startTime, e: a.endTime })),
    ...blocks.map((b) => ({ s: b.startAt, e: b.endAt })),
  ]

  const slots: string[] = []
  let cursor = dayStart

  while (!isAfter(addMinutes(cursor, serviceDurationMin), dayEnd)) {
    const slotEnd = addMinutes(cursor, serviceDurationMin)
    const taken = busy.some(({ s, e }) => intervalsOverlap(cursor, slotEnd, s, e))
    if (!taken) slots.push(cursor.toISOString())
    cursor = addMinutes(cursor, SLOT_STEP_MINUTES)
  }
  return slots
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const serviceId = searchParams.get('serviceId')
  const staffIdParam = searchParams.get('staffId')
  const dateStr = searchParams.get('date')

  if (!dateStr) {
    return NextResponse.json({ error: 'date required' }, { status: 400 })
  }

  try {
    const date = parseISO(dateStr)

    const blockRows = await prisma.bookingBlock.findMany({
      where: {
        startAt: { lt: endOfDay(date) },
        endAt: { gt: startOfDay(date) },
      },
    })
    const blocks = blockRows.map((b) => ({ startAt: b.startAt, endAt: b.endAt }))

    if (serviceId) {
      const staffIds = await getStaffIdsForService(serviceId)
      if (staffIds.length === 0) {
        return NextResponse.json({ slots: [] as { startTime: string; staffId: string }[] })
      }

      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { durationMinutes: true },
      })
      const durationMin = service?.durationMinutes ?? 60

      const allAppts = await prisma.appointment.findMany({
        where: {
          staffId: { in: staffIds },
          status: { notIn: ['CANCELLED'] },
          startTime: { gte: startOfDay(date), lte: endOfDay(date) },
        },
      })

      const byStaff = new Map<string, Appointment[]>()
      for (const a of allAppts) {
        const arr = byStaff.get(a.staffId) ?? []
        arr.push(a)
        byStaff.set(a.staffId, arr)
      }

      const merged = new Map<string, string>()
      for (const sid of staffIds) {
        const existing = byStaff.get(sid) ?? []
        for (const t of slotsForDay(date, existing, blocks, durationMin)) {
          if (!merged.has(t)) merged.set(t, sid)
        }
      }

      const slots = [...merged.entries()]
        .map(([startTime, staffId]) => ({ startTime, staffId }))
        .sort((a, b) => a.startTime.localeCompare(b.startTime))

      return NextResponse.json({ slots })
    }

    if (!staffIdParam) {
      return NextResponse.json({ error: 'serviceId or staffId required' }, { status: 400 })
    }

    const existing = await prisma.appointment.findMany({
      where: {
        staffId: staffIdParam,
        status: { notIn: ['CANCELLED'] },
        startTime: { gte: startOfDay(date), lte: endOfDay(date) },
      },
    })

    const timeStrings = slotsForDay(date, existing, blocks, 60)
    const slots = timeStrings.map((startTime) => ({
      startTime,
      staffId: staffIdParam,
    }))

    return NextResponse.json({ slots })
  } catch {
    return NextResponse.json({ slots: [] })
  }
}
