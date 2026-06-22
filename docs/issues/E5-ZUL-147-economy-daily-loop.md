# E5 — Economy & Daily Loop

- **Issue:** ZUL-147 · **Milestone:** Fase 1 — MVP · **Priority:** High · **Status:** Backlog
- **Branch:** `fachril21/zul-147-e5-economy-daily-loop`

## Goal

Mengintegrasikan & menampilkan seluruh ekonomi non-pack: wallet (coin/dust), pack gratis harian, streak login, dan riwayat coin — sehingga loop harian terasa hidup.

## Context

Backend ekonomi sudah ada (`daily_checkin`, ledger, streak di DB). Epic ini fokus UI/UX & integrasi state agar pemain paham progres ekonominya. Angka: lihat dokumen **Economy & Pull Rate Spec**.

## Scope (in)

* Tampilan saldo coin & dust real-time di seluruh app.
* Indikator pack gratis tersisa hari ini + waktu reset.
* Visual streak (hari beruntun, bonus saat ini, animasi naik).
* Halaman/riwayat transaksi coin via `get_coin_history()`.
* Reward harian/streak pop-up saat `daily_checkin()` memproses hari baru.

## Out of scope

* Buka pack itu sendiri (E6), misi (E10).

## Tasks

- [ ] State global wallet (refetch setelah aksi ekonomi).
- [ ] Komponen streak + free-pack counter.
- [ ] Pop-up reward harian (base 50 + bonus streak hingga +100).
- [ ] Halaman riwayat coin (`get_coin_history`).
- [ ] Empty/edge states (saldo 0, pack gratis habis).

## Acceptance Criteria

- [ ] Saldo & free-pack tampil akurat dan ter-update setelah tiap aksi.
- [ ] Streak naik tiap hari beruntun; putus bila skip (kecuali ada freeze).
- [ ] Reward harian muncul tepat sekali per hari.
- [ ] Riwayat coin menampilkan reason yang jelas (login, mission, completion, pack_purchase, dst).

## Dependencies

Blocked by **E3**.

## References

RPC `daily_checkin`, `get_dashboard`, `get_coin_history`; dokumen **Economy & Pull Rate Spec** (§5–§9).
