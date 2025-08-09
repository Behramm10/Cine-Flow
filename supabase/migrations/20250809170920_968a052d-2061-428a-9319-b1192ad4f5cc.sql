-- Create basic schema for Movie App with RLS
-- 1) Movies table
create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  genre text,
  poster_url text,
  duration_minutes int,
  rating text,
  description text,
  created_at timestamptz not null default now()
);

alter table public.movies enable row level security;

-- Public read-only access for movies
create policy if not exists "Movies are viewable by everyone"
  on public.movies for select
  using (true);

-- 2) Cinemas table
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

-- 3) Showtimes table
create table if not exists public.showtimes (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  cinema_id uuid not null references public.cinemas(id) on delete cascade,
  auditorium text,
  starts_at timestamptz not null,
  base_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_showtimes_movie on public.showtimes(movie_id);
create index if not exists idx_showtimes_cinema on public.showtimes(cinema_id);
create index if not exists idx_showtimes_starts_at on public.showtimes(starts_at);

alter table public.showtimes enable row level security;

create policy if not exists "Showtimes are viewable by everyone"
  on public.showtimes for select
  using (true);

-- 4) Seats table (auditorium-level seat map)
create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  cinema_id uuid not null references public.cinemas(id) on delete cascade,
  auditorium text not null,
  row_label text not null,
  seat_number int not null,
  seat_label text generated always as (row_label || seat_number::text) stored,
  created_at timestamptz not null default now(),
  unique (cinema_id, auditorium, row_label, seat_number)
);

create index if not exists idx_seats_cinema_auditorium on public.seats(cinema_id, auditorium);

alter table public.seats enable row level security;

create policy if not exists "Seats are viewable by everyone"
  on public.seats for select
  using (true);

-- 5) Bookings table (user-scoped)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  showtime_id uuid not null references public.showtimes(id) on delete cascade,
  total_amount numeric(10,2) not null default 0,
  currency text not null default 'INR',
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_user on public.bookings(user_id);
create index if not exists idx_bookings_showtime on public.bookings(showtime_id);

alter table public.bookings enable row level security;

-- RLS: Users only access their own bookings
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

-- 6) Booking seats table (seats selected per booking)
create table if not exists public.booking_seats (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  showtime_id uuid not null references public.showtimes(id) on delete cascade,
  seat_label text not null,
  price numeric(10,2) not null,
  created_at timestamptz not null default now(),
  unique (showtime_id, seat_label)
);

create index if not exists idx_booking_seats_booking on public.booking_seats(booking_id);
create index if not exists idx_booking_seats_showtime on public.booking_seats(showtime_id);

alter table public.booking_seats enable row level security;

-- RLS: Only access seats via own bookings
create policy if not exists "Users can view seats of their bookings"
  on public.booking_seats for select
  using (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()));

create policy if not exists "Users can insert seats for their bookings"
  on public.booking_seats for insert
  with check (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()));

create policy if not exists "Users can delete seats of their bookings"
  on public.booking_seats for delete
  using (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()));

-- Optional: function to validate booking_seats insert to ensure base integrity can be extended later
-- Note: Authentication UI is required for RLS-protected tables to be writable.
