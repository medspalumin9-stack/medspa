/** Where to send a user immediately after credentials sign-in. */
export function postCredentialsLoginPath(user: {
  canAccessAdminPortal?: boolean | null
  canAccessClientPortal?: boolean | null
}): string {
  if (user.canAccessAdminPortal) return '/admin'
  if (user.canAccessClientPortal) return '/dashboard'
  return '/'
}
