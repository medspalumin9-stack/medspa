import React from 'react'

export const dynamic = 'force-dynamic'

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
