import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@luminmedspa.com'

export async function sendBookingConfirmation(
  to: string,
  name: string,
  service: string,
  dateTime: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Lumin MedSpa Appointment is Confirmed ✦',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#4A4A4A;">
        <div style="background:#F9F7F5;padding:40px;border-radius:8px;">
          <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;">Glow Secured, ${name}.</h1>
          <p style="color:#888;margin-bottom:24px;">Your appointment has been confirmed.</p>
          <div style="background:#FFF;border:1px solid #E0DCD9;border-radius:8px;padding:24px;margin-bottom:24px;">
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Date &amp; Time:</strong> ${dateTime}</p>
          </div>
          <p style="color:#888;font-size:14px;">Need to reschedule? Reply to this email or contact us.</p>
        </div>
      </div>
    `,
  })
}

export async function sendAppointmentReminder(
  to: string,
  name: string,
  service: string,
  dateTime: string,
  isOneHour = false
) {
  const subject = isOneHour
    ? 'Get Ready for Your Glow Up — 1 Hour Away ✦'
    : 'Your Lumin Appointment is Tomorrow ✦'

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#4A4A4A;">
        <div style="background:#F9F7F5;padding:40px;border-radius:8px;">
          <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;">
            ${isOneHour ? `See you soon, ` : `Almost time, `}${name}!
          </h1>
          <p style="color:#888;margin-bottom:24px;">
            ${isOneHour ? 'Your glow up is in 1 hour.' : 'Your appointment is tomorrow.'}
          </p>
          <div style="background:#FFF;border:1px solid #E0DCD9;border-radius:8px;padding:24px;">
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Date &amp; Time:</strong> ${dateTime}</p>
          </div>
        </div>
      </div>
    `,
  })
}
