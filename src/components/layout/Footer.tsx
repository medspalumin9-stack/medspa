import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[#E0DCD9] bg-[#F9F7F5] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="text-xl font-bold tracking-[-0.02em] mb-3 text-[#4A4A4A]">LUMIN</p>
          <p className="text-sm text-[#4A4A4A]/60 leading-relaxed max-w-xs">
            Non-invasive skin rejuvenation treatments designed to give you your
            ultimate glow up.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] mb-4 text-[#4A4A4A]/50">
            Quick Links
          </p>
          <ul className="space-y-2">
            {[
              ['Services', '/services'],
              ['Shop', '/shop'],
              ['Book Appointment', '/booking'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-[#4A4A4A]/70 hover:text-[#4A4A4A] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] mb-4 text-[#4A4A4A]/50">
            Contact
          </p>
          <p className="text-sm text-[#4A4A4A]/60">hello@luminmedspa.com</p>
          <p className="text-sm text-[#4A4A4A]/60 mt-1">+1 (000) 000-0000</p>
        </div>
      </div>
      <div className="border-t border-[#E0DCD9]">
        <p className="text-center text-xs text-[#4A4A4A]/40 py-4">
          © {new Date().getFullYear()} Lumin MedSpa. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
