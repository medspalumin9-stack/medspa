import { requireAdminSection } from '@/lib/admin-guard'

export default async function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSection('users')
  return children
}
