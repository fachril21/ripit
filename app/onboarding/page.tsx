import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from './onboarding-form'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', auth.user.id)
    .single()

  if (profile?.username) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Selamat datang di RipIt!</h1>
          <p className="text-sm text-neutral-400">
            Kamu baru dapat <span className="font-semibold text-white">300 coin</span> +{' '}
            <span className="font-semibold text-white">5 pack gratis</span>. Set username dulu
            buat lanjut ke dashboard.
          </p>
        </div>

        <OnboardingForm />
      </div>
    </main>
  )
}
