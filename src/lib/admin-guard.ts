import { auth } from './auth'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const session = await auth()
  const u = session?.user as { canAccessAdminPortal?: boolean } | undefined
  if (!session || !u?.canAccessAdminPortal) redirect('/auth/signin')
  return session
}

export async function requireAdminApi() {
  const session = await auth()
  const u = session?.user as { canAccessAdminPortal?: boolean } | undefined
  if (!session || !u?.canAccessAdminPortal) return null
  return session
}
