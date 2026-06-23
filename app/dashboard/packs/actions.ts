'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { mapOpenPackError } from '@/lib/packs/errors'
import type { OpenPackActionResult, OpenPackResult, PackSource } from '@/lib/packs/types'

const OpenPackInput = z.object({
  setId: z.string().min(1),
  source: z.enum(['free', 'coin']),
  idemKey: z.string().uuid(),
})

export async function openPack(
  setId: string,
  source: PackSource,
  idemKey: string,
): Promise<OpenPackActionResult> {
  const parsed = OpenPackInput.safeParse({ setId, source, idemKey })
  if (!parsed.success) {
    return { error: 'Permintaan tidak valid.' }
  }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return { error: mapOpenPackError('not authenticated') }
  }

  const { data, error } = await supabase.rpc('open_pack', {
    p_set_id: parsed.data.setId,
    p_source: parsed.data.source,
    p_idem: parsed.data.idemKey,
  })

  if (error) {
    return { error: mapOpenPackError(error.message) }
  }

  return { result: data as OpenPackResult }
}
