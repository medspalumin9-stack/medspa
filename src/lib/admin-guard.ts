import { auth } from './auth'
import { redirect } from 'next/navigation'
import {
  firstAllowedAdminPath,
  userHasAdminSection,
  type AdminSection,
  type AdminSectionFlags,
} from './admin-sections'

export type SessionUserWithAdmin = {
  canAccessAdminPortal?: boolean
} & Partial<AdminSectionFlags>

/** Bookings list API is used by Bookings and Clients dashboards — allow either section for GET-style reads. */
export async function requireAdminApiBookingsOrClientsRead() {
  const session = await auth()
  const u = session?.user as SessionUserWithAdmin | undefined
  if (!session || !u?.canAccessAdminPortal) return null
  if (userHasAdminSection(u, 'bookings') || userHasAdminSection(u, 'clients')) return session
  return null
}

export async function requireAdmin() {
  const session = await auth()
  const u = session?.user as SessionUserWithAdmin | undefined
  if (!session || !u?.canAccessAdminPortal) redirect('/auth/signin')
  return session
}

/** Gate /admin APIs. Pass `section` to require access to that admin area. */
export async function requireAdminApi(section?: AdminSection) {
  const session = await auth()
  const u = session?.user as SessionUserWithAdmin | undefined
  if (!session || !u?.canAccessAdminPortal) return null
  if (section && !userHasAdminSection(u, section)) return null
  return session
}

/** Server layouts/pages: require admin portal + specific section. */
export async function requireAdminSection(section: AdminSection) {
  const session = await auth()
  const u = session?.user as SessionUserWithAdmin | undefined
  if (!session || !u?.canAccessAdminPortal) redirect('/auth/signin')
  if (userHasAdminSection(u, section)) return session
  redirect(firstAllowedAdminPath(u))
}
