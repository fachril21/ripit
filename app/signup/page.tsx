'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signup } from './actions'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  if (state?.sent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-bold">Cek email kamu</h1>
        <p className="max-w-sm text-sm text-neutral-400">
          Kami sudah kirim link konfirmasi. Klik link itu untuk mulai dapat 300 coin + 5 pack gratis.
        </p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Daftar RipIt</h1>
          <p className="text-sm text-neutral-400">300 coin + 5 pack gratis langsung pas daftar.</p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="w-full rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {pending ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-white underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  )
}
