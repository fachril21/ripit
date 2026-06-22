# E7 — Reveal Experience (swipe, rare-last, holo, audio)

- **Issue:** ZUL-149 · **Milestone:** Fase 1 — MVP · **Priority:** High · **Status:** Backlog
- **Branch:** `fachril21/zul-149-e7-reveal-experience-swipe-rare-last-holo-audio`

## Goal

Ritual reveal yang memuaskan: animasi sobek pack, swipe kartu satu per satu, rare di akhir, efek holo interaktif, dan audio. Ini "jantung dopamine" produk.

## Context

Hasil 10 kartu (urut slot, hit di slot 10) datang dari E6. Keputusan UX: **swipe** (buang kartu), **rare di slot terakhir**, **holo full interaktif** (tilt/mouse), audio. Tidak ada "skip all".

## Scope (in)

* Animasi rip/sobek pack saat mulai.
* Reveal **swipe**: tiap kartu di-swipe untuk lanjut ke berikutnya; hit di slot terakhir (urutan dari `open_pack` sudah benar).
* **Telegraphing**: sinyal halus sebelum kartu bagus (glow card-back, partikel, pitch audio).
* **Holo interaktif**: shine mengikuti gyroscope (mobile) / mousemove (desktop), CSS holografik. Hanya untuk tier holo/UR/SR.
* **Audio**: sobek, swipe, shimmer, sting rare (dengan toggle mute).
* Ringkasan akhir pull + CTA share (ke E12) & "buka lagi".

## Out of scope

* Logika RNG/charge (E6), share image generation (E12).

## Catatan teknis

* iOS butuh izin `DeviceOrientationEvent.requestPermission()` via gesture; sediakan fallback mouse/touch.
* Efek holo berat hanya di view reveal/detail, JANGAN di thumbnail binder (cegah lag).
* Karena swipe lebih cepat dari tap, rem anti-spam diserahkan ke ekonomi; reveal tetap beri jeda memuaskan di momen hit.

## Tasks

- [ ] Animasi pack rip.
- [ ] Komponen kartu + gesture swipe (mobile & desktop).
- [ ] Efek holo interaktif (tilt/mouse) + permission handler iOS + fallback.
- [ ] Telegraphing (glow/partikel/pitch) berbasis tier kartu berikutnya.
- [ ] Layer audio + mute toggle + preload aset.
- [ ] Layar ringkasan pull (semua 10 kartu) + tombol share & buka lagi.

## Acceptance Criteria

- [ ] Reveal satu per satu via swipe; hit muncul terakhir.
- [ ] Holo bereaksi terhadap tilt (mobile) & gerak mouse (desktop); fallback bila izin ditolak.
- [ ] Audio sinkron dengan animasi; mute persist.
- [ ] Performa mulus di mobile mid-range (tak ada jank parah).

## Dependencies

Blocked by **E6**.

## References

Dokumen **Economy & Pull Rate Spec** (§2 komposisi); keputusan reveal di deskripsi project (§3).
