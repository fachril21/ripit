-- RipIt — Migration 008: sync rarity_tier_map with the full TCGdex rarity list (ZUL-150).
--
-- GET https://api.tcgdex.net/v2/en/rarities returned several rarity strings that
-- migration_001's seed never covered — some brand new (Secret Rare, Crown, the
-- Pocket-style Diamond/Star/Shiny tiers), others a casing mismatch against an
-- already-seeded label (e.g. API sends "Special illustration rare", we only had
-- "Special Illustration Rare"). map_rarity() does an exact text match, so any of
-- these fell through to 'FALLBACK' — and pick_hit_tier()/pick_reverse_tier() never
-- draw FALLBACK, so those cards could never appear in a pack.

insert into rarity_tier_map (rarity_raw_en, tier) values
  -- casing fixes for rarities migration_001 already intended to cover
  ('Double rare', 'UR'),
  ('Hyper rare', 'SR'),
  ('Illustration rare', 'UR'),
  ('Shiny rare V', 'SR'),
  ('Shiny rare VMAX', 'SR'),
  ('Special illustration rare', 'SR'),
  -- previously unmapped mainline TCG rarities
  ('Black White Rare', 'UR'),
  ('Crown', 'SR'),
  ('Mega Hyper Rare', 'SR'),
  ('Rare Holo LV.X', 'RH'),
  ('Rare PRIME', 'RH'),
  ('Secret Rare', 'SR'),
  ('Shiny Ultra Rare', 'SR'),
  ('Shiny rare', 'SR'),
  ('Ultra Rare', 'UR'),
  -- Pocket-style Diamond/Star/Shiny rarities, ranked by their in-game pull difficulty
  ('One Diamond', 'C'),
  ('Two Diamond', 'U'),
  ('Three Diamond', 'R'),
  ('Four Diamond', 'RH'),
  ('One Star', 'UR'),
  ('Two Star', 'SR'),
  ('Three Star', 'SR'),
  ('One Shiny', 'SR'),
  ('Two Shiny', 'SR'),
  -- "None" is TCGdex's marker for cards with no rarity (e.g. some Energy cards),
  -- not a missing mapping — keep it pinned to FALLBACK explicitly so it stops
  -- showing up in unmapped_rarities().
  ('None', 'FALLBACK')
on conflict (rarity_raw_en) do nothing;

-- Re-derive tier for every already-imported card so existing rows pick up the
-- new mappings immediately instead of waiting for the next catalog sync.
select remap_all_tiers();
