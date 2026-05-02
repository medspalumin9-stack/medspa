'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20))

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F9F7F5]/95 backdrop-blur-sm border-b border-[#E0DCD9]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-[-0.02em] text-[#4A4A4A]"
        >
          LUMIN
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/services"
            className="text-sm text-[#4A4A4A]/70 hover:text-[#4A4A4A] transition-colors"
          >
            Services
          </Link>
          <Link
            href="/shop"
            className="text-sm text-[#4A4A4A]/70 hover:text-[#4A4A4A] transition-colors"
          >
            Shop
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-[#4A4A4A]/70 hover:text-[#4A4A4A] transition-colors"
              >
                My Account
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/booking">
                <Button variant="primary" size="sm">Book Now</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-[#4A4A4A]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <div className="w-5 flex flex-col gap-1">
            <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#F9F7F5] border-b border-[#E0DCD9] px-6 py-4 flex flex-col gap-4">
          <Link href="/services" className="text-sm text-[#4A4A4A]" onClick={() => setMobileOpen(false)}>Services</Link>
          <Link href="/shop" className="text-sm text-[#4A4A4A]" onClick={() => setMobileOpen(false)}>Shop</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm text-[#4A4A4A]" onClick={() => setMobileOpen(false)}>My Account</Link>
              <button className="text-sm text-left text-[#4A4A4A]" onClick={() => signOut()}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="text-sm text-[#4A4A4A]" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/booking" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">Book Now</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </motion.nav>
  )
}
