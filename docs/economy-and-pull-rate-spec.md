# Economy & Pull Rate Spec

> Sumber: Linear document "Economy and Pull Rate Spec" (project RipIt).
> Semua angka = starting value untuk playtest, wajib di-tuning pakai data nyata.
> Prinsip: **Coin = beli pack (untung-untungan). Dust = ciptakan kartu spesifik (pasti, mahal).** No pity.

## 1. Tier Rarity (abstraksi di atas data mentah TCGdex)

TCGdex mengembalikan string `rarity` per era (puluhan). Kita map ke 6 tier via tabel `rarity_tier_map`.

| Tier | Kode | String TCGdex (contoh) |
| -- | -- | -- |
| Common | C | Common |
| Uncommon | U | Uncommon |
| Rare | R | Rare |
| Rare Holo | RH | Rare Holo, Holo Rare, Radiant Rare, Amazing Rare |
| Ultra Rare | UR | Holo Rare V/VMAX/VSTAR, Double rare, Full Art Trainer, Illustration rare, ACE SPEC Rare, LEGEND |
| Secret Rare | SR | Hyper rare, Shiny rare V/VMAX, Classic Collection, Special Illustration Rare |
| (fallback) | FALLBACK | None/null (promo, energy) → dikecualikan dari hit slot |

Aturan: wajib ada tier fallback; mapping pakai bahasa English sebagai kunci; `rarity` ≠ `variants`.

## 2. Komposisi Pack (10 kartu, hit di slot terakhir)

| Slot | Isi |
| -- | -- |
| 1–5 | Common |
| 6–8 | Uncommon |
| 9 | Reverse Holo (variant reverse) |
| 10 | Hit (rare+, posisi terakhir untuk suspense) |

## 3. Pull Rate — Hit Slot (slot 10)

| Tier | Peluang | Rata-rata |
| -- | -- | -- |
| Rare | 55% | ~1/1.8 pack |
| Rare Holo | 28% | ~1/3.6 pack |
| Ultra Rare | 13% | ~1/7.7 pack |
| Secret Rare | 4% | ~1/25 pack |

**Reverse slot (9):** Common reverse 65% / Uncommon 28% / Rare 7%.
**God pack (opsional):** 0.5% — semua slot upgrade, hit dijamin ≥ UR.

## 4. Currency

* **Coin:** beli pack, (fase 2) auction. Sumber: login, streak, misi, completion, jual auction.
* **Dust:** crafting kartu spesifik. Sumber: lebur dobel.

## 5. Coin Faucet

* Login harian base: **50 coin**. Bonus streak: **+10/hari beruntun, cap +100** (hari ke-10+ = 150 total).
* Misi harian (3): ~**80 coin/hari**. Misi mingguan: ~**400/minggu**.
* Completion set: 25% → 250, 50% → 500, 75% → 1.000, 100% → 2.000 coin + kosmetik.

## 6. Coin Sink

* **1 pack = 100 coin.** Pajak auction (fase 2): 5%. Kosmetik premium (opsional): 500–5.000.

## 7. Dust — Lebur vs Craft (rasio 4:1)

| Tier | Lebur (dapat) | Craft (butuh) |
| -- | -- | -- |
| C | 5 | 20 |
| U | 15 | 60 |
| R | 40 | 160 |
| RH | 100 | 400 |
| UR | 300 | 1.200 |
| SR | 800 | 3.200 |

Craft dust-only; hanya kartu yang belum dimiliki; tidak bisa lebur copy terakhir (jaga koleksi).

## 8. Onboarding

Pemain baru: **5 pack gratis** + **300 coin**.

## 9. Pacing (pemain aktif streak 10+)

~287 coin/hari → ~2.8 pack beli + 3 gratis ≈ **6 pack/hari**. Mustahil spam 100 pack; burst datang dari completion windfall.

## 10. Tuning Levers (urutan pengaruh)

1. Harga pack (sink terbesar)
2. Cap streak & coin misi
3. Pull rate UR/SR
4. Rasio dust craft
5. Pajak auction (fase 2).

## 11. Parameter Auction (Fase 2)

Pajak jual 5%. Price floor/ceiling per tier: R 20–2.000, RH 50–5.000, UR 200–20.000, SR 500–100.000. Batas listing & rate-limit bid.
