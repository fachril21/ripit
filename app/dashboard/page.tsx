import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/dashboard/topbar'
import { DailyRewardModal } from '@/components/economy/daily-reward-modal'
import type { DailyCheckinResult, DashboardStats } from '@/lib/economy/types'

export default async function DashboardPage() {
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

  const { data: checkin, error: checkinError } = await supabase.rpc('daily_checkin')
  if (checkinError) {
    console.error('daily_checkin failed:', checkinError.message)
  }

  const { data: dashboard, error } = await supabase.rpc('get_dashboard')

  if (error || !dashboard) {
    throw new Error('Gagal memuat dashboard.')
  }

  const stats = dashboard as DashboardStats
  const dailyReward = checkin as DailyCheckinResult | null

  return (
    <main className="min-h-screen">
      {dailyReward && dailyReward.coin_gain > 0 && <DailyRewardModal reward={dailyReward} />}

      <Topbar
        username={profile.username}
        coins={stats.coins}
        dust={stats.dust}
        freePacksLeft={stats.free_packs_left}
        streakCount={stats.streak_count}
        streakFreezes={stats.streak_freezes}
      />

      <div className="p-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-400">Misi belum tersedia di epic ini.</p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/dashboard/packs"
            className="inline-block rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium"
          >
            Buka Pack
          </Link>
          <Link
            href="/collection"
            className="inline-block rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium"
          >
            Koleksi
          </Link>
        </div>
      </div>
    </main>
  )
}
