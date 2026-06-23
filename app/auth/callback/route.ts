import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Tujuan redirect OAuth (Google) & link konfirmasi email (PKCE).
 * Menukar `code` jadi sesi, lalu lempar ke onboarding/dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback`)
}
