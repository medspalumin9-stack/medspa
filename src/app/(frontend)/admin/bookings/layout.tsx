import { requireAdminSection } from '@/lib/admin-guard'

export default async function AdminBookingsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSection('bookings')
  return children
}
