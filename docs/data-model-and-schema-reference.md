# Data Model & Schema Reference

> Sumber: Linear document "Data Model and Schema Reference" (project RipIt).
> Target: Supabase (PostgreSQL). DDL final ada di file `migration_001..004.sql`. Ini ringkasan rujukan.
> **Catatan:** `users` diganti `profiles` yang reference `auth.users(id)`.

## Enums

* `card_tier` (C, U, R, RH, UR, SR, FALLBACK)
* `card_variant` (normal, holo, reverse, first_edition)
* `pack_source` (free, coin)
* `coin_reason` (onboarding, daily_login, streak, mission, completion, pack_purchase, auction_sale, auction_buy, auction_tax)
* `dust_reason` (onboarding, dismantle, craft)
* `mission_scope` (daily, weekly)
* `auction_status` (active, sold, cancelled, expired)

## Tabel — Katalog (hasil sync TCGdex)

* **series**(id, name, logo_url, synced_at)
* **sets**(id, series_id, name, logo_url, symbol_url, count_official/total/holo/reverse/normal, release_date, synced_at)
* **rarity_tier_map**(rarity_raw_en PK, tier) — config mapping
* **cards**(id PK = tcgdex id, set_id, local_id, name, image_url, rarity_raw_en, tier, has_normal/holo/reverse, illustrator, synced_at)

## Tabel — User & Wallet

* **profiles**(id = auth.users.id, username, display_name, avatar_url)
* **user_wallets**(user_id PK, coins ≥0, dust ≥0)
* **user_daily_state**(user_id PK, free_packs_left, free_packs_reset_at, last_login_date, streak_count, streak_freezes)

## Tabel — Koleksi

* **user_cards**(user_id, card_id, variant, quantity) UNIQUE(user_id, card_id, variant) — qty-1 = dobel
* **user_set_progress**(user_id, set_id, owned_count, total_count, completion_pct, milestones_claimed jsonb) — denormalisasi buat binder & leaderboard

## Tabel — Pull (juga share)

* **pack_openings**(id UUID, user_id, set_id, source, idempotency_key) UNIQUE(user_id, idempotency_key)
* **pack_opening_cards**(pack_opening_id, card_id, variant, tier, slot)

## Tabel — Ledger

* **coin_transactions**(user_id, amount±, reason, ref_id, balance_after, created_at)
* **dust_transactions**(user_id, amount±, reason, ref_id, balance_after, created_at)

## Tabel — Misi & Kosmetik

* **mission_defs**(scope, description, goal_type, goal_target, reward_coins, active)
* **user_missions**(user_id, mission_def_id, period_key, progress, completed, claimed) UNIQUE(user, def, period)
* **cosmetic_defs**(type, name, unlock_hint)
* **user_cosmetics**(user_id, cosmetic_id, equipped)

## Tabel — Auction (Fase 2)

* **auction_listings**(seller_id, card_id, variant, start_price, buy_now_price, current_bid, current_bidder_id, status, expires_at)
* **auction_bids**(listing_id, bidder_id, amount)
* **auction_transactions**(listing_id, buyer_id, seller_id, price, tax)

## RPC Functions (dipanggil client via supabase.rpc)

**Mutasi (SECURITY DEFINER, baca auth.uid sendiri):**

* `open_pack(p_set_id, p_source, p_idem) → jsonb` — idempotent, atomik, resolve RNG server-side, update koleksi/progress, reward milestone.
* `dismantle_card(p_card_id, p_variant, p_qty) → jsonb` — lebur dobel (sisakan ≥1).
* `craft_card(p_card_id, p_variant) → jsonb` — craft kartu belum dimiliki (dust 4:1).
* `daily_checkin() → jsonb` — proses reset harian + streak (lazy).
* `claim_mission(p_user_mission_id) → jsonb`

**Read (SECURITY DEFINER):** `get_dashboard`, `get_my_sets`, `get_set_binder(set_id)`, `get_duplicates`, `get_leaderboard(limit)`, `get_coin_history(limit)`, `list_missions`. `get_pull(opening_id)` publik (anon) untuk share.

**Import (service_role only):** `import_series/import_sets/import_cards(jsonb)`, `map_rarity`, `remap_all_tiers`, `unmapped_rarities`.

## Trigger

* `on_auth_user_created` → buat profile + wallet (300 coin) + daily_state (5 pack) saat signup.
* `after_pack_opening` → progress misi 'open_packs'. `after_new_card` → progress misi 'new_card'.

## Completion logic

owned = COUNT(DISTINCT card_id dimiliki di set) ; denominator = sets.count_total ; pct = LEAST(100, owned*100/total).
