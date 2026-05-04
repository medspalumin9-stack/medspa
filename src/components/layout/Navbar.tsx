'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { signOutToHome } from '@/lib/client-sign-out'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { cn } from '@/lib/utils'

const HOME_SCROLL_SOLID_PX = 72

/* ─── Arrow icon (inline SVG – no external asset needed) ─────────────────── */
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

/* ─── NavLink ─────────────────────────────────────────────────────────────── */
export function BlissNavLink({
  href,
  children,
  current,
}: {
  href: string
  children: string
  current: boolean
}) {
  return (
    <Link href={href} aria-current={current ? 'page' : undefined} className="bliss-nav-link">
      <span className="bliss-nav-link-text-wrap">
        <span className="bliss-nav-link-slide">
          <span className="bliss-nav-link-text-line">{children}</span>
          <span className="bliss-nav-link-text-line">{children}</span>
        </span>
      </span>
    </Link>
  )
}

/* ─── Book CTA button ─────────────────────────────────────────────────────── */
function BookBtn({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="sara-btn sara-btn--dark min-h-[44px] shrink-0 items-center !gap-2.5 !px-3 !py-2.5 !text-[13px] min-[381px]:!px-5"
      aria-label="Book appointment"
    >
      <span className="sara-btn-arrow">
        <ArrowRight />
      </span>
      <span className="hidden min-[381px]:inline">Book Appointment</span>
      <span className="inline min-[381px]:hidden">Book</span>
    </Link>
  )
}

/* ─── Navbar ──────────────────────────────────────────────────────────────── */
export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isHome = pathname === '/'
  const { scrollY } = useScroll()
  const [navSolid, setNavSolid] = useState(!isHome)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const bookingHref = session?.user ? '/booking?next=/dashboard' : '/booking'

  /* solid-state on non-home pages + scroll */
  useLayoutEffect(() => {
    if (!isHome) { setNavSolid(true); return }
    setNavSolid(window.scrollY > HOME_SCROLL_SOLID_PX)
    lastY.current = window.scrollY
  }, [isHome])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const delta = latest - lastY.current
    if (!isHome) setNavSolid(true)
    else setNavSolid(latest > HOME_SCROLL_SOLID_PX)

    if (Math.abs(delta) < 6) return
    if (delta > 0 && latest > 120) {
      setHidden(true)   // scrolling down → hide
    } else {
      setHidden(false)  // scrolling up → show
    }
    lastY.current = latest
  })

  /* mouse near top of viewport → always show */
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (e.clientY < 80) setHidden(false)
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const isCurrent = (href: string) => {
    if (href === '/#about') return pathname === '/'
    if (href === '/') return pathname === '/'
    const base = href.split('#')[0]
    return pathname === base || pathname.startsWith(`${base}/`)
  }

  const linkTuples: [string, string][] = [
    ['Home', '/'],
    ['About Us', '/#about'],
    ['Services', '/services'],
    ['Shop', '/shop'],
  ]
  const links: [string, string][] = linkTuples

  return (
    <nav
      className={cn(
        'bliss-navbar',
        navSolid && 'bliss-navbar--solid',
        hidden && 'nav--hidden',
      )}
      role="banner"
    >
      <div className="bliss-container">
        <div className="bliss-nav-wrapper">
          {/* Brand */}
          <Link
            href="/"
            className="bliss-brand-logo flex-col items-start md:flex-row md:items-center md:gap-3"
          >
            <span className="bliss-brand-name font-display text-[1.35rem] md:text-[1.6rem] leading-none tracking-tight">
              Lumin
            </span>
            <span className="bliss-brand-tagline font-sans text-[11px] md:text-xs font-semibold tracking-widest uppercase mt-1 md:mt-0">
              Medspa
            </span>
          </Link>

          {/* Desktop nav pill */}
          <div className="bliss-nav-center">
            <div className="bliss-nav-menu-pill">
              {links.map(([label, href]) => (
                <BlissNavLink key={href} href={href} current={isCurrent(href)}>
                  {label}
                </BlissNavLink>
              ))}
              {session && (
                <BlissNavLink href="/dashboard" current={isCurrent('/dashboard')}>
                  My portal
                </BlissNavLink>
              )}
              {!session && (
                <BlissNavLink href="/auth/signin" current={isCurrent('/auth/signin')}>
                  Sign in
                </BlissNavLink>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="bliss-nav-right">
            {session && (
              <button
                type="button"
                onClick={() => void signOutToHome()}
                className="bliss-nav-ghost hidden md:inline"
              >
                Sign out
              </button>
            )}
            <BookBtn href={bookingHref} />
            {/* Hamburger */}
            <button
              type="button"
              className="bliss-menu-button md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span
                className="bliss-menu-bar"
                style={{ transform: mobileOpen ? 'translateY(8px) rotate(45deg)' : undefined }}
              />
              <span className="bliss-menu-bar" style={{ opacity: mobileOpen ? 0 : 1 }} />
              <span
                className="bliss-menu-bar"
                style={{ transform: mobileOpen ? 'translateY(-8px) rotate(-45deg)' : undefined }}
              />
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        <div className={`bliss-mobile-panel ${mobileOpen ? 'is-open' : ''}`}>
          <div className="bliss-mobile-inner">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="bliss-mobile-link" onClick={() => setMobileOpen(false)}>
                {label}
              </Link>
            ))}
            {session && (
              <Link href="/dashboard" className="bliss-mobile-link" onClick={() => setMobileOpen(false)}>
                My portal
              </Link>
            )}
            {!session && (
              <Link href="/auth/signin" className="bliss-mobile-link" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
            )}
            <Link
              href={bookingHref}
              className="bliss-mobile-link"
              onClick={() => setMobileOpen(false)}
              style={{ background: 'var(--sara-accent)', color: '#fff' }}
            >
              Book Appointment
            </Link>
            {session && (
              <button
                type="button"
                className="bliss-mobile-link text-left"
                onClick={() => void signOutToHome()}
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
