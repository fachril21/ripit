import type { OpenPackCard } from '@/lib/packs/types'

const TIER_LABELS: Record<string, string> = {
  C: 'Common',
  U: 'Uncommon',
  R: 'Rare',
  RH: 'Rare Holo',
  UR: 'Ultra Rare',
  SR: 'Secret Rare',
  FALLBACK: '-',
}

const HOLO_TIERS = new Set(['RH', 'UR', 'SR'])

const TIER_GLOW: Record<string, string> = {
  R: '#e5e7eb',
  RH: '#60a5fa',
  UR: '#c084fc',
  SR: '#facc15',
}

export function tierLabel(tier: string): string {
  return TIER_LABELS[tier] ?? tier
}

export function isHoloTier(tier: string): boolean {
  return HOLO_TIERS.has(tier)
}

export function tierGlowColor(tier: string): string | null {
  return TIER_GLOW[tier] ?? null
}

export function lastCardTier(cards: OpenPackCard[]): string | null {
  const last = cards[cards.length - 1]
  return last ? last.tier : null
}
