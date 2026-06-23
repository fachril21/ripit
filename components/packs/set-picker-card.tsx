'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { openPack } from '@/app/dashboard/packs/actions'
import { formatNumber } from '@/lib/format'
import type { PackSource, SetWithProgress } from '@/lib/packs/types'

type SetPickerCardProps = {
  set: SetWithProgress
  coins: number
  freePacksLeft: number
}

export function SetPickerCard({ set, coins, freePacksLeft }: SetPickerCardProps) {
  const router = useRouter()
  const idemKeyRef = useRef<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const canOpenFree = freePacksLeft > 0
  const canOpenCoin = coins >= 100

  function handleOpen(source: PackSource) {
    if (!idemKeyRef.current) {
      idemKeyRef.current = crypto.randomUUID()
    }
    const idemKey = idemKeyRef.current
    setError(null)

    startTransition(async () => {
      try {
        const outcome = await openPack(set.id, source, idemKey)

        if ('error' in outcome) {
          setError(outcome.error)
          return
        }

        idemKeyRef.current = null
        router.push(`/dashboard/packs/result/${outcome.result.opening_id}`)
      } catch {
        setError('Gagal terhubung ke server. Coba lagi.')
      }
    })
  }

  return (
    <li className="rounded-md border border-neutral-800 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{set.name}</p>
          <p className="text-xs text-neutral-500">
            {formatNumber(set.owned_count)}/{formatNumber(set.count_total)} kartu &middot; {set.completion_pct}%
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={!canOpenFree || isPending}
          onClick={() => handleOpen('free')}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:text-neutral-500"
        >
          Buka gratis
        </button>
        <button
          type="button"
          disabled={!canOpenCoin || isPending}
          onClick={() => handleOpen('coin')}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:text-neutral-500"
        >
          Buka (100 coin)
        </button>
        {isPending && <span className="text-xs text-neutral-500">Membuka pack...</span>}
      </div>

      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
    </li>
  )
}
