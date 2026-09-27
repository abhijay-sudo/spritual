-- Published graph revisions are immutable. To correct content, withdraw the
-- published row and prepare a new draft with a new ID, review and publication.
-- Current rights can still be revoked; public RPCs recheck them on every call.
-- Rollback: drop the four triggers and the two functions below. Do not do so
-- while published records exist without a replacement integrity policy.

create or replace function app.trg_lock_spiritual_published()
returns trigger language plpgsql security definer set search_path = app, pg_catalog as $$
begin
  if tg_op='DELETE' then
    if old.published_at is not null then
      raise exception 'published content must be withdrawn, not deleted' using errcode='23514';
    end if;
    return old;
  end if;
  if tg_op='UPDATE' and old.published_at is not null then
    if tg_table_name='spiritual_media_assets' then
      if (to_jsonb(new)-'withdrawn_at'-'rights_status'-'editorial_status')
           is distinct from (to_jsonb(old)-'withdrawn_at'-'rights_status'-'editorial_status')
         or (new.rights_status is distinct from old.rights_status and not (old.rights_status='verified' and new.rights_status='revoked'))
         or (new.editorial_status is distinct from old.editorial_status and not (old.editorial_status='verified' and new.editorial_status='archived')) then
        raise exception 'published media is immutable except withdrawal or rights revocation' using errcode='23514';
      end if;
    elsif (to_jsonb(new)-'withdrawn_at'-'updated_at')
             is distinct from (to_jsonb(old)-'withdrawn_at'-'updated_at') then
      raise exception 'published content is immutable; withdraw and create a new revision' using errcode='23514';
    end if;
  end if;
  return new;
end $$;

create trigger lock_spiritual_entity before update or delete on app.spiritual_entities
  for each row execute function app.trg_lock_spiritual_published();
create trigger lock_spiritual_story before update or delete on app.spiritual_stories
  for each row execute function app.trg_lock_spiritual_published();
create trigger lock_spiritual_media before update or delete on app.spiritual_media_assets
  for each row execute function app.trg_lock_spiritual_published();

create or replace function app.trg_lock_spiritual_child()
returns trigger language plpgsql security definer set search_path = app, pg_catalog as $$
declare parent_id uuid; published timestamptz;
begin
  if tg_table_name='spiritual_story_scenes' then
    parent_id := case when tg_op='DELETE' then old.story_id else new.story_id end;
    select published_at into published from app.spiritual_stories where id=parent_id;
  else
    parent_id := case when tg_op='DELETE' then old.entity_id else new.entity_id end;
    select published_at into published from app.spiritual_entities where id=parent_id;
  end if;
  if published is not null then
    raise exception 'published names or scenes cannot change in place' using errcode='23514';
  end if;
  if tg_op='UPDATE' then
    if tg_table_name='spiritual_entity_names' then
      if new.entity_id is distinct from old.entity_id
         and exists(select 1 from app.spiritual_entities where id=old.entity_id and published_at is not null) then
        raise exception 'published names cannot be moved' using errcode='23514';
      end if;
    else
      if new.story_id is distinct from old.story_id
         and exists(select 1 from app.spiritual_stories where id=old.story_id and published_at is not null) then
        raise exception 'published scenes cannot be moved' using errcode='23514';
      end if;
    end if;
  end if;
  return case when tg_op='DELETE' then old else new end;
end $$;

create trigger lock_spiritual_name before insert or update or delete on app.spiritual_entity_names
  for each row execute function app.trg_lock_spiritual_child();
create trigger lock_spiritual_scene before insert or update or delete on app.spiritual_story_scenes
  for each row execute function app.trg_lock_spiritual_child();

revoke all on function app.trg_lock_spiritual_published(),app.trg_lock_spiritual_child()
  from public,anon,authenticated;
