import type { Appointment } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStaffIdsForService } from '@/lib/booking/resolve-staff'
import {
  addMinutes,
  parseISO,
  setHours,
  setMinutes,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
} from 'date-fns'

const BUSINESS_START = 9
const BUSINESS_END = 18
const SLOT_INTERVAL = 30

function slotsForStaff(staffId: string, date: Date, existing: Appointment[]): string[] {
  const dayStart = setMinutes(setHours(date, BUSINESS_START), 0)
  const dayEnd = setMinutes(setHours(date, BUSINESS_END), 0)

  const slots: string[] = []
  let cursor = dayStart

  while (isBefore(cursor, dayEnd)) {
    const slotEnd = addMinutes(cursor, SLOT_INTERVAL)
    const busy = existing.some(
      (a) => isBefore(cursor, a.endTime) && isAfter(slotEnd, a.startTime)
    )
    if (!busy) slots.push(cursor.toISOString())
    cursor = slotEnd
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

    if (serviceId) {
      const staffIds = await getStaffIdsForService(serviceId)
      if (staffIds.length === 0) {
        return NextResponse.json({ slots: [] as { startTime: string; staffId: string }[] })
      }

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
        for (const t of slotsForStaff(sid, date, existing)) {
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

    const timeStrings = slotsForStaff(staffIdParam, date, existing)
    const slots = timeStrings.map((startTime) => ({
      startTime,
      staffId: staffIdParam,
    }))

    return NextResponse.json({ slots })
  } catch {
    return NextResponse.json({ slots: [] })
  }
}
