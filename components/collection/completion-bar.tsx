import { MILESTONE_THRESHOLDS } from '@/lib/collection/types'

type CompletionBarProps = {
  completionPct: number
}

export function CompletionBar({ completionPct }: CompletionBarProps) {
  return (
    <div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width]"
          style={{ width: `${completionPct}%` }}
        />
        {MILESTONE_THRESHOLDS.slice(0, -1).map((milestone) => (
          <div
            key={milestone}
            className="absolute top-0 h-full w-px bg-neutral-950/60"
            style={{ left: `${milestone}%` }}
          />
        ))}
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        {MILESTONE_THRESHOLDS.map((milestone) => (
          <span
            key={milestone}
            className={
              completionPct >= milestone
                ? 'rounded-full border border-emerald-700 bg-emerald-900/40 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300'
                : 'rounded-full border border-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-600'
            }
          >
            {milestone}%
          </span>
        ))}
      </div>
    </div>
  )
}
