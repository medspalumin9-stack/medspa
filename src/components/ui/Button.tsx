'use client'
import { motion } from 'framer-motion'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium tracking-[0.05em] uppercase text-sm rounded-[4px] transition-colors duration-200 disabled:opacity-50 cursor-pointer'

    const variants = {
      primary: 'bg-[#F4D1C5] hover:bg-[#E8B8A8] text-[#4A4A4A]',
      secondary: 'bg-white border border-[#E0DCD9] hover:border-[#F4D1C5] text-[#4A4A4A]',
      outline: 'border border-[#F4D1C5] text-[#4A4A4A] hover:bg-[#F4D1C5]/20',
      ghost: 'text-[#4A4A4A] hover:bg-[#E0DCD9]/40',
    }

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-base',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(base, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
