import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const staffId = searchParams.get('staffId')
  const dateStr = searchParams.get('date')

  if (!staffId || !dateStr) {
    return NextResponse.json(
      { error: 'staffId and date required' },
      { status: 400 }
    )
  }

  try {
    const date = parseISO(dateStr)
    const dayStart = setMinutes(setHours(date, BUSINESS_START), 0)
    const dayEnd = setMinutes(setHours(date, BUSINESS_END), 0)

    const payload = await getPayloadClient()
    const { docs: existing } = await payload.find({
      collection: 'appointments',
      where: {
        staff: { equals: staffId },
        status: { not_in: ['cancelled'] },
        startTime: {
          greater_than_equal: startOfDay(date).toISOString(),
          less_than_equal: endOfDay(date).toISOString(),
        },
      },
      limit: 100,
    })

    const slots: string[] = []
    let cursor = dayStart

    while (isBefore(cursor, dayEnd)) {
      const slotEnd = addMinutes(cursor, SLOT_INTERVAL)
      const busy = existing.some((appt) => {
        const s = parseISO(String(appt.startTime))
        const e = parseISO(String(appt.endTime))
        return isBefore(cursor, e) && isAfter(slotEnd, s)
      })
      if (!busy) slots.push(cursor.toISOString())
      cursor = slotEnd
    }

    return NextResponse.json({ slots })
  } catch {
    return NextResponse.json({ slots: [] })
  }
}
