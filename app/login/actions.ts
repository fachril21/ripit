'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getTrustedSiteUrl } from '@/lib/auth/site-url'

const LoginSchema = z.object({
  email: z.email({ error: 'Email tidak valid.' }).trim(),
  password: z.string().min(1, { error: 'Password wajib diisi.' }),
})

export type LoginState = {
  error?: string
} | undefined

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Email atau password tidak valid.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Email atau password salah.' }
  }

  redirect('/dashboard')
}

export async function loginWithGoogle(): Promise<void> {
  const supabase = await createClient()
  const siteUrl = await getTrustedSiteUrl()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error || !data.url) {
    redirect('/login?error=oauth')
  }

  redirect(data.url)
}
