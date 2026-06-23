export const PACK_SOUND_FILES = {
  rip: '/audio/pack-rip.mp3',
  swipe: '/audio/card-swipe.mp3',
  shimmer: '/audio/card-shimmer.mp3',
  rareSting: '/audio/rare-sting.mp3',
} as const

export type PackSoundName = keyof typeof PACK_SOUND_FILES

export const PACK_AUDIO_MUTED_STORAGE_KEY = 'ripit:pack-audio-muted'
