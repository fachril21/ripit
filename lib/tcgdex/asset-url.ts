// Logo/symbol assets on TCGdex have no quality variants (unlike card images,
// which do use /high.{ext}). Rows synced before that distinction was fixed
// still carry the old /high.{ext} suffix — normalize it here so already-synced
// data renders correctly without requiring a re-sync.
const HIGH_SUFFIX = /\/high\.(png|webp|jpg|jpeg)$/i

export function normalizeSetAssetUrl(url: string | null): string | null {
  if (!url) return null
  return url.replace(HIGH_SUFFIX, '.$1')
}
