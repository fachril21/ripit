# RipIt — PRD (Source of Truth)

> **Sumber:** Linear project *RipIt — Pokémon TCG Pack Opening Simulator* (team Zulfidar / ZUL)
> **Project URL:** https://linear.app/zulfidar/project/ripit-pokemon-tcg-pack-opening-simulator-15fabbe2ed65
> **Status:** Spec lengkap, siap dikembangkan per-epic.
> **Tipe:** Pokémon TCG pack-opening simulator. **Tanpa IAP**, murni hiburan.
> **Stack:** Next.js (React) + Supabase (Postgres, Auth, Edge Functions, Storage, Realtime).
> **Data kartu:** TCGdex API (gratis, tanpa key) — di-cache lokal.
> **Lead:** Fachril R. Zulfidar

---

## 1. Visi & Tesis Produk

Targetnya bukan main kartunya, tapi **sensasi brewek + ngelengkapin koleksi**. Karena digital & gratis, rem alami brewek (uang) hilang. Tesis: bikin tiap pack tetap berharga lewat **kelangkaan buatan (ekonomi)**, **tujuan jelas (completion per-set)**, dan **ritual reveal memuaskan** — bukan dengan membatasi jumlah secara kasar.

## 2. Prinsip Desain

1. Bukan jumlah pack yang dibatasi, tapi alasan tiap pack jadi spesial.
2. Reveal adalah ritual, bukan tombol (tidak ada skip-all).
3. Hoki jelek tidak boleh terasa sia-sia (crafting + nilai pasar).
4. Tanpa uang asli — prestise diukur lewat kosmetik & completion.

## 3. Keputusan Terkunci (hasil brainstorm)

* **Ekonomi:** Hybrid — pack gratis harian + coin yang di-earn. **No pity** (pull murni hoki). **Streak login** untuk habit.
* **Dua currency:** Coin (beli pack) & Dust (craft kartu spesifik). Tidak saling tukar.
* **Kartu dobel:** bisa dilebur jadi dust (crafting rasio 4:1) ATAU disimpan untuk trading.
* **Completion:** per-set saja (MVP). Meta-goal lintas set (Pokédex) → fase lanjut.
* **Reward:** kosmetik (binder skin, efek pack, badge, frame) sebagai reward utama.
* **Reveal:** swipe (buang kartu satu per satu), **rare di slot terakhir**, **holo full interaktif** (tilt/mouse), audio.
* **Akun & backend:** dari awal → Supabase.
* **Trading:** Auction House ala EA FC Ultimate Team (bid + buy-now, coin, pajak 5%). **Fase 2.**
* **Leaderboard:** berbasis completion (jumlah kartu unik + set tamat).
* **Share pull:** ya, penting (loop pertumbuhan).

## 4. Invariant Teknis (WAJIB dipatuhi semua epic)

* **Server-authoritative:** RNG & ekonomi di-resolve di server (Postgres RPC), bukan client.
* **Transaksional + ledger:** tiap operasi ekonomi atomik dalam 1 transaksi; tiap perubahan saldo dicatat di `coin_transactions`/`dust_transactions`.
* **Idempotency:** `open_pack` & pembelian pakai idempotency key (cegah double-spend saat retry).
* **RLS lockdown (Supabase):** client hanya boleh SELECT data sendiri; **tidak ada policy write** di tabel ekonomi. Semua mutasi lewat function `SECURITY DEFINER` yang baca `auth.uid()` sendiri — JANGAN terima user_id dari client.
* **Etika TCGdex:** cache katalog lokal; jangan fetch live tiap buka pack.

## 5. Daftar Epic (urutan kerja)

**Fase 1 (MVP):**

| Epic | Issue | Judul | Priority |
| -- | -- | -- | -- |
| E1 | ZUL-143 | Foundation & Infrastructure Setup | High |
| E2 | ZUL-144 | Database Schema & Migrations | High |
| E3 | ZUL-145 | Authentication & Onboarding | High |
| E4 | ZUL-146 | TCGdex Catalog Sync | High |
| E5 | ZUL-147 | Economy & Daily Loop | High |
| E6 | ZUL-148 | Pack Opening (server flow + set selection) | High |
| E7 | ZUL-149 | Reveal Experience | High |
| E8 | ZUL-150 | Collection & Binder | High |
| E9 | ZUL-151 | Duplicates, Dust & Crafting | Medium |
| E10 | ZUL-152 | Missions | Medium |
| E11 | ZUL-153 | Leaderboard | Medium |
| E12 | ZUL-154 | Share Pull | Medium |
| E13 | ZUL-155 | Cosmetics & Rewards | Low |
| E14 | ZUL-156 | Hardening, QA & Launch | Medium |

**Fase 2:**

| Epic | Issue | Judul | Priority |
| -- | -- | -- | -- |
| E15 | ZUL-157 | Trading / Auction House | Medium |

## 6. Dokumen Referensi

* [Economy & Pull Rate Spec](./economy-and-pull-rate-spec.md) — semua angka ekonomi & pull rate.
* [Data Model & Schema Reference](./data-model-and-schema-reference.md) — tabel, enum, fungsi RPC, mapping rarity.
* [Architecture & Security](./architecture-and-security.md) — stack, RLS, pola SECURITY DEFINER, sync TCGdex.
* [Issues (per-epic)](./issues/) — detail scope, tasks, acceptance criteria tiap epic.

## 7. Risiko

* IP Pokémon (Nintendo/TPC) — aman untuk non-komersial; hindari jalur uang asli; siapkan disclaimer non-afiliasi.
* Optik gacha/loot box — tanpa uang asli & tanpa cashout, risiko rendah.
* Eksploit ekonomi (auction fase 2) — wajib sink kuat + escrow + anti alt-account.

## 8. Milestones

### Fase 1 — MVP
Brewek + koleksi + crafting + misi + leaderboard + share. Tanpa trading. Target: produk utuh yang bisa dimainkan & dibagikan.

### Fase 2 — Trading & Sosial
Auction House ala FUT (bid + buy-now, coin, pajak 5%, escrow, anti alt-account), friend list, event mingguan. Dibangun di atas ekonomi MVP yang sudah disiapkan.
