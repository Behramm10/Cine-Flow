-- Create cities table for managing available cities
create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.cities enable row level security;

-- Policies for cities
create policy if not exists "Cities are viewable by everyone"
  on public.cities for select
  using (true);

create policy if not exists "Admins can insert cities"
  on public.cities for insert
  with check (has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can update cities"
  on public.cities for update
  using (has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can delete cities"
  on public.cities for delete
  using (has_role(auth.uid(), 'admin'));

-- Admin policies for movies
create policy if not exists "Admins can insert movies"
  on public.movies for insert
  with check (has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can update movies"
  on public.movies for update
  using (has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can delete movies"
  on public.movies for delete
  using (has_role(auth.uid(), 'admin'));

-- Admin policies for cinemas
create policy if not exists "Admins can insert cinemas"
  on public.cinemas for insert
  with check (has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can update cinemas"
  on public.cinemas for update
  using (has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can delete cinemas"
  on public.cinemas for delete
  using (has_role(auth.uid(), 'admin'));

-- Admin policies for seats
create policy if not exists "Admins can insert seats"
  on public.seats for insert
  with check (has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can update seats"
  on public.seats for update
  using (has_role(auth.uid(), 'admin'));

create policy if not exists "Admins can delete seats"
  on public.seats for delete
  using (has_role(auth.uid(), 'admin'));
