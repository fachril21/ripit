# Architecture & Security

> Sumber: Linear document "Architecture and Security" (project RipIt).

## Stack

| Layer | Pilihan |
| -- | -- |
| Frontend | Next.js (React), SSR untuk halaman share (OG image) |
| Backend | Supabase Postgres RPC (SECURITY DEFINER) + Edge Functions (tugas eksternal) |
| DB | Supabase PostgreSQL |
| Auth | Supabase Auth (email + OAuth) |
| Cache/Realtime | Tidak perlu Redis di MVP; leaderboard via query/materialized view. Upstash menyusul kalau perlu |
| Cron | pg_cron + Edge Function terjadwal |
| Asset gambar | Supabase Storage / Cloudflare CDN (proxy TCGdex) |
| Realtime (fase 2) | Supabase Realtime untuk bid auction live |

## Server-Authoritative Flow (open_pack)

1. Idempotency check (key sudah dipakai → kembalikan hasil lama).
2. Bayar: free → potong free_packs_left (reset lazy dulu); coin → SELECT wallet FOR UPDATE, cek, potong, ledger.
3. Resolve RNG server-side (slot 1-5 C, 6-8 U, 9 reverse, 10 hit by bobot tier; fallback turun rarity bila set tak punya tier).
4. Upsert user_cards (qty++ = dobel), recompute progress, cek milestone → reward.
5. Semua dalam 1 transaksi → gagal di tengah = rollback.

## RLS Lockdown (KRITIS — Supabase membuka Postgres ke client)

* RLS **ON di semua tabel**.
* Tabel ekonomi (wallet, user_cards, progress, pulls, ledger, missions, cosmetics): **read-own SELECT only, TANPA policy write**.
* Katalog & config: public read. Profiles: public read + update own. Pulls + listings: public read (share/market).
* Semua mutasi lewat function `SECURITY DEFINER` + `SET search_path = public`, baca `auth.uid()` sendiri — **JANGAN terima user_id dari client**.
* `GRANT EXECUTE` function ekonomi hanya ke role `authenticated`; import hanya `service_role`. `get_pull` ke `anon` juga.
* `service_role` key hanya di Edge Function/server, tidak pernah di client.

## Daily Reset / Streak (lazy)

Saat login/aktif: bandingkan last_login_date vs today (UTC). Hari baru → hitung streak (kemarin → +1; ada freeze → tetap; selain itu → 1), isi ulang free pack, beri coin login+streak. Hanya misi mingguan butuh cron.

## Sinkronisasi Katalog TCGdex (Edge Function terjadwal)

GET series → sets → tiap set ambil daftar kartu → map rarity (EN) ke tier (fallback + log) → set variants → upsert ke DB → cache gambar ke CDN. **Cache lokal; jangan fetch live tiap buka pack.** Pakai `import_*` (service_role). Audit via `unmapped_rarities()` lalu `remap_all_tiers()`.

## Checklist Keamanan

- [ ] RLS ON semua tabel; tabel ekonomi read-own tanpa write.
- [ ] Semua mutasi via SECURITY DEFINER + search_path; baca auth.uid() sendiri.
- [ ] GRANT EXECUTE tepat (authenticated / anon / service_role).
- [ ] service_role key tak pernah di client.
- [ ] Idempotency key di open_pack & purchase.
- [ ] Constraint DB (coins/dust ≥ 0, UNIQUE) sebagai jaring terakhir.
