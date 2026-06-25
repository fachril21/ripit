'use client'

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { isHoloTier, tierGlowColor, tierLabel } from '@/lib/packs/tier'
import { CardBackPlaceholder } from '@/components/collection/card-back-placeholder'
import type { BinderCardEntry } from '@/lib/collection/types'
import '@/components/packs/reveal/holo.css'

type CardDetailModalProps = {
  card: BinderCardEntry
  onClose: () => void
}

type Variant = 'normal' | 'holo' | 'reverse'

const VARIANT_LABELS: Record<Variant, string> = {
  normal: 'Normal',
  holo: 'Holo',
  reverse: 'Reverse',
}

export function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const ownedVariants = (['normal', 'holo', 'reverse'] as Variant[]).filter(
    (variant) => card[`owned_${variant}`] > 0,
  )
  const [activeVariant, setActiveVariant] = useState<Variant>(ownedVariants[0] ?? 'normal')
  const isOwned = ownedVariants.length > 0
  const isHolo = activeVariant === 'holo' && isHoloTier(card.tier)
  const glowColor = tierGlowColor(card.tier) ?? '#ffffff'

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    cardRef.current?.style.setProperty('--holo-color', glowColor)
  }, [glowColor])

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isHolo) return
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = ((event.clientX - rect.left) / rect.width) * 100
    const py = ((event.clientY - rect.top) / rect.height) * 100
    el.style.setProperty('--pointer-x', `${px}%`)
    el.style.setProperty('--pointer-y', `${py}%`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          ref={cardRef}
          data-holo-active={isHolo}
          onPointerMove={handlePointerMove}
          className="holo-card relative aspect-[5/7] overflow-hidden rounded-lg border border-neutral-800"
        >
          {isOwned && card.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.image_url} alt={card.name} className="h-full w-full object-contain" />
          ) : (
            <CardBackPlaceholder localId={card.local_id} />
          )}
          <div className="holo-card__shine" />
          <div className="holo-card__sweep" />
        </div>

        {ownedVariants.length > 1 && (
          <div className="mt-3 flex gap-2">
            {ownedVariants.map((variant) => (
              <button
                key={variant}
                type="button"
                onClick={() => setActiveVariant(variant)}
                className={
                  activeVariant === variant
                    ? 'rounded-md border border-neutral-500 px-2 py-1 text-xs font-medium'
                    : 'rounded-md border border-neutral-800 px-2 py-1 text-xs text-neutral-500'
                }
              >
                {VARIANT_LABELS[variant]} x{card[`owned_${variant}`]}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 space-y-1">
          <p className="font-semibold">{card.name}</p>
          <p className="text-xs text-neutral-500">Rarity: {tierLabel(card.tier)}</p>
          {card.rarity_raw_en && <p className="text-xs text-neutral-500">{card.rarity_raw_en}</p>}
          {card.illustrator && (
            <p className="text-xs text-neutral-500">Ilustrator: {card.illustrator}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-md border border-neutral-700 px-3 py-1.5 text-sm font-medium"
        >
          Tutup
        </button>
      </div>
    </div>
  )
}
