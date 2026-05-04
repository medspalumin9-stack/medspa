import { requireAdminSection } from '@/lib/admin-guard'

export default async function AdminServicesLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSection('services')
  return children
}
