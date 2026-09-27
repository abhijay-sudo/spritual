-- Phase III: a deliberate publication boundary for the private 0012 graph.
-- No religious records are inserted. Existing draft rows remain unpublished.
-- Rollback: revoke the new RPC grants, drop the new functions/triggers and
-- publication audit table, then remove the nullable columns. Never roll back
-- after public records exist without first withdrawing and exporting them.

alter table app.spiritual_entities
  add column source_id uuid references app.knowledge_sources(id),
  add column edition_id uuid references app.knowledge_editions(id),
  add column source_reference text,
  add column reviewer_id uuid references app.reviewers(id),
  add column reviewed_at timestamptz,
  add column published_at timestamptz,
  add column published_by uuid,
  add column withdrawn_at timestamptz;

alter table app.spiritual_stories
  add column published_at timestamptz,
  add column published_by uuid,
  add column withdrawn_at timestamptz;

alter table app.spiritual_media_assets
  add column reviewer_id uuid references app.reviewers(id),
  add column reviewed_at timestamptz,
  add column published_at timestamptz,
  add column published_by uuid,
  add column withdrawn_at timestamptz;

create table app.spiritual_publication_audit (
  id bigint generated always as identity primary key,
  object_kind text not null check (object_kind in ('entity','story','media')),
  object_id uuid not null,
  action text not null check (action in ('publish','withdraw')),
  actor_id uuid,
  occurred_at timestamptz not null default now()
);
revoke all on table app.spiritual_publication_audit from public, anon, authenticated;
alter table app.spiritual_publication_audit enable row level security;
alter table app.spiritual_publication_audit force row level security;

create or replace function app.fn_spiritual_edition_eligible(p_source_id uuid, p_edition_id uuid)
returns boolean language sql stable security definer set search_path = app, pg_catalog as $$
  select exists (
    select 1 from app.knowledge_editions e
    join app.knowledge_sources s on s.id=e.source_id
    join app.knowledge_source_licenses l on l.edition_id=e.id
    where e.id=p_edition_id and e.source_id=p_source_id
      and s.provenance_status='verified' and s.verified_at is not null
      and l.status='verified' and l.may_redistribute
      and (l.valid_from is null or l.valid_from<=current_date)
      and (l.valid_until is null or l.valid_until>=current_date)
  );
$$;

create or replace function app.fn_spiritual_reviewer_eligible(p_reviewer_id uuid, p_reviewed_at timestamptz)
returns boolean language sql stable security definer set search_path = app, pg_catalog as $$
  select p_reviewed_at is not null and exists (
    select 1 from app.reviewers r where r.id=p_reviewer_id and r.auth_user_id is not null
      and exists (select 1 from app.reviewer_languages l where l.reviewer_id=r.id and l.language_code='en')
      and exists (select 1 from app.reviewer_languages l where l.reviewer_id=r.id and l.language_code='hi')
  );
$$;

create or replace function app.fn_spiritual_media_public(p_id uuid)
returns boolean language sql stable security definer set search_path = app, pg_catalog as $$
  select exists (
    select 1 from app.spiritual_media_assets m
    where m.id=p_id and m.editorial_status='verified' and m.rights_status='verified'
      and nullif(btrim(coalesce(m.rights_evidence,'')),'') is not null
      and m.published_at is not null and m.withdrawn_at is null
      and app.fn_spiritual_reviewer_eligible(m.reviewer_id,m.reviewed_at)
  );
$$;

create or replace function app.fn_spiritual_entity_public(p_id uuid)
returns boolean language sql stable security definer set search_path = app, pg_catalog as $$
  select exists (
    select 1 from app.spiritual_entities e
    where e.id=p_id and e.editorial_status='verified'
      and e.published_at is not null and e.withdrawn_at is null
      and nullif(btrim(coalesce(e.tradition_context,'')),'') is not null
      and nullif(btrim(coalesce(e.source_reference,'')),'') is not null
      and app.fn_spiritual_edition_eligible(e.source_id,e.edition_id)
      and app.fn_spiritual_reviewer_eligible(e.reviewer_id,e.reviewed_at)
      and exists (select 1 from app.spiritual_entity_names n where n.entity_id=e.id and n.name_kind='primary' and n.language_code='en')
      and exists (select 1 from app.spiritual_entity_names n where n.entity_id=e.id and n.name_kind='primary' and n.language_code='hi')
  );
