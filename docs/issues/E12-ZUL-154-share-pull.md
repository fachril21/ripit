# E12 — Share Pull

- **Issue:** ZUL-154 · **Milestone:** Fase 1 — MVP · **Priority:** Medium · **Status:** Backlog
- **Branch:** `fachril21/zul-154-e12-share-pull`

## Goal

Bagikan hasil pull ke luar (WA/X/dll) lewat halaman publik + OG image, sebagai loop pertumbuhan termurah.

## Context

`pack_openings.id` = UUID acak, dan `get_pull(opening_id)` publik (bisa anon). Tabel pull punya RLS public read. Halaman share tak butuh login.

## Scope (in)

* Halaman publik `/pull/[id]` (SSR) → render kartu hasil via `get_pull()`.
* OG image dinamis (mis. Next OG / Edge Function) menampilkan highlight pull (kartu hit).
* Tombol share di ringkasan reveal (E7) → salin link / share native.
* Tampilan menarik untuk viewer yang belum punya akun + CTA daftar.

## Out of scope

* Feed sosial / komentar.

## Tasks

- [ ] Route publik `/pull/[id]` (SSR, tanpa auth).
- [ ] Integrasi `get_pull` + render kartu + holo statis (ringan).
- [ ] OG image generator (kartu hit + username + branding).
- [ ] Tombol share (Web Share API + fallback copy link) di E7.
- [ ] CTA "Coba brewek juga" untuk anon.

## Acceptance Criteria

- [ ] Link `/pull/[id]` bisa dibuka tanpa login & menampilkan kartu yang benar.
- [ ] Preview OG image muncul saat link di-share (WA/X).
- [ ] Tidak ada data sensitif user yang bocor (hanya username + kartu pull).

## Dependencies

Blocked by **E7** (CTA share dari ringkasan reveal). Butuh `get_pull` (E2).

## References

RPC `get_pull`; dokumen **Architecture & Security** (RLS public read untuk pulls).
