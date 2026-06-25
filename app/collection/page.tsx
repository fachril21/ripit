import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/dashboard/topbar'
import { SetGalleryCard } from '@/components/collection/set-gallery-card'
import type { DashboardStats } from '@/lib/economy/types'
import type { CollectionSetProgress, CollectionSetSummary, CollectionSetWithProgress } from '@/lib/collection/types'

export default async function CollectionPage() {
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

  const [{ data: dashboard, error: dashboardError }, { data: sets, error: setsError }, { data: progress }] =
    await Promise.all([
      supabase.rpc('get_dashboard'),
      supabase.from('sets').select('id, name, logo_url, symbol_url, count_total').order('name'),
      supabase.rpc('get_my_sets'),
    ])

  if (dashboardError || !dashboard) {
    throw new Error('Gagal memuat dashboard.')
  }
  if (setsError || !sets) {
    throw new Error('Gagal memuat daftar set.')
  }

  const stats = dashboard as DashboardStats
  const progressBySetId = new Map(
    ((progress ?? []) as CollectionSetProgress[]).map((row) => [row.set_id, row]),
  )

  const setsWithProgress: CollectionSetWithProgress[] = (sets as CollectionSetSummary[]).map((set) => {
    const row = progressBySetId.get(set.id)
    return {
      ...set,
      owned_count: row?.owned_count ?? 0,
      completion_pct: row?.completion_pct ?? 0,
    }
  })

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
          <h1 className="text-xl font-bold">Koleksi</h1>
          <Link href="/dashboard" className="text-sm text-neutral-400 underline">
            Kembali
          </Link>
        </div>

        {setsWithProgress.length === 0 ? (
          <p className="text-sm text-neutral-400">Belum ada set yang tersedia.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {setsWithProgress.map((set) => (
              <li key={set.id}>
                <SetGalleryCard set={set} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
