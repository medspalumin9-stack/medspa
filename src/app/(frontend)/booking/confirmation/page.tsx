'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F5] flex items-center justify-center px-6 py-24">
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
          className="w-20 h-20 rounded-full bg-[#F4D1C5]/50 flex items-center justify-center mx-auto mb-8 text-3xl"
        >
          ✦
        </motion.div>

        <h1 className="text-4xl font-bold tracking-[-0.02em] text-[#4A4A4A] mb-4">
          Glow Secured.
        </h1>
        <p className="text-[#4A4A4A]/60 leading-relaxed mb-3 text-lg">
          Your appointment has been confirmed.
        </p>
        <p className="text-sm text-[#4A4A4A]/50 mb-10">
          Check your email and phone for your booking details and reminders.
        </p>

        <div className="bg-white border border-[#E0DCD9] rounded-xl p-5 mb-8 text-left">
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-[#4A4A4A]/50 mb-3">
            What Happens Next
          </p>
          <ul className="space-y-2">
            {[
              '📧 Confirmation email sent to your inbox',
              '📱 SMS confirmation sent to your phone',
              '🔔 24-hour reminder before your appointment',
              '⏰ 1-hour "Get ready" reminder',
            ].map((item) => (
              <li key={item} className="text-sm text-[#4A4A4A]/70 flex items-start gap-2">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/auth/signin">
            <Button variant="primary" className="w-full">
              Track in My Account
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
