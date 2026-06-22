import { createClient } from '@/lib/supabase/server'

/**
 * Health-check fondasi (E1):
 * - Konfirmasi env Supabase ke-load.
 * - Konfirmasi client server bisa diinisialisasi & memanggil Supabase.
 *   (Belum ada tabel sampai E2, jadi cukup cek sesi auth.)
 */
export default async function Home() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isPlaceholder = !url || url.includes('placeholder')

  let connection: 'ok' | 'placeholder' | 'error' = 'error'
  let detail = ''

  if (isPlaceholder) {
    connection = 'placeholder'
    detail =
      'Isi .env.local dengan kredensial Supabase asli, lalu restart dev server.'
  } else {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.getSession()
      connection = error ? 'error' : 'ok'
      detail = error ? error.message : 'Supabase client terhubung.'
    } catch (e) {
      connection = 'error'
      detail = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  const badge = {
    ok: { label: 'TERHUBUNG', color: 'bg-green-500/15 text-green-400 ring-green-500/30' },
    placeholder: { label: 'PLACEHOLDER', color: 'bg-amber-500/15 text-amber-400 ring-amber-500/30' },
    error: { label: 'ERROR', color: 'bg-red-500/15 text-red-400 ring-red-500/30' },
  }[connection]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">RipIt</h1>
        <p className="text-sm text-neutral-400">
          Pokémon TCG Pack Opening Simulator — fondasi (E1)
        </p>
      </div>

      <div
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ring-1 ${badge.color}`}
      >
        Supabase: {badge.label}
      </div>

      <p className="max-w-sm text-sm text-neutral-500">{detail}</p>
    </main>
  )
}
