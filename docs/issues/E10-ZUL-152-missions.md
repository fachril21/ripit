# E10 — Missions

- **Issue:** ZUL-152 · **Milestone:** Fase 1 — MVP · **Priority:** Medium · **Status:** Backlog
- **Branch:** `fachril21/zul-152-e10-missions`

## Goal

UI misi harian/mingguan: tampil progress, dan klaim reward coin. Progress di-track otomatis server-side via trigger.

## Context

DB sudah punya `mission_defs`, trigger `after_pack_opening`/`after_new_card` (server-verifiable), `list_missions`, `claim_mission`. Misi berbasis laporan client (mis. swipe) dinonaktifkan demi anti-cheat.

## Scope (in)

* Panel misi via `list_missions()` → deskripsi, target, progress, reward, status.
* Tombol klaim saat completed → `claim_mission(mission_id)`.
* Indikator misi selesai/belum diklaim (badge) di nav.
* Seed misi MVP: harian "Buka 3 pack" (30), harian "Tambah 1 kartu baru" (30), mingguan "Buka 25 pack" (400).

## Out of scope

* Penambahan goal_type baru (bisa menyusul).

## Tasks

- [ ] Panel/halaman misi (`list_missions`).
- [ ] Progress bar per misi + state completed/claimed.
- [ ] Aksi klaim (`claim_mission`) + animasi reward + refresh wallet.
- [ ] Badge notifikasi misi siap klaim.

## Acceptance Criteria

- [ ] Progress 'open_packs' & 'new_card' naik otomatis tanpa input client.
- [ ] Klaim hanya bisa saat completed & belum diklaim; tak bisa double-claim.
- [ ] Reward coin masuk ke wallet & ledger (reason 'mission').
- [ ] Misi reset per periode (harian/mingguan, kunci UTC).

## Dependencies

Blocked by **E6** (progress muncul saat buka pack).

## References

RPC `list_missions`, `claim_mission`; trigger di `migration_004`; dokumen **Economy & Pull Rate Spec** (§5).
