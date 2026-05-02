import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendAppointmentReminder } from '@/lib/resend'
import { sendReminderSMS } from '@/lib/twilio'
import { addHours, subMinutes, addMinutes, parseISO, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayloadClient()
  const now = new Date()
  const WINDOW = 15 // ±15 minute window for matching

  // 24-hour reminders: appointments starting 24h from now (±15 min)
  const target24h = addHours(now, 24)
  const { docs: upcoming24 } = await payload.find({
    collection: 'appointments',
    where: {
      status: { in: ['scheduled', 'confirmed'] },
      reminderSent24h: { equals: false },
      startTime: {
        greater_than_equal: subMinutes(target24h, WINDOW).toISOString(),
        less_than_equal: addMinutes(target24h, WINDOW).toISOString(),
      },
    },
    limit: 50,
    depth: 1,
  })

  let processed24h = 0
  for (const appt of upcoming24) {
    const dateStr = format(parseISO(String(appt.startTime)), "MMMM d 'at' h:mm a")
    const serviceName =
      typeof appt.service === 'object' ? (appt.service as any).name : 'appointment'

    await Promise.allSettled([
      sendAppointmentReminder(
        appt.clientEmail as string,
        appt.clientName as string,
        serviceName,
        dateStr,
        false
      ),
      sendReminderSMS(
        appt.clientPhone as string,
        appt.clientName as string,
        serviceName,
        dateStr,
        false
      ),
      payload.update({
        collection: 'appointments',
        id: appt.id,
        data: { reminderSent24h: true },
      }),
    ])
    processed24h++
  }

  // 1-hour reminders: appointments starting 1h from now (±15 min)
  const target1h = addHours(now, 1)
  const { docs: upcoming1h } = await payload.find({
    collection: 'appointments',
    where: {
      status: { in: ['scheduled', 'confirmed'] },
      reminderSent1h: { equals: false },
      startTime: {
        greater_than_equal: subMinutes(target1h, WINDOW).toISOString(),
        less_than_equal: addMinutes(target1h, WINDOW).toISOString(),
      },
    },
    limit: 50,
    depth: 1,
  })

  let processed1h = 0
  for (const appt of upcoming1h) {
    const dateStr = format(parseISO(String(appt.startTime)), 'h:mm a')
    const serviceName =
      typeof appt.service === 'object' ? (appt.service as any).name : 'appointment'

    await Promise.allSettled([
      sendAppointmentReminder(
        appt.clientEmail as string,
        appt.clientName as string,
        serviceName,
        dateStr,
        true
      ),
      sendReminderSMS(
        appt.clientPhone as string,
        appt.clientName as string,
        serviceName,
        dateStr,
        true
      ),
      payload.update({
        collection: 'appointments',
        id: appt.id,
        data: { reminderSent1h: true },
      }),
    ])
    processed1h++
  }

  return NextResponse.json({
    ok: true,
    processed24h,
    processed1h,
    checkedAt: now.toISOString(),
  })
}
