import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BinderGrid } from '@/components/collection/binder-grid'
import type { BinderCardEntry } from '@/lib/collection/types'

export const dynamic = 'force-dynamic'

type CardRow = {
  id: string
  local_id: string
  name: string
  image_url: string | null
  rarity_raw_en: string | null
  tier: string
  illustrator: string | null
}

type DevSetCardsPageProps = {
  params: Promise<{ setId: string }>
}

export default async function DevSetCardsPage({ params }: DevSetCardsPageProps) {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const { setId } = await params
  const supabase = await createClient()

  const [{ data: set, error: setError }, { data: cards, error: cardsError }] = await Promise.all([
    supabase.from('sets').select('id, name').eq('id', setId).single(),
    supabase
      .from('cards')
      .select('id, local_id, name, image_url, rarity_raw_en, tier, illustrator')
      .eq('set_id', setId)
      .order('local_id'),
  ])

  if (setError || !set) {
    redirect('/dev/cards')
  }
  if (cardsError || !cards) {
    throw new Error('Gagal memuat daftar kartu.')
  }

  const binderCards: BinderCardEntry[] = (cards as CardRow[]).map((card) => ({
    card_id: card.id,
    local_id: card.local_id,
    name: card.name,
    tier: card.tier,
    image_url: card.image_url,
    rarity_raw_en: card.rarity_raw_en,
    illustrator: card.illustrator,
    owned_normal: 1,
    owned_holo: 0,
    owned_reverse: 0,
  }))

  return (
    <main className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">[DEV] {set.name}</h1>
          <p className="text-xs text-amber-400">{binderCards.length} kartu — tanpa memperhatikan kepemilikan.</p>
        </div>
        <Link href="/dev/cards" className="text-sm text-neutral-400 underline">
          Kembali
        </Link>
      </div>

      {binderCards.length === 0 ? (
        <p className="text-sm text-neutral-400">Set ini belum memiliki kartu.</p>
      ) : (
        <BinderGrid cards={binderCards} />
      )}
    </main>
  )
}
