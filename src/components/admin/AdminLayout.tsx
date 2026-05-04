'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BlissNavLink } from '@/components/layout/Navbar'

const NAV: [string, string][] = [
  ['Overview', '/admin'],
  ['Bookings', '/admin/bookings'],
  ['Clients', '/admin/clients'],
  ['Services', '/admin/services'],
  ['Shop', '/admin/products'],
  ['Staff', '/admin/staff'],
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isCurrent = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="bliss-admin-root min-h-screen">
      <nav className="bliss-navbar bliss-navbar--solid" role="banner">
        <div className="bliss-container">
          <div className="bliss-nav-wrapper">
            <Link href="/admin" className="bliss-brand-logo flex-col items-start md:flex-row md:items-center md:gap-3">
              <span className="bliss-brand-name font-display text-[1.35rem] md:text-[1.6rem] leading-none tracking-tight">
                Lumin
              </span>
              <span className="bliss-brand-tagline font-sans text-[11px] md:text-xs font-medium tracking-wide mt-1 md:mt-0">
                Medspa · Admin
              </span>
            </Link>

            <div className="bliss-nav-center">
              <div className="bliss-nav-menu-pill">
                {NAV.map(([label, href]) => (
                  <BlissNavLink key={href} href={href} current={isCurrent(href)}>
                    {label}
                  </BlissNavLink>
                ))}
              </div>
            </div>

            <div className="bliss-nav-right">
              <Link href="/" className="bliss-nav-ghost hidden md:inline">
                View website
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bliss-nav-ghost hidden md:inline"
              >
                Sign out
              </button>
              <button
                type="button"
                className="bliss-menu-button md:hidden"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((o) => !o)}
              >
                <span
                  className="bliss-menu-bar"
                  style={{
                    transform: mobileOpen ? 'translateY(8px) rotate(45deg)' : undefined,
                  }}
                />
                <span className="bliss-menu-bar" style={{ opacity: mobileOpen ? 0 : 1 }} />
                <span
                  className="bliss-menu-bar"
                  style={{
                    transform: mobileOpen ? 'translateY(-8px) rotate(-45deg)' : undefined,
                  }}
                />
              </button>
            </div>
          </div>

          <div className={cn('bliss-mobile-panel', mobileOpen && 'is-open')}>
            <div className="bliss-mobile-inner">
              {NAV.map(([label, href]) => (
                <Link key={href} href={href} className="bliss-mobile-link" onClick={() => setMobileOpen(false)}>
                  {label}
                </Link>
              ))}
              <Link href="/" className="bliss-mobile-link" onClick={() => setMobileOpen(false)}>
                View website
              </Link>
              <button type="button" className="bliss-mobile-link text-left" onClick={() => signOut({ callbackUrl: '/' })}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="bliss-admin-page-main blissoria-services-scope">{children}</main>
    </div>
  )
}
