-- Protect the deliberately public demo passwords against visitor changes.
create or replace function private.protect_demo_identity() returns trigger
language plpgsql set search_path='' as $$
begin
 if old.raw_app_meta_data->>'demo'='true' and current_user='supabase_auth_admin' and
 (new.email is distinct from old.email or new.encrypted_password is distinct from old.encrypted_password or new.email_change is distinct from old.email_change) then
  raise exception 'Public demo credentials cannot be changed';
 end if;return new;
end;$$;
revoke all on function private.protect_demo_identity() from public,anon,authenticated;
create trigger protect_demo_identity before update on auth.users for each row execute function private.protect_demo_identity();
