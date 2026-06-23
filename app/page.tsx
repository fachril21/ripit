import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (auth.user) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">RipIt</h1>
        <p className="text-sm text-neutral-400">Pokémon TCG Pack Opening Simulator</p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          Daftar
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-semibold"
        >
          Masuk
        </Link>
      </div>
    </main>
  )
}
