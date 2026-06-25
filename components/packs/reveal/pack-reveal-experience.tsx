'use client'

import { useMemo, useState } from 'react'
import { usePackAudio } from '@/hooks/use-pack-audio'
import { useDeviceTilt } from '@/hooks/use-device-tilt'
import { useImagePreload } from '@/hooks/use-image-preload'
import type { PullResult } from '@/lib/packs/types'
import { PackRipIntro } from '@/components/packs/reveal/pack-rip-intro'
import { RevealLoading } from '@/components/packs/reveal/reveal-loading'
import { RevealStack } from '@/components/packs/reveal/reveal-stack'
import { RevealSummary } from '@/components/packs/reveal/reveal-summary'
import { MuteToggle } from '@/components/packs/reveal/mute-toggle'

type RevealPhase = 'intro' | 'loading' | 'reveal' | 'summary'

type PackRevealExperienceProps = {
  pull: PullResult
  setName: string
}

export function PackRevealExperience({ pull, setName }: PackRevealExperienceProps) {
  const [phase, setPhase] = useState<RevealPhase>('intro')
  const { isMuted, toggleMute, playSound } = usePackAudio()
  const { tilt, requestPermission } = useDeviceTilt()

  const imageUrls = useMemo(
    () => pull.cards.map((card) => card.image_url).filter((url): url is string => Boolean(url)),
    [pull.cards],
  )
  const imagesLoaded = useImagePreload(imageUrls)
  // Once images finish loading, fall through 'loading' -> 'reveal' without
  // a render-triggered effect (derived, not stored, to avoid cascading renders).
  const displayPhase = phase === 'loading' && imagesLoaded ? 'reveal' : phase

  function handleRipped() {
    playSound('rip')
    void requestPermission()
    setPhase(imagesLoaded ? 'reveal' : 'loading')
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full max-w-md items-center justify-end">
        <MuteToggle isMuted={isMuted} onToggle={toggleMute} />
      </div>

      {displayPhase === 'intro' && <PackRipIntro setName={setName} onRipped={handleRipped} />}

      {displayPhase === 'loading' && <RevealLoading />}

      {displayPhase === 'reveal' && (
        <RevealStack cards={pull.cards} tilt={tilt} playSound={playSound} onComplete={() => setPhase('summary')} />
      )}

      {displayPhase === 'summary' && <RevealSummary cards={pull.cards} />}
    </div>
  )
}
