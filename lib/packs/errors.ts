const OPEN_PACK_ERROR_LABELS: Record<string, string> = {
  'no free packs left': 'Pack gratis hari ini sudah habis.',
  'insufficient coins': 'Coin kamu tidak cukup (butuh 100 coin).',
  'not authenticated': 'Sesi kamu berakhir. Silakan login lagi.',
}

export function mapOpenPackError(message: string): string {
  return OPEN_PACK_ERROR_LABELS[message] ?? 'Gagal membuka pack. Set tidak valid atau terjadi kesalahan, coba lagi.'
}
