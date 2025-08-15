-- Insert sample cities
INSERT INTO public.cities (name) VALUES
('Mumbai'),
('Delhi'),
('Bangalore'),
('Chennai'),
('Kolkata'),
('Pune'),
('Hyderabad');

-- Insert sample cinemas
INSERT INTO public.cinemas (name, city, address) VALUES
('PVR Phoenix Mills', 'Mumbai', 'High Street Phoenix, Lower Parel'),
('INOX R-City Mall', 'Mumbai', 'R City Mall, Ghatkopar West'),
('Cinepolis DLF Mall', 'Delhi', 'DLF Mall of India, Noida'),
('PVR Select City Walk', 'Delhi', 'Select City Walk, Saket'),
('PVR Forum Mall', 'Bangalore', 'Forum Mall, Koramangala'),
('INOX Garuda Mall', 'Bangalore', 'Garuda Mall, Magrath Road'),
('PVR Grand Mall', 'Chennai', 'Grand Mall, Velachery'),
('Escape Cinemas', 'Chennai', 'Express Avenue Mall, Royapettah'),
('INOX South City', 'Kolkata', 'South City Mall, Prince Anwar Shah Road'),
('PVR Acropolis Mall', 'Pune', 'Acropolis Mall, Viman Nagar'),
('AMB Cinemas', 'Hyderabad', 'AMB Mall, Gachibowli');

-- Insert sample movies
INSERT INTO public.movies (title, genre, duration_minutes, rating, description, poster_url) VALUES
('Avengers: Endgame', 'Action', 181, 'PG-13', 'The Avengers assemble once more to reverse the damage caused by Thanos in Infinity War.', '/poster-action.jpg'),
('The Grand Budapest Hotel', 'Comedy', 99, 'R', 'The adventures of Gustave H, a legendary concierge at a famous European hotel.', '/poster-comedy.jpg'),
('Blade Runner 2049', 'Sci-Fi', 164, 'R', 'A young blade runner discovers a secret that could plunge what remains of society into chaos.', '/poster-sci-fi.jpg'),
('The Princess Bride', 'Romance', 98, 'PG', 'A classic fairy tale of true love and high adventure.', '/poster-romance.jpg'),
('The Lord of the Rings: Fellowship', 'Fantasy', 178, 'PG-13', 'A hobbit and his companions set out on a quest to destroy the One Ring.', '/poster-fantasy.jpg'),
('Casablanca', 'Noir', 102, 'PG', 'A cynical American expatriate struggles to decide whether or not he should help his former lover.', '/poster-noir.jpg'),
('Dune', 'Sci-Fi', 155, 'PG-13', 'Paul Atreides leads nomadic tribes in a revolt against the galactic emperor.', '/poster-sci-fi.jpg'),
('Inception', 'Action', 148, 'PG-13', 'A thief who steals corporate secrets through dream-sharing technology.', '/poster-action.jpg'),
('La La Land', 'Romance', 128, 'PG-13', 'A jazz musician and an aspiring actress meet and fall in love in Los Angeles.', '/poster-romance.jpg'),
('The Dark Knight', 'Action', 152, 'PG-13', 'Batman faces the Joker, a criminal mastermind wreaking havoc on Gotham City.', '/poster-action.jpg');

-- Insert sample seats for different cinemas and auditoriums using ASCII values
WITH cinema_seats AS (
  SELECT 
    c.id as cinema_id,
    'Screen 1' as auditorium,
    (ASCII('A') + (r - 1))::int as ascii_val,
    s as seat_num,
    r as row_num
  FROM public.cinemas c
  CROSS JOIN generate_series(1, 8) r
  CROSS JOIN generate_series(1, 12) s
  WHERE c.name IN ('PVR Phoenix Mills', 'INOX R-City Mall', 'Cinepolis DLF Mall')
)
INSERT INTO public.seats (cinema_id, auditorium, row_label, seat_number, seat_label) 
SELECT 
  cinema_id,
  auditorium,
  CAST(ascii_val AS char),
  seat_num,
  CAST(ascii_val AS char) || seat_num::text
FROM cinema_seats;

-- Insert more seats for Screen 2
WITH cinema_seats_2 AS (
  SELECT 
    c.id as cinema_id,
    'Screen 2' as auditorium,
    (ASCII('A') + (r - 1))::int as ascii_val,
    s as seat_num,
    r as row_num
  FROM public.cinemas c
  CROSS JOIN generate_series(1, 6) r
  CROSS JOIN generate_series(1, 10) s
  WHERE c.name IN ('PVR Phoenix Mills', 'INOX R-City Mall')
)
INSERT INTO public.seats (cinema_id, auditorium, row_label, seat_number, seat_label) 
SELECT 
  cinema_id,
  auditorium,
  CAST(ascii_val AS char),
  seat_num,
  CAST(ascii_val AS char) || seat_num::text
FROM cinema_seats_2;

-- Insert sample showtimes for today and tomorrow
INSERT INTO public.showtimes (movie_id, cinema_id, auditorium, starts_at, base_price)
SELECT 
    m.id,
    c.id,
    'Screen 1',
    (CURRENT_DATE + INTERVAL '1 day' + (time_slot || ' hours')::interval)::timestamp with time zone,
    CASE 
        WHEN time_slot IN ('10', '13') THEN 250.00
        WHEN time_slot IN ('16', '19') THEN 350.00
        ELSE 450.00
    END
FROM public.movies m
CROSS JOIN public.cinemas c
CROSS JOIN (VALUES ('10'), ('13'), ('16'), ('19'), ('22')) AS t(time_slot)
WHERE c.name IN ('PVR Phoenix Mills', 'INOX R-City Mall', 'Cinepolis DLF Mall')
AND m.title IN ('Avengers: Endgame', 'Blade Runner 2049', 'Inception', 'The Dark Knight')
LIMIT 60;

-- Insert more showtimes for different screens and days
INSERT INTO public.showtimes (movie_id, cinema_id, auditorium, starts_at, base_price)
SELECT 
    m.id,
    c.id,
    'Screen 2',
    (CURRENT_DATE + INTERVAL '2 day' + (time_slot || ' hours')::interval)::timestamp with time zone,
    CASE 
        WHEN time_slot IN ('11', '14') THEN 275.00
        WHEN time_slot IN ('17', '20') THEN 375.00
        ELSE 475.00
    END
FROM public.movies m
CROSS JOIN public.cinemas c
CROSS JOIN (VALUES ('11'), ('14'), ('17'), ('20')) AS t(time_slot)
WHERE c.name IN ('PVR Forum Mall', 'INOX Garuda Mall', 'PVR Grand Mall', 'PVR Select City Walk')
AND m.title IN ('Dune', 'La La Land', 'The Princess Bride', 'The Lord of the Rings: Fellowship')
LIMIT 48;