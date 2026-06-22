# E6 — Pack Opening (server flow & set selection)

- **Issue:** ZUL-148 · **Milestone:** Fase 1 — MVP · **Priority:** High · **Status:** Backlog
- **Branch:** `fachril21/zul-148-e6-pack-opening-server-flow-set-selection`

## Goal

Alur buka pack end-to-end: pilih set → bayar (gratis/coin) → panggil `open_pack` → terima 10 kartu hasil resolve server. (Animasi reveal di E7.)

## Context

`open_pack` adalah jantung server-authoritative: idempotent, atomik, RNG di server. Frontend TIDAK menentukan hasil. Komposisi & pull rate: dokumen **Economy & Pull Rate Spec** (§2–§3).

## Scope (in)

* Layar pilih set (pakai `get_my_sets()` → daftar set + progress).
* Aksi buka pack: pilih sumber `free` atau `coin` (100 coin).
* Generate **idempotency key** unik per percobaan buka (cegah double-charge saat retry).
* Panggil `supabase.rpc('open_pack', { p_set_id, p_source, p_idem })`.
* Tangani error: not enough coins, no free packs left, unknown set.
* Hasil pull diserahkan ke modul reveal (E7); simpan `opening_id` untuk share.

## Out of scope

* Animasi/holo/audio reveal (E7), binder (E8).

## Tasks

- [ ] Layar set picker + tombol buka (free / 100 coin).
- [ ] Util idempotency key (mis. `crypto.randomUUID()` di-hold sampai sukses).
- [ ] Wrapper RPC `open_pack` + handling loading/disabled saat in-flight.
- [ ] Error states ramah (coin kurang, free habis).
- [ ] Refetch wallet & progress setelah sukses.

## Acceptance Criteria

- [ ] Buka pack mengurangi free pack atau 100 coin (tepat, lewat server).
- [ ] Retry dengan idempotency key sama TIDAK menggandakan pull/charge.
- [ ] Hasil selalu 10 kartu; slot 10 sesuai distribusi hit; reverse di slot 9.
- [ ] Kartu hasil masuk koleksi & progress otomatis (dicek di E8).
- [ ] Tidak ada logika RNG di client.

## Dependencies

Blocked by **E4** (katalog) & **E5** (ekonomi).

## References

RPC `open_pack`, `get_my_sets`; dokumen **Economy & Pull Rate Spec** (§2–§3) & **Architecture & Security** (server-authoritative flow).
