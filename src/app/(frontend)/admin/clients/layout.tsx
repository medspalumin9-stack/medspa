import { requireAdminSection } from '@/lib/admin-guard'

export default async function AdminClientsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSection('clients')
  return children
}
