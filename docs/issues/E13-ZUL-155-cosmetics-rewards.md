# E13 — Cosmetics & Rewards

- **Issue:** ZUL-155 · **Milestone:** Fase 1 — MVP · **Priority:** Low · **Status:** Backlog
- **Branch:** `fachril21/zul-155-e13-cosmetics-rewards`

## Goal

Sistem kosmetik unlockable sebagai reward prestise utama (karena no IAP): binder skin, efek buka pack, badge, frame kartu.

## Context

Tabel `cosmetic_defs` & `user_cosmetics` sudah ada. Yang BELUM dibuat: seed kosmetik, fungsi unlock, dan hook ke milestone completion. Epic ini melengkapi backend + UI.

## Scope (in)

* **DB tambahan (migration baru):** seed `cosmetic_defs`; fungsi `unlock_cosmetic(p_user, p_cosmetic_id)` (SECURITY DEFINER) + `equip_cosmetic(p_cosmetic_id)`; perluas `_check_milestones` agar unlock kosmetik saat completion 100% (atau milestone tertentu).
* RPC baca `get_cosmetics()` (dimiliki + terkunci).
* UI: galeri kosmetik, status locked/unlocked, equip; terapkan equipped ke binder skin / efek pack / frame.

## Out of scope

* Kosmetik berbayar (tidak ada IAP).

## Tasks

- [ ] Migration: seed cosmetic_defs + fungsi unlock/equip + RLS/grant + hook completion.
- [ ] RPC `get_cosmetics`.
- [ ] Galeri kosmetik + aksi equip.
- [ ] Terapkan kosmetik equipped ke UI (binder skin, efek reveal, frame, badge profil).

## Acceptance Criteria

- [ ] Menyelesaikan set memberi kosmetik (ter-unlock otomatis, tercatat).
- [ ] Equip mengubah tampilan terkait secara persisten.
- [ ] Kosmetik terkunci tak bisa di-equip.

## Dependencies

Blocked by **E8** (completion sebagai pemicu unlock).

## References

Tabel `cosmetic_defs`/`user_cosmetics`; `_check_milestones` di `migration_001`; deskripsi project (§3 reward).
