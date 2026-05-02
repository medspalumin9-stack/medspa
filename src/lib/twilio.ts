import twilio from 'twilio'

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token || !sid.startsWith('AC')) {
    throw new Error('Twilio credentials not configured')
  }
  return twilio(sid, token)
}

async function sendSMS(to: string, body: string) {
  const client = getClient()
  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  })
}

export async function sendBookingConfirmationSMS(
  to: string,
  name: string,
  service: string,
  dateTime: string
) {
  await sendSMS(
    to,
    `Lumin MedSpa ✦ Hi ${name}, your ${service} appointment on ${dateTime} is confirmed. See you soon!`
  )
}

export async function sendReminderSMS(
  to: string,
  name: string,
  service: string,
  dateTime: string,
  isOneHour = false
) {
  const msg = isOneHour
    ? `Lumin MedSpa ✦ Get ready, ${name}! Your ${service} is in 1 hour at ${dateTime}.`
    : `Lumin MedSpa ✦ Reminder: Your ${service} is tomorrow at ${dateTime}. See you then!`
  await sendSMS(to, msg)
}