$$;

create or replace function app.fn_spiritual_story_public(p_id uuid)
returns boolean language sql stable security definer set search_path = app, pg_catalog as $$
  select exists (
    select 1 from app.spiritual_stories st
    where st.id=p_id and st.editorial_status='verified'
      and st.published_at is not null and st.withdrawn_at is null
      and app.fn_spiritual_edition_eligible(st.source_id,st.edition_id)
      and app.fn_spiritual_reviewer_eligible(st.reviewer_id,st.reviewed_at)
      and exists (select 1 from app.spiritual_story_scenes sc where sc.story_id=st.id)
  );
$$;

create or replace function app.trg_guard_spiritual_publication()
returns trigger language plpgsql security definer set search_path = app, pg_catalog as $$
declare eligible boolean;
begin
  if tg_op='UPDATE' and old.published_at is not null and new.published_at is distinct from old.published_at then
    raise exception 'publication timestamp is immutable' using errcode='23514';
  end if;
  if tg_op='UPDATE' and old.withdrawn_at is not null and new.withdrawn_at is null then
    raise exception 'withdrawal cannot be silently reversed' using errcode='23514';
  end if;
  if new.published_at is not null and (tg_op='INSERT' or old.published_at is null) then
    if new.published_by is null or new.withdrawn_at is not null then
      raise exception 'publication needs a named actor and active state' using errcode='23514';
    end if;
    if tg_table_name='spiritual_entities' then
      eligible := new.editorial_status='verified'
        and nullif(btrim(coalesce(new.tradition_context,'')),'') is not null
        and nullif(btrim(coalesce(new.source_reference,'')),'') is not null
        and app.fn_spiritual_edition_eligible(new.source_id,new.edition_id)
        and app.fn_spiritual_reviewer_eligible(new.reviewer_id,new.reviewed_at)
        and exists(select 1 from app.spiritual_entity_names n where n.entity_id=new.id and n.name_kind='primary' and n.language_code='en')
        and exists(select 1 from app.spiritual_entity_names n where n.entity_id=new.id and n.name_kind='primary' and n.language_code='hi');
    elsif tg_table_name='spiritual_stories' then
      eligible := new.editorial_status='verified'
        and app.fn_spiritual_edition_eligible(new.source_id,new.edition_id)
        and app.fn_spiritual_reviewer_eligible(new.reviewer_id,new.reviewed_at)
        and exists(select 1 from app.spiritual_story_scenes sc where sc.story_id=new.id);
    else
      eligible := new.editorial_status='verified' and new.rights_status='verified'
        and nullif(btrim(coalesce(new.rights_evidence,'')),'') is not null
        and app.fn_spiritual_reviewer_eligible(new.reviewer_id,new.reviewed_at);
    end if;
    if not coalesce(eligible,false) then
      raise exception 'publication blocked: current rights, source, bilingual named review or content incomplete' using errcode='23514';
    end if;
    insert into app.spiritual_publication_audit(object_kind,object_id,action,actor_id)
      values (case tg_table_name when 'spiritual_entities' then 'entity' when 'spiritual_stories' then 'story' else 'media' end,
              new.id,'publish',new.published_by);
  end if;
  if tg_op='UPDATE' and old.withdrawn_at is null and new.withdrawn_at is not null then
    insert into app.spiritual_publication_audit(object_kind,object_id,action,actor_id)
      values (case tg_table_name when 'spiritual_entities' then 'entity' when 'spiritual_stories' then 'story' else 'media' end,
              new.id,'withdraw',auth.uid());
  end if;
  return new;
end $$;

create trigger guard_spiritual_entity_publication before insert or update on app.spiritual_entities
  for each row execute function app.trg_guard_spiritual_publication();
create trigger guard_spiritual_story_publication before insert or update on app.spiritual_stories
  for each row execute function app.trg_guard_spiritual_publication();
create trigger guard_spiritual_media_publication before insert or update on app.spiritual_media_assets
  for each row execute function app.trg_guard_spiritual_publication();

