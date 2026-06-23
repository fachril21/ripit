import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PullResult } from '@/lib/packs/types'

type PackResultPageProps = {
  params: Promise<{ openingId: string }>
}

export default async function PackResultPage({ params }: PackResultPageProps) {
  const { openingId } = await params
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const { data, error } = await supabase.rpc('get_pull', { p_opening_id: openingId })

  if (error || !data) {
    return (
      <main className="min-h-screen p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">Hasil Buka Pack</h1>
          <Link href="/dashboard/packs" className="text-sm text-neutral-400 underline">
            Kembali
          </Link>
        </div>
        <p className="text-sm text-neutral-400">Hasil buka pack tidak ditemukan.</p>
      </main>
    )
  }

  const pull = data as PullResult

  return (
    <main className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Hasil Buka Pack</h1>
        <Link href="/dashboard/packs" className="text-sm text-neutral-400 underline">
          Buka pack lagi
        </Link>
      </div>

      <p className="mb-4 text-sm text-neutral-400">
        Set {pull.set_id} &middot; sumber {pull.source === 'free' ? 'gratis' : '100 coin'}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {pull.cards.map((card) => (
          <div key={card.slot} className="rounded-md border border-neutral-800 p-2 text-center">
            {card.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.image_url} alt={card.name} className="mx-auto h-32 w-auto rounded" />
            ) : (
              <div className="flex h-32 items-center justify-center text-xs text-neutral-500">
                Tidak ada gambar
              </div>
            )}
            <p className="mt-2 text-xs font-medium">{card.name}</p>
            <p className="text-xs text-neutral-500">
              {card.tier} &middot; {card.variant}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
