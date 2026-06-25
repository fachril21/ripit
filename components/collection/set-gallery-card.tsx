import Link from 'next/link'
import { formatNumber } from '@/lib/format'
import { normalizeSetAssetUrl } from '@/lib/tcgdex/asset-url'
import { CompletionBar } from '@/components/collection/completion-bar'
import type { CollectionSetWithProgress } from '@/lib/collection/types'

type SetGalleryCardProps = {
  set: CollectionSetWithProgress
}

export function SetGalleryCard({ set }: SetGalleryCardProps) {
  const isUntouched = set.owned_count === 0
  const logoUrl = normalizeSetAssetUrl(set.logo_url)

  return (
    <Link
      href={`/collection/${set.id}`}
      className="block rounded-md border border-neutral-800 p-4 transition-colors hover:border-neutral-600"
    >
      <div className="flex items-center gap-3">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={set.name} className="h-10 w-auto object-contain" />
        ) : (
          <div className="h-10 w-10 rounded bg-neutral-900" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{set.name}</p>
          <p className="text-xs text-neutral-500">
            {isUntouched
              ? `Belum disentuh · ${formatNumber(set.count_total)} kartu`
              : `${formatNumber(set.owned_count)}/${formatNumber(set.count_total)} kartu · ${set.completion_pct}%`}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <CompletionBar completionPct={set.completion_pct} />
      </div>
    </Link>
  )
}
