const DISMANTLE_DUST: Record<string, number> = {
  C: 5,
  U: 15,
  R: 40,
  RH: 100,
  UR: 300,
  SR: 800,
}

const CRAFT_DUST: Record<string, number> = {
  C: 20,
  U: 60,
  R: 160,
  RH: 400,
  UR: 1200,
  SR: 3200,
}

export function dismantleValue(tier: string): number {
  return DISMANTLE_DUST[tier] ?? 0
}

export function craftCost(tier: string): number | null {
  return CRAFT_DUST[tier] ?? null
}
