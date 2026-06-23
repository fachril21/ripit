'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login, loginWithGoogle } from './actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Masuk ke RipIt</h1>
          <p className="text-sm text-neutral-400">Lanjutkan brewek pack-mu.</p>
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
              autoComplete="current-password"
              className="w-full rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {pending ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="h-px flex-1 bg-neutral-800" />
          atau
          <span className="h-px flex-1 bg-neutral-800" />
        </div>

        <form action={loginWithGoogle}>
          <button
            type="submit"
            className="w-full rounded-md border border-neutral-700 px-3 py-2 text-sm font-semibold"
          >
            Lanjutkan dengan Google
          </button>
        </form>

        <p className="text-center text-sm text-neutral-400">
          Belum punya akun?{' '}
          <Link href="/signup" className="font-semibold text-white underline">
            Daftar
          </Link>
        </p>
      </div>
    </main>
  )
}
