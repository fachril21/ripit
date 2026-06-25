import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/dashboard/topbar'
import { LeaderboardList } from '@/components/leaderboard/leaderboard-list'
import type { DashboardStats } from '@/lib/economy/types'
import type { LeaderboardEntry } from '@/lib/leaderboard/types'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', auth.user.id)
    .single()

  if (!profile?.username) {
    redirect('/onboarding')
  }

  const [{ data: dashboard, error: dashboardError }, { data: leaderboard, error: leaderboardError }] =
    await Promise.all([supabase.rpc('get_dashboard'), supabase.rpc('get_leaderboard')])

  if (dashboardError || !dashboard) {
    throw new Error('Gagal memuat dashboard.')
  }
  if (leaderboardError) {
    throw new Error('Gagal memuat leaderboard.')
  }

  const stats = dashboard as DashboardStats
  const entries = (leaderboard ?? []) as LeaderboardEntry[]

  return (
    <main className="min-h-screen">
      <Topbar
        username={profile.username}
        coins={stats.coins}
        dust={stats.dust}
        freePacksLeft={stats.free_packs_left}
        streakCount={stats.streak_count}
        streakFreezes={stats.streak_freezes}
      />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">Leaderboard</h1>
          <Link href="/dashboard" className="text-sm text-neutral-400 underline">
            Kembali
          </Link>
        </div>

        <LeaderboardList entries={entries} currentUserId={auth.user.id} />
      </div>
    </main>
  )
}
