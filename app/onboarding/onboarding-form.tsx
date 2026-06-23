'use client'

import { useActionState } from 'react'
import { setUsername } from './actions'

export function OnboardingForm() {
  const [state, action, pending] = useActionState(setUsername, undefined)

  return (
    <form action={action} className="space-y-4 text-left">
      <div className="space-y-1">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          minLength={3}
          maxLength={20}
          autoComplete="username"
          className="w-full rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        {pending ? 'Menyimpan...' : 'Lanjut ke Dashboard'}
      </button>
    </form>
  )
}
