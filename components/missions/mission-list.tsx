import { MissionCard } from '@/components/missions/mission-card'
import { MISSION_SCOPE_LABELS } from '@/lib/missions/labels'
import type { Mission, MissionScope } from '@/lib/missions/types'

type MissionListProps = {
  missions: Mission[]
}

const SCOPE_ORDER: MissionScope[] = ['daily', 'weekly']

export function MissionList({ missions }: MissionListProps) {
  if (missions.length === 0) {
    return <p className="text-sm text-neutral-400">Belum ada misi aktif.</p>
  }

  return (
    <div className="space-y-6">
      {SCOPE_ORDER.map((scope) => {
        const scopedMissions = missions.filter((mission) => mission.scope === scope)
        if (scopedMissions.length === 0) return null

        return (
          <section key={scope}>
            <h2 className="mb-2 text-sm font-semibold text-neutral-300">
              {MISSION_SCOPE_LABELS[scope]}
            </h2>
            <ul className="space-y-2">
              {scopedMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
