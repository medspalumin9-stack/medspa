'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useLayoutEffect, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import {
  BLISSORIA_BTN_ICON_ALT,
  BLISSORIA_BTN_ICON_PRIMARY,
} from '@/lib/blissoria-cdn'
import { cn } from '@/lib/utils'

const HOME_SCROLL_SOLID_PX = 72

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

function BookAppointmentLink({ href }: { href: string }) {
  return (
    <Link href={href} className="bliss-secondary-button">
      <span className="bliss-secondary-button-bg" aria-hidden />
      <span className="bliss-secondary-button-icon-wrap">
        <Image
          src={BLISSORIA_BTN_ICON_PRIMARY}
          alt=""
          width={22}
          height={22}
          className="bliss-secondary-button-icon"
        />
        <Image
          src={BLISSORIA_BTN_ICON_ALT}
          alt=""
          width={22}
          height={22}
          className="bliss-secondary-button-icon bliss-icon-hover"
        />
      </span>
      <span className="bliss-secondary-button-text">Book Appointment</span>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isHome = pathname === '/'
  const { scrollY } = useScroll()
  const [navSolid, setNavSolid] = useState(!isHome)
  const bookingHref = session?.user ? '/booking?next=/dashboard' : '/booking'

  useLayoutEffect(() => {
    if (!isHome) {
      setNavSolid(true)
      return
    }
    setNavSolid(window.scrollY > HOME_SCROLL_SOLID_PX)
  }, [isHome])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (!isHome) return
    setNavSolid(latest > HOME_SCROLL_SOLID_PX)
  })

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
  const links: [string, string][] = session
    ? linkTuples.filter(([, href]) => href !== '/shop')
    : linkTuples

  return (
    <nav className={cn('bliss-navbar', navSolid && 'bliss-navbar--solid')} role="banner">
      <div className="bliss-container">
        <div className="bliss-nav-wrapper">
          <Link href="/" className="bliss-brand-logo flex-col items-start md:flex-row md:items-center md:gap-3">
            <span className="bliss-brand-name font-display text-[1.35rem] md:text-[1.6rem] leading-none tracking-tight">
              Lumin
            </span>
            <span className="bliss-brand-tagline font-sans text-[11px] md:text-xs font-medium tracking-wide mt-1 md:mt-0">
              Medspa
            </span>
          </Link>

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
              {!session && <BlissNavLink href="/auth/signin" current={isCurrent('/auth/signin')}>Sign In</BlissNavLink>}
            </div>
          </div>

          <div className="bliss-nav-right">
            {session && (
              <button type="button" onClick={() => signOut()} className="bliss-nav-ghost hidden md:inline">
                Sign out
              </button>
            )}
            <BookAppointmentLink href={bookingHref} />
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
                Sign In
              </Link>
            )}
            <Link href={bookingHref} className="bliss-mobile-link" onClick={() => setMobileOpen(false)} style={{ background: '#1e211e', color: '#f4e6cd' }}>
              Book Appointment
            </Link>
            {session && (
              <button type="button" className="bliss-mobile-link text-left" onClick={() => signOut()}>
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
