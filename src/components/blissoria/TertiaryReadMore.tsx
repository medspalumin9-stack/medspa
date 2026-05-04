import Link from 'next/link'

const sharedClass =
  'group/tertiary inline-flex overflow-hidden h-[1.35rem] font-sans text-[15px] font-medium text-dark hover:text-tan transition-colors cursor-pointer bg-transparent border-0 p-0'

type TertiaryReadMoreProps =
  | { href: string; onClick?: undefined; label?: string; className?: string }
  | { href?: undefined; onClick: () => void; label?: string; className?: string }

export function TertiaryReadMore(props: TertiaryReadMoreProps) {
  const label = props.label ?? 'Read More'
  const extra = props.className ?? ''
  const inner = (
    <span className="bliss-tertiary-inner flex flex-col leading-[1.35rem] text-left">
      <span>{label}</span>
      <span>{label}</span>
    </span>
  )

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={`${sharedClass} ${extra}`}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={props.onClick} className={`${sharedClass} ${extra}`}>
      {inner}
    </button>
  )
}
