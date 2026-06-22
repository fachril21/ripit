# E15 — Trading / Auction House (Phase 2)

- **Issue:** ZUL-157 · **Milestone:** Fase 2 — Trading & Sosial · **Priority:** Medium · **Status:** Backlog
- **Branch:** `fachril21/zul-157-e15-trading-auction-house-phase-2`

## Goal

Pasar lelang ala EA FC Ultimate Team Transfer Market: jual/beli kartu (dobel) antar user pakai coin, dengan bid + buy-now, pajak penjualan, dan escrow ketat. **Fase 2.**

## Context

Skema tabel auction sudah disiapkan di MVP (`auction_listings/bids/transactions`). Auction menambah faucet coin besar → wajib sink (pajak 5%) + guard harga agar tak inflasi. Lihat **Economy & Pull Rate Spec** (§11) & **Architecture & Security**.

## Scope (in)

* **DB (migration baru):** fungsi `create_listing`, `place_bid`, `buy_now`, `cancel_listing`, dan job penyelesaian lelang kedaluwarsa — semua SECURITY DEFINER + escrow.
* **Escrow kartu:** saat listing, kurangi `user_cards.quantity` penjual & tahan di listing (cegah jual 2x). Saat batal/expired tanpa pembeli → kembalikan.
* **Escrow coin:** saat bid, tahan coin bidder; bid kalah → kembalikan.
* **Pajak 5%** sebagai sink (catat `auction_transactions.tax` + ledger).
* **Guard anti-eksploit:** price floor/ceiling per tier, batas listing aktif per user, rate-limit bid, deteksi pola transfer coin via overbid (alt-account).
* **UI:** browse/search market, listing form (dari kartu dobel), detail lelang + bid/buy-now, "my listings/bids".
* (Opsional) Supabase Realtime untuk update bid live.

## Out of scope

* Uang asli (tidak akan pernah ada).

## Tasks

- [ ] Migration fungsi auction + escrow + RLS/grant.
- [ ] Job penyelesaian lelang expired (pg_cron / Edge Function).
- [ ] Guard harga & rate-limit + deteksi alt-account.
- [ ] UI market (browse, search, filter by tier/set).
- [ ] UI listing dari kartu dobel + my listings/bids.
- [ ] (Opsional) Realtime bid.

## Acceptance Criteria

- [ ] Kartu yang di-listing tak bisa dijual/di-pakai 2x (escrow benar).
- [ ] Coin bid di-escrow; refund saat kalah/batal; pajak 5% tersedot.
- [ ] Tidak bisa transfer coin sewenang-wenang via overbid (guard bekerja).
- [ ] Ekonomi tetap seimbang (monitor inflasi coin pasca-rilis).

## Dependencies

Blocked by **E14** (MVP stabil & ekonomi teruji). Memanfaatkan stok dobel dari **E9**.

## References

Tabel auction (`migration_001`); dokumen **Economy & Pull Rate Spec** (§11) & **Architecture & Security**.
