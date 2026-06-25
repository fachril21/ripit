'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { claimMission } from '@/app/missions/actions'
import { formatNumber } from '@/lib/format'
import type { Mission } from '@/lib/missions/types'

type MissionCardProps = {
  mission: Mission
}

export function MissionCard({ mission }: MissionCardProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rewardGain, setRewardGain] = useState<number | null>(null)

  const progressPct = Math.min(100, Math.round((mission.progress / mission.goal_target) * 100))

  async function handleClaim() {
    setIsPending(true)
    setError(null)

    const response = await claimMission(mission.id)
    setIsPending(false)

    if ('error' in response) {
      setError(response.error)
      return
    }

    setRewardGain(response.result.reward_coins)
    router.refresh()
  }

  return (
    <li className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{mission.description}</p>
          <p className="text-xs text-neutral-500">
            {mission.progress}/{mission.goal_target} &middot; +{formatNumber(mission.reward_coins)} 🪙
          </p>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>

        {mission.claimed ? (
          <span className="text-xs font-medium text-neutral-500">Diklaim ✓</span>
        ) : mission.completed ? (
          <div className="relative">
            <button
              type="button"
              disabled={isPending}
              onClick={handleClaim}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
            >
              {isPending ? 'Memproses…' : 'Klaim'}
            </button>
            {rewardGain !== null && (
              <span className="absolute -top-5 right-0 text-xs font-bold text-amber-400">
                +{formatNumber(rewardGain)} 🪙
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-neutral-500">Belum selesai</span>
        )}
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-amber-500 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </li>
  )
}
