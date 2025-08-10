-- Enable required extension for gen_random_uuid
create extension if not exists pgcrypto;

-- Movies table
create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  poster_url text,
  rating text,
  description text,
  genre text,
  duration_minutes integer,
  created_at timestamptz not null default now()
);

alter table public.movies enable row level security;
create policy if not exists "Movies are viewable by everyone"
  on public.movies for select
  using (true);

-- Cinemas table
create table if not exists public.cinemas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  address text,
  created_at timestamptz not null default now()
);

alter table public.cinemas enable row level security;
create policy if not exists "Cinemas are viewable by everyone"
  on public.cinemas for select
  using (true);

-- Showtimes table
create table if not exists public.showtimes (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null,
  cinema_id uuid not null,
  starts_at timestamptz not null,
  base_price numeric not null default 0,
  auditorium text,
  created_at timestamptz not null default now()
);

alter table public.showtimes enable row level security;
create policy if not exists "Showtimes are viewable by everyone"
  on public.showtimes for select
  using (true);

-- Seats table
create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  cinema_id uuid not null,
  auditorium text not null,
  row_label text not null,
  seat_number integer not null,
  seat_label text,
  created_at timestamptz not null default now()
);

alter table public.seats enable row level security;
create policy if not exists "Seats are viewable by everyone"
  on public.seats for select
  using (true);

-- Bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  showtime_id uuid not null,
  status text not null default 'confirmed',
  total_amount numeric not null default 0,
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;
create policy if not exists "Users can view their own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);
create policy if not exists "Users can insert their own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);
create policy if not exists "Users can update their own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);
create policy if not exists "Users can delete their own bookings"
  on public.bookings for delete
  using (auth.uid() = user_id);

-- Booking seats table
create table if not exists public.booking_seats (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null,
  showtime_id uuid not null,
  seat_label text not null,
  price numeric not null,
  created_at timestamptz not null default now()
);

alter table public.booking_seats enable row level security;
create policy if not exists "Users can view seats of their bookings"
  on public.booking_seats for select
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_seats.booking_id and b.user_id = auth.uid()
  ));
create policy if not exists "Users can insert seats for their bookings"
  on public.booking_seats for insert
  with check (exists (
    select 1 from public.bookings b
    where b.id = booking_seats.booking_id and b.user_id = auth.uid()
  ));
create policy if not exists "Users can delete seats of their bookings"
  on public.booking_seats for delete
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_seats.booking_id and b.user_id = auth.uid()
  ));