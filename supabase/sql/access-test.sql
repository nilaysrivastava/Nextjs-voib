begin;
-- Disposable metadata-only records. This entire test transaction rolls back.
insert into public.songs(user_id,title,author,song_path,image_path,is_demo)
 select id,'Access-test record','Voib test',id::text||'/access-test.mp3',id::text||'/access-test.png',true
 from auth.users where email in ('demo.user@voib.example','demo.admin@voib.example');
select set_config('voib.test_admin_id',(select id::text from auth.users where email='demo.admin@voib.example'),true);
select set_config('request.jwt.claims',json_build_object('sub',(select id from auth.users where email='demo.user@voib.example'),'role','authenticated')::text,true);
set local role authenticated;
do $$
declare n int;seed bigint;begin
 if private.is_admin() or private.is_demo_admin() or not private.is_demo() then raise exception 'Incorrect demo listener role';end if;
 select count(*),min(id) into n,seed from public.songs where is_seed;if n<32 then raise exception 'Official catalogue inaccessible';end if;
 update public.songs set title='FORGED' where is_seed;get diagnostics n=row_count;if n<>0 then raise exception 'Listener changed official recordings';end if;
 update public.songs set title='FORGED' where is_demo and user_id<>auth.uid();get diagnostics n=row_count;if n<>0 then raise exception 'Listener changed another account';end if;
 begin
  insert into public.liked_songs(user_id,song_id) values(current_setting('voib.test_admin_id')::uuid,seed);raise exception 'Forged like was allowed';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.subscriptions(id,user_id,status) values('forged',auth.uid(),'active');raise exception 'Forged subscription was allowed';
 exception when insufficient_privilege then null;end;
 begin
  update public.songs set source_type='youtube',youtube_id='lUPltG1hb3k' where user_id=auth.uid();raise exception 'Forged playback source was allowed';
 exception when raise_exception then
  if sqlerrm='Forged playback source was allowed' then raise;end if;
 end;
end $$;
reset role;
select set_config('request.jwt.claims',json_build_object('sub',(select id from auth.users where email='demo.admin@voib.example'),'role','authenticated')::text,true);
set local role authenticated;
do $$ declare n int;begin
 if private.is_admin() or not private.is_demo_admin() then raise exception 'Demo admin has live permissions';end if;
 update public.songs set title='Demo moderation test' where is_demo;get diagnostics n=row_count;if n<2 then raise exception 'Demo moderation failed';end if;
 update public.songs set title='FORGED' where is_seed;get diagnostics n=row_count;if n<>0 then raise exception 'Demo admin changed official recordings';end if;
end $$;
rollback;
select true as access_tests_passed;
