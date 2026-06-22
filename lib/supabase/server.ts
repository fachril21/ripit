import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client untuk Server Components, Route Handlers, & Server Actions.
 * Cookie-based session (RSC-safe). Hanya memakai anon key publik.
 *
 * Catatan: di Server Component murni, set/remove cookie bisa dilempar
 * Next.js — di-catch agar aman; refresh sesi ditangani middleware (E3).
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Dipanggil dari Server Component — abaikan; middleware (E3)
            // yang akan me-refresh sesi.
          }
        },
      },
    },
  )
}
