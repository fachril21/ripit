export type CardVariant = 'normal' | 'holo' | 'reverse'

export type DuplicateEntry = {
  card_id: string
  variant: CardVariant
  quantity: number
  tier: string
  name: string
  image_url: string | null
}

export type DismantleResult = {
  card_id: string
  variant: CardVariant
  dust_gain: number
  dust_balance: number
}

export type CraftResult = {
  card_id: string
  variant: CardVariant
  dust_spent: number
  dust_balance: number
}

export type DismantleActionResult = { error: string } | { result: DismantleResult }
export type CraftActionResult = { error: string } | { result: CraftResult }
