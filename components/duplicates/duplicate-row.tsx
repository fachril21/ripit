'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { dismantleCard } from '@/app/collection/duplicates/actions'
import { tierLabel } from '@/lib/packs/tier'
import { dismantleValue } from '@/lib/economy/dust'
import { formatNumber } from '@/lib/format'
import type { DuplicateEntry } from '@/lib/duplicates/types'

type DuplicateRowProps = {
  entry: DuplicateEntry
}

export function DuplicateRow({ entry }: DuplicateRowProps) {
  const router = useRouter()
  const maxSpare = entry.quantity - 1
  const dustPerUnit = dismantleValue(entry.tier)
  const [qty, setQty] = useState(1)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalDust = dustPerUnit * qty

  function adjustQty(delta: number) {
    setQty((current) => Math.min(maxSpare, Math.max(1, current + delta)))
  }

  async function handleConfirmDismantle() {
    setIsPending(true)
    setError(null)
    const response = await dismantleCard(entry.card_id, entry.variant, qty)
    setIsPending(false)
    setIsConfirming(false)

    if ('error' in response) {
      setError(response.error)
      return
    }

    router.refresh()
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-900">
        {entry.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.image_url} alt={entry.name} className="h-full w-full object-contain" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{entry.name}</p>
        <p className="text-xs text-neutral-500">
          {tierLabel(entry.tier)} &middot; Spare: x{maxSpare} &middot; {dustPerUnit} dust/copy
        </p>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>

      {isConfirming ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-300">+{formatNumber(totalDust)} dust?</span>
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirmDismantle}
            className="rounded-md bg-amber-500 px-2 py-1 text-xs font-semibold text-black disabled:opacity-50"
          >
            {isPending ? 'Memproses…' : 'Ya, lebur'}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setIsConfirming(false)}
            className="rounded-md border border-neutral-700 px-2 py-1 text-xs"
          >
            Batal
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => adjustQty(-1)}
              disabled={qty <= 1}
              className="h-6 w-6 rounded border border-neutral-700 text-xs disabled:opacity-30"
            >
              -
            </button>
            <span className="w-6 text-center text-xs">{qty}</span>
            <button
              type="button"
              onClick={() => adjustQty(1)}
              disabled={qty >= maxSpare}
              className="h-6 w-6 rounded border border-neutral-700 text-xs disabled:opacity-30"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsConfirming(true)}
            className="rounded-md border border-neutral-700 px-3 py-1 text-xs font-medium hover:border-neutral-500"
          >
            Lebur
          </button>
        </div>
      )}
    </li>
  )
}
