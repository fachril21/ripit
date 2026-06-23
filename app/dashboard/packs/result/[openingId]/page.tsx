import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PackRevealExperience } from '@/components/packs/reveal/pack-reveal-experience'
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

  const { data: set } = await supabase.from('sets').select('name').eq('id', pull.set_id).single()

  return <PackRevealExperience pull={pull} setName={set?.name ?? pull.set_id} />
}
