import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lumin MedSpa | Your Glow Up Awaits',
  description:
    'Non-invasive skin rejuvenation treatments and premium cosmetics. Book your glow up today.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
