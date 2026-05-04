'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export function FrontendChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hidePublicChrome = pathname?.startsWith('/admin') ?? false

  return (
    <>
      {!hidePublicChrome && <Navbar />}
      {children}
      {!hidePublicChrome && <Footer />}
    </>
  )
}
