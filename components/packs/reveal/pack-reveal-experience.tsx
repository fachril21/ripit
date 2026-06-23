'use client'

import { useState } from 'react'
import { usePackAudio } from '@/hooks/use-pack-audio'
import { useDeviceTilt } from '@/hooks/use-device-tilt'
import type { PullResult } from '@/lib/packs/types'
import { PackRipIntro } from '@/components/packs/reveal/pack-rip-intro'
import { RevealStack } from '@/components/packs/reveal/reveal-stack'
import { RevealSummary } from '@/components/packs/reveal/reveal-summary'
import { MuteToggle } from '@/components/packs/reveal/mute-toggle'

type RevealPhase = 'intro' | 'reveal' | 'summary'

type PackRevealExperienceProps = {
  pull: PullResult
  setName: string
}

export function PackRevealExperience({ pull, setName }: PackRevealExperienceProps) {
  const [phase, setPhase] = useState<RevealPhase>('intro')
  const { isMuted, toggleMute, playSound } = usePackAudio()
  const { tilt, requestPermission } = useDeviceTilt()

  function handleRipped() {
    playSound('rip')
    void requestPermission()
    setPhase('reveal')
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full max-w-md items-center justify-end">
        <MuteToggle isMuted={isMuted} onToggle={toggleMute} />
      </div>

      {phase === 'intro' && <PackRipIntro setName={setName} onRipped={handleRipped} />}

      {phase === 'reveal' && (
        <RevealStack cards={pull.cards} tilt={tilt} playSound={playSound} onComplete={() => setPhase('summary')} />
      )}

      {phase === 'summary' && <RevealSummary cards={pull.cards} />}
    </div>
  )
}
