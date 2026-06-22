-- RipIt — Migration 001: enums, all tables, RLS, signup trigger, core economy RPCs.
-- Source: docs/data-model-and-schema-reference.md + docs/architecture-and-security.md (ZUL-144).

-- ── Enums ──────────────────────────────────────────────────────────────────

create type card_tier as enum ('C', 'U', 'R', 'RH', 'UR', 'SR', 'FALLBACK');
create type card_variant as enum ('normal', 'holo', 'reverse', 'first_edition');
create type pack_source as enum ('free', 'coin');
create type coin_reason as enum (
  'onboarding', 'daily_login', 'streak', 'mission', 'completion',
  'pack_purchase', 'auction_sale', 'auction_buy', 'auction_tax'
);
create type dust_reason as enum ('onboarding', 'dismantle', 'craft');
create type mission_scope as enum ('daily', 'weekly');
create type auction_status as enum ('active', 'sold', 'cancelled', 'expired');

-- ── Catalog (synced from TCGdex) ─────────────────────────────────────────

create table series (
  id text primary key,
  name text not null,
  logo_url text,
  synced_at timestamptz not null default now()
);

create table sets (
  id text primary key,
  series_id text not null references series(id) on delete cascade,
  name text not null,
  logo_url text,
  symbol_url text,
  count_official integer not null default 0,
  count_total integer not null default 0,
  count_holo integer not null default 0,
  count_reverse integer not null default 0,
  count_normal integer not null default 0,
  release_date date,
  synced_at timestamptz not null default now()
);

create table rarity_tier_map (
  rarity_raw_en text primary key,
  tier card_tier not null
);

create table cards (
  id text primary key,
  set_id text not null references sets(id) on delete cascade,
  local_id text not null,
  name text not null,
  image_url text,
  rarity_raw_en text,
  tier card_tier not null default 'FALLBACK',
  has_normal boolean not null default false,
  has_holo boolean not null default false,
  has_reverse boolean not null default false,
  illustrator text,
  synced_at timestamptz not null default now()
);
create index cards_set_id_idx on cards(set_id);
create index cards_tier_idx on cards(tier);

-- ── User & wallet ─────────────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table user_wallets (
  user_id uuid primary key references profiles(id) on delete cascade,
  coins integer not null default 0 check (coins >= 0),
  dust integer not null default 0 check (dust >= 0),
  updated_at timestamptz not null default now()
);

create table user_daily_state (
  user_id uuid primary key references profiles(id) on delete cascade,
  free_packs_left integer not null default 0 check (free_packs_left >= 0),
  free_packs_reset_at date not null default current_date,
  last_login_date date,
  streak_count integer not null default 0,
  streak_freezes integer not null default 0
);

-- ── Collection ────────────────────────────────────────────────────────────

create table user_cards (
  user_id uuid not null references profiles(id) on delete cascade,
  card_id text not null references cards(id) on delete cascade,
  variant card_variant not null,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, card_id, variant)
);
create index user_cards_user_id_idx on user_cards(user_id);

create table user_set_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  set_id text not null references sets(id) on delete cascade,
  owned_count integer not null default 0,
  total_count integer not null default 0,
  completion_pct integer not null default 0,
  milestones_claimed jsonb not null default '[]'::jsonb,
  unique (user_id, set_id)
);
create index user_set_progress_user_id_idx on user_set_progress(user_id);

-- ── Pull (also used for share) ───────────────────────────────────────────

create table pack_openings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  set_id text not null references sets(id),
  source pack_source not null,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index pack_openings_user_id_idx on pack_openings(user_id);

create table pack_opening_cards (
  pack_opening_id uuid not null references pack_openings(id) on delete cascade,
  card_id text not null references cards(id),
  variant card_variant not null,
  tier card_tier not null,
  slot integer not null check (slot between 1 and 10)
);
create index pack_opening_cards_opening_id_idx on pack_opening_cards(pack_opening_id);

-- ── Ledger ────────────────────────────────────────────────────────────────

create table coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount integer not null,
  reason coin_reason not null,
  ref_id text,
  balance_after integer not null,
  created_at timestamptz not null default now()
);
create index coin_transactions_user_id_idx on coin_transactions(user_id, created_at desc);

