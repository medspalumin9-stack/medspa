import { SessionProvider } from 'next-auth/react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { requireAdmin } from '@/lib/admin-guard'
import '@/styles/blissoria-site.css'
import '@/styles/admin-blissoria.css'
import '@/styles/blissoria-services-scope.css'

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <SessionProvider>
      <AdminLayout>{children}</AdminLayout>
    </SessionProvider>
  )
}
