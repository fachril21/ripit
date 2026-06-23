import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/dashboard/topbar'

type DashboardRpc = {
  coins: number
  dust: number
  free_packs_left: number
  streak_count: number
  streak_freezes: number
}

type DailyCheckinRpc = {
  streak_count: number
  free_packs_left: number
  coins: number
  coin_gain: number
}

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

  const { data: checkin } = await supabase.rpc('daily_checkin')
  const { data: dashboard, error } = await supabase.rpc('get_dashboard')

  if (error || !dashboard) {
    throw new Error('Gagal memuat dashboard.')
  }

  const stats = dashboard as DashboardRpc
  const dailyReward = checkin as DailyCheckinRpc | null

  return (
    <main className="min-h-screen">
      <Topbar
        username={profile.username}
        coins={stats.coins}
        dust={stats.dust}
        freePacksLeft={stats.free_packs_left}
        streakCount={stats.streak_count}
      />

      <div className="p-6">
        {dailyReward && dailyReward.coin_gain > 0 && (
          <div className="mb-6 rounded-md bg-amber-500/15 px-4 py-3 text-sm text-amber-300 ring-1 ring-amber-500/30">
            Login harian: +{dailyReward.coin_gain} coin (streak {dailyReward.streak_count}🔥), free
            pack diisi ulang.
          </div>
        )}

        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Pack opening, binder, dan misi belum tersedia di epic ini.
        </p>
      </div>
    </main>
  )
}