create table dust_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount integer not null,
  reason dust_reason not null,
  ref_id text,
  balance_after integer not null,
  created_at timestamptz not null default now()
);
create index dust_transactions_user_id_idx on dust_transactions(user_id, created_at desc);

-- ── Missions & cosmetics ──────────────────────────────────────────────────

create table mission_defs (
  id uuid primary key default gen_random_uuid(),
  scope mission_scope not null,
  description text not null unique,
  goal_type text not null,
  goal_target integer not null,
  reward_coins integer not null default 0,
  active boolean not null default true
);

create table user_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  mission_def_id uuid not null references mission_defs(id) on delete cascade,
  period_key text not null,
  progress integer not null default 0,
  completed boolean not null default false,
  claimed boolean not null default false,
  unique (user_id, mission_def_id, period_key)
);
create index user_missions_user_id_idx on user_missions(user_id, period_key);

create table cosmetic_defs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text not null,
  unlock_hint text
);

create table user_cosmetics (
  user_id uuid not null references profiles(id) on delete cascade,
  cosmetic_id uuid not null references cosmetic_defs(id) on delete cascade,
  equipped boolean not null default false,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, cosmetic_id)
);

-- ── Auction (Fase 2 — schema defined now per E2 scope, RPCs land in E13) ──

create table auction_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  card_id text not null references cards(id),
  variant card_variant not null,
  start_price integer not null check (start_price > 0),
  buy_now_price integer check (buy_now_price is null or buy_now_price >= start_price),
  current_bid integer,
  current_bidder_id uuid references profiles(id),
  status auction_status not null default 'active',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index auction_listings_status_idx on auction_listings(status);

create table auction_bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references auction_listings(id) on delete cascade,
  bidder_id uuid not null references profiles(id) on delete cascade,
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index auction_bids_listing_id_idx on auction_bids(listing_id);

create table auction_transactions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references auction_listings(id),
  buyer_id uuid not null references profiles(id),
  seller_id uuid not null references profiles(id),
  price integer not null,
  tax integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── Signup trigger: profile + wallet (300 coin) + daily_state (5 free pack) ─

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));

  insert into public.user_wallets (user_id, coins, dust)
  values (new.id, 300, 0);

  insert into public.user_daily_state (user_id, free_packs_left, free_packs_reset_at, last_login_date, streak_count, streak_freezes)
  values (new.id, 5, current_date, current_date, 1, 0);

  insert into public.coin_transactions (user_id, amount, reason, balance_after)
  values (new.id, 300, 'onboarding', 300);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

revoke all on function handle_new_user() from public, anon, authenticated;

-- ── RLS ───────────────────────────────────────────────────────────────────

alter table series enable row level security;
alter table sets enable row level security;
alter table rarity_tier_map enable row level security;
alter table cards enable row level security;
alter table profiles enable row level security;
alter table user_wallets enable row level security;
alter table user_daily_state enable row level security;
alter table user_cards enable row level security;
alter table user_set_progress enable row level security;
alter table pack_openings enable row level security;
alter table pack_opening_cards enable row level security;
alter table coin_transactions enable row level security;
alter table dust_transactions enable row level security;
alter table mission_defs enable row level security;
alter table user_missions enable row level security;
alter table cosmetic_defs enable row level security;
alter table user_cosmetics enable row level security;
alter table auction_listings enable row level security;
alter table auction_bids enable row level security;
alter table auction_transactions enable row level security;

-- Catalog & config: public read.
create policy "public read series" on series for select using (true);
create policy "public read sets" on sets for select using (true);
create policy "public read rarity_tier_map" on rarity_tier_map for select using (true);
create policy "public read cards" on cards for select using (true);
create policy "public read mission_defs" on mission_defs for select using (true);
create policy "public read cosmetic_defs" on cosmetic_defs for select using (true);

-- Profiles: public read, update own.
create policy "public read profiles" on profiles for select using (true);
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- Economy: read-own SELECT only — no write policy, all writes via SECURITY DEFINER RPCs.
create policy "read own wallet" on user_wallets for select using (auth.uid() = user_id);
create policy "read own daily state" on user_daily_state for select using (auth.uid() = user_id);
create policy "read own cards" on user_cards for select using (auth.uid() = user_id);
create policy "read own set progress" on user_set_progress for select using (auth.uid() = user_id);
create policy "read own coin transactions" on coin_transactions for select using (auth.uid() = user_id);
create policy "read own dust transactions" on dust_transactions for select using (auth.uid() = user_id);
create policy "read own missions" on user_missions for select using (auth.uid() = user_id);
create policy "read own cosmetics" on user_cosmetics for select using (auth.uid() = user_id);

