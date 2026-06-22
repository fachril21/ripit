-- RipIt — Migration 002: catalog import pipeline (service_role only).
-- Source: docs/data-model-and-schema-reference.md + docs/architecture-and-security.md (ZUL-144).

create or replace function map_rarity(p_rarity_raw_en text)
returns card_tier
language sql
stable
as $$
  select coalesce(
    (select tier from rarity_tier_map where rarity_raw_en = p_rarity_raw_en),
    'FALLBACK'::card_tier
  );
$$;

create or replace function import_series(p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into series (id, name, logo_url, synced_at)
  select s->>'id', s->>'name', s->>'logo_url', now()
  from jsonb_array_elements(p_payload) s
  on conflict (id) do update set
    name = excluded.name, logo_url = excluded.logo_url, synced_at = now();
end;
$$;

create or replace function import_sets(p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into sets (
    id, series_id, name, logo_url, symbol_url,
    count_official, count_total, count_holo, count_reverse, count_normal,
    release_date, synced_at
  )
  select
    s->>'id', s->>'series_id', s->>'name', s->>'logo_url', s->>'symbol_url',
    coalesce((s->>'count_official')::integer, 0),
    coalesce((s->>'count_total')::integer, 0),
    coalesce((s->>'count_holo')::integer, 0),
    coalesce((s->>'count_reverse')::integer, 0),
    coalesce((s->>'count_normal')::integer, 0),
    (s->>'release_date')::date,
    now()
  from jsonb_array_elements(p_payload) s
  on conflict (id) do update set
    series_id = excluded.series_id, name = excluded.name, logo_url = excluded.logo_url,
    symbol_url = excluded.symbol_url, count_official = excluded.count_official,
    count_total = excluded.count_total, count_holo = excluded.count_holo,
    count_reverse = excluded.count_reverse, count_normal = excluded.count_normal,
    release_date = excluded.release_date, synced_at = now();
end;
$$;

create or replace function import_cards(p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into cards (
    id, set_id, local_id, name, image_url, rarity_raw_en, tier,
    has_normal, has_holo, has_reverse, illustrator, synced_at
  )
  select
    c->>'id', c->>'set_id', c->>'local_id', c->>'name', c->>'image_url', c->>'rarity_raw_en',
    map_rarity(c->>'rarity_raw_en'),
    coalesce((c->>'has_normal')::boolean, false),
    coalesce((c->>'has_holo')::boolean, false),
    coalesce((c->>'has_reverse')::boolean, false),
    c->>'illustrator', now()
  from jsonb_array_elements(p_payload) c
  on conflict (id) do update set
    set_id = excluded.set_id, local_id = excluded.local_id, name = excluded.name,
    image_url = excluded.image_url, rarity_raw_en = excluded.rarity_raw_en, tier = excluded.tier,
    has_normal = excluded.has_normal, has_holo = excluded.has_holo, has_reverse = excluded.has_reverse,
    illustrator = excluded.illustrator, synced_at = now();
end;
$$;

create or replace function remap_all_tiers()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update cards set tier = map_rarity(rarity_raw_en);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function unmapped_rarities()
returns table (rarity_raw_en text, card_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select c.rarity_raw_en, count(*) as card_count
  from cards c
  where c.rarity_raw_en is not null
    and not exists (select 1 from rarity_tier_map m where m.rarity_raw_en = c.rarity_raw_en)
  group by c.rarity_raw_en
  order by card_count desc;
$$;

revoke all on function import_series(jsonb) from public, anon, authenticated;
revoke all on function import_sets(jsonb) from public, anon, authenticated;
revoke all on function import_cards(jsonb) from public, anon, authenticated;
revoke all on function remap_all_tiers() from public, anon, authenticated;
revoke all on function unmapped_rarities() from public, anon, authenticated;
grant execute on function import_series(jsonb) to service_role;
grant execute on function import_sets(jsonb) to service_role;
grant execute on function import_cards(jsonb) to service_role;
grant execute on function remap_all_tiers() to service_role;
grant execute on function unmapped_rarities() to service_role;
