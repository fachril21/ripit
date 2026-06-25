export function RevealLoading() {
  return (
    <div className="flex h-99 w-72 flex-col items-center justify-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-300" />
      <p className="text-sm text-neutral-500">Menyiapkan kartu...</p>
    </div>
  )
}
