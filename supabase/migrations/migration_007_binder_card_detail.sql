-- RipIt — Migration 007: add rarity/illustrator to get_set_binder for card detail modal (ZUL-150).

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
    'card_id', c.id, 'local_id', c.local_id, 'name', c.name, 'tier', c.tier, 'image_url', c.image_url,
    'rarity_raw_en', c.rarity_raw_en, 'illustrator', c.illustrator,
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
