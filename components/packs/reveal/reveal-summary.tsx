'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { OpenPackCard } from '@/lib/packs/types'
import { tierGlowColor, tierLabel } from '@/lib/packs/tier'

type RevealSummaryProps = {
  cards: OpenPackCard[]
}

export function RevealSummary({ cards }: RevealSummaryProps) {
  const lastIndex = cards.length - 1

  return (
    <motion.div className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <h2 className="mb-4 text-center text-lg font-semibold">Hasil Pull</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map((card, index) => {
          const isHit = index === lastIndex
          const glowColor = isHit ? tierGlowColor(card.tier) ?? '#e5e7eb' : null

          return (
            <motion.div
              key={card.slot}
              className="relative rounded-md border p-2 text-center"
              style={{
                borderColor: isHit && glowColor ? glowColor : 'rgb(38 38 38)',
                boxShadow: isHit && glowColor ? `0 0 18px -2px ${glowColor}` : undefined,
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              {isHit && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-neutral-950 px-2 py-0.5 text-[10px] font-bold tracking-wide text-neutral-100">
                  HIT
                </span>
              )}
              {card.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.image_url} alt={card.name} className="mx-auto h-32 w-auto rounded" />
              ) : (
                <div className="flex h-32 items-center justify-center text-xs text-neutral-500">
                  Tidak ada gambar
                </div>
              )}
              <p className="mt-2 text-xs font-medium">{card.name}</p>
              <p className="text-xs text-neutral-500">{tierLabel(card.tier)}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          disabled
          title="Fitur share akan tersedia di update berikutnya"
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-500"
        >
          Bagikan
        </button>
        <Link href="/dashboard/packs" className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium">
          Buka lagi
        </Link>
      </div>
    </motion.div>
  )
}
