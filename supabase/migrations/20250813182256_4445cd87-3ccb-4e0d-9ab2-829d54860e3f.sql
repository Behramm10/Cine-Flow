-- Create cities table for managing available cities
CREATE TABLE public.cities (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Policies for cities
CREATE POLICY "Cities are viewable by everyone"
  ON public.cities FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert cities"
  ON public.cities FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cities"
  ON public.cities FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cities"
  ON public.cities FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Admin policies for movies
CREATE POLICY "Admins can insert movies"
  ON public.movies FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update movies"
  ON public.movies FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete movies"
  ON public.movies FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Admin policies for cinemas
CREATE POLICY "Admins can insert cinemas"
  ON public.cinemas FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cinemas"
  ON public.cinemas FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cinemas"
  ON public.cinemas FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Admin policies for seats
CREATE POLICY "Admins can insert seats"
  ON public.seats FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update seats"
  ON public.seats FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete seats"
  ON public.seats FOR DELETE
  USING (has_role(auth.uid(), 'admin'));