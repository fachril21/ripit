# Pack reveal audio assets

Drop the following files here (paths referenced by `lib/audio/pack-sounds.ts`):

- `pack-rip.mp3` — played when the pack is torn open.
- `card-swipe.mp3` — played on each card swipe.
- `card-shimmer.mp3` — played during holo/telegraphing build-up before the hit card.
- `rare-sting.mp3` — played when the hit card (slot 10) is revealed.

Until these files exist, playback fails silently and the reveal experience still works without sound.
