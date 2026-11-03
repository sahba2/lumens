-- ============================================================================
-- LUMENS · 01 · Profiles, roles and auth helpers
-- ----------------------------------------------------------------------------
-- Creates the shared enums, the `profiles` table that mirrors `auth.users`,
-- a trigger that bootstraps a profile after sign-up, role helper functions
-- used by Row Level Security, and the profile RLS policies.
--
-- Apply with:  supabase db push
--          or: paste into Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $do$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_role' and n.nspname = 'public'
  ) then
    create type public.user_role as enum ('student', 'instructor', 'editor', 'admin');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'content_status' and n.nspname = 'public'
  ) then
    create type public.content_status as enum ('draft', 'review', 'published', 'archived');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'object_license' and n.nspname = 'public'
  ) then
    create type public.object_license as enum ('personal', 'commercial', 'extended');
  end if;
end
$do$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  bio text,
  website text,
  role public.user_role not null default 'student',
  locale text not null default 'fa-IR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (char_length(full_name) <= 120),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 600),
  constraint profiles_website_format check (
    website is null or website ~* '^https?://[^\s]+$'
  )
);

comment on table public.profiles is
  'Public author/student profile for LUMENS, one row per auth.users record.';
comment on column public.profiles.role is
  'student < instructor < editor < admin. Only editors/admins can moderate content (see is_staff()).';

-- ---------------------------------------------------------------------------
-- updated_at helper (shared by every table)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Sign-up bootstrap: auth.users -> public.profiles
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  requested_role public.user_role;
  display_name text;
begin
  requested_role := case lower(coalesce(new.raw_user_meta_data ->> 'role', 'student'))
    when 'instructor' then 'instructor'::public.user_role
    else 'student'::public.user_role
  end;

  display_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'کاربر LUMENS'
  );

  insert into public.profiles (id, full_name, avatar_url, role, locale)
  values (
    new.id,
    left(display_name, 120),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    requested_role,
    coalesce(nullif(new.raw_user_meta_data ->> 'locale', ''), 'fa-IR')
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;

drop trigger if exists on_auth_user_created on auth.users;
-- ---------------------------------------------------------------------------
-- Role helpers used inside RLS policies
-- ---------------------------------------------------------------------------
create or replace function public.has_role(
  p_roles public.user_role[],
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles
    where profiles.id = p_user_id
      and profiles.role = any (p_roles)
  );
$function$;

create or replace function public.is_staff(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select public.has_role(
    array['editor', 'admin']::public.user_role[],
    p_user_id
  );
$function$;

comment on function public.has_role(public.user_role[], uuid) is
  'TRUE when the given user (default: current session) owns one of the roles.';
comment on function public.is_staff(uuid) is
  'TRUE for editors and admins: the only roles allowed to publish or moderate.';

-- Regular users may edit their own profile but must never change their role.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  -- Service-role / SQL-editor operations have no JWT and bypass RLS on purpose.
  if auth.uid() is null then
    return new;
  end if;

  if new.role is distinct from old.role
     and not public.is_staff(auth.uid()) then
    raise exception 'ROLE_CHANGE_FORBIDDEN'
      using hint = 'Only editors and admins can change a profile role.';
  end if;

  return new;
end;
$function$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Staff can update any profile" on public.profiles;
create policy "Staff can update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "Admins can delete profiles" on public.profiles;
create policy "Admins can delete profiles"
  on public.profiles for delete
  to authenticated
  using (public.has_role(array['admin']::public.user_role[]));

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
