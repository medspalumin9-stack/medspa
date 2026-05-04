'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Registration failed. Please try again.')
      setLoading(false)
      return
    }

    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/dashboard')
  }

  const inputClassName =
    'rounded-full border-[#1e211e]/15 bg-[#faf9f7] py-3.5 px-5 text-[#1e211e] focus:border-[#1e211e]/35'

  return (
    <div className="blissoria-inner-page min-h-screen">
      <div className="bliss-container max-w-6xl">
        <div className="bliss-auth-layout">
          <div className="bliss-auth-visual" aria-hidden>
            <Image
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80"
              alt=""
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(160deg, rgba(30,33,30,0.12) 0%, rgba(189,160,110,0.18) 60%, rgba(30,33,30,0.35) 100%)',
              }}
              aria-hidden
            />
            <div className="absolute bottom-10 left-8 right-8 pointer-events-none">
              <p className="font-display text-white/90 text-2xl leading-tight">
                Your glow journey starts here
              </p>
              <p className="font-sans text-white/55 text-sm mt-2">
                Book, track visits, and build your skin profile.
              </p>
            </div>
          </div>

          <div className="bliss-auth-panel">
            <p className="bliss-auth-eyebrow">New to Lumin</p>
            <h1 className="bliss-auth-heading">Create your account</h1>
            <p className="bliss-auth-sub">Join to track your treatments, skin goals, and appointment history.</p>

            <div className="bliss-auth-card">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  label="Full Name"
                  labelClassName="bliss-field-label"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  required
                  placeholder="Jane Doe"
                  autoComplete="name"
                  className={inputClassName}
                />
                <Input
                  label="Email Address"
                  labelClassName="bliss-field-label"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                  placeholder="jane@email.com"
                  autoComplete="email"
                  className={inputClassName}
                />
                <Input
                  label="Phone Number"
                  labelClassName="bliss-field-label"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  required
                  placeholder="+1 555 000 0000"
                  autoComplete="tel"
                  className={inputClassName}
                />
                <Input
                  label="Password"
                  labelClassName="bliss-field-label"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className={inputClassName}
                />
                {error && <p className="text-sm text-red-600 text-center font-sans">{error}</p>}
                <button type="submit" disabled={loading} className="bliss-auth-submit font-sans">
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p className="bliss-auth-footer-note">
                Already have an account?{' '}
                <Link href="/auth/signin">Sign in</Link>
              </p>
            </div>

            <p className="bliss-auth-hint font-sans">
              Prefer to book as a guest?{' '}
              <Link href="/booking">Book without an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
