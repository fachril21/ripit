export type DashboardStats = {
  coins: number
  dust: number
  free_packs_left: number
  streak_count: number
  streak_freezes: number
}

export type DailyCheckinResult = {
  streak_count: number
  free_packs_left: number
  coins: number
  coin_gain: number
}

export type CoinReason =
  | 'onboarding'
  | 'daily_login'
  | 'streak'
  | 'mission'
  | 'completion'
  | 'pack_purchase'
  | 'auction_sale'
  | 'auction_buy'
  | 'auction_tax'

export type CoinTransaction = {
  id: string
  user_id: string
  amount: number
  reason: CoinReason
  ref_id: string | null
  balance_after: number
  created_at: string
}
