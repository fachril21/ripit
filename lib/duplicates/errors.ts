const DISMANTLE_ERROR_LABELS: Record<string, string> = {
  'cannot dismantle: must keep at least 1 copy': 'Tidak bisa melebur copy terakhir.',
  'qty must be >= 1': 'Jumlah tidak valid.',
  'not authenticated': 'Sesi kamu berakhir. Silakan login lagi.',
}

const CRAFT_ERROR_LABELS: Record<string, string> = {
  'card already owned; craft is only for missing cards': 'Kartu ini sudah kamu miliki.',
  'insufficient dust': 'Dust kamu tidak cukup.',
  'card not found': 'Kartu tidak ditemukan.',
  'card tier not craftable': 'Kartu ini tidak bisa di-craft.',
  'not authenticated': 'Sesi kamu berakhir. Silakan login lagi.',
}

export function mapDismantleError(message: string): string {
  return DISMANTLE_ERROR_LABELS[message] ?? 'Gagal melebur kartu. Coba lagi.'
}

export function mapCraftError(message: string): string {
  return CRAFT_ERROR_LABELS[message] ?? 'Gagal craft kartu. Coba lagi.'
}
