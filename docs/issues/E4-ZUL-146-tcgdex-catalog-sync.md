# E4 — TCGdex Catalog Sync

- **Issue:** ZUL-146 · **Milestone:** Fase 1 — MVP · **Priority:** High · **Status:** Backlog
- **Branch:** `fachril21/zul-146-e4-tcgdex-catalog-sync`

## Goal

Edge Function yang menarik data series/set/kartu dari TCGdex dan mengisinya ke katalog DB lewat fungsi `import_*`, dengan mapping rarity → tier.

## Context

`open_pack` butuh `sets` & `cards` terisi, kalau tidak akan error "unknown set". TCGdex gratis, tanpa key. **Etika: cache lokal, jangan fetch live tiap buka pack.** Lihat dokumen **Architecture & Security** (bagian sinkronisasi).

## Scope (in)

* Supabase Edge Function `sync-catalog` (Deno/TS) pakai **service_role**.
* Fetch `GET https://api.tcgdex.net/v2/en/series`, `/sets`, lalu tiap set `/sets/{id}` untuk daftar kartu.
* Bentuk payload JSON sesuai kontrak `import_series/import_sets/import_cards` (field: id, set_id, local_id, name, image, rarity, variants{normal,holo,reverse}, illustrator).
* Panggil RPC `import_*`. Rarity dipetakan via `map_rarity` (gunakan string EN).
* Jadwalkan (cron) harian/mingguan; deteksi set baru.
* Cache gambar ke Supabase Storage / CDN (boleh fase awal pakai URL TCGdex langsung + lazy-load).

## Out of scope

* UI pemilihan set (E6).

## Tasks

- [ ] Tulis Edge Function `sync-catalog` (pagination + backoff, hormati rate).
- [ ] Mapping field TCGdex → kontrak import.
- [ ] Panggil `import_series` → `import_sets` → `import_cards` per set.
- [ ] Jadwalkan via Supabase scheduled function / pg_cron pemicu.
- [ ] Setelah sync awal, jalankan `SELECT * FROM unmapped_rarities();` → lengkapi `rarity_tier_map` → `SELECT remap_all_tiers();`.
- [ ] (Opsional) Job cache gambar ke Storage.

## Acceptance Criteria

- [ ] `sets` & `cards` terisi untuk minimal beberapa set.
- [ ] `cards.tier` terisi benar; jumlah `FALLBACK` minimal (sisanya tercatat di `unmapped_rarities`).
- [ ] Re-run sync bersifat idempotent (upsert, bukan duplikat).
- [ ] Tidak ada pemanggilan TCGdex saat user buka pack (hanya saat sync).

## Dependencies

Blocked by **E2** (butuh fungsi `import_*`).

## References

RPC `import_series/sets/cards`, `map_rarity`, `unmapped_rarities`, `remap_all_tiers`; dokumen **Architecture & Security** & **Economy & Pull Rate Spec** (§1 tier).
