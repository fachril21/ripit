'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { mapDismantleError, mapCraftError } from '@/lib/duplicates/errors'
import type { CardVariant, CraftActionResult, DismantleActionResult } from '@/lib/duplicates/types'

const CardVariantSchema = z.enum(['normal', 'holo', 'reverse'])

const DismantleInput = z.object({
  cardId: z.string().min(1),
  variant: CardVariantSchema,
  qty: z.number().int().min(1),
})

const CraftInput = z.object({
  cardId: z.string().min(1),
  variant: CardVariantSchema,
})

export async function dismantleCard(
  cardId: string,
  variant: CardVariant,
  qty: number,
): Promise<DismantleActionResult> {
  const parsed = DismantleInput.safeParse({ cardId, variant, qty })
  if (!parsed.success) {
    return { error: 'Permintaan tidak valid.' }
  }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return { error: mapDismantleError('not authenticated') }
  }

  const { data, error } = await supabase.rpc('dismantle_card', {
    p_card_id: parsed.data.cardId,
    p_variant: parsed.data.variant,
    p_qty: parsed.data.qty,
  })

  if (error) {
    return { error: mapDismantleError(error.message) }
  }

  return { result: data }
}

export async function craftCard(cardId: string, variant: CardVariant): Promise<CraftActionResult> {
  const parsed = CraftInput.safeParse({ cardId, variant })
  if (!parsed.success) {
    return { error: 'Permintaan tidak valid.' }
  }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return { error: mapCraftError('not authenticated') }
  }

  const { data, error } = await supabase.rpc('craft_card', {
    p_card_id: parsed.data.cardId,
    p_variant: parsed.data.variant,
  })

  if (error) {
    return { error: mapCraftError(error.message) }
  }

  return { result: data }
}
