'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type PackRipIntroProps = {
  setName: string
  onRipped: () => void
}

export function PackRipIntro({ setName, onRipped }: PackRipIntroProps) {
  const [isRipping, setIsRipping] = useState(false)

  function handleTap() {
    if (isRipping) return
    setIsRipping(true)
  }

  return (
    <div className="flex h-112 w-72 flex-col items-center justify-center">
      <motion.button
        type="button"
        onClick={handleTap}
        disabled={isRipping}
        className="relative h-99 w-72 overflow-visible rounded-xl border border-neutral-800 bg-linear-to-b from-neutral-800 to-neutral-950 focus:outline-none"
        animate={isRipping ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl border-b border-neutral-700 bg-neutral-900"
          animate={isRipping ? { y: '-130%', rotate: -10, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: 'easeIn', delay: isRipping ? 0.12 : 0 }}
          onAnimationComplete={() => {
            if (isRipping) onRipped()
          }}
        />
        <motion.div
          className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-xl bg-neutral-900"
          animate={isRipping ? { y: '130%', rotate: 10, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: 'easeIn', delay: isRipping ? 0.12 : 0 }}
        />
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <span className="text-sm font-semibold text-neutral-300">{setName}</span>
        </div>
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl bg-white"
          initial={{ opacity: 0 }}
          animate={isRipping ? { opacity: [0, 0.85, 0] } : { opacity: 0 }}
          transition={{ duration: 0.35, times: [0, 0.2, 1] }}
        />
      </motion.button>

      {!isRipping && <p className="mt-6 text-sm text-neutral-500">Tap pack untuk membuka</p>}
    </div>
  )
}