create or replace function app.fn_public_spiritual_entities(p_language text default 'en', p_limit integer default 30, p_after_slug text default '')
returns table (id uuid, slug text, entity_kind text, display_name text, description text,
  tradition_context text, source_reference text, source_title text, source_url text,
  edition_label text, reviewer_name text, media_path text, media_alt text)
language plpgsql stable security definer set search_path = app, pg_catalog as $$
begin
  if p_language not in ('en','hi') or p_limit not between 1 and 50 or length(coalesce(p_after_slug,''))>160 then
    raise exception 'invalid entity page request' using errcode='23514';
  end if;
  return query select e.id,e.slug,e.entity_kind,n.display_name,
    case p_language when 'hi' then e.description_hi else e.description_en end,
    e.tradition_context,e.source_reference,s.title,s.source_url,ed.edition_label,r.full_name,
    case when app.fn_spiritual_media_public(e.hero_media_id) then m.storage_path else null end,
    case when app.fn_spiritual_media_public(e.hero_media_id) then (case p_language when 'hi' then m.alt_hi else m.alt_en end) else null end
  from app.spiritual_entities e
  join app.spiritual_entity_names n on n.entity_id=e.id and n.language_code=p_language and n.name_kind='primary'
  join app.knowledge_sources s on s.id=e.source_id
  join app.knowledge_editions ed on ed.id=e.edition_id
  join app.reviewers r on r.id=e.reviewer_id
  left join app.spiritual_media_assets m on m.id=e.hero_media_id
  where e.slug>coalesce(p_after_slug,'') and app.fn_spiritual_entity_public(e.id)
  order by e.slug limit p_limit;
end $$;

create or replace function app.fn_public_spiritual_entity(p_slug text, p_language text default 'en')
returns jsonb language sql stable security definer set search_path = app, pg_catalog as $$
  select to_jsonb(x) from (
    select e.id,e.slug,e.entity_kind,n.display_name,
      case p_language when 'hi' then e.description_hi else e.description_en end as description,
      e.tradition_context,e.source_reference,s.title as source_title,s.source_url,
      ed.edition_label,r.full_name as reviewer_name,
      case when app.fn_spiritual_media_public(e.hero_media_id) then m.storage_path else null end as media_path,
      case when app.fn_spiritual_media_public(e.hero_media_id) then (case p_language when 'hi' then m.alt_hi else m.alt_en end) else null end as media_alt
    from app.spiritual_entities e
    join app.spiritual_entity_names n on n.entity_id=e.id and n.language_code=p_language and n.name_kind='primary'
    join app.knowledge_sources s on s.id=e.source_id
    join app.knowledge_editions ed on ed.id=e.edition_id
    join app.reviewers r on r.id=e.reviewer_id
    left join app.spiritual_media_assets m on m.id=e.hero_media_id
    where e.slug=p_slug and p_language in ('en','hi') and app.fn_spiritual_entity_public(e.id)
  ) x;
$$;

create or replace function app.fn_public_spiritual_stories(p_language text default 'en', p_limit integer default 30, p_after_slug text default '')
returns table (id uuid, slug text, title text, story_kind text, source_reference text,
  source_title text, source_url text, edition_label text, reviewer_name text)
language plpgsql stable security definer set search_path = app, pg_catalog as $$
begin
  if p_language not in ('en','hi') or p_limit not between 1 and 50 or length(coalesce(p_after_slug,''))>160 then
    raise exception 'invalid story page request' using errcode='23514';
  end if;
  return query select st.id,st.slug,case p_language when 'hi' then st.title_hi else st.title_en end,
    st.story_kind,st.source_reference,s.title,s.source_url,ed.edition_label,r.full_name
  from app.spiritual_stories st
  join app.knowledge_sources s on s.id=st.source_id
  join app.knowledge_editions ed on ed.id=st.edition_id
  join app.reviewers r on r.id=st.reviewer_id
  where st.slug>coalesce(p_after_slug,'') and app.fn_spiritual_story_public(st.id)
  order by st.slug limit p_limit;
end $$;

