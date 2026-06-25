import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type SetRow = {
  id: string
  name: string
}

export default async function DevAllCardsPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const supabase = await createClient()

  const [{ data: sets, error: setsError }, { data: cardCounts, error: cardCountsError }] = await Promise.all([
    supabase.from('sets').select('id, name').order('name'),
    supabase.from('cards').select('set_id'),
  ])

  if (setsError || !sets) {
    throw new Error('Gagal memuat daftar set.')
  }
  if (cardCountsError || !cardCounts) {
    throw new Error('Gagal memuat jumlah kartu.')
  }

  const countBySetId = new Map<string, number>()
  for (const row of cardCounts as { set_id: string }[]) {
    countBySetId.set(row.set_id, (countBySetId.get(row.set_id) ?? 0) + 1)
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">[DEV] Semua Pack</h1>
          <p className="text-xs text-amber-400">
            Halaman developer sementara — pilih set untuk melihat seluruh kartunya, tanpa memperhatikan kepemilikan.
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-neutral-400 underline">
          Kembali
        </Link>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(sets as SetRow[]).map((set) => {
          const count = countBySetId.get(set.id) ?? 0
          return (
            <li key={set.id}>
              <Link
                href={`/dev/cards/${set.id}`}
                className="block rounded-lg border border-neutral-800 px-4 py-3 hover:border-neutral-600"
              >
                <p className="font-medium">{set.name}</p>
                <p className="text-xs text-neutral-500">{count} kartu</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
