# E3 — Authentication & Onboarding

- **Issue:** ZUL-145 · **Milestone:** Fase 1 — MVP · **Priority:** High · **Status:** Backlog
- **Branch:** `fachril21/zul-145-e3-authentication-onboarding`

## Goal

Sign-up / sign-in via Supabase Auth, plus onboarding sehingga user baru langsung punya saldo, pack starter, dan dashboard.

## Context

Akun wajib dari awal (untuk leaderboard, share, dan trading fase 2). Trigger DB sudah meng-handle pembuatan profile/wallet/daily_state. Frontend tinggal nyambungin sesi & onboarding.

## Scope (in)

* Halaman auth: sign up & login (email + minimal 1 OAuth, mis. Google).
* Session handling (middleware Next.js, server & client).
* Onboarding: tampilkan welcome (300 coin + 5 pack), set username (edit `profiles.username`).
* Dashboard awal: panggil `get_dashboard()` → tampil coin, dust, free pack, streak, username.
* Trigger `daily_checkin()` saat masuk app (proses streak & reset harian lazy).

## Out of scope

* Logika buka pack (E6), binder (E8).

## Tasks

- [ ] Setup Supabase Auth (email + Google) di dashboard.
- [ ] Halaman `/login` & `/signup` + handler.
- [ ] Middleware proteksi route privat; redirect belum-login ke `/login`.
- [ ] Onboarding: form set username (update `profiles`), tampil welcome grant.
- [ ] Komponen header/topbar nampilin coin/dust/free-pack/streak dari `get_dashboard()`.
- [ ] Panggil `daily_checkin()` saat sesi aktif; tampilkan reward harian/streak bila ada.

## Acceptance Criteria

- [ ] User baru bisa sign up → otomatis punya 300 coin + 5 pack.
- [ ] Login persist antar reload (sesi tersimpan).
- [ ] Username unik (tangani error duplikat dengan ramah).
- [ ] `daily_checkin` idempotent: panggil 2x sehari tak menggandakan reward.

## Dependencies

Blocked by **E2**.

## References

RPC `get_dashboard`, `daily_checkin`; dokumen **Architecture & Security** (bagian RLS & daily reset).
