'use client'

import { useState } from 'react'
import { streakBonusCoin } from '@/lib/economy/labels'
import type { DailyCheckinResult } from '@/lib/economy/types'

type DailyRewardModalProps = {
  reward: DailyCheckinResult
}

export function DailyRewardModal({ reward }: DailyRewardModalProps) {
  const [isOpen, setIsOpen] = useState(true)
  const bonus = streakBonusCoin(reward.streak_count)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-lg border border-amber-500/30 bg-neutral-900 p-6 text-center">
        <p className="text-xs tracking-wide text-amber-400 uppercase">Reward Harian</p>
        <p className="mt-3 text-3xl font-black text-amber-300">+{reward.coin_gain} 🪙</p>
        <p className="mt-2 text-sm text-neutral-400">
          Streak {reward.streak_count} hari beruntun
          {bonus > 0 && ` (base 50 + bonus ${bonus})`}
        </p>
        <p className="mt-1 text-sm text-neutral-400">
          Pack gratis diisi ulang: {reward.free_packs_left}
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="mt-5 w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-black"
        >
          Ambil
        </button>
      </div>
    </div>
  )
}
