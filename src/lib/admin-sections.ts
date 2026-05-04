/**
 * Granular admin UI areas — matches /admin routes and Prisma User.canAdmin* fields.
 */
export const ADMIN_SECTIONS = [
  'overview',
  'bookings',
  'clients',
  'services',
  'products',
  'staff',
  'users',
] as const

export type AdminSection = (typeof ADMIN_SECTIONS)[number]

export type AdminSectionFlags = {
  canAdminOverview: boolean
  canAdminBookings: boolean
  canAdminClients: boolean
  canAdminServices: boolean
  canAdminProducts: boolean
  canAdminStaff: boolean
  canAdminUsers: boolean
}

export const DEFAULT_ADMIN_SECTION_FLAGS: AdminSectionFlags = {
  canAdminOverview: true,
  canAdminBookings: true,
  canAdminClients: true,
  canAdminServices: true,
  canAdminProducts: true,
  canAdminStaff: true,
  canAdminUsers: true,
}

const SECTION_TO_FLAG: Record<AdminSection, keyof AdminSectionFlags> = {
  overview: 'canAdminOverview',
  bookings: 'canAdminBookings',
  clients: 'canAdminClients',
  services: 'canAdminServices',
  products: 'canAdminProducts',
  staff: 'canAdminStaff',
  users: 'canAdminUsers',
}

export function userHasAdminSection(
  user: Partial<AdminSectionFlags> & { canAccessAdminPortal?: boolean | null } | null | undefined,
  section: AdminSection,
): boolean {
  if (!user?.canAccessAdminPortal) return false
  const key = SECTION_TO_FLAG[section]
  const v = user[key]
  return v !== false
}

/** First allowed path under /admin for post-login or redirects. */
export function firstAllowedAdminPath(
  user: Partial<AdminSectionFlags> & { canAccessAdminPortal?: boolean | null } | null | undefined,
): string {
  if (!user?.canAccessAdminPortal) return '/'
  const order: { section: AdminSection; path: string }[] = [
    { section: 'overview', path: '/admin' },
    { section: 'bookings', path: '/admin/bookings' },
    { section: 'clients', path: '/admin/clients' },
    { section: 'services', path: '/admin/services' },
    { section: 'products', path: '/admin/products' },
    { section: 'staff', path: '/admin/staff' },
    { section: 'users', path: '/admin/users' },
  ]
  for (const { section, path } of order) {
    if (userHasAdminSection(user, section)) return path
  }
  return '/'
}

/** Admin chrome nav — label, href, permission key. */
export const ADMIN_NAV: { label: string; href: string; section: AdminSection }[] = [
  { label: 'Overview', href: '/admin', section: 'overview' },
  { label: 'Bookings', href: '/admin/bookings', section: 'bookings' },
  { label: 'Clients', href: '/admin/clients', section: 'clients' },
  { label: 'Services', href: '/admin/services', section: 'services' },
  { label: 'Shop', href: '/admin/products', section: 'products' },
  { label: 'Staff', href: '/admin/staff', section: 'staff' },
  { label: 'Users', href: '/admin/users', section: 'users' },
]
