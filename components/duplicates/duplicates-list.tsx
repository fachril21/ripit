'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { dismantleCard } from '@/app/collection/duplicates/actions'
import { DuplicateRow } from '@/components/duplicates/duplicate-row'
import { dismantleValue } from '@/lib/economy/dust'
import { formatNumber } from '@/lib/format'
import type { DuplicateEntry } from '@/lib/duplicates/types'

type DuplicatesListProps = {
  entries: DuplicateEntry[]
}

export function DuplicatesList({ entries }: DuplicatesListProps) {
  const router = useRouter()
  const [isConfirmingBulk, setIsConfirmingBulk] = useState(false)
  const [isBulkPending, setIsBulkPending] = useState(false)
  const [bulkError, setBulkError] = useState<string | null>(null)

  const totalBulkDust = entries.reduce(
    (sum, entry) => sum + dismantleValue(entry.tier) * (entry.quantity - 1),
    0,
  )

  async function handleConfirmBulk() {
    setIsBulkPending(true)
    setBulkError(null)

    for (const entry of entries) {
      const spare = entry.quantity - 1
      if (spare < 1) continue
      const response = await dismantleCard(entry.card_id, entry.variant, spare)
      if ('error' in response) {
        setBulkError(`${entry.name}: ${response.error}`)
        setIsBulkPending(false)
        setIsConfirmingBulk(false)
        router.refresh()
        return
      }
    }

    setIsBulkPending(false)
    setIsConfirmingBulk(false)
    router.refresh()
  }

  if (entries.length === 0) {
    return <p className="text-sm text-neutral-400">Belum ada kartu dobel.</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 p-3">
        <div>
          <p className="text-sm font-medium">Lebur semua dobel</p>
          <p className="text-xs text-neutral-500">
            Melebur seluruh spare kartu &middot; +{formatNumber(totalBulkDust)} dust
          </p>
          {bulkError && <p className="mt-1 text-xs text-red-400">{bulkError}</p>}
        </div>

        {isConfirmingBulk ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isBulkPending}
              onClick={handleConfirmBulk}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
            >
              {isBulkPending ? 'Memproses…' : 'Ya, lebur semua'}
            </button>
            <button
              type="button"
              disabled={isBulkPending}
              onClick={() => setIsConfirmingBulk(false)}
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs"
            >
              Batal
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingBulk(true)}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-medium hover:border-neutral-500"
          >
            Lebur semua
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {entries.map((entry) => (
          <DuplicateRow key={`${entry.card_id}:${entry.variant}`} entry={entry} />
        ))}
      </ul>
    </div>
  )
}
