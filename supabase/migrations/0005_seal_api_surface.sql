-- 0005_seal_api_surface.sql
-- Postgres grants EXECUTE on every new function to PUBLIC. Combined with
-- SECURITY DEFINER and an owner holding BYPASSRLS, that is a complete bypass of
-- the no-table-grants model in 0001. ALTER DEFAULT PRIVILEGES is NOT sufficient:
-- it only covers objects created by the role that issued it, so a later migration
-- run by a different role silently reopens the hole.
--
-- This event trigger closes it for every function in app/ops, forever, regardless
-- of who creates it. Grants are then re-added explicitly and must appear in
-- ops.api_allowlist, or ops.fn_check_api_surface() fails CI.
--
-- Discovered empirically: `authenticated` could call app.fn_has_access() with no
-- grant at all. The meta-test's first catch was itself.

revoke all on function ops.fn_check_api_surface() from public, anon, authenticated;

create or replace function ops.fn_revoke_new_function_grants()
returns event_trigger
language plpgsql
security definer
set search_path = ops, pg_catalog
as $$
declare obj record;
begin
  for obj in select * from pg_event_trigger_ddl_commands()
             where command_tag in ('CREATE FUNCTION','CREATE PROCEDURE')
  loop
    if split_part(obj.object_identity, '.', 1) in ('app','ops') then
      execute format('revoke all on function %s from public', obj.object_identity);
    end if;
  end loop;
end $$;

revoke all on function ops.fn_revoke_new_function_grants() from public, anon, authenticated;

drop event trigger if exists trg_seal_functions;
create event trigger trg_seal_functions
  on ddl_command_end
  when tag in ('CREATE FUNCTION','CREATE PROCEDURE')
  execute function ops.fn_revoke_new_function_grants();
