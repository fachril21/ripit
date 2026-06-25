'use client'

import { useState } from 'react'
import { CardSlot } from '@/components/collection/card-slot'
import { CardDetailModal } from '@/components/collection/card-detail-modal'
import type { BinderCardEntry } from '@/lib/collection/types'

type BinderGridProps = {
  cards: BinderCardEntry[]
  dust: number
}

export function BinderGrid({ cards, dust }: BinderGridProps) {
  const [selectedCard, setSelectedCard] = useState<BinderCardEntry | null>(null)

  return (
    <>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {cards.map((card) => (
          <li key={card.card_id}>
            <CardSlot card={card} onSelect={() => setSelectedCard(card)} />
          </li>
        ))}
      </ul>

      {selectedCard && (
        <CardDetailModal card={selectedCard} dust={dust} onClose={() => setSelectedCard(null)} />
      )}
    </>
  )
}
