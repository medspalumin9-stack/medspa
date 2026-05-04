import { firstAllowedAdminPath, type AdminSectionFlags } from '@/lib/admin-sections'

/** Where to send a user immediately after credentials sign-in. */
export function postCredentialsLoginPath(
  user: {
    canAccessAdminPortal?: boolean | null
    canAccessClientPortal?: boolean | null
  } & Partial<AdminSectionFlags>,
): string {
  if (user.canAccessAdminPortal) return firstAllowedAdminPath(user)
  if (user.canAccessClientPortal) return '/dashboard'
  return '/'
}