create or replace function app.fn_public_spiritual_story(p_slug text, p_language text default 'en')
returns jsonb language sql stable security definer set search_path = app, pg_catalog as $$
  select to_jsonb(st) || jsonb_build_object('scenes',(
    select coalesce(jsonb_agg(jsonb_build_object('sequence_no',sc.sequence_no,'source_reference',sc.source_reference,
      'body',case p_language when 'hi' then sc.body_hi else sc.body_en end,
      'reflection',case p_language when 'hi' then sc.reflection_hi else sc.reflection_en end)
      order by sc.sequence_no),'[]'::jsonb)
    from app.spiritual_story_scenes sc where sc.story_id=st.id))
  from app.spiritual_stories raw
  cross join lateral (select raw.id,raw.slug,
    case p_language when 'hi' then raw.title_hi else raw.title_en end as title,
    raw.story_kind,raw.source_reference,s.title as source_title,s.source_url,
    ed.edition_label,r.full_name as reviewer_name
    from app.knowledge_sources s,app.knowledge_editions ed,app.reviewers r
    where s.id=raw.source_id and ed.id=raw.edition_id and r.id=raw.reviewer_id) st
  where raw.slug=p_slug and p_language in ('en','hi') and app.fn_spiritual_story_public(raw.id);
$$;

create or replace function app.fn_public_spiritual_search(p_query text, p_language text default 'en', p_limit integer default 20)
returns table (kind text, id uuid, slug text, title text, source_reference text, rank integer)
language plpgsql stable security definer set search_path = app, pg_catalog as $$
declare q text := lower(btrim(translate(coalesce(p_query,''),'०१२३४५६७८९','0123456789')));
begin
  if p_language not in ('en','hi') or length(q) not between 2 and 120 or p_limit not between 1 and 30
     or position('%' in q)>0 or position('_' in q)>0 then
    raise exception 'invalid knowledge search' using errcode='23514';
  end if;
  return query
  select z.kind,z.id,z.slug,z.title,z.source_reference,z.rank from (
    select 'entity'::text kind,e.id,e.slug,n.display_name title,e.source_reference,
      case when lower(n.normalized_name)=q then 100 when lower(n.normalized_name) like q||'%' then 80 else 45 end rank
    from app.spiritual_entities e join app.spiritual_entity_names n on n.entity_id=e.id
    where app.fn_spiritual_entity_public(e.id) and
      (lower(n.normalized_name)=q or lower(n.normalized_name) like q||'%' or lower(n.normalized_name) like '%'||q||'%')
    union all
    select 'story'::text,st.id,st.slug,case p_language when 'hi' then st.title_hi else st.title_en end,
      st.source_reference,case when lower(case p_language when 'hi' then st.title_hi else st.title_en end)=q then 95 else 40 end
    from app.spiritual_stories st where app.fn_spiritual_story_public(st.id)
      and lower(case p_language when 'hi' then st.title_hi else st.title_en end) like '%'||q||'%'
  ) z order by z.rank desc,z.kind,z.slug limit p_limit;
end $$;

revoke all on function app.fn_spiritual_edition_eligible(uuid,uuid),app.fn_spiritual_reviewer_eligible(uuid,timestamptz),
  app.fn_spiritual_media_public(uuid),app.fn_spiritual_entity_public(uuid),app.fn_spiritual_story_public(uuid),
  app.trg_guard_spiritual_publication() from public,anon,authenticated;
revoke all on function app.fn_public_spiritual_entities(text,integer,text),app.fn_public_spiritual_entity(text,text),
  app.fn_public_spiritual_stories(text,integer,text),app.fn_public_spiritual_story(text,text),
  app.fn_public_spiritual_search(text,text,integer) from public,anon,authenticated;
grant execute on function app.fn_public_spiritual_entities(text,integer,text),app.fn_public_spiritual_entity(text,text),
  app.fn_public_spiritual_stories(text,integer,text),app.fn_public_spiritual_story(text,text),
  app.fn_public_spiritual_search(text,text,integer) to anon,authenticated;

insert into ops.api_allowlist(function_signature,granted_to,rationale) values
  ('app.fn_public_spiritual_entities(text,integer,text)','both','published entities only; current source, edition, review and media eligibility'),
  ('app.fn_public_spiritual_entity(text,text)','both','one currently eligible published entity'),
  ('app.fn_public_spiritual_stories(text,integer,text)','both','published stories only; current source and review eligibility'),
  ('app.fn_public_spiritual_story(text,text)','both','one currently eligible published story and its scenes'),
  ('app.fn_public_spiritual_search(text,text,integer)','both','bounded search of currently eligible published graph records');
