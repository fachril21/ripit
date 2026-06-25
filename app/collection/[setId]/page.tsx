import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/dashboard/topbar'
import { CompletionBar } from '@/components/collection/completion-bar'
import { BinderGrid } from '@/components/collection/binder-grid'
import { formatNumber } from '@/lib/format'
import type { DashboardStats } from '@/lib/economy/types'
import type { BinderData } from '@/lib/collection/types'

type CollectionSetPageProps = {
  params: Promise<{ setId: string }>
}

export default async function CollectionSetPage({ params }: CollectionSetPageProps) {
  const { setId } = await params
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

  const [{ data: dashboard, error: dashboardError }, { data: set, error: setError }, { data: binder, error: binderError }] =
    await Promise.all([
      supabase.rpc('get_dashboard'),
      supabase.from('sets').select('id, name').eq('id', setId).single(),
      supabase.rpc('get_set_binder', { p_set_id: setId }),
    ])

  if (dashboardError || !dashboard) {
    throw new Error('Gagal memuat dashboard.')
  }
  if (setError || !set) {
    redirect('/collection')
  }
  if (binderError || !binder) {
    throw new Error('Gagal memuat binder.')
  }

  const stats = dashboard as DashboardStats
  const binderData = binder as BinderData
  const progress = binderData.progress

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
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{set.name}</h1>
          <Link href="/collection" className="text-sm text-neutral-400 underline">
            Kembali
          </Link>
        </div>

        <div className="mb-6 max-w-md">
          <p className="mb-1.5 text-xs text-neutral-500">
            {formatNumber(progress?.owned_count ?? 0)}/{formatNumber(progress?.total_count ?? 0)} kartu &middot;{' '}
            {progress?.completion_pct ?? 0}%
          </p>
          <CompletionBar completionPct={progress?.completion_pct ?? 0} />
        </div>

        {binderData.cards.length === 0 ? (
          <p className="text-sm text-neutral-400">Set ini belum memiliki kartu.</p>
        ) : (
          <BinderGrid cards={binderData.cards} dust={stats.dust} />
        )}
      </div>
    </main>
  )
}
