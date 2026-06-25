import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/dashboard/topbar'
import { DuplicatesList } from '@/components/duplicates/duplicates-list'
import type { DashboardStats } from '@/lib/economy/types'
import type { DuplicateEntry } from '@/lib/duplicates/types'

export default async function DuplicatesPage() {
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

  const [{ data: dashboard, error: dashboardError }, { data: duplicates, error: duplicatesError }] =
    await Promise.all([supabase.rpc('get_dashboard'), supabase.rpc('get_duplicates')])

  if (dashboardError || !dashboard) {
    throw new Error('Gagal memuat dashboard.')
  }
  if (duplicatesError) {
    throw new Error('Gagal memuat daftar dobel.')
  }

  const stats = dashboard as DashboardStats
  const entries = (duplicates ?? []) as DuplicateEntry[]

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
          <h1 className="text-xl font-bold">Kartu Dobel</h1>
          <Link href="/collection" className="text-sm text-neutral-400 underline">
            Kembali
          </Link>
        </div>

        <DuplicatesList entries={entries} />
      </div>
    </main>
  )
}
