'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getTrustedSiteUrl } from '@/lib/auth/site-url'

const SignupSchema = z.object({
  email: z.email({ error: 'Email tidak valid.' }).trim(),
  password: z
    .string()
    .min(8, { error: 'Password minimal 8 karakter.' })
    .regex(/[a-zA-Z]/, { error: 'Password harus mengandung huruf.' })
    .regex(/[0-9]/, { error: 'Password harus mengandung angka.' }),
})

export type SignupState = {
  error?: string
  sent?: boolean
} | undefined

export async function signup(_state: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = SignupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data tidak valid.' }
  }

  const supabase = await createClient()
  const siteUrl = await getTrustedSiteUrl()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    if (error.code === 'user_already_exists') {
      return { error: 'Email sudah terdaftar. Coba masuk.' }
    }
    return { error: 'Gagal mendaftar. Coba lagi.' }
  }

  return { sent: true }
}
