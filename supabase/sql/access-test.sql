begin;
select set_config('request.jwt.claims','{"sub":"51fe6425-f5f2-45db-87a3-5ba86aef32ac","role":"authenticated"}',true);
set local role authenticated;
do $$
declare n int;begin
 if private.is_admin() or private.is_demo_admin() or not private.is_demo() then raise exception 'Incorrect demo listener role';end if;
 select count(*) into n from public.songs where is_seed;if n<>3 then raise exception 'Seed catalog inaccessible';end if;
 update public.songs set title='FORGED' where is_seed;get diagnostics n=row_count;if n<>0 then raise exception 'Listener changed seed songs';end if;
 update public.songs set title='FORGED' where user_id='281999ba-73b1-4795-a04f-37dbb574865e';get diagnostics n=row_count;if n<>0 then raise exception 'Listener changed another account';end if;
 begin
  insert into public.liked_songs(user_id,song_id) values('281999ba-73b1-4795-a04f-37dbb574865e',1);raise exception 'Forged like was allowed';
 exception when insufficient_privilege then null;end;
 begin
  insert into public.subscriptions(id,user_id,status) values('forged','51fe6425-f5f2-45db-87a3-5ba86aef32ac','active');raise exception 'Forged subscription was allowed';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"281999ba-73b1-4795-a04f-37dbb574865e","role":"authenticated"}',true);
set local role authenticated;
do $$ declare n int;begin
 if private.is_admin() or not private.is_demo_admin() then raise exception 'Demo admin has live permissions';end if;
 update public.songs set title='Demo moderation test' where is_demo;get diagnostics n=row_count;if n<>6 then raise exception 'Demo moderation failed';end if;
 update public.songs set title='FORGED' where is_seed;get diagnostics n=row_count;if n<>0 then raise exception 'Demo admin changed live seed tracks';end if;
end $$;
rollback;
select true as access_tests_passed;
