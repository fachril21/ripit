export type CollectionSetProgress = {
  user_id: string
  set_id: string
  owned_count: number
  total_count: number
  completion_pct: number
  milestones_claimed: number[]
}

export type CollectionSetSummary = {
  id: string
  name: string
  logo_url: string | null
  symbol_url: string | null
  count_total: number
}

export type CollectionSetWithProgress = CollectionSetSummary & {
  owned_count: number
  completion_pct: number
}

export type BinderCardEntry = {
  card_id: string
  local_id: string
  name: string
  tier: string
  image_url: string | null
  rarity_raw_en: string | null
  illustrator: string | null
  owned_normal: number
  owned_holo: number
  owned_reverse: number
}

export type BinderProgress = {
  set_id: string
  owned_count: number
  total_count: number
  completion_pct: number
}

export type BinderData = {
  set_id: string
  cards: BinderCardEntry[]
  progress: BinderProgress | null
}

export const MILESTONE_THRESHOLDS = [25, 50, 75, 100] as const
