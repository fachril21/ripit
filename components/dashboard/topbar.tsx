import { logout } from '@/lib/auth/actions'

type TopbarProps = {
  username: string
  coins: number
  dust: number
  freePacksLeft: number
  streakCount: number
}

export function Topbar({ username, coins, dust, freePacksLeft, streakCount }: TopbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
      <div className="flex items-center gap-6 text-sm">
        <span className="font-semibold">{username}</span>
        <span title="Coin">🪙 {coins}</span>
        <span title="Dust">✨ {dust}</span>
        <span title="Free pack hari ini">📦 {freePacksLeft}</span>
        <span title="Streak login">🔥 {streakCount}</span>
      </div>

      <form action={logout}>
        <button type="submit" className="text-sm text-neutral-400 underline">
          Keluar
        </button>
      </form>
    </header>
  )
}
