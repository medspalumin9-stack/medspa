'use client'

import { SessionProvider } from 'next-auth/react'

const authBasePath =
  process.env.NEXT_PUBLIC_AUTH_BASE_PATH?.replace(/\/$/, '') || '/api/auth'

export function SessionProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider basePath={authBasePath}>{children}</SessionProvider>
}
