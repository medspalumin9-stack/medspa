import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addMinutes, format } from 'date-fns'
import { sendBookingConfirmation } from '@/lib/resend'
import { sendBookingConfirmationSMS } from '@/lib/twilio'
import { getStaffIdForService } from '@/lib/booking/resolve-staff'
import { ReminderChannel } from '@prisma/client'

function prismaErrCode(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const c = (err as { code: unknown }).code
    return typeof c === 'string' ? c : undefined
  }
  return undefined
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  let { serviceId, staffId, startTime, clientName, clientEmail, clientPhone } = body
  const rawChannel = body.reminderChannel
  const reminderChannel: ReminderChannel =
    rawChannel === 'SMS' ? ReminderChannel.SMS : ReminderChannel.EMAIL

  if (!serviceId || !startTime || !clientName || !clientEmail || !clientPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    if (!staffId) {
      const resolved = await getStaffIdForService(serviceId)
      if (!resolved) {
        return NextResponse.json({ error: 'No specialist available for this service' }, { status: 400 })
      }
      staffId = resolved
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const start = new Date(startTime)
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: 'Invalid appointment time' }, { status: 400 })
    }

    const end = addMinutes(start, service.durationMinutes)

    let appointment: { id: string }
    try {
      appointment = await prisma.appointment.create({
        data: {
          clientName,
          clientEmail,
          clientPhone,
          serviceId,
          staffId,
          startTime: start,
          endTime: end,
          status: 'SCHEDULED',
          reminderChannel,
        },
      })
    } catch (innerErr) {
      // reminderChannel column may not exist yet if db push hasn't run — retry without it
      const code = prismaErrCode(innerErr)
      if (code === 'P2022' || code === 'P2021') {
        appointment = await (prisma.appointment.create as (args: unknown) => Promise<{ id: string }>)({
          data: {
            clientName,
            clientEmail,
            clientPhone,
            serviceId,
            staffId,
            startTime: start,
            endTime: end,
            status: 'SCHEDULED',
          },
        })
      } else {
        throw innerErr
      }
    }

    const formattedDate = format(start, "MMMM d, yyyy 'at' h:mm a")

    let confirmationEmailSent = false
    let confirmationEmailError: string | undefined
    try {
      await sendBookingConfirmation(clientEmail, clientName, service.name, formattedDate)
      confirmationEmailSent = true
    } catch (emailErr) {
      console.error('Booking confirmation email failed:', emailErr)
      confirmationEmailError =
        emailErr instanceof Error ? emailErr.message : 'Confirmation email could not be sent.'
    }

    Promise.all([
      sendBookingConfirmationSMS(clientPhone, clientName, service.name, formattedDate),
      prisma.appointment.update({
        where: { id: appointment.id },
        data: { confirmationSent: confirmationEmailSent },
      }),
    ]).catch(console.error)

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      reminderChannel,
      confirmationEmailSent,
      confirmationEmailError,
    })
  } catch (err) {
    console.error('Booking error:', err)
    const code = prismaErrCode(err)
    if (code === 'P2022' || code === 'P2021') {
      return NextResponse.json(
        {
          error:
            'Database is missing new columns or tables. In the project folder run: npx prisma db push — then try again.',
          code,
        },
        { status: 503 }
      )
    }
    if (code === 'P2003') {
      return NextResponse.json(
        {
          error:
            'That time or specialist is no longer valid. Pick another slot or refresh the page.',
          code,
        },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