-- Pulls: public read (share link).
create policy "public read pack openings" on pack_openings for select using (true);
create policy "public read pack opening cards" on pack_opening_cards for select using (true);

-- Auction (Fase 2): listings public read (market); bids/transactions participant-only.
create policy "public read auction listings" on auction_listings for select using (true);
create policy "read own bids" on auction_bids for select using (auth.uid() = bidder_id);
create policy "read own auction transactions" on auction_transactions
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- ── Pull-rate helpers (docs/economy-and-pull-rate-spec.md §3) ──────────────

create or replace function pick_hit_tier()
returns card_tier
language sql
as $$
  select case
    when r < 0.55 then 'R'::card_tier
    when r < 0.83 then 'RH'::card_tier
    when r < 0.96 then 'UR'::card_tier
    else 'SR'::card_tier
  end
  from (select random() as r) s;
$$;

create or replace function pick_reverse_tier()
returns card_tier
language sql
as $$
  select case
    when r < 0.65 then 'C'::card_tier
    when r < 0.93 then 'U'::card_tier
    else 'R'::card_tier
  end
  from (select random() as r) s;
$$;

-- ── Core economy RPCs (SECURITY DEFINER, read auth.uid() themselves) ──────

create or replace function daily_checkin()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_state user_daily_state;
  v_today date := current_date;
  v_coin_gain integer := 0;
  v_wallet user_wallets;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_state from user_daily_state where user_id = v_user_id for update;
  if v_state.user_id is null then
    raise exception 'daily state not found';
  end if;

  if v_state.last_login_date is distinct from v_today then
    if v_state.last_login_date = v_today - 1 then
      v_state.streak_count := v_state.streak_count + 1;
    elsif v_state.streak_freezes > 0 then
      v_state.streak_freezes := v_state.streak_freezes - 1;
    else
      v_state.streak_count := 1;
    end if;

    v_coin_gain := 50 + least((v_state.streak_count - 1) * 10, 100);

    update user_daily_state
    set last_login_date = v_today,
        free_packs_left = 5,
        free_packs_reset_at = v_today,
        streak_count = v_state.streak_count,
        streak_freezes = v_state.streak_freezes
    where user_id = v_user_id;

    update user_wallets
    set coins = coins + v_coin_gain, updated_at = now()
    where user_id = v_user_id
    returning * into v_wallet;

    insert into coin_transactions (user_id, amount, reason, balance_after)
    values (
      v_user_id, v_coin_gain,
      case when v_state.streak_count > 1 then 'streak' else 'daily_login' end,
      v_wallet.coins
    );
  else
    select * into v_wallet from user_wallets where user_id = v_user_id;
  end if;

  return jsonb_build_object(
    'streak_count', v_state.streak_count,
    'free_packs_left', (select free_packs_left from user_daily_state where user_id = v_user_id),
    'coins', v_wallet.coins,
    'coin_gain', v_coin_gain
  );
end;
$$;

