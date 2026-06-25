import { formatNumber } from '@/lib/format'
import type { LeaderboardEntry } from '@/lib/leaderboard/types'

type LeaderboardListProps = {
  entries: LeaderboardEntry[]
  currentUserId: string
}

function rankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-amber-500 text-black'
  if (rank === 2) return 'bg-neutral-300 text-black'
  if (rank === 3) return 'bg-amber-800 text-amber-100'
  return 'bg-neutral-800 text-neutral-300'
}

export function LeaderboardList({ entries, currentUserId }: LeaderboardListProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-neutral-400">Belum ada data peringkat.</p>
  }

  return (
    <ol className="space-y-2">
      {entries.map((entry, index) => {
        const rank = index + 1
        const isCurrentUser = entry.user_id === currentUserId
        const displayName = entry.username ?? 'Pemain'

        return (
          <li
            key={entry.user_id}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              isCurrentUser
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-neutral-800 bg-neutral-950'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankBadgeClass(rank)}`}
            >
              {rank}
            </span>

            {entry.avatar_url ? (
              <img
                src={entry.avatar_url}
                alt={displayName}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-neutral-300">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {displayName}
                {isCurrentUser && <span className="ml-2 text-xs text-amber-400">(Kamu)</span>}
              </p>
              <p className="text-xs text-neutral-500">
                {entry.sets_completed} set tamat
              </p>
            </div>

            <span className="shrink-0 text-sm font-semibold text-neutral-200">
              {formatNumber(entry.total_owned)} kartu
            </span>
          </li>
        )
      })}
    </ol>
  )
}
