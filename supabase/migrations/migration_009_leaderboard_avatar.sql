-- RipIt — Migration 009: add avatar_url to get_leaderboard (ZUL-153).
--
-- E11 leaderboard UI needs avatars alongside rank/username. Return-table shape
-- is changing, so the function must be dropped before recreate.

drop function if exists get_leaderboard(integer);

create or replace function get_leaderboard(p_limit integer default 50)
returns table (user_id uuid, username text, avatar_url text, total_owned bigint, sets_completed bigint)
language sql security definer
set search_path = public
stable
as $$
  select p.id, p.username, p.avatar_url,
    coalesce(sum(usp.owned_count), 0) as total_owned,
    coalesce(count(*) filter (where usp.completion_pct = 100), 0) as sets_completed
  from profiles p
  left join user_set_progress usp on usp.user_id = p.id
  group by p.id, p.username, p.avatar_url
  order by total_owned desc, sets_completed desc
  limit p_limit;
$$;

grant execute on function get_leaderboard(integer) to authenticated, anon;
