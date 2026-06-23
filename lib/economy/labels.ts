import type { CoinReason } from '@/lib/economy/types'

export const COIN_REASON_LABELS: Record<CoinReason, string> = {
  onboarding: 'Bonus pendaftaran',
  daily_login: 'Login harian',
  streak: 'Bonus streak login',
  mission: 'Hadiah misi',
  completion: 'Bonus set lengkap',
  pack_purchase: 'Beli pack',
  auction_sale: 'Jual lelang',
  auction_buy: 'Beli lelang',
  auction_tax: 'Pajak lelang',
}

// Economy & Pull Rate Spec §5 — base 50 coin, +10/hari beruntun, cap +100.
const STREAK_BASE_COIN = 50
const STREAK_BONUS_PER_DAY = 10
const STREAK_BONUS_CAP = 100

export function streakBonusCoin(streakCount: number): number {
  return Math.min(Math.max(streakCount - 1, 0) * STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP)
}

export function streakTotalCoin(streakCount: number): number {
  return STREAK_BASE_COIN + streakBonusCoin(streakCount)
}
