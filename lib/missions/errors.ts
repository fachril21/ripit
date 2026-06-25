const CLAIM_ERROR_LABELS: Record<string, string> = {
  'mission not found': 'Misi tidak ditemukan.',
  'mission not completed yet': 'Misi belum selesai.',
  'mission already claimed': 'Misi sudah diklaim.',
  'not authenticated': 'Sesi kamu berakhir. Silakan login lagi.',
}

export function mapClaimMissionError(message: string): string {
  return CLAIM_ERROR_LABELS[message] ?? 'Gagal klaim misi. Coba lagi.'
}
