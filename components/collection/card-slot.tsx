import { CardBackPlaceholder } from '@/components/collection/card-back-placeholder'
import type { BinderCardEntry } from '@/lib/collection/types'

type CardSlotProps = {
  card: BinderCardEntry
  onSelect: () => void
}

export function CardSlot({ card, onSelect }: CardSlotProps) {
  const ownedTotal = card.owned_normal + card.owned_holo + card.owned_reverse
  const isOwned = ownedTotal > 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        isOwned
          ? 'group relative block aspect-5/7 w-full rounded-lg transition-transform duration-200 ease-out will-change-transform hover:z-10 hover:scale-110 hover:drop-shadow-2xl focus-visible:z-10 focus-visible:scale-110'
          : 'group relative block aspect-5/7 w-full overflow-hidden rounded-lg'
      }
    >
      {isOwned && card.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image_url}
          alt={card.name}
          className="h-full w-full rounded-lg object-contain transition-[filter] duration-200 group-hover:brightness-110"
        />
      ) : (
        <CardBackPlaceholder localId={card.local_id} />
      )}

      {isOwned && card.owned_holo > 0 && (
        <span className="absolute right-1 top-1 rounded bg-black/70 px-1 text-[10px] font-semibold text-amber-300">
          HOLO
        </span>
      )}

      {isOwned && ownedTotal > 1 && (
        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-neutral-200">
          x{ownedTotal}
        </span>
      )}
    </button>
  )
}
