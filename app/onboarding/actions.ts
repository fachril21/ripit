'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const UsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { error: 'Username minimal 3 karakter.' })
    .max(20, { error: 'Username maksimal 20 karakter.' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      error: 'Username hanya boleh huruf, angka, dan underscore.',
    }),
})

export type SetUsernameState = {
  error?: string
} | undefined

const UNIQUE_VIOLATION = '23505'

export async function setUsername(
  _state: SetUsernameState,
  formData: FormData,
): Promise<SetUsernameState> {
  const parsed = UsernameSchema.safeParse({ username: formData.get('username') })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Username tidak valid.' }
  }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username: parsed.data.username })
    .eq('id', auth.user.id)
    .is('username', null)

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: 'Username sudah dipakai. Coba yang lain.' }
    }
    return { error: 'Gagal menyimpan username. Coba lagi.' }
  }

  redirect('/dashboard')
}
