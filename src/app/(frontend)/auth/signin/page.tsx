'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { postCredentialsLoginPath } from '@/lib/post-login-redirect'

type AuthMode = 'existing' | 'new'

/* ─── Arrow SVG ───────────────────────────────────────────────────────────── */
function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

/* ─── Shared field component ──────────────────────────────────────────────── */
function Field({
  id, label, type = 'text', placeholder, value, onChange, autoComplete,
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
}) {
  return (
    <div className="sara-field-wrap">
      <label htmlFor={id} className="sara-label">{label}</label>
      <input
        id={id}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sara-input"
      />
    </div>
  )
}

/* ─── Sign-In panel (no outer card — lives inside unified card) ──────────── */
function SignInPanel() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', { ...form, redirect: false })
    if (res?.error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }
    const session = await getSession()
    const u = session?.user as {
      canAccessAdminPortal?: boolean
      canAccessClientPortal?: boolean
    } | undefined
    router.push(postCredentialsLoginPath(u ?? {}))
    router.refresh()
  }

  return (
    <>
      <div className="sara-auth-mark">✦</div>
      <p className="sara-kicker">Welcome back</p>
      <h1 className="sara-h2" style={{ marginBottom: '6px' }}>Sign in</h1>
      <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.55)', marginBottom: '32px' }}>
        Enter your credentials to access your account.
      </p>

      {error && <div className="sara-alert sara-alert--error">{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Field id="signin-email" label="Email address" type="email" placeholder="jane@email.com"
          autoComplete="email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
        <Field id="signin-password" label="Password" type="password" placeholder="••••••••"
          autoComplete="current-password" value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} />
        <button type="submit" disabled={loading} className="sara-btn sara-btn--dark"
          style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
          <span className="sara-btn-arrow"><Arrow /></span>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '13px', color: 'rgba(30,27,24,0.50)', textAlign: 'center' }}>
        Forgot your password?{' '}
        <Link href="/auth/signin" style={{ color: 'var(--sara-accent)', textDecoration: 'underline' }}>Reset it</Link>
      </p>
    </>
  )
}

/* ─── Register panel ──────────────────────────────────────────────────────── */
function RegisterPanel() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data?.error || 'Registration failed.'); setLoading(false); return }
    setSuccess(true)
    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    const session = await getSession()
    const u = session?.user as {
      canAccessAdminPortal?: boolean
      canAccessClientPortal?: boolean
    } | undefined
    router.push(postCredentialsLoginPath(u ?? {}))
    router.refresh()
  }

  return (
    <>
      <div className="sara-auth-mark" style={{ color: 'var(--sara-accent)', borderColor: 'rgba(124,68,58,0.15)' }}>✧</div>
      <p className="sara-kicker">New here?</p>
      <h2 className="sara-h2" style={{ marginBottom: '6px' }}>Join Lumin</h2>
      <p style={{ fontSize: '14px', color: 'rgba(30,27,24,0.55)', marginBottom: '32px' }}>
        Create an account to manage your bookings and track your glow-up journey.
      </p>

      {error && <div className="sara-alert sara-alert--error">{error}</div>}
      {success && <div className="sara-alert sara-alert--success">Account created! Redirecting…</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Field id="reg-name" label="Full name" placeholder="Jane Doe" autoComplete="name"
          value={form.fullName} onChange={(v) => setForm((p) => ({ ...p, fullName: v }))} />
        <Field id="reg-email" label="Email address" type="email" placeholder="jane@email.com" autoComplete="email"
          value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
        <Field id="reg-phone" label="Phone (optional)" type="tel" placeholder="+233 24 000 0000" autoComplete="tel"
          value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
        <div className="sara-2col">
          <Field id="reg-password" label="Password" type="password" placeholder="••••••••" autoComplete="new-password"
            value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} />
          <Field id="reg-confirm" label="Confirm" type="password" placeholder="••••••••" autoComplete="new-password"
            value={form.confirm} onChange={(v) => setForm((p) => ({ ...p, confirm: v }))} />
        </div>
        <button type="submit" disabled={loading || success} className="sara-btn"
          style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
          <span className="sara-btn-arrow"><Arrow /></span>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function SignInPage() {
  const [mode, setMode] = useState<AuthMode>('existing')

  return (
    <div className="sara-auth-bg">
      <div className="sara-auth-wrap sara-auth-wrap--single">
        <div className="sara-auth-card">
          <div className="sara-auth-segment" role="group" aria-label="Account">
            <button
              type="button"
              aria-pressed={mode === 'existing'}
              onClick={() => setMode('existing')}
            >
              Existing account
            </button>
            <button
              type="button"
              aria-pressed={mode === 'new'}
              onClick={() => setMode('new')}
            >
              New account
            </button>
          </div>

          <div id="auth-panel-existing" hidden={mode !== 'existing'}>
            <SignInPanel />
          </div>
          <div id="auth-panel-new" hidden={mode !== 'new'}>
            <RegisterPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
