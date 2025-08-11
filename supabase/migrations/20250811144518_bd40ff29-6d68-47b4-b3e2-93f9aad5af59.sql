-- 1) Profiles table + triggers and policies
create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Public profiles viewable by everyone
create policy if not exists "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Users can insert/update their own profile
create policy if not exists "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy if not exists "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- updated_at trigger helper
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Auto-insert profile on user signup with dummy defaults
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/initials/svg?seed=' || split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Roles enum, table, helper, policies
-- Create enum if it doesn't exist
DO $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace where t.typname = 'app_role' and n.nspname = 'public') then
    create type public.app_role as enum ('admin', 'user');
  end if;
end$$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer helper for role checks
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- RLS: users can read their own roles
create policy if not exists "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- RLS: users can insert their own roles (used by triggers or future UI)
create policy if not exists "Users can insert their own roles"
  on public.user_roles for insert
  with check (auth.uid() = user_id);

-- Optional: admins can view all roles
create policy if not exists "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));

-- Assign admin role automatically for a specific email on signup
create or replace function public.handle_new_user_roles()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Everyone becomes a 'user' by default (idempotent)
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;

  -- Grant admin to the specific email
  if lower(new.email) = lower('behramm.umrigar200@nmims.edu.in') then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_roles on auth.users;
create trigger on_auth_user_created_roles
  after insert on auth.users
  for each row execute procedure public.handle_new_user_roles();
