import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/dashboard/topbar'
import { MissionList } from '@/components/missions/mission-list'
import type { DashboardStats } from '@/lib/economy/types'
import type { Mission } from '@/lib/missions/types'

export default async function MissionsPage() {
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

  const [{ data: dashboard, error: dashboardError }, { data: missions, error: missionsError }] =
    await Promise.all([supabase.rpc('get_dashboard'), supabase.rpc('list_missions')])

  if (dashboardError || !dashboard) {
    throw new Error('Gagal memuat dashboard.')
  }
  if (missionsError) {
    throw new Error('Gagal memuat misi.')
  }

  const stats = dashboard as DashboardStats
  const missionList = (missions ?? []) as Mission[]

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
          <h1 className="text-xl font-bold">Misi</h1>
          <Link href="/dashboard" className="text-sm text-neutral-400 underline">
            Kembali
          </Link>
        </div>

        <MissionList missions={missionList} />
      </div>
    </main>
  )
}
