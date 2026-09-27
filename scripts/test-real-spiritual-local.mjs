#!/usr/bin/env node
// A disposable, loopback-only GoTrue/PostgREST check for migration 0013.
// Synthetic records are committed so the actual API can read them, then deleted.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { randomBytes, randomUUID } from 'node:crypto';

const project = process.env.SPIRITUAL_LOCAL_SUPABASE_DIR;
if (!project || !project.startsWith('/Users/abhijay/.local/share/spritual-supabase-auth-check')) {
  throw new Error('Set SPIRITUAL_LOCAL_SUPABASE_DIR to the isolated local Supabase fixture.');
}
const require = createRequire(new URL('../package.json', import.meta.url));
const { createClient } = require('@supabase/supabase-js');
const status = JSON.parse(execFileSync('supabase',['status','-o','json'],{cwd:project,encoding:'utf8'}));
for (const key of ['API_URL','DB_URL']) {
  assert.ok(['localhost','127.0.0.1','[::1]'].includes(new URL(status[key]).hostname),`${key} must be loopback`);
}
assert.ok(status.PUBLISHABLE_KEY && status.SECRET_KEY);
const options = { auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},db:{schema:'app'} };
const anon = createClient(status.API_URL,status.PUBLISHABLE_KEY,options);
const member = createClient(status.API_URL,status.PUBLISHABLE_KEY,options);
const admin = createClient(status.API_URL,status.SECRET_KEY,options);
const suffix = randomBytes(5).toString('hex');
const ids = Object.fromEntries(['source','work','edition','reviewer','media','entity','story','actor'].map(k=>[k,randomUUID()]));
const slug = `fixture-phase3-${suffix}`;
let signedUp = false;
let seeded = false;
let checks = 0;
function pass(name) { checks += 1; console.log(`PASS ${name}`); }
function sql(statement) {
  return execFileSync('psql',[status.DB_URL,'-X','-A','-t','-v','ON_ERROR_STOP=1'],{input:statement,encoding:'utf8'}).trim();
}
async function rpc(client,name,args) {
  const response = await client.rpc(name,args);
  assert.ifError(response.error);
  return response.data;
}
try {
  const auth = await member.auth.signUp({email:`phase3-${suffix}@example.test`,password:randomBytes(24).toString('hex')});
  assert.ifError(auth.error);
  assert.ok(auth.data.session?.access_token);
  ids.actor=auth.data.user.id;
  signedUp=true;
  const verified = await member.auth.getUser();
  assert.ifError(verified.error);
  assert.equal(verified.data.user?.id,ids.actor);
  pass('real GoTrue user token verified');

  const initial = await rpc(anon,'fn_public_spiritual_entities',{p_language:'en'});
  assert.ok(!initial.some(row=>row.slug===slug));
  pass('anonymous graph list contains no fixture before publication');
  const table = await member.from('spiritual_entities').select('id').limit(1);
  assert.ok(table.error);
  pass('real authenticated client cannot read private editorial table');

  sql(`begin;
    insert into app.knowledge_sources(id,title,source_identifier,source_url)
      values ('${ids.source}','Synthetic Phase III source','fixture:${suffix}','https://example.invalid/${suffix}');
    insert into app.knowledge_works(id,slug,title,work_kind)
      values ('${ids.work}','${slug}','Synthetic work','other');
    insert into app.knowledge_editions(id,work_id,source_id,edition_label,language_code)
      values ('${ids.edition}','${ids.work}','${ids.source}','Synthetic edition','en');
    insert into app.knowledge_source_licenses(edition_id) values ('${ids.edition}');
    insert into app.reviewers(id,full_name,credentials,auth_user_id)
      values ('${ids.reviewer}','Synthetic reviewer','Test only','${ids.actor}');
    insert into app.reviewer_languages(reviewer_id,language_code)
      values ('${ids.reviewer}','en'),('${ids.reviewer}','hi');
    insert into app.spiritual_media_assets(id,storage_path,media_kind,alt_en,alt_hi)
      values ('${ids.media}','synthetic/${slug}.webp','image','Synthetic art','नमूना चित्र');
    insert into app.spiritual_entities(id,slug,entity_kind,tradition_context,source_id,edition_id,source_reference,hero_media_id)
      values ('${ids.entity}','${slug}','scriptural_character','Synthetic test tradition',
        '${ids.source}','${ids.edition}','fixture 1','${ids.media}');
    insert into app.spiritual_entity_names(entity_id,language_code,script_code,display_name,normalized_name,name_kind)
      values ('${ids.entity}','en','Latn','Synthetic figure','synthetic figure','primary'),
        ('${ids.entity}','hi','Deva','नमूना पात्र','नमूना पात्र','primary'),
        ('${ids.entity}','en','Latn','Fixture courage','fixture courage','alias');
    insert into app.spiritual_stories(id,slug,title_en,title_hi,story_kind,source_id,edition_id,source_reference)
      values ('${ids.story}','${slug}-story','Synthetic story','नमूना कथा','original_retelling',
        '${ids.source}','${ids.edition}','fixture 1');
    insert into app.spiritual_story_scenes(story_id,sequence_no,source_reference,body_en,body_hi)
      values ('${ids.story}',1,'fixture 1','Synthetic scene','नमूना दृश्य');
    commit;`);
  seeded=true;
  assert.equal(await rpc(anon,'fn_public_spiritual_entity',{p_slug:slug,p_language:'en'}),null);
  assert.deepEqual((await rpc(anon,'fn_public_spiritual_search',{p_query:'fixture courage',p_language:'en'})).filter(row=>row.slug===slug),[]);
  pass('draft entity and alias hidden through actual PostgREST');
  const noPublish=sql(`begin; savepoint attempt; do $$begin
    begin update app.spiritual_entities set published_at=now(),published_by='${ids.actor}' where id='${ids.entity}';
    exception when check_violation then null; end; end$$;
    select (published_at is null)::text from app.spiritual_entities where id='${ids.entity}'; commit;`);
  assert.ok(noPublish.split('\n').includes('true'));
  pass('invalid publication stays blocked in real local database');

  sql(`begin;
    update app.knowledge_sources set provenance_status='verified',provenance_evidence='Synthetic proof',verified_at=now() where id='${ids.source}';
    update app.knowledge_source_licenses set license_kind='owned',status='verified',rights_evidence='Synthetic permission',
      verified_at=now(),may_redistribute=true,may_use_for_ai=false where edition_id='${ids.edition}';
    update app.spiritual_media_assets set rights_status='verified',rights_evidence='Synthetic media permission',
      editorial_status='verified',reviewer_id='${ids.reviewer}',reviewed_at=now() where id='${ids.media}';
    update app.spiritual_entities set editorial_status='verified',reviewer_id='${ids.reviewer}',reviewed_at=now() where id='${ids.entity}';
    update app.spiritual_stories set editorial_status='verified',reviewer_id='${ids.reviewer}',reviewed_at=now() where id='${ids.story}';
    commit;`);
  assert.equal(await rpc(member,'fn_public_spiritual_entity',{p_slug:slug,p_language:'en'}),null);
  pass('verified but unpublished entity hidden from real member token');

  sql(`begin;
    update app.spiritual_media_assets set published_at=now(),published_by='${ids.actor}' where id='${ids.media}';
    update app.spiritual_entities set published_at=now(),published_by='${ids.actor}' where id='${ids.entity}';
    update app.spiritual_stories set published_at=now(),published_by='${ids.actor}' where id='${ids.story}';
    commit;`);
  const listed = await rpc(anon,'fn_public_spiritual_entities',{p_language:'en'});
  assert.ok(listed.some(row=>row.slug===slug));
  const detail = await rpc(member,'fn_public_spiritual_entity',{p_slug:slug,p_language:'hi'});
  assert.equal(detail.display_name,'नमूना पात्र');
  assert.equal(detail.media_path,`synthetic/${slug}.webp`);
  pass('published entity list/detail through anon and real member tokens');
  const story = await rpc(anon,'fn_public_spiritual_story',{p_slug:`${slug}-story`,p_language:'en'});
  assert.equal(story.scenes[0].body,'Synthetic scene');
  pass('published story scene through real PostgREST');
  const search = await rpc(member,'fn_public_spiritual_search',{p_query:'fixture courage',p_language:'en'});
  assert.ok(search.some(row=>row.slug===slug && row.kind==='entity'));
  pass('alias search uses database rows, not client fixture logic');
  const anonSaves=await anon.rpc('fn_my_spiritual_saves',{p_language:'en'});
  assert.ok(anonSaves.error);
  pass('anonymous token cannot read account saves');
  assert.equal(await rpc(member,'fn_set_spiritual_save',{p_kind:'entity',p_id:ids.entity,p_enabled:true}),true);
  assert.equal(await rpc(member,'fn_set_spiritual_save',{p_kind:'story',p_id:ids.story,p_enabled:true}),true);
  const saves=await rpc(member,'fn_my_spiritual_saves',{p_language:'en'});
  assert.equal(saves.length,2);
  assert.ok(saves.every(row=>row.available && row.title));
  pass('real member token saves stable IDs and reads current metadata');

  sql(`update app.spiritual_media_assets set rights_status='revoked',editorial_status='archived' where id='${ids.media}';`);
  assert.equal((await rpc(anon,'fn_public_spiritual_entity',{p_slug:slug,p_language:'en'})).media_path,null);
  pass('media revocation removes image from live API');
  sql(`update app.knowledge_source_licenses set status='revoked' where edition_id='${ids.edition}';`);
  assert.equal(await rpc(anon,'fn_public_spiritual_entity',{p_slug:slug,p_language:'en'}),null);
  assert.equal(await rpc(anon,'fn_public_spiritual_story',{p_slug:`${slug}-story`,p_language:'en'}),null);
  pass('rights revocation removes entity and story from live API');
  const unavailable=await rpc(member,'fn_my_spiritual_saves',{p_language:'en'});
  assert.equal(unavailable.filter(row=>!row.available && row.title===null).length,2);
  pass('rights-revoked saves show unavailable without copied content');
  sql(`begin;
    update app.knowledge_source_licenses set status='verified' where edition_id='${ids.edition}';
    update app.spiritual_stories set withdrawn_at=now() where id='${ids.story}';
    commit;`);
  assert.equal(await rpc(member,'fn_public_spiritual_story',{p_slug:`${slug}-story`,p_language:'en'}),null);
  assert.ok(!(await rpc(anon,'fn_public_spiritual_search',{p_query:'synthetic story',p_language:'en'})).some(row=>row.slug===`${slug}-story`));
  pass('withdrawn story disappears from detail and search');
  assert.equal(await rpc(member,'fn_set_spiritual_save',{p_kind:'story',p_id:ids.story,p_enabled:false}),false);
  assert.equal(await rpc(member,'fn_set_spiritual_save',{p_kind:'entity',p_id:ids.entity,p_enabled:false}),false);
  assert.deepEqual(await rpc(member,'fn_my_spiritual_saves',{p_language:'en'}),[]);
  pass('member can erase unavailable references through real PostgREST');
  console.log(`VERIFIED ${checks} live graph Auth/PostgREST checks`);
} finally {
  if (seeded) {
    sql(`begin;
      set local session_replication_role=replica;
      delete from app.spiritual_saves where object_id in ('${ids.entity}','${ids.story}');
      delete from app.spiritual_publication_audit where object_id in ('${ids.entity}','${ids.story}','${ids.media}');
      delete from app.spiritual_story_scenes where story_id='${ids.story}';
      delete from app.spiritual_stories where id='${ids.story}';
      delete from app.spiritual_entity_names where entity_id='${ids.entity}';
      delete from app.spiritual_entities where id='${ids.entity}';
      delete from app.spiritual_media_assets where id='${ids.media}';
      delete from app.knowledge_source_licenses where edition_id='${ids.edition}';
      delete from app.knowledge_editions where id='${ids.edition}';
      delete from app.knowledge_works where id='${ids.work}';
      delete from app.knowledge_sources where id='${ids.source}';
      delete from app.reviewer_languages where reviewer_id='${ids.reviewer}';
      delete from app.reviewers where id='${ids.reviewer}';
      commit;`);
  }
  if (signedUp) {
    const result=await admin.auth.admin.deleteUser(ids.actor);
    if (result.error) { console.error('LOCAL CLEANUP ERROR: synthetic Auth user remains'); process.exitCode=1; }
  }
}
