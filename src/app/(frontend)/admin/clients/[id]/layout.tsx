import { requireAdminSection } from '@/lib/admin-guard'

export default async function AdminClientDetailLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSection('clients')
  return children
}
