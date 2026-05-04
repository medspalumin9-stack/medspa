import { Resend } from 'resend'

function getApiKey(): string | undefined {
  const k = process.env.RESEND_API_KEY?.trim()
  return k || undefined
}

/**
 * Resend requires a verified domain for custom from-addresses.
 * Use RESEND_FROM_EMAIL="booking@yourdomain.com" or "Lumin MedSpa <booking@yourdomain.com>".
 * For sandbox testing only, you may use onboarding@resend.dev (delivery limited by Resend).
 */
function getFromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim()
  if (raw) {
    if (raw.includes('<') && raw.includes('>')) return raw
    return `Lumin MedSpa <${raw}>`
  }
  return 'Lumin MedSpa <onboarding@resend.dev>'
}

function getClient(): Resend | null {
  const key = getApiKey()
  if (!key) return null
  return new Resend(key)
}

const resendClient = getClient()

function requireClient(): Resend {
  if (!resendClient) {
    throw new Error('RESEND_API_KEY is not set. Add it to .env.local to send email.')
  }
  return resendClient
}

async function sendEmail(payload: Parameters<Resend['emails']['send']>[0]) {
  const resend = requireClient()
  const { data, error } = await resend.emails.send(payload)

  if (error) {
    const msg =
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
        ? (error as { message: string }).message
        : JSON.stringify(error)
    console.error('[resend] send failed:', msg)
    throw new Error(msg || 'Resend rejected the message (check domain verification and from address).')
  }

  return data
}

export async function sendBookingConfirmation(
  to: string,
  name: string,
  service: string,
  dateTime: string
) {
  await sendEmail({
    from: getFromAddress(),
    to: [to],
    subject: 'Your Lumin MedSpa Appointment is Confirmed ✦',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#4A4A4A;">
        <div style="background:#F9F7F5;padding:40px;border-radius:8px;">
          <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;">Glow Secured, ${escapeHtml(name)}.</h1>
          <p style="color:#888;margin-bottom:24px;">Your appointment has been confirmed.</p>
          <div style="background:#FFF;border:1px solid #E0DCD9;border-radius:8px;padding:24px;margin-bottom:24px;">
            <p><strong>Service:</strong> ${escapeHtml(service)}</p>
            <p><strong>Date &amp; Time:</strong> ${escapeHtml(dateTime)}</p>
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

  await sendEmail({
    from: getFromAddress(),
    to: [to],
    subject,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#4A4A4A;">
        <div style="background:#F9F7F5;padding:40px;border-radius:8px;">
          <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;">
            ${isOneHour ? `See you soon, ` : `Almost time, `}${escapeHtml(name)}!
          </h1>
          <p style="color:#888;margin-bottom:24px;">
            ${isOneHour ? 'Your glow up is in 1 hour.' : 'Your appointment is tomorrow.'}
          </p>
          <div style="background:#FFF;border:1px solid #E0DCD9;border-radius:8px;padding:24px;">
            <p><strong>Service:</strong> ${escapeHtml(service)}</p>
            <p><strong>Date &amp; Time:</strong> ${escapeHtml(dateTime)}</p>
          </div>
        </div>
      </div>
    `,
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
