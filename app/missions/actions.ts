'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { mapClaimMissionError } from '@/lib/missions/errors'
import type { ClaimMissionActionResult } from '@/lib/missions/types'

const ClaimMissionInput = z.object({
  userMissionId: z.string().uuid(),
})

export async function claimMission(userMissionId: string): Promise<ClaimMissionActionResult> {
  const parsed = ClaimMissionInput.safeParse({ userMissionId })
  if (!parsed.success) {
    return { error: 'Permintaan tidak valid.' }
  }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return { error: mapClaimMissionError('not authenticated') }
  }

  const { data, error } = await supabase.rpc('claim_mission', {
    p_user_mission_id: parsed.data.userMissionId,
  })

  if (error) {
    return { error: mapClaimMissionError(error.message) }
  }

  return { result: data }
}
