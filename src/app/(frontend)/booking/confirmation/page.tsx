'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ConfirmationPage() {
  return (
    <div className="blissoria-inner-page min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-[#edddc3] flex items-center justify-center mx-auto mb-8 text-3xl text-[#1e211e]/40"
        >
          ✦
        </motion.div>

        <h1 className="font-display text-4xl font-normal tracking-tight text-[#1e211e] mb-4">
          Glow Secured.
        </h1>
        <p className="font-sans text-[#1e211e]/70 leading-relaxed mb-3 text-lg font-light">
          Your appointment has been confirmed.
        </p>
        <p className="font-sans text-sm text-[#1e211e]/55 mb-10">
          Check your email and phone for your booking details and reminders.
        </p>

        <div className="bg-white border border-[#1e211e]/12 rounded-2xl p-5 mb-8 text-left shadow-[0_12px_40px_rgba(30,33,30,0.06)]">
          <p className="font-sans text-xs font-medium text-[#6b5344] mb-3">
            What Happens Next
          </p>
          <ul className="space-y-2">
            {[
              '📧 Confirmation email sent to your inbox',
              '📱 SMS confirmation sent to your phone',
              '🔔 24-hour and 1-hour reminders on the channel you chose at booking',
            ].map((item) => (
              <li key={item} className="font-sans text-sm text-[#1e211e]/70 flex items-start gap-2">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/auth/signin">
            <Button variant="primary" className="w-full">
              Sign in to your portal
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="secondary" className="w-full">
              Shop The Glow
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
