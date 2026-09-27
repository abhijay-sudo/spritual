-- Cross-device, caller-owned knowledge bookmarks. No copied religious text or
-- reflection is stored. Withdrawn/rights-revoked objects retain only a stable
-- private reference and resolve as unavailable until the member removes it.
-- Rollback: revoke RPC grants and drop the RPCs, then table; export user saves
-- first if this migration has been used by real accounts.

create table app.spiritual_saves (
  user_id uuid not null,
  object_kind text not null check (object_kind in ('entity','story','passage')),
  object_id text not null check (length(object_id) between 1 and 160),
  saved_at timestamptz not null default now(),
  primary key (user_id,object_kind,object_id)
);
create index spiritual_saves_user_time_idx on app.spiritual_saves(user_id,saved_at desc);
revoke all on table app.spiritual_saves from public,anon,authenticated;
alter table app.spiritual_saves enable row level security;
alter table app.spiritual_saves force row level security;

create or replace function app.fn_spiritual_object_public(p_kind text,p_id text)
returns boolean language plpgsql stable security definer set search_path=app,pg_catalog as $$
begin
  if p_kind='entity' then
    return app.fn_spiritual_entity_public(p_id::uuid);
  elsif p_kind='story' then
    return app.fn_spiritual_story_public(p_id::uuid);
  elsif p_kind='passage' then
    return app.fn_knowledge_passage(p_id,'en') is not null
      or app.fn_knowledge_passage(p_id,'hi') is not null;
  end if;
  return false;
exception when invalid_text_representation then return false;
end $$;

create or replace function app.fn_set_spiritual_save(p_kind text,p_id text,p_enabled boolean)
returns boolean language plpgsql security definer set search_path=app,pg_catalog as $$
declare actor uuid:=auth.uid();
begin
  if actor is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_kind not in ('entity','story','passage') or p_id is null or length(p_id) not between 1 and 160
     or p_enabled is null then raise exception 'invalid save request' using errcode='23514'; end if;
  if p_enabled then
    if not app.fn_spiritual_object_public(p_kind,p_id) then
      raise exception 'content unavailable' using errcode='42501';
    end if;
    insert into app.spiritual_saves(user_id,object_kind,object_id)
      values(actor,p_kind,p_id) on conflict do nothing;
  else
    delete from app.spiritual_saves where user_id=actor and object_kind=p_kind and object_id=p_id;
  end if;
  return p_enabled;
end $$;

create or replace function app.fn_my_spiritual_saves(p_language text default 'en')
returns table (object_kind text,object_id text,slug text,title text,available boolean,saved_at timestamptz)
language plpgsql stable security definer set search_path=app,pg_catalog as $$
declare actor uuid:=auth.uid();
begin
  if actor is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_language not in ('en','hi') then raise exception 'unsupported language' using errcode='23514'; end if;
  return query
  select sv.object_kind,sv.object_id,
    case when app.fn_spiritual_object_public(sv.object_kind,sv.object_id) then
      case sv.object_kind when 'entity' then e.slug when 'story' then st.slug else p.canonical_id end else null end,
    case when app.fn_spiritual_object_public(sv.object_kind,sv.object_id) then
      case sv.object_kind when 'entity' then n.display_name
        when 'story' then (case p_language when 'hi' then st.title_hi else st.title_en end)
        else (w.title||' '||p.canonical_reference) end else null end,
    app.fn_spiritual_object_public(sv.object_kind,sv.object_id),sv.saved_at
  from app.spiritual_saves sv
  left join app.spiritual_entities e on sv.object_kind='entity' and sv.object_id=e.id::text
  left join app.spiritual_entity_names n on n.entity_id=e.id and n.name_kind='primary' and n.language_code=p_language
  left join app.spiritual_stories st on sv.object_kind='story' and sv.object_id=st.id::text
  left join app.knowledge_passages p on sv.object_kind='passage' and sv.object_id=p.canonical_id
  left join app.knowledge_works w on w.id=p.work_id
  where sv.user_id=actor
  order by sv.saved_at desc,sv.object_kind,sv.object_id;
end $$;

revoke all on function app.fn_spiritual_object_public(text,text),
  app.fn_set_spiritual_save(text,text,boolean),app.fn_my_spiritual_saves(text)
  from public,anon,authenticated;
grant execute on function app.fn_set_spiritual_save(text,text,boolean),app.fn_my_spiritual_saves(text)
  to authenticated;
insert into ops.api_allowlist(function_signature,granted_to,rationale) values
  ('app.fn_set_spiritual_save(text,text,boolean)','authenticated','caller-only stable-ID save/unsave after current publication check'),
  ('app.fn_my_spiritual_saves(text)','authenticated','caller-only metadata; withdrawn objects become unavailable without copied text');
