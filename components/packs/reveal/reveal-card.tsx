'use client'

import { useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import type { OpenPackCard } from '@/lib/packs/types'
import { isHoloTier, tierGlowColor } from '@/lib/packs/tier'
import './holo.css'

const SWIPE_DISTANCE_THRESHOLD = 100
const SWIPE_VELOCITY_THRESHOLD = 450
const TAP_MOVEMENT_THRESHOLD = 8
const MAX_STACK_DEPTH = 2

type RevealCardProps = {
  card: OpenPackCard
  tilt: { x: number; y: number } | null
  isTopCard: boolean
  isHit: boolean
  stackDepth: number
  onSwiped: () => void
}

export function RevealCard({ card, tilt, isTopCard, isHit, stackDepth, onSwiped }: RevealCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const flyingRef = useRef(false)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-260, 260], [-16, 16])
  const isHolo = isHoloTier(card.tier)
  const glowColor = tierGlowColor(card.tier) ?? '#ffffff'
  const depth = Math.min(stackDepth, MAX_STACK_DEPTH)
  const holoActive = isTopCard && isHolo

  useEffect(() => {
    cardRef.current?.style.setProperty('--holo-color', glowColor)
  }, [glowColor])

  useEffect(() => {
    if (!holoActive || !tilt || !cardRef.current) return
    const px = 50 + tilt.x * 50
    const py = 50 + tilt.y * 50
    cardRef.current.style.setProperty('--pointer-x', `${px}%`)
    cardRef.current.style.setProperty('--pointer-y', `${py}%`)
  }, [holoActive, tilt])

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!holoActive) return
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = ((event.clientX - rect.left) / rect.width) * 100
    const py = ((event.clientY - rect.top) / rect.height) * 100
    el.style.setProperty('--pointer-x', `${px}%`)
    el.style.setProperty('--pointer-y', `${py}%`)
  }

  function flyAway(direction: 1 | -1) {
    if (flyingRef.current) return
    flyingRef.current = true
    animate(x, direction * 700, { duration: 0.3, ease: 'easeIn' })
    onSwiped()
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    flyingRef.current = false
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (!start || flyingRef.current) return

    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    if (moved < TAP_MOVEMENT_THRESHOLD) {
      flyAway(1)
    }
  }

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (flyingRef.current) return
    const passedDistance = Math.abs(info.offset.x) > SWIPE_DISTANCE_THRESHOLD
    const passedVelocity = Math.abs(info.velocity.x) > SWIPE_VELOCITY_THRESHOLD

    if (passedDistance || passedVelocity) {
      flyAway(info.offset.x >= 0 ? 1 : -1)
      return
    }

    animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
  }

  const restScale = isTopCard ? 1 : 1 - depth * 0.04
  const hitScale = isTopCard && isHit ? 1.04 : 1

  return (
    <motion.div
      ref={cardRef}
      className="holo-card absolute inset-0 perspective-[1000px]"
      data-holo-active={holoActive}
      style={{ x, rotate }}
      animate={{
        scale: restScale * hitScale,
        y: isTopCard ? 0 : depth * 14,
        opacity: !isTopCard && stackDepth > MAX_STACK_DEPTH ? 0 : 1,
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      drag={isTopCard ? 'x' : false}
      dragElastic={0.7}
      onDragEnd={isTopCard ? handleDragEnd : undefined}
      onPointerDown={isTopCard ? handlePointerDown : undefined}
      onPointerUp={isTopCard ? handlePointerUp : undefined}
      onPointerMove={isTopCard ? handlePointerMove : undefined}
      whileTap={isTopCard ? { scale: restScale * hitScale * 0.98 } : undefined}
    >
      {isTopCard ? (
        <div className="absolute inset-0 overflow-hidden rounded-xl shadow-[0_18px_45px_-15px_rgba(0,0,0,0.7)]">
          {card.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.image_url} alt={card.name} className="h-full w-full object-contain" draggable={false} />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-900 text-xs text-neutral-500">
              Tidak ada gambar
            </div>
          )}
          <div className="holo-card__shine" />
          <div className="holo-card__sweep" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl border border-neutral-800 bg-linear-to-br from-neutral-900 to-neutral-950 shadow-[0_18px_45px_-15px_rgba(0,0,0,0.7)]">
          <span className="text-sm font-bold tracking-widest text-neutral-700">RIPIT</span>
          <div className="holo-card__back-sheen" />
        </div>
      )}
    </motion.div>
  )
}
