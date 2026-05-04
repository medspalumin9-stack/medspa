import { requireAdminSection } from '@/lib/admin-guard'

export default async function AdminProductsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSection('products')
  return children
}
