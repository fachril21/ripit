import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client untuk komponen browser (Client Components).
 * Hanya memakai anon key publik — TIDAK PERNAH service_role key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
