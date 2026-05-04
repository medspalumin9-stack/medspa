'use client'
import { getSession, signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const fieldClass =
  'mt-1.5 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-[15px] text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10'

const labelClass = 'text-sm font-medium text-neutral-800'

export function SignInForm({ defaultNext }: { defaultNext?: string }) {
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
    const role = (session?.user as { role?: string } | undefined)?.role
    const safe = defaultNext && !defaultNext.startsWith('/auth') ? defaultNext : undefined
    router.push(role === 'ADMIN' ? '/admin' : safe ?? '/dashboard')
    router.refresh()
  }

  const regHref = defaultNext
    ? `/auth/register?callbackUrl=${encodeURIComponent(defaultNext)}`
    : '/auth/register'

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7] font-sans antialiased">
      <header className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-neutral-900">
            Lumin Medspa
          </Link>
          <Link href={regHref} className="text-sm text-neutral-600 transition-colors hover:text-neutral-900">
            Sign up
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-12 sm:py-16">
        <div
          className={cn(
            'w-full max-w-[400px] rounded-xl bg-white p-8 shadow-[0_2px_24px_rgba(15,23,42,0.08)]',
            'ring-1 ring-black/[0.05]'
          )}
        >
          <div className="mb-2 flex justify-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold tracking-tight text-white"
              aria-hidden
            >
              LM
            </div>
          </div>
          <h1 className="text-center text-xl font-semibold text-neutral-900">Sign in to Lumin</h1>
          <p className="mt-1 text-center text-sm text-neutral-500">
            Welcome back. Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Email address"
              labelClassName={labelClass}
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
              autoComplete="email"
              placeholder="you@email.com"
              className={fieldClass}
            />
            <Input
              label="Password"
              labelClassName={labelClass}
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={fieldClass}
            />
            {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'flex h-10 w-full items-center justify-center rounded-md bg-neutral-900 text-sm font-medium text-white',
                'transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-45'
              )}
            >
              {loading ? 'Signing in…' : 'Continue'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Don&apos;t have an account?{' '}
            <Link href={regHref} className="font-medium text-neutral-900 underline-offset-2 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <p className="mt-8 max-w-sm text-center text-xs text-neutral-500">
          Prefer to book without an account?{' '}
          <Link href="/booking" className="font-medium text-neutral-700 underline-offset-2 hover:underline">
            Book as guest
          </Link>
        </p>
      </main>
    </div>
  )
}
