import { streakBonusCoin } from '@/lib/economy/labels'

type StreakBadgeProps = {
  streakCount: number
  streakFreezes: number
}

export function StreakBadge({ streakCount, streakFreezes }: StreakBadgeProps) {
  const bonus = streakBonusCoin(streakCount)

  return (
    <div
      className="flex items-center gap-1 text-sm"
      title={`Streak ${streakCount} hari — bonus login +${bonus} coin`}
    >
      <span>🔥</span>
      <span className="font-semibold">{streakCount}</span>
      <span className="text-neutral-400">hari</span>
      {streakFreezes > 0 && (
        <span className="ml-1 text-xs text-sky-400" title="Streak freeze tersisa">
          🧊{streakFreezes}
        </span>
      )}
    </div>
  )
}
