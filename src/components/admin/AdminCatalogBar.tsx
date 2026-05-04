import Link from 'next/link'
import { auth } from '@/lib/auth'

type Props = {
  /** e.g. /admin/services */
  adminHref: string
  /** e.g. "Edit services in admin" */
  ctaLabel: string
  /** Short line for staff */
  message?: string
}

export async function AdminCatalogBar({ adminHref, ctaLabel, message }: Props) {
  const session = await auth()
  if ((session?.user as { role?: string } | undefined)?.role !== 'ADMIN') return null

  return (
    <div className="bliss-container relative z-20">
      <div className="bliss-admin-manage-banner">
        <p>{message ?? 'You are signed in as an admin — manage catalog from the dashboard.'}</p>
        <Link href={adminHref}>{ctaLabel}</Link>
      </div>
    </div>
  )
}
