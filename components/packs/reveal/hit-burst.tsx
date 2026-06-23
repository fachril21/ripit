'use client'

import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import './holo.css'

const SPARKLE_POSITIONS = [
  { x: '20%', y: '25%', delay: 0 },
  { x: '78%', y: '18%', delay: 0.2 },
  { x: '85%', y: '60%', delay: 0.4 },
  { x: '65%', y: '85%', delay: 0.1 },
  { x: '30%', y: '82%', delay: 0.3 },
  { x: '12%', y: '55%', delay: 0.5 },
  { x: '50%', y: '10%', delay: 0.25 },
  { x: '90%', y: '38%', delay: 0.6 },
]

type HitBurstProps = {
  color: string
}

export function HitBurst({ color }: HitBurstProps) {
  return (
    <>
      <motion.div
        className="hit-flash"
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      <div className="hit-spotlight" style={{ '--hit-color': color } as CSSProperties} />
      <div className="hit-rays" style={{ '--hit-color': color } as CSSProperties} />
      {SPARKLE_POSITIONS.map((sparkle, index) => (
        <div
          key={index}
          className="hit-sparkle"
          style={
            {
              '--hit-color': color,
              '--sparkle-x': sparkle.x,
              '--sparkle-y': sparkle.y,
              '--sparkle-delay': `${sparkle.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </>
  )
}
