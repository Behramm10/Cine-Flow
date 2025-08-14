-- Create showtimes table to link movies with cinemas and times
CREATE TABLE public.showtimes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  cinema_id UUID NOT NULL REFERENCES public.cinemas(id) ON DELETE CASCADE,
  auditorium TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  base_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table (similar to existing but with proper relations)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  showtime_id UUID NOT NULL REFERENCES public.showtimes(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create booking_seats table to track individual seat reservations
CREATE TABLE IF NOT EXISTS public.booking_seats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  showtime_id UUID NOT NULL REFERENCES public.showtimes(id) ON DELETE CASCADE,
  seat_label TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_seats ENABLE ROW LEVEL SECURITY;

-- Showtimes policies (public read, admin write)
CREATE POLICY "Showtimes are viewable by everyone" ON public.showtimes
FOR SELECT USING (true);

CREATE POLICY "Admins can insert showtimes" ON public.showtimes
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update showtimes" ON public.showtimes
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete showtimes" ON public.showtimes
FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Bookings policies (user-specific access)
CREATE POLICY "Users can view their own bookings" ON public.bookings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" ON public.bookings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" ON public.bookings
FOR DELETE USING (auth.uid() = user_id);

-- Booking seats policies (user-specific through bookings)
CREATE POLICY "Users can view seats of their bookings" ON public.booking_seats
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_seats.booking_id AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert seats for their bookings" ON public.booking_seats
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_seats.booking_id AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete seats of their bookings" ON public.booking_seats
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_seats.booking_id AND b.user_id = auth.uid()
  )
);

-- Add indexes for better performance
CREATE INDEX idx_showtimes_movie_id ON public.showtimes(movie_id);
CREATE INDEX idx_showtimes_cinema_id ON public.showtimes(cinema_id);
CREATE INDEX idx_showtimes_starts_at ON public.showtimes(starts_at);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_showtime_id ON public.bookings(showtime_id);
CREATE INDEX idx_booking_seats_booking_id ON public.booking_seats(booking_id);
CREATE INDEX idx_booking_seats_showtime_id ON public.booking_seats(showtime_id);

-- Add unique constraint to prevent double-booking same seat for same showtime
CREATE UNIQUE INDEX idx_unique_seat_showtime ON public.booking_seats(showtime_id, seat_label);