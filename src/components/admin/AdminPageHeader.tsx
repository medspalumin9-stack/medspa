import type { ReactNode } from 'react'

type AdminPageHeaderProps = {
  eyebrow?: string
  title: string
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

/** Match public site services rhythm */
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = '',
}: AdminPageHeaderProps) {
  return (
    <header
      className={`services-title-wrap mb-8 flex flex-col gap-4 md:mb-10 lg:flex-row lg:items-end lg:justify-between ${className}`}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b5344]">{eyebrow}</p>
        ) : null}
        <h1 className="services-title !text-[clamp(1.75rem,4.2vw,3.25rem)] !leading-[1.08]">{title}</h1>
        {description ? (
          <div className="service-card-text mt-3 max-w-2xl text-[17px] opacity-[0.88]">{description}</div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  )
}
