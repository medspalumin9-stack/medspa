'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })
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

    await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#F9F7F5] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#E8B8A8] mb-3">
            Join Lumin
          </p>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#4A4A4A] mb-2">
            Start Your Glow Up
          </h1>
          <p className="text-[#4A4A4A]/60">
            Create your account to track your journey.
          </p>
        </div>

        <div className="bg-white border border-[#E0DCD9] rounded-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              required
              placeholder="Jane Doe"
              autoComplete="name"
            />
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              placeholder="jane@email.com"
              autoComplete="email"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              required
              placeholder="+1 555 000 0000"
              autoComplete="tel"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              placeholder="Create a password"
              autoComplete="new-password"
            />
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#4A4A4A]/60 mt-6">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-[#E8B8A8] hover:underline font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
