# E8 — Collection & Binder

- **Issue:** ZUL-150 · **Milestone:** Fase 1 — MVP · **Priority:** High · **Status:** Backlog
- **Branch:** `fachril21/zul-150-e8-collection-binder`

## Goal

Binder koleksi: lihat semua set + progress, dan isi tiap set (kartu dimiliki vs slot kosong) dengan persen completion. Ini "jantung retensi" produk.

## Context

Yang bikin nagih bukan brewek-nya tapi ngisi binder. Data siap dari RPC `get_my_sets` & `get_set_binder`. Completion per-set (MVP). Progress di-update otomatis oleh `open_pack`/`craft_card`.

## Scope (in)

* Galeri set: `get_my_sets()` → kartu set, logo, owned/total, completion %.
* Detail set/binder: `get_set_binder(set_id)` → grid semua kartu, slot kosong digelapkan, owned ditandai, tampil qty & variant dimiliki.
* Bar progress completion + indikator milestone (25/50/75/100).
* Detail kartu (modal): gambar besar, holo bila punya variant holo, info rarity/illustrator.

## Out of scope

* Lebur/craft (E9), reveal (E7).

## Tasks

- [ ] Halaman galeri set (`get_my_sets`).
- [ ] Halaman binder per set (`get_set_binder`) — grid owned vs kosong.
- [ ] Progress bar + badge milestone.
- [ ] Modal detail kartu (holo hanya di view ini, bukan thumbnail).
- [ ] State loading/empty (set belum tersentuh = 0%).

## Acceptance Criteria

- [ ] Completion % cocok dengan data server (distinct card_id / total).
- [ ] Slot kosong vs terisi jelas terlihat.
- [ ] Variant (normal/holo/reverse) yang dimiliki ditampilkan benar.
- [ ] Buka pack baru langsung memperbarui binder & %.

## Dependencies

Blocked by **E6** (butuh kartu masuk koleksi).

## References

RPC `get_my_sets`, `get_set_binder`; dokumen **Data Model & Schema Reference** (completion logic).
