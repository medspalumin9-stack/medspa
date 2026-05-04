import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAppointmentReminder } from '@/lib/resend'
import { sendReminderSMS } from '@/lib/twilio'
import { addHours, subMinutes, addMinutes, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const WINDOW = 15

  // 24-hour reminders
  const target24h = addHours(now, 24)
  const upcoming24 = await prisma.appointment.findMany({
    where: {
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      reminderSent24h: false,
      startTime: {
        gte: subMinutes(target24h, WINDOW),
        lte: addMinutes(target24h, WINDOW),
      },
    },
    include: { service: true },
  })

  let processed24h = 0
  for (const appt of upcoming24) {
    const dateStr = format(appt.startTime, "MMMM d 'at' h:mm a")
    const channel = appt.reminderChannel ?? 'EMAIL'
    const tasks: Promise<unknown>[] = []
    if (channel === 'EMAIL') {
      tasks.push(sendAppointmentReminder(appt.clientEmail, appt.clientName, appt.service.name, dateStr, false))
    } else {
      tasks.push(sendReminderSMS(appt.clientPhone, appt.clientName, appt.service.name, dateStr, false))
    }
    tasks.push(
      prisma.appointment.update({ where: { id: appt.id }, data: { reminderSent24h: true } })
    )
    await Promise.allSettled(tasks)
    processed24h++
  }

  // 1-hour reminders
  const target1h = addHours(now, 1)
  const upcoming1h = await prisma.appointment.findMany({
    where: {
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      reminderSent1h: false,
      startTime: {
        gte: subMinutes(target1h, WINDOW),
        lte: addMinutes(target1h, WINDOW),
      },
    },
    include: { service: true },
  })

  let processed1h = 0
  for (const appt of upcoming1h) {
    const dateStr = format(appt.startTime, 'h:mm a')
    const channel = appt.reminderChannel ?? 'EMAIL'
    const tasks: Promise<unknown>[] = []
    if (channel === 'EMAIL') {
      tasks.push(sendAppointmentReminder(appt.clientEmail, appt.clientName, appt.service.name, dateStr, true))
    } else {
      tasks.push(sendReminderSMS(appt.clientPhone, appt.clientName, appt.service.name, dateStr, true))
    }
    tasks.push(prisma.appointment.update({ where: { id: appt.id }, data: { reminderSent1h: true } }))
    await Promise.allSettled(tasks)
    processed1h++
  }

  return NextResponse.json({ ok: true, processed24h, processed1h, checkedAt: now.toISOString() })
}
