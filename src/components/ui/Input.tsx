import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  labelClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelClassName, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className={cn(
            labelClassName ?? 'text-sm font-medium text-[#4A4A4A]',
          )}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 border border-[#E0DCD9] rounded-[4px] bg-white text-[#4A4A4A] text-base',
          'focus:outline-none focus:border-[#F4D1C5] transition-colors duration-200',
          'placeholder:text-[#4A4A4A]/40',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
)
Input.displayName = 'Input'
