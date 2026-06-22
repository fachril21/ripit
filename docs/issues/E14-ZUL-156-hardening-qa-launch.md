# E14 — Hardening, QA & Launch

- **Issue:** ZUL-156 · **Milestone:** Fase 1 — MVP · **Priority:** Medium · **Status:** Backlog
- **Branch:** `fachril21/zul-156-e14-hardening-qa-launch`

## Goal

Pengerasan keamanan, QA, performa, dan kesiapan rilis MVP. Epic terakhir Fase 1 — dikerjakan setelah fitur inti jadi.

## Context

Karena ada ekonomi, verifikasi anti-cheat & integritas wajib sebelum rilis. Lihat checklist di dokumen **Architecture & Security**.

## Scope (in)

* **Verifikasi keamanan:** audit RLS (semua tabel ON, ekonomi read-own tanpa write), pastikan semua mutasi via SECURITY DEFINER & baca `auth.uid()` sendiri, grant tepat, service_role tak di client.
* **Uji anti-cheat:** coba update wallet/koleksi langsung dari client (harus ditolak); coba panggil fungsi internal `_*`/`import_*` sebagai authenticated (harus ditolak); uji idempotency (retry tak double-spend).
* **Performa:** holo hanya di reveal/detail; lazy-load gambar; cek leaderboard di banyak user; Lighthouse mobile.
* **Robustness:** gyroscope fallback iOS; offline/timeout handling; empty states.
* **Legal/UX:** disclaimer non-afiliasi Pokémon/Nintendo; halaman About; pastikan TIDAK ada jalur uang asli.
* **Observability:** logging error, monitoring dasar.

## Out of scope

* Trading (E15, Fase 2).

## Tasks

- [ ] Audit RLS & grant menyeluruh (checklist Architecture & Security §Checklist Keamanan).
- [ ] Skrip uji anti-cheat (tulis test yang mencoba bypass & harus gagal).
- [ ] Uji idempotency open_pack (retry).
- [ ] Audit performa mobile (holo, gambar, leaderboard).
- [ ] Disclaimer non-afiliasi + halaman About/Privacy.
- [ ] Setup error logging/monitoring.
- [ ] Smoke test end-to-end loop: signup → buka pack → reveal → binder → lebur/craft → misi → share → leaderboard.

## Acceptance Criteria

- [ ] Semua percobaan bypass ekonomi dari client GAGAL.
- [ ] Idempotency terbukti (tidak ada double pull/charge).
- [ ] Lighthouse mobile wajar; tak ada jank parah di reveal.
- [ ] Disclaimer tampil; tidak ada fitur uang asli.
- [ ] Loop end-to-end lulus smoke test.

## Dependencies

Blocked by fitur inti MVP (E6–E13).

## References

Dokumen **Architecture & Security** (Checklist Keamanan); deskripsi project (§4 invariant, §7 risiko).
