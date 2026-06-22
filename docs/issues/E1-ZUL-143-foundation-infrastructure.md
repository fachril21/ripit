# E1 — Foundation & Infrastructure Setup

- **Issue:** ZUL-143 · **Milestone:** Fase 1 — MVP · **Priority:** High · **Status:** Backlog
- **Branch:** `fachril21/zul-143-e1-foundation-infrastructure-setup`

## Goal

Menyiapkan fondasi project: repo, Next.js app, koneksi Supabase, env, dan struktur folder, sebelum fitur apa pun dibangun.

## Context

Semua epic lain bergantung pada fondasi ini. Stack: Next.js (React) + Supabase. Lihat dokumen **Architecture & Security**.

## Scope (in)

* Inisialisasi repo + Next.js (App Router) + TypeScript.
* Setup Supabase project (cloud) + ambil URL & anon key.
* Konfigurasi env (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Service role key HANYA untuk Edge Function/server, jangan di client.
* Supabase JS client (browser + server helper).
* Struktur folder: `app/`, `components/`, `lib/` (supabase client, types), `supabase/` (migrations, functions).
* Linting/formatting (eslint, prettier), Tailwind.

## Out of scope

* Auth flow (E3), DB schema (E2).

## Tasks

- [ ] `create-next-app` (TypeScript, App Router, Tailwind).
- [ ] Buat project Supabase, simpan kredensial di env.
- [ ] `lib/supabase/client.ts` (browser) & `lib/supabase/server.ts` (server, RSC-safe).
- [ ] Folder `supabase/migrations` untuk SQL & `supabase/functions` untuk Edge Functions.
- [ ] Setup eslint + prettier + Tailwind config.
- [ ] Halaman placeholder `/` yang konfirmasi koneksi Supabase berhasil.

## Acceptance Criteria

- [ ] `npm run dev` jalan tanpa error.
- [ ] Client Supabase bisa konek (mis. query sederhana ke tabel test / health check).
- [ ] Service role key TIDAK ter-expose ke bundle client.

## Dependencies

Tidak ada (epic pertama).

## References

Dokumen project: **Architecture & Security**.
