import Link from 'next/link'
import { logout } from '@/lib/auth/actions'
import { WalletBalance } from '@/components/economy/wallet-balance'
import { StreakBadge } from '@/components/economy/streak-badge'
import { FreePackBadge } from '@/components/economy/free-pack-badge'
import { MissionNavBadge } from '@/components/economy/mission-nav-badge'

type TopbarProps = {
  username: string
  coins: number
  dust: number
  freePacksLeft: number
  streakCount: number
  streakFreezes: number
}

export function Topbar({
  username,
  coins,
  dust,
  freePacksLeft,
  streakCount,
  streakFreezes,
}: TopbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold">{username}</span>
        <WalletBalance coins={coins} dust={dust} />
        <FreePackBadge freePacksLeft={freePacksLeft} />
        <StreakBadge streakCount={streakCount} streakFreezes={streakFreezes} />
      </div>

      <div className="flex items-center gap-4">
        <MissionNavBadge />
        <Link href="/collection" className="text-sm text-neutral-400 underline">
          Koleksi
        </Link>
        <Link href="/collection/duplicates" className="text-sm text-neutral-400 underline">
          Dobel
        </Link>
        <Link href="/leaderboard" className="text-sm text-neutral-400 underline">
          Leaderboard
        </Link>
        <Link href="/dashboard/coins" className="text-sm text-neutral-400 underline">
          Riwayat coin
        </Link>
        <form action={logout}>
          <button type="submit" className="text-sm text-neutral-400 underline">
            Keluar
          </button>
        </form>
      </div>
    </header>
  )
}
