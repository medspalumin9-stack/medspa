'use client'
import { getSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Input } from '@/components/ui/Input'
import { safeInternalPath } from '@/lib/safe-redirect'

const STORAGE_KEY = 'lumin_booking_setup'

export default function CompleteRegistrationPage() {
  const router = useRouter()
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [returnTo, setReturnTo] = useState<string | undefined>(undefined)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setError('missing')
        setHydrated(true)
        return
      }
      const parsed = JSON.parse(raw) as { appointmentId?: string; email?: string; returnTo?: string | null }
      if (!parsed.appointmentId || !parsed.email) {
        setError('missing')
        setHydrated(true)
        return
      }
      setAppointmentId(parsed.appointmentId)
      setEmail(parsed.email)
      if (parsed.returnTo) {
        const next = safeInternalPath(parsed.returnTo)
        if (next) setReturnTo(next)
      }
    } catch {
      setError('missing')
    }
    setHydrated(true)
  }, [])

  const inputClassName =
    'rounded-full border-[#1e211e]/15 bg-[#faf9f7] py-3.5 px-5 text-[#1e211e] focus:border-[#1e211e]/35'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!appointmentId || !email) {
      setError('Session expired. Book again or sign in if you already have an account.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/booking/complete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, email, password }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error || 'Could not create your account.')
        setLoading(false)
        return
      }

      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }

      const signRes = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })
      if (signRes?.error) {
        setError('Account created. Sign in with your new password.')
        setLoading(false)
        router.push('/auth/signin')
        return
      }

      const session = await getSession()
      const role = (session?.user as { role?: string } | undefined)?.role
      const clientDest = returnTo ?? '/dashboard'
      router.push(role === 'ADMIN' ? '/admin' : clientDest)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!hydrated) {
    return (
      <div className="blissoria-inner-page min-h-screen flex items-center justify-center px-6 py-24">
        <p className="text-[#1e211e]/60">Loading…</p>
      </div>
    )
  }

  if (error === 'missing') {
    return (
      <div className="blissoria-inner-page min-h-screen">
        <div className="bliss-container max-w-6xl">
          <div className="bliss-auth-panel mx-auto max-w-lg py-20">
            <p className="bliss-auth-eyebrow">Account setup</p>
            <h1 className="bliss-auth-heading">Nothing to finish here</h1>
            <p className="bliss-auth-sub">
              Complete a booking and choose &quot;Create an account&quot; to return to this step, or sign in if you
              already registered.
            </p>
            <div className="bliss-auth-card mt-8 flex flex-col gap-3">
              <Link href="/booking" className="bliss-auth-submit text-center font-sans no-underline">
                Book a visit
              </Link>
              <Link
                href="/auth/signin"
                className="rounded-full border border-[#1e211e]/15 py-3.5 text-center text-sm font-semibold text-[#1e211e] no-underline hover:bg-[#faf9f7]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blissoria-inner-page min-h-screen">
      <div className="bliss-container max-w-6xl">
        <div className="bliss-auth-layout">
          <div className="bliss-auth-visual" aria-hidden>
            <Image
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80"
              alt=""
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#1e211e]/35 via-transparent to-transparent"
              aria-hidden
            />
          </div>

          <div className="bliss-auth-panel">
            <p className="bliss-auth-eyebrow">Almost there</p>
            <h1 className="bliss-auth-heading">Finish your account</h1>
            <p className="bliss-auth-sub">
              Your booking is saved. Set a password for <strong className="font-semibold text-[#1e211e]">{email}</strong>{' '}
              to see it in your client dashboard.
            </p>

            <div className="bliss-auth-card">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <Input
                  label="Email"
                  labelClassName="bliss-field-label"
                  type="email"
                  value={email}
                  readOnly
                  autoComplete="username"
                  className={`${inputClassName} opacity-80`}
                />
                <Input
                  label="Password"
                  labelClassName="bliss-field-label"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={inputClassName}
                />
                <Input
                  label="Confirm password"
                  labelClassName="bliss-field-label"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  className={inputClassName}
                />
                {error && error !== 'missing' && (
                  <p className="text-center text-sm font-sans text-red-600">{error}</p>
                )}
                <button type="submit" disabled={loading} className="bliss-auth-submit font-sans">
                  {loading ? 'Creating account…' : 'Create account & sign in'}
                </button>
              </form>

              <p className="bliss-auth-footer-note">
                Prefer to stay a guest? <Link href="/">Back to home</Link> — your visit is still booked.
              </p>
            </div>

            <p className="bliss-auth-hint font-sans">
              Already have an account? <Link href="/auth/signin">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
