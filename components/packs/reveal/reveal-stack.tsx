'use client'

import { useEffect, useState } from 'react'
import type { OpenPackCard } from '@/lib/packs/types'
import { tierGlowColor } from '@/lib/packs/tier'
import type { PackSoundName } from '@/lib/audio/pack-sounds'
import { RevealCard } from '@/components/packs/reveal/reveal-card'
import { HitBurst } from '@/components/packs/reveal/hit-burst'
import './holo.css'

type RevealStackProps = {
  cards: OpenPackCard[]
  tilt: { x: number; y: number } | null
  playSound: (name: PackSoundName) => void
  onComplete: () => void
}

export function RevealStack({ cards, tilt, playSound, onComplete }: RevealStackProps) {
  const [revealCount, setRevealCount] = useState(0)

  const topIndex = revealCount
  const lastIndex = cards.length - 1
  const isHitOnTop = topIndex === lastIndex

  useEffect(() => {
    if (isHitOnTop) {
      playSound('rareSting')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHitOnTop])

  function handleSwiped() {
    playSound('swipe')
    const next = revealCount + 1
    setRevealCount(next)
    if (next === cards.length) {
      onComplete()
    }
  }

  const hitColor = tierGlowColor(cards[lastIndex]?.tier ?? '') ?? '#e5e7eb'

  return (
    <div className="relative mx-auto h-99 w-72">
      {isHitOnTop && <HitBurst color={hitColor} />}

      {cards.map((card, index) => {
        if (index < revealCount - 1) return null

        return (
          <div
            key={card.slot}
            className="absolute inset-0"
            style={{ zIndex: cards.length - index, pointerEvents: index === topIndex ? 'auto' : 'none' }}
          >
            <RevealCard
              card={card}
              tilt={tilt}
              isTopCard={index === topIndex}
              isHit={index === lastIndex}
              stackDepth={Math.max(0, index - topIndex)}
              onSwiped={handleSwiped}
            />
          </div>
        )
      })}
    </div>
  )
}
