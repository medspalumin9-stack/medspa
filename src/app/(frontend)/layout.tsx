import { SessionProvider } from 'next-auth/react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lumin MedSpa | Your Glow Up Awaits',
  description:
    'Non-invasive skin rejuvenation treatments and premium cosmetics.',
}

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <Navbar />
      <main className="pt-16 flex-1">{children}</main>
      <Footer />
    </SessionProvider>
  )
}
