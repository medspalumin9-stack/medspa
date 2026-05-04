import { auth } from './auth'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session || role !== 'ADMIN') redirect('/auth/signin')
  return session
}

export async function requireAdminApi() {
  const session = await auth()
  const role = (session?.user as any)?.role
  if (!session || role !== 'ADMIN') return null
  return session
}
