'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PACK_AUDIO_MUTED_STORAGE_KEY, PACK_SOUND_FILES, type PackSoundName } from '@/lib/audio/pack-sounds'

type UsePackAudio = {
  isMuted: boolean
  toggleMute: () => void
  playSound: (name: PackSoundName) => void
}

export function usePackAudio(): UsePackAudio {
  const audioRefs = useRef<Partial<Record<PackSoundName, HTMLAudioElement>>>({})
  const [isMuted, setIsMuted] = useState(
    () => typeof window !== 'undefined' && window.localStorage.getItem(PACK_AUDIO_MUTED_STORAGE_KEY) === 'true',
  )

  useEffect(() => {
    for (const [name, src] of Object.entries(PACK_SOUND_FILES) as [PackSoundName, string][]) {
      const audio = new Audio(src)
      audio.preload = 'auto'
      audioRefs.current[name] = audio
    }

    return () => {
      for (const audio of Object.values(audioRefs.current)) {
        audio?.pause()
      }
      audioRefs.current = {}
    }
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      window.localStorage.setItem(PACK_AUDIO_MUTED_STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const playSound = useCallback(
    (name: PackSoundName) => {
      if (isMuted) return
      const audio = audioRefs.current[name]
      if (!audio) return
      audio.currentTime = 0
      // Playback can reject when the asset is missing or autoplay is restricted;
      // sound is an enhancement here, never required for the reveal flow to proceed.
      void audio.play().catch(() => {})
    },
    [isMuted],
  )

  return { isMuted, toggleMute, playSound }
}
