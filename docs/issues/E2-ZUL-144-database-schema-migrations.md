# E2 — Database Schema & Migrations

- **Issue:** ZUL-144 · **Milestone:** Fase 1 — MVP · **Priority:** High · **Status:** Backlog
- **Branch:** `fachril21/zul-144-e2-database-schema-migrations`

## Goal

Menerapkan seluruh skema database, RLS, dan fungsi RPC ekonomi ke Supabase via 4 file migration.

## Context

Ini tulang punggung server-authoritative. DDL & fungsi sudah final di file `migration_001_init.sql` … `migration_004_missions.sql`. Lihat dokumen **Data Model & Schema Reference**.

## Scope (in)

* Jalankan migration **berurutan** (001 → 002 → 003 → 004) di Supabase SQL Editor / CLI.
* Verifikasi: tabel, enum, RLS aktif, fungsi RPC ada, trigger signup jalan.
* Commit file migration ke `supabase/migrations`.

## Out of scope

* Mengisi katalog (E4), frontend (epic lain).

## Detail per migration

* **001** — enum, semua tabel, trigger `on_auth_user_created` (300 coin + 5 pack), RLS + policy, fungsi `open_pack`/`dismantle_card`/`craft_card`/`daily_checkin`, seed `rarity_tier_map` + misi.
* **002** — `map_rarity`, `import_series/sets/cards`, `remap_all_tiers`, `unmapped_rarities` (service_role only).
* **003** — read API: `get_dashboard/my_sets/set_binder/duplicates/leaderboard/coin_history/pull`.
* **004** — misi: `_period_key`, `record_mission_progress`, trigger `after_pack_opening` & `after_new_card`, `claim_mission`, `list_missions`.

## Tasks

- [ ] Apply 001–004 berurutan, pastikan tanpa error.
- [ ] Cek RLS ON di semua tabel (Supabase dashboard → Authentication → Policies).
- [ ] Buat user test di Auth tab → verifikasi trigger auto-buat profile+wallet+daily_state.
- [ ] Konfirmasi `GRANT`/`REVOKE`: client tak bisa panggil fungsi internal (`_*`, `import_*`).
- [ ] Simpan file migration di repo.

## Acceptance Criteria

- [ ] Semua tabel & fungsi RPC ada.
- [ ] User baru otomatis dapat 300 coin + 5 free pack.
- [ ] `update user_wallets ...` langsung dari client (anon/auth) DITOLAK oleh RLS.
- [ ] `open_pack` dipanggil tanpa auth → error "not authenticated" (perilaku benar).

## Dependencies

Blocked by **E1**.

## References

File `migration_001..004.sql`; dokumen **Data Model & Schema Reference** & **Architecture & Security**.
