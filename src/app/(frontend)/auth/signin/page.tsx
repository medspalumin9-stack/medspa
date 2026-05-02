'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SignInPage() {
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
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F7F5] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#E8B8A8] mb-3">
            Client Portal
          </p>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#4A4A4A] mb-2">
            Welcome Back
          </h1>
          <p className="text-[#4A4A4A]/60">Sign in to manage your appointments.</p>
        </div>

        <div className="bg-white border border-[#E0DCD9] rounded-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              autoComplete="email"
              placeholder="jane@email.com"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              autoComplete="current-password"
              placeholder="••••••••"
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
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#4A4A4A]/60 mt-6">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="text-[#E8B8A8] hover:underline font-medium"
            >
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[#4A4A4A]/40 mt-6">
          Looking to book without an account?{' '}
          <Link href="/booking" className="hover:underline">
            Click here
          </Link>
        </p>
      </div>
    </div>
  )
}
