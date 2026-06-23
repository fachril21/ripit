'use client'

type MuteToggleProps = {
  isMuted: boolean
  onToggle: () => void
}

export function MuteToggle({ isMuted, onToggle }: MuteToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-400"
    >
      {isMuted ? 'Suara: mati' : 'Suara: aktif'}
    </button>
  )
}
