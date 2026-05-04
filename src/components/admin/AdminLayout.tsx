'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { signOutToHome } from '@/lib/client-sign-out'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ADMIN_NAV, firstAllowedAdminPath, userHasAdminSection } from '@/lib/admin-sections'
import type { SessionUserWithAdmin } from '@/lib/admin-guard'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data, status } = useSession()
  const u = data?.user as SessionUserWithAdmin | undefined
  const navLinks =
    status === 'loading'
      ? ADMIN_NAV
      : ADMIN_NAV.filter((item) => userHasAdminSection(u, item.section))
  const brandHref = firstAllowedAdminPath(u)

  const isCurrent = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="sara-admin-root">
      {/* ── Admin Navbar ──────────────────────────────────────────────────── */}
      <nav className="bliss-navbar bliss-navbar--solid" role="banner">
        <div className="bliss-container">
          <div className="bliss-nav-wrapper">
            {/* Brand */}
            <Link
              href={brandHref}
              className="bliss-brand-logo flex-col items-start md:flex-row md:items-center md:gap-3"
            >
              <span className="bliss-brand-name font-display text-[1.35rem] md:text-[1.6rem] leading-none tracking-tight">
                Lumin
              </span>
              <span className="bliss-brand-tagline font-sans text-[11px] md:text-xs font-semibold tracking-widest uppercase mt-1 md:mt-0">
                Admin
              </span>
            </Link>

            {/* Desktop nav pill */}
            <div className="bliss-nav-center">
              <div className="bliss-nav-menu-pill">
                {navLinks.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isCurrent(href) ? 'page' : undefined}
                    className="bliss-nav-link"
                  >
                    <span className="bliss-nav-link-text-wrap">
                      <span className="bliss-nav-link-slide">
                        <span className="bliss-nav-link-text-line">{label}</span>
                        <span className="bliss-nav-link-text-line">{label}</span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right actions */}
            <div className="bliss-nav-right">
              <Link href="/" className="bliss-nav-ghost hidden md:inline">
                View site
              </Link>
              <button
                type="button"
                onClick={() => void signOutToHome()}
                className="bliss-nav-ghost hidden md:inline"
              >
                Sign out
              </button>
              {/* Hamburger */}
              <button
                type="button"
                className="bliss-menu-button md:hidden"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((o) => !o)}
              >
                <span className="bliss-menu-bar" style={{ transform: mobileOpen ? 'translateY(8px) rotate(45deg)' : undefined }} />
                <span className="bliss-menu-bar" style={{ opacity: mobileOpen ? 0 : 1 }} />
                <span className="bliss-menu-bar" style={{ transform: mobileOpen ? 'translateY(-8px) rotate(-45deg)' : undefined }} />
              </button>
            </div>
          </div>

          {/* Mobile panel */}
          <div className={cn('bliss-mobile-panel', mobileOpen && 'is-open')}>
            <div className="bliss-mobile-inner">
              {navLinks.map(({ label, href }) => (
                <Link key={href} href={href} className="bliss-mobile-link" onClick={() => setMobileOpen(false)}>
                  {label}
                </Link>
              ))}
              <Link href="/" className="bliss-mobile-link" onClick={() => setMobileOpen(false)}>View site</Link>
              <button type="button" className="bliss-mobile-link text-left" onClick={() => void signOutToHome()}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="sara-admin-main blissoria-services-scope">{children}</main>
    </div>
  )
}
