type CardBackPlaceholderProps = {
  localId: string
}

function formatCardNumber(localId: string): string {
  const padded = /^\d+$/.test(localId) ? localId.padStart(3, '0') : localId
  return `#${padded}`
}

export function CardBackPlaceholder({ localId }: CardBackPlaceholderProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-neutral-700/70 bg-neutral-950">
      <span className="font-mono text-sm tracking-wide text-neutral-600">
        {formatCardNumber(localId)}
      </span>
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-neutral-700/70 text-neutral-600">
        <span className="text-sm leading-none">+</span>
      </div>
    </div>
  )
}
