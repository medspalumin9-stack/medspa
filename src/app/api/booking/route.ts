import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { addMinutes, format } from 'date-fns'
import { sendBookingConfirmation } from '@/lib/resend'
import { sendBookingConfirmationSMS } from '@/lib/twilio'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { serviceId, staffId, startTime, clientName, clientEmail, clientPhone } =
    body

  if (!serviceId || !staffId || !startTime || !clientName || !clientEmail || !clientPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const payload = await getPayloadClient()

    const service = await payload.findByID({
      collection: 'services',
      id: serviceId,
    })
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const endTime = addMinutes(
      new Date(startTime),
      service.durationMinutes as number
    )

    const appointment = await payload.create({
      collection: 'appointments',
      data: {
        clientName,
        clientEmail,
        clientPhone,
        service: serviceId,
        staff: staffId,
        startTime,
        endTime: endTime.toISOString(),
        status: 'scheduled',
        confirmationSent: false,
        reminderSent24h: false,
        reminderSent1h: false,
      },
    })

    const formattedDate = format(
      new Date(startTime),
      "MMMM d, yyyy 'at' h:mm a"
    )

    // Fire notifications non-blocking
    Promise.all([
      sendBookingConfirmation(
        clientEmail,
        clientName,
        service.name as string,
        formattedDate
      ),
      sendBookingConfirmationSMS(
        clientPhone,
        clientName,
        service.name as string,
        formattedDate
      ),
      payload.update({
        collection: 'appointments',
        id: appointment.id,
        data: { confirmationSent: true },
      }),
    ]).catch(console.error)

    return NextResponse.json({ success: true, appointmentId: appointment.id })
  } catch (err) {
    console.error('Booking error:', err)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
