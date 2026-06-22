-- RipIt — Migration 003: read API RPCs (dashboard, binder, leaderboard, share).
-- Source: docs/data-model-and-schema-reference.md (ZUL-144).

create or replace function get_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_user_id uuid := auth.uid();
  v_wallet user_wallets;
  v_daily user_daily_state;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_wallet from user_wallets where user_id = v_user_id;
  select * into v_daily from user_daily_state where user_id = v_user_id;

  return jsonb_build_object(
    'coins', v_wallet.coins,
    'dust', v_wallet.dust,
    'free_packs_left', v_daily.free_packs_left,
    'streak_count', v_daily.streak_count,
    'streak_freezes', v_daily.streak_freezes
  );
end;
$$;

create or replace function get_my_sets()
returns setof user_set_progress
language sql
security definer
set search_path = public
stable
as $$
  select * from user_set_progress where user_id = auth.uid() order by set_id;
$$;

create or replace function get_set_binder(p_set_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_user_id uuid := auth.uid();
  v_cards jsonb;
  v_progress user_set_progress;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select jsonb_agg(jsonb_build_object(
    'card_id', c.id, 'name', c.name, 'tier', c.tier, 'image_url', c.image_url,
    'owned_normal', coalesce(un.quantity, 0),
    'owned_holo', coalesce(uh.quantity, 0),
    'owned_reverse', coalesce(ur.quantity, 0)
  ) order by c.local_id)
  into v_cards
  from cards c
  left join user_cards un on un.card_id = c.id and un.user_id = v_user_id and un.variant = 'normal'
  left join user_cards uh on uh.card_id = c.id and uh.user_id = v_user_id and uh.variant = 'holo'
  left join user_cards ur on ur.card_id = c.id and ur.user_id = v_user_id and ur.variant = 'reverse'
  where c.set_id = p_set_id;

  select * into v_progress from user_set_progress where user_id = v_user_id and set_id = p_set_id;

  return jsonb_build_object(
    'set_id', p_set_id,
    'cards', coalesce(v_cards, '[]'::jsonb),
    'progress', row_to_json(v_progress)
  );
end;
$$;

create or replace function get_duplicates()
returns table (card_id text, variant card_variant, quantity integer, tier card_tier, name text, image_url text)
language sql
security definer
set search_path = public
stable
as $$
  select uc.card_id, uc.variant, uc.quantity, c.tier, c.name, c.image_url
  from user_cards uc
  join cards c on c.id = uc.card_id
  where uc.user_id = auth.uid() and uc.quantity > 1
  order by c.tier desc, uc.quantity desc;
$$;

create or replace function get_leaderboard(p_limit integer default 50)
returns table (user_id uuid, username text, total_owned bigint, sets_completed bigint)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.username,
    coalesce(sum(usp.owned_count), 0) as total_owned,
    coalesce(count(*) filter (where usp.completion_pct = 100), 0) as sets_completed
  from profiles p
  left join user_set_progress usp on usp.user_id = p.id
  group by p.id, p.username
  order by total_owned desc
  limit p_limit;
$$;

create or replace function get_coin_history(p_limit integer default 50)
returns setof coin_transactions
language sql
security definer
set search_path = public
stable
as $$
  select * from coin_transactions
  where user_id = auth.uid()
  order by created_at desc
  limit p_limit;
$$;

-- Publik (anon) untuk share link hasil buka pack.
create or replace function get_pull(p_opening_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_opening pack_openings;
  v_cards jsonb;
begin
  select * into v_opening from pack_openings where id = p_opening_id;
  if v_opening.id is null then
    raise exception 'pull not found';
  end if;

  select jsonb_agg(jsonb_build_object(
    'slot', poc.slot, 'card_id', poc.card_id, 'variant', poc.variant, 'tier', poc.tier,
    'name', c.name, 'image_url', c.image_url
  ) order by poc.slot)
  into v_cards
  from pack_opening_cards poc
  join cards c on c.id = poc.card_id
  where poc.pack_opening_id = p_opening_id;

  return jsonb_build_object(
    'opening_id', v_opening.id, 'set_id', v_opening.set_id,
    'source', v_opening.source, 'cards', coalesce(v_cards, '[]'::jsonb)
  );
end;
$$;

revoke all on function get_dashboard() from public, anon;
revoke all on function get_my_sets() from public, anon;
revoke all on function get_set_binder(text) from public, anon;
revoke all on function get_duplicates() from public, anon;
revoke all on function get_coin_history(integer) from public, anon;
grant execute on function get_dashboard() to authenticated;
grant execute on function get_my_sets() to authenticated;
grant execute on function get_set_binder(text) to authenticated;
grant execute on function get_duplicates() to authenticated;
grant execute on function get_coin_history(integer) to authenticated;
grant execute on function get_leaderboard(integer) to authenticated, anon;
grant execute on function get_pull(uuid) to authenticated, anon;
