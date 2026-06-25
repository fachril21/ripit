import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Mission } from '@/lib/missions/types'

export async function MissionNavBadge() {
  const supabase = await createClient()
  const { data } = await supabase.rpc('list_missions')
  const missions = (data ?? []) as Mission[]
  const claimableCount = missions.filter((mission) => mission.completed && !mission.claimed).length

  return (
    <Link href="/missions" className="relative text-sm text-neutral-400 underline">
      Misi
      {claimableCount > 0 && (
        <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
          {claimableCount}
        </span>
      )}
    </Link>
  )
}
