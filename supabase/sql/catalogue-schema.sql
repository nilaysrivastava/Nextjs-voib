-- Additive migration. Apply before publishing official-catalogue.sql.
alter table public.songs
 add column if not exists source_type text not null default 'upload' check(source_type in ('upload','youtube')),
 add column if not exists youtube_id text unique,
 add column if not exists artists text[] not null default '{}',
 add column if not exists genres text[] not null default '{}',
 add column if not exists collections text[] not null default '{}',
 add column if not exists source_channel text,
 add column if not exists source_channel_url text;

alter table public.songs add constraint valid_official_source check(
 (source_type='upload' and youtube_id is null) or
 (source_type='youtube' and youtube_id is not null and youtube_id ~ '^[A-Za-z0-9_-]{11}$' and is_seed and not is_demo and user_id is null)
);

-- Only trusted catalogue seeding can create external-source records. Existing
-- RLS and validate_song still protect ownership, uploads and admin moderation.
create function private.protect_playback_source() returns trigger
language plpgsql set search_path='' as $$
begin
 if auth.uid() is not null and tg_op='UPDATE' and
  (new.source_type is distinct from old.source_type or new.youtube_id is distinct from old.youtube_id
   or new.source_channel is distinct from old.source_channel or new.source_channel_url is distinct from old.source_channel_url
   or new.artists is distinct from old.artists or new.genres is distinct from old.genres or new.collections is distinct from old.collections) then
  raise exception 'Playback sources and catalogue classifications are managed by the server';
 end if;
 return new;
end;$$;
revoke all on function private.protect_playback_source() from public,anon,authenticated;
create trigger protect_playback_source before update on public.songs for each row execute function private.protect_playback_source();
