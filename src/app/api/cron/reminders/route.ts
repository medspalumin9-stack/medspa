import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAppointmentReminder } from '@/lib/resend'
import { sendReminderSMS } from '@/lib/twilio'
import { addHours, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  // Hobby Vercel crons: at most once/day, so use wide windows instead of ±15min around T−24h / T−1h.
  const latest24h = addHours(now, 28)
  const earliest24h = addHours(now, 1)

  // ~“day before” reminders: appointment between 1h and ~28h from now, not yet sent
  const upcoming24 = await prisma.appointment.findMany({
    where: {
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      reminderSent24h: false,
      startTime: {
        gt: earliest24h,
        lte: latest24h,
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

  // Final reminders: starting soon (within ~3h), not yet sent
  const upcoming1h = await prisma.appointment.findMany({
    where: {
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      reminderSent1h: false,
      startTime: {
        gt: now,
        lte: addHours(now, 3),
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
