type FreePackBadgeProps = {
  freePacksLeft: number
}

export function FreePackBadge({ freePacksLeft }: FreePackBadgeProps) {
  const isEmpty = freePacksLeft < 1

  return (
    <div
      className="flex items-center gap-1 text-sm"
      title={isEmpty ? 'Pack gratis hari ini habis — reset besok saat kamu login' : 'Pack gratis hari ini'}
    >
      <span>📦</span>
      <span className={isEmpty ? 'text-neutral-500' : 'font-semibold'}>{freePacksLeft}</span>
      {isEmpty && <span className="text-xs text-neutral-500">habis</span>}
    </div>
  )
}
