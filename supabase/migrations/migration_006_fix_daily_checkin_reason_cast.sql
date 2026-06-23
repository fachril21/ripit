-- RipIt — Migration 006: fix daily_checkin() enum cast bug (found during E5 testing).
--
-- Postgres resolves a CASE expression whose branches are bare string literals
-- ('streak' / 'daily_login') to type `text`, not `unknown` — so it does not
-- get the implicit literal-to-enum assignment cast that a single bare
-- literal would. Inserting that `text` value into the `coin_reason` enum
-- column failed with:
--   column "reason" is of type coin_reason but expression is of type text
-- which rolled back the whole daily_checkin() transaction (no reward, no
-- last_login_date update, no error surfaced to the client beyond the RPC
-- error itself).

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
      case when v_state.streak_count > 1 then 'streak' else 'daily_login' end::coin_reason,
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
