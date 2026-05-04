import { requireAdminSection } from '@/lib/admin-guard'

export default async function AdminStaffLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSection('staff')
  return children
}