create or replace function open_pack(p_set_id text, p_source pack_source, p_idem text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing pack_openings;
  v_opening_id uuid;
  v_wallet user_wallets;
  v_daily user_daily_state;
  v_card record;
  v_slot integer;
  v_tier card_tier;
  v_variant card_variant;
  v_cards jsonb := '[]'::jsonb;
  v_owned_count integer;
  v_total_count integer;
  v_pct integer;
  c_pack_price constant integer := 100;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_existing from pack_openings where user_id = v_user_id and idempotency_key = p_idem;
  if v_existing.id is not null then
    return get_pull(v_existing.id);
  end if;

  perform daily_checkin();

  select * into v_daily from user_daily_state where user_id = v_user_id for update;

  if p_source = 'free' then
    if v_daily.free_packs_left < 1 then
      raise exception 'no free packs left';
    end if;
    update user_daily_state set free_packs_left = free_packs_left - 1 where user_id = v_user_id;
  else
    select * into v_wallet from user_wallets where user_id = v_user_id for update;
    if v_wallet.coins < c_pack_price then
      raise exception 'insufficient coins';
    end if;
    update user_wallets set coins = coins - c_pack_price, updated_at = now()
    where user_id = v_user_id returning * into v_wallet;
    insert into coin_transactions (user_id, amount, reason, ref_id, balance_after)
    values (v_user_id, -c_pack_price, 'pack_purchase', p_set_id, v_wallet.coins);
  end if;

  insert into pack_openings (user_id, set_id, source, idempotency_key)
  values (v_user_id, p_set_id, p_source, p_idem)
  returning id into v_opening_id;

  for v_slot in 1..10 loop
    if v_slot <= 5 then
      v_tier := 'C';
      v_variant := 'normal';
    elsif v_slot <= 8 then
      v_tier := 'U';
      v_variant := 'normal';
    elsif v_slot = 9 then
      v_tier := pick_reverse_tier();
      v_variant := 'reverse';
    else
      v_tier := pick_hit_tier();
      v_variant := 'holo';
    end if;

    select c.* into v_card from cards c
    where c.set_id = p_set_id and c.tier = v_tier
    order by random() limit 1;

    if v_card.id is null then
      select c.* into v_card from cards c
      where c.set_id = p_set_id and c.tier <= v_tier
      order by c.tier desc, random() limit 1;
    end if;

    if v_card.id is null then
      select c.* into v_card from cards c where c.set_id = p_set_id order by random() limit 1;
    end if;

    insert into pack_opening_cards (pack_opening_id, card_id, variant, tier, slot)
    values (v_opening_id, v_card.id, v_variant, v_tier, v_slot);

    insert into user_cards (user_id, card_id, variant, quantity, updated_at)
    values (v_user_id, v_card.id, v_variant, 1, now())
    on conflict (user_id, card_id, variant)
    do update set quantity = user_cards.quantity + 1, updated_at = now();

    v_cards := v_cards || jsonb_build_object(
      'slot', v_slot, 'card_id', v_card.id, 'name', v_card.name,
      'tier', v_tier, 'variant', v_variant, 'image_url', v_card.image_url
    );
  end loop;

  select count(distinct uc.card_id) into v_owned_count
  from user_cards uc
  where uc.user_id = v_user_id and uc.quantity > 0
    and uc.card_id in (select id from cards where set_id = p_set_id);

  select count_total into v_total_count from sets where id = p_set_id;
  v_pct := case when v_total_count > 0 then least(100, v_owned_count * 100 / v_total_count) else 0 end;

  insert into user_set_progress (user_id, set_id, owned_count, total_count, completion_pct)
  values (v_user_id, p_set_id, v_owned_count, v_total_count, v_pct)
  on conflict (user_id, set_id)
  do update set owned_count = v_owned_count, total_count = v_total_count, completion_pct = v_pct;

  return jsonb_build_object(
    'opening_id', v_opening_id, 'set_id', p_set_id, 'source', p_source,
    'cards', v_cards, 'set_progress_pct', v_pct
  );
end;
$$;

create or replace function dismantle_card(p_card_id text, p_variant card_variant, p_qty integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_owned user_cards;
  v_tier card_tier;
  v_dust_gain integer;
  v_wallet user_wallets;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;
  if p_qty < 1 then
    raise exception 'qty must be >= 1';
  end if;

  select * into v_owned from user_cards
  where user_id = v_user_id and card_id = p_card_id and variant = p_variant
  for update;

  if v_owned.user_id is null or v_owned.quantity - p_qty < 1 then
    raise exception 'cannot dismantle: must keep at least 1 copy';
  end if;

  select tier into v_tier from cards where id = p_card_id;

  v_dust_gain := (case v_tier
    when 'C' then 5 when 'U' then 15 when 'R' then 40
    when 'RH' then 100 when 'UR' then 300 when 'SR' then 800
    else 0
  end) * p_qty;

  update user_cards set quantity = quantity - p_qty, updated_at = now()
  where user_id = v_user_id and card_id = p_card_id and variant = p_variant;

  update user_wallets set dust = dust + v_dust_gain, updated_at = now()
  where user_id = v_user_id returning * into v_wallet;

  insert into dust_transactions (user_id, amount, reason, ref_id, balance_after)
  values (v_user_id, v_dust_gain, 'dismantle', p_card_id, v_wallet.dust);

  return jsonb_build_object('card_id', p_card_id, 'variant', p_variant, 'dust_gain', v_dust_gain, 'dust_balance', v_wallet.dust);
end;
$$;

create or replace function craft_card(p_card_id text, p_variant card_variant)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_already_owned integer;
  v_tier card_tier;
  v_dust_cost integer;
  v_wallet user_wallets;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select quantity into v_already_owned from user_cards
  where user_id = v_user_id and card_id = p_card_id and variant = p_variant;

  if coalesce(v_already_owned, 0) > 0 then
    raise exception 'card already owned; craft is only for missing cards';
  end if;

  select tier into v_tier from cards where id = p_card_id;
  if v_tier is null then
    raise exception 'card not found';
  end if;

  v_dust_cost := case v_tier
    when 'C' then 20 when 'U' then 60 when 'R' then 160
    when 'RH' then 400 when 'UR' then 1200 when 'SR' then 3200
    else null
  end;
  if v_dust_cost is null then
    raise exception 'card tier not craftable';
  end if;

  select * into v_wallet from user_wallets where user_id = v_user_id for update;
  if v_wallet.dust < v_dust_cost then
    raise exception 'insufficient dust';
  end if;

  update user_wallets set dust = dust - v_dust_cost, updated_at = now()
  where user_id = v_user_id returning * into v_wallet;

  insert into dust_transactions (user_id, amount, reason, ref_id, balance_after)
  values (v_user_id, -v_dust_cost, 'craft', p_card_id, v_wallet.dust);

  insert into user_cards (user_id, card_id, variant, quantity, updated_at)
  values (v_user_id, p_card_id, p_variant, 1, now())
  on conflict (user_id, card_id, variant)
  do update set quantity = user_cards.quantity + 1, updated_at = now();

  return jsonb_build_object('card_id', p_card_id, 'variant', p_variant, 'dust_spent', v_dust_cost, 'dust_balance', v_wallet.dust);
end;
$$;

revoke all on function daily_checkin() from public, anon;
revoke all on function open_pack(text, pack_source, text) from public, anon;
revoke all on function dismantle_card(text, card_variant, integer) from public, anon;
revoke all on function craft_card(text, card_variant) from public, anon;
grant execute on function daily_checkin() to authenticated;
grant execute on function open_pack(text, pack_source, text) to authenticated;
grant execute on function dismantle_card(text, card_variant, integer) to authenticated;
grant execute on function craft_card(text, card_variant) to authenticated;

-- ── Seed: rarity_tier_map (docs/economy-and-pull-rate-spec.md §1) ─────────

insert into rarity_tier_map (rarity_raw_en, tier) values
  ('Common', 'C'),
  ('Uncommon', 'U'),
  ('Rare', 'R'),
  ('Rare Holo', 'RH'), ('Holo Rare', 'RH'), ('Radiant Rare', 'RH'), ('Amazing Rare', 'RH'),
  ('Holo Rare V', 'UR'), ('Holo Rare VMAX', 'UR'), ('Holo Rare VSTAR', 'UR'),
  ('Double Rare', 'UR'), ('Full Art Trainer', 'UR'), ('Illustration Rare', 'UR'),
  ('ACE SPEC Rare', 'UR'), ('LEGEND', 'UR'),
  ('Hyper Rare', 'SR'), ('Shiny Rare V', 'SR'), ('Shiny Rare VMAX', 'SR'),
  ('Classic Collection', 'SR'), ('Special Illustration Rare', 'SR')
on conflict (rarity_raw_en) do nothing;

-- ── Seed: misi (docs/economy-and-pull-rate-spec.md §5) ────────────────────

insert into mission_defs (scope, description, goal_type, goal_target, reward_coins, active) values
  ('daily', 'Buka 3 pack', 'open_packs', 3, 30, true),
  ('daily', 'Dapatkan 1 kartu baru', 'new_card', 1, 25, true),
  ('daily', 'Login hari ini', 'login', 1, 25, true),
  ('weekly', 'Buka 20 pack minggu ini', 'open_packs', 20, 200, true),
  ('weekly', 'Dapatkan 10 kartu baru minggu ini', 'new_card', 10, 200, true)
on conflict (description) do nothing;
