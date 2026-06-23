# sync-catalog (ZUL-146)

Pulls series/sets/cards from TCGdex and upserts them into the catalog tables
via `import_series` / `import_sets` / `import_cards` (service_role RPCs from
`migration_002_import.sql`). This is the **only** place that talks to TCGdex —
`open_pack` reads exclusively from the local catalog.

## Deploy

```bash
supabase functions deploy sync-catalog
supabase secrets set SYNC_CATALOG_SECRET=<random-value>
```

## Invoke manually (backfill / debugging)

```bash
curl -X POST "https://<project-ref>.functions.supabase.co/sync-catalog" \
  -H "Authorization: Bearer <random-value>" \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

Body options:
- `force: true` — re-fetch card details for every set, ignoring the cache check.
- `setIds: ["base1", "swsh1"]` — limit the run to specific sets.
- `cardBudget: 200` (default) — max number of individual card-detail fetches
  per invocation. TCGdex has no bulk card endpoint — `rarity`, `variants`, and
  `illustrator` only exist on `GET /cards/{id}`, one HTTP request per card.
  A full first-time backfill (~20k+ cards across the catalog) cannot fit in
  one invocation's wall-clock limit, so a set is only imported once the
  function can fetch *all* of its cards within the remaining budget — it
  never imports a set's cards partially. Check `sets_remaining` in the
  response and keep calling until it's `0`:

```bash
until [ "$(curl -s -X POST "https://<project-ref>.functions.supabase.co/sync-catalog" \
  -H "Authorization: Bearer <random-value>" -H "Content-Type: application/json" \
  -d '{}' | jq '.sets_remaining')" = "0" ]; do sleep 1; done
```

## Schedule

See `migration_005_catalog_sync_schedule.sql` for the pg_cron + pg_net job
that calls this function daily. It requires a Vault secret named
`sync_catalog_secret` holding the same value as `SYNC_CATALOG_SECRET`.

## After the first sync

```sql
select * from unmapped_rarities();
-- fill any gaps into rarity_tier_map, then:
select remap_all_tiers();
```
