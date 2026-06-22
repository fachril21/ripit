# E9 — Duplicates, Dust & Crafting

- **Issue:** ZUL-151 · **Milestone:** Fase 1 — MVP · **Priority:** Medium · **Status:** Backlog
- **Branch:** `fachril21/zul-151-e9-duplicates-dust-crafting`

## Goal

Kelola kartu dobel: lebur jadi dust, dan craft kartu spesifik yang belum dimiliki. Inilah pengganti pity yang fair (pull tetap murni hoki, hoki jelek tak sia-sia).

## Context

RPC `dismantle_card` & `craft_card` sudah ada (rasio 4:1, dust-only, tak bisa craft yang sudah dimiliki, tak bisa lebur copy terakhir). Angka: dokumen **Economy & Pull Rate Spec** (§7).

## Scope (in)

* Layar "Duplicates" via `get_duplicates()` → daftar dobel + spare count + nilai dust.
* Aksi lebur (single / bulk) → `dismantle_card(card_id, variant, qty)`.
* Layar craft: dari binder slot kosong → tombol craft bila dust cukup → `craft_card(card_id, variant)`.
* Tampilkan biaya craft & dust balance; konfirmasi sebelum aksi.

## Out of scope

* Trading/auction (E15).

## Tasks

- [ ] Layar daftar dobel (`get_duplicates`) + nilai lebur per tier.
- [ ] Aksi lebur (qty selector) + konfirmasi + refresh.
- [ ] Tombol "Craft" di slot kosong binder (E8) dengan biaya & status dust cukup/kurang.
- [ ] Handling error (dust kurang, sudah dimiliki, copy terakhir).
- [ ] Update koleksi/progress/dust setelah aksi.

## Acceptance Criteria

- [ ] Lebur memberi dust sesuai tier; tak bisa melebur copy terakhir.
- [ ] Craft hanya untuk kartu yang belum dimiliki; biaya = craft cost tier (4× lebur).
- [ ] Craft menambah kartu ke koleksi & menaikkan completion bila relevan.
- [ ] Dust balance & ledger akurat.

## Dependencies

Blocked by **E8** (entry craft dari slot kosong binder).

## References

RPC `get_duplicates`, `dismantle_card`, `craft_card`; dokumen **Economy & Pull Rate Spec** (§7).
