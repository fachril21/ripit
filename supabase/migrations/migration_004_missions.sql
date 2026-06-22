-- RipIt — Migration 004: mission progress triggers, claim/list RPCs.
-- Source: docs/data-model-and-schema-reference.md (ZUL-144).

create or replace function _period_key(p_scope mission_scope)
returns text
language sql
stable
as $$
  select case p_scope
    when 'daily' then to_char(current_date, 'YYYY-MM-DD')
    when 'weekly' then to_char(date_trunc('week', current_date), 'YYYY-MM-DD')
  end;
$$;

create or replace function record_mission_progress(p_user_id uuid, p_goal_type text, p_amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_def mission_defs;
  v_period text;
begin
  for v_def in select * from mission_defs where goal_type = p_goal_type and active loop
    v_period := _period_key(v_def.scope);

    insert into user_missions (user_id, mission_def_id, period_key, progress, completed)
    values (p_user_id, v_def.id, v_period, p_amount, p_amount >= v_def.goal_target)
    on conflict (user_id, mission_def_id, period_key)
    do update set
      progress = least(user_missions.progress + p_amount, v_def.goal_target),
      completed = (user_missions.progress + p_amount) >= v_def.goal_target;
  end loop;
end;
$$;

-- after_pack_opening: progres misi 'open_packs' — 1 buka = 1 progres, lewat trigger insert.
create or replace function after_pack_opening()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform record_mission_progress(new.user_id, 'open_packs', 1);
  return new;
end;
$$;

create trigger after_pack_opening
  after insert on pack_openings
  for each row
  execute function after_pack_opening();

-- after_new_card: AFTER INSERT (bukan ON CONFLICT UPDATE) → hanya fire saat kartu benar2 baru.
create or replace function after_new_card()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform record_mission_progress(new.user_id, 'new_card', 1);
  return new;
end;
$$;

create trigger after_new_card
  after insert on user_cards
  for each row
  execute function after_new_card();

create or replace function list_missions()
returns table (
  id uuid, mission_def_id uuid, scope mission_scope, description text,
  goal_type text, goal_target integer, progress integer, completed boolean,
  claimed boolean, reward_coins integer, period_key text
)
language sql
security definer
set search_path = public
stable
as $$
  select um.id, um.mission_def_id, md.scope, md.description, md.goal_type,
    md.goal_target, um.progress, um.completed, um.claimed, md.reward_coins, um.period_key
  from user_missions um
  join mission_defs md on md.id = um.mission_def_id
  where um.user_id = auth.uid()
    and um.period_key = _period_key(md.scope)
  order by md.scope, md.description;
$$;

create or replace function claim_mission(p_user_mission_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_mission user_missions;
  v_def mission_defs;
  v_wallet user_wallets;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_mission from user_missions
  where id = p_user_mission_id and user_id = v_user_id
  for update;

  if v_mission.id is null then
    raise exception 'mission not found';
  end if;
  if not v_mission.completed then
    raise exception 'mission not completed yet';
  end if;
  if v_mission.claimed then
    raise exception 'mission already claimed';
  end if;

  select * into v_def from mission_defs where id = v_mission.mission_def_id;

  update user_missions set claimed = true where id = p_user_mission_id;

  update user_wallets set coins = coins + v_def.reward_coins, updated_at = now()
  where user_id = v_user_id
  returning * into v_wallet;

  insert into coin_transactions (user_id, amount, reason, ref_id, balance_after)
  values (v_user_id, v_def.reward_coins, 'mission', p_user_mission_id::text, v_wallet.coins);

  return jsonb_build_object('mission_id', p_user_mission_id, 'reward_coins', v_def.reward_coins, 'coins', v_wallet.coins);
end;
$$;

revoke all on function list_missions() from public, anon;
revoke all on function claim_mission(uuid) from public, anon;
grant execute on function list_missions() to authenticated;
grant execute on function claim_mission(uuid) to authenticated;
