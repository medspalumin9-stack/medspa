import { SessionProviders } from '@/components/providers/SessionProviders'
import { FrontendChrome } from '@/components/layout/FrontendChrome'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import type { Metadata } from 'next'
import '@/styles/blissoria-site.css'

export const metadata: Metadata = {
  title: 'Lumin Medspa | Non-invasive skin rejuvenation',
  description:
    'Lumin Medspa offers evidence-based, non-invasive aesthetic treatments in a calm, professional setting.',
}

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProviders>
      <div className="page-wrapper">
        <LoadingScreen />
        <FrontendChrome>
          <main className="main flex-1">{children}</main>
        </FrontendChrome>
      </div>
    </SessionProviders>
  )
}
