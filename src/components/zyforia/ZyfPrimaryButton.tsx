import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

const ARROW =
  'https://cdn.prod.website-files.com/6953859153f794174c57cf1c/695510e971cee230b84744ab_arrow-right.svg'

function ButtonInner({ children }: { children: string }) {
  return (
    <>
      <div className="button-text-box">
        <div className="button-text top">{children}</div>
        <div className="button-text bottom">{children}</div>
      </div>
      <div className="button-icon-box">
        <div className="button-icon-block">
          <img src={ARROW} alt="" className="button-icon top" width={20} height={20} />
          <img src={ARROW} alt="" className="button-icon bottom" width={20} height={20} />
        </div>
      </div>
    </>
  )
}

export function ZyfPrimaryLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: string
  className?: string
}) {
  return (
    <Link href={href} className={`primary-button w-inline-block ${className}`}>
      <ButtonInner>{children}</ButtonInner>
    </Link>
  )
}

type NativeButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'children'>

export function ZyfPrimaryButton({
  children,
  className = '',
  ...props
}: NativeButtonProps & { children: string; className?: string }) {
  return (
    <button type="button" className={`primary-button w-inline-block ${className}`} {...props}>
      <ButtonInner>{children}</ButtonInner>
    </button>
  )
}

export function ZyfPrimarySubmit({
  children,
  className = '',
  disabled,
  ...props
}: Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'type'> & {
  children: string
  className?: string
}) {
  return (
    <button
      {...props}
      type="submit"
      disabled={disabled}
      className={`primary-button w-inline-block ${className} ${disabled ? 'pointer-events-none opacity-60' : ''}`}
    >
      <ButtonInner>{children}</ButtonInner>
    </button>
  )
}
