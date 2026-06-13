'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { BLISSORIA_CARD_SIZES, blissoriaServiceThumbForIndex } from '@/lib/blissoria-card'
import { formatGhs } from '@/lib/format-currency'
import { cn } from '@/lib/utils'

type ServiceOption = {
  id: string
  name: string
  price: number
  durationMinutes: number
  description: string
  imageUrl?: string | null
}

function normalizeServices(raw: unknown): ServiceOption[] {
  if (!raw || typeof raw !== 'object' || !('services' in raw)) return []
  const list = (raw as { services: unknown }).services
  if (!Array.isArray(list)) return []
  return list
    .filter((s): s is Record<string, unknown> => !!s && typeof s === 'object')
    .map((s) => ({
      id: String(s.id ?? ''),
      name: String(s.name ?? 'Service'),
      price: Number(s.price ?? 0),
      durationMinutes: Number(s.durationMinutes ?? 0),
      description: typeof s.description === 'string' ? s.description : '',
      imageUrl: typeof s.imageUrl === 'string' ? s.imageUrl : undefined,
    }))
    .filter((s) => s.id.length > 0)
}

export function StepServiceSelect({
  onNext,
  preselectedId,
}: {
  onNext: (s: { id: string; name: string }) => void
  preselectedId?: string
}) {
  const [services, setServices] = useState<ServiceOption[]>([])
  const [selected, setSelected] = useState<string | null>(preselectedId || null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setFetchError(null)
    fetch('/api/services')
      .then((r) => {
        if (!r.ok) throw new Error('Bad response')
        return r.json()
      })
      .then((data) => {
        setServices(normalizeServices(data))
      })
      .catch(() => {
        setFetchError('We couldn’t load treatments. Check your connection and try again.')
        setServices([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (preselectedId) setSelected(preselectedId)
  }, [preselectedId])

  useEffect(() => {
    if (!preselectedId || services.length === 0) return
    if (!services.some((s) => s.id === preselectedId)) setSelected(null)
  }, [preselectedId, services])

  const handleContinue = () => {
    const s = services.find((x) => x.id === selected)
    if (!s) return
    onNext({ id: s.id, name: s.name })
  }

  return (
    <div>
      <h2 className="service-card-title !mb-2 !text-[1.65rem] md:!text-[1.85rem]">Choose your treatment</h2>
      <p className="service-card-text mb-8 !text-[15px] opacity-80">Select a service to see available times.</p>

      {fetchError && (
        <div className="mb-6 rounded-[var(--bliss-radius-m)] border border-[#1e211e]/15 bg-[#f4e6cd]/40 px-4 py-3 font-sans text-sm text-[#1e211e]">
          <p className="mb-2">{fetchError}</p>
          <button
            type="button"
            onClick={load}
            className="font-medium underline underline-offset-2 hover:opacity-80"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-[var(--bliss-radius-m)] bg-[#1e211e]/[0.06]"
            />
          ))}
        </div>
      ) : services.length === 0 ? (
        <p className="service-card-text opacity-75">
          No treatments are listed yet. If you just set up the site, run the database seed so services appear here.
          You can still call the studio to book.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((s, idx) => {
            const thumb = s.imageUrl?.trim()
            const fallback = blissoriaServiceThumbForIndex(idx)
            const isOn = selected === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s.id)}
                className={cn(
                  'service-card-wrap group/scard w-full !cursor-pointer border-2 border-transparent text-left transition-[box-shadow,border-color]',
                  isOn && 'border-[#1e211e] ring-2 ring-[#1e211e]/10'
                )}
              >
                <div className="service-card-image-wrap relative aspect-[4/3] w-full overflow-hidden rounded-[var(--bliss-radius-s)] bg-[#1e211e]/5">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      sizes={BLISSORIA_CARD_SIZES}
                      className="object-cover"
                    />
                  ) : (
                    <img
                      src={fallback.src}
                      srcSet={fallback.srcSet}
                      sizes={BLISSORIA_CARD_SIZES}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="service-card-content-wrapper !pt-3">
                  <p className="service-card-kicker">
                    {formatGhs(s.price)} · {s.durationMinutes} min
                  </p>
                  <div className="service-card-title-wrap">
                    <div className="service-card-title !text-[1.35rem] !leading-snug md:!text-[1.5rem]">{s.name}</div>
                  </div>
                  {s.description ? (
                    <div className="service-card-text-wrap !mb-2">
                      <p className="service-card-text line-clamp-2 !text-[15px] opacity-85">{s.description}</p>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-end">
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2',
                        isOn ? 'border-[#1e211e] bg-[#1e211e]' : 'border-[#1e211e]/25 bg-white'
                      )}
                      aria-hidden
                    >
                      {isOn ? <span className="h-2 w-2 rounded-full bg-[#f4e6cd]" /> : null}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <button
        type="button"
        disabled={!selected || services.length === 0}
        onClick={handleContinue}
        className="tertiary-button mt-8 hover:!bg-[#1e211e] hover:!text-[#f4e6cd] disabled:pointer-events-none disabled:opacity-35"
      >
        <span className="tertiary-button-text-wrap">
          <span className="tertiary-button-slide">
            <span className="tertiary-button-text">Continue</span>
            <span className="tertiary-button-text">Continue</span>
          </span>
        </span>
      </button>
    </div>
  )
}
