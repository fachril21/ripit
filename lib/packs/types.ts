export type SetSummary = {
  id: string
  name: string
  logo_url: string | null
  symbol_url: string | null
  count_total: number
}

export type SetProgress = {
  set_id: string
  owned_count: number
  total_count: number
  completion_pct: number
}

export type SetWithProgress = SetSummary & {
  owned_count: number
  completion_pct: number
}

export type PackSource = 'free' | 'coin'

export type OpenPackCard = {
  slot: number
  card_id: string
  name: string
  tier: string
  variant: string
  image_url: string | null
}

export type OpenPackResult = {
  opening_id: string
  set_id: string
  source: PackSource
  cards: OpenPackCard[]
  set_progress_pct: number
}

export type OpenPackActionResult = { error: string } | { result: OpenPackResult }

export type PullResult = {
  opening_id: string
  set_id: string
  source: PackSource
  cards: OpenPackCard[]
}
