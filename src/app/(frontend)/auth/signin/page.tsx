import { SignInForm } from './SignInForm'
import { safeInternalPath } from '@/lib/safe-redirect'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign in | Lumin MedSpa' }

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  return <SignInForm defaultNext={safeInternalPath(callbackUrl)} />
}
