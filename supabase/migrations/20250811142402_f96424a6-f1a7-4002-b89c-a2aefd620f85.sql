-- Seed movies
INSERT INTO public.movies (title, poster_url, rating, description, duration_minutes, genre)
SELECT 'Neon Skyline', NULL, '8.6', 'In a sprawling neon metropolis, a rogue engineer must outsmart a sentient grid to save the city from a catastrophic blackout.', 128, 'Sci‑Fi,Adventure'
WHERE NOT EXISTS (SELECT 1 FROM public.movies WHERE title = 'Neon Skyline');

INSERT INTO public.movies (title, poster_url, rating, description, duration_minutes, genre)
SELECT 'City of Rain', NULL, '7.9', 'Two strangers cross paths under the rain and rewrite the stories they thought were already written.', 114, 'Romance,Drama'
WHERE NOT EXISTS (SELECT 1 FROM public.movies WHERE title = 'City of Rain');

INSERT INTO public.movies (title, poster_url, rating, description, duration_minutes, genre)
SELECT 'Tunnel Run', NULL, '8.1', 'A courier with a secret package races through the underbelly of the city with the world’s most relentless pursuer on his tail.', 102, 'Action,Thriller'
WHERE NOT EXISTS (SELECT 1 FROM public.movies WHERE title = 'Tunnel Run');

INSERT INTO public.movies (title, poster_url, rating, description, duration_minutes, genre)
SELECT 'Crown of Ember', NULL, '8.3', 'A farmhand discovers an ancient crown and awakens a dragon sworn to protect its rightful bearer.', 136, 'Fantasy,Adventure'
WHERE NOT EXISTS (SELECT 1 FROM public.movies WHERE title = 'Crown of Ember');

INSERT INTO public.movies (title, poster_url, rating, description, duration_minutes, genre)
SELECT 'Balloon Day', NULL, '7.4', 'Best friends attempt to throw the perfect park party and everything delightfully goes off‑script.', 96, 'Comedy,Family'
WHERE NOT EXISTS (SELECT 1 FROM public.movies WHERE title = 'Balloon Day');

INSERT INTO public.movies (title, poster_url, rating, description, duration_minutes, genre)
SELECT 'Shadow Alley', NULL, '8.0', 'A hard‑boiled detective stalks the midnight streets to untangle a case everyone else forgot.', 110, 'Mystery,Noir'
WHERE NOT EXISTS (SELECT 1 FROM public.movies WHERE title = 'Shadow Alley');

-- Seed cinemas
INSERT INTO public.cinemas (name, city, address)
SELECT 'PVR Phoenix Palladium', 'Mumbai', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'PVR Phoenix Palladium' AND city = 'Mumbai');

INSERT INTO public.cinemas (name, city, address)
SELECT 'INOX R City Mall', 'Mumbai', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'INOX R City Mall' AND city = 'Mumbai');

INSERT INTO public.cinemas (name, city, address)
SELECT 'PVR Select Citywalk', 'Delhi', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'PVR Select Citywalk' AND city = 'Delhi');

INSERT INTO public.cinemas (name, city, address)
SELECT 'INOX Pacific Mall', 'Delhi', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'INOX Pacific Mall' AND city = 'Delhi');

INSERT INTO public.cinemas (name, city, address)
SELECT 'PVR Orion Mall', 'Bengaluru', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'PVR Orion Mall' AND city = 'Bengaluru');

INSERT INTO public.cinemas (name, city, address)
SELECT 'INOX Garuda Mall', 'Bengaluru', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'INOX Garuda Mall' AND city = 'Bengaluru');

INSERT INTO public.cinemas (name, city, address)
SELECT 'PVR Nexus Mall', 'Hyderabad', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'PVR Nexus Mall' AND city = 'Hyderabad');

INSERT INTO public.cinemas (name, city, address)
SELECT 'Asian Priya Cinemas', 'Hyderabad', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'Asian Priya Cinemas' AND city = 'Hyderabad');

INSERT INTO public.cinemas (name, city, address)
SELECT 'SPI Sathyam Cinemas', 'Chennai', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'SPI Sathyam Cinemas' AND city = 'Chennai');

INSERT INTO public.cinemas (name, city, address)
SELECT 'PVR Phoenix Marketcity', 'Pune', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'PVR Phoenix Marketcity' AND city = 'Pune');

INSERT INTO public.cinemas (name, city, address)
SELECT 'INOX South City Mall', 'Kolkata', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'INOX South City Mall' AND city = 'Kolkata');

INSERT INTO public.cinemas (name, city, address)
SELECT 'Cinépolis Ahmedabad One', 'Ahmedabad', NULL
WHERE NOT EXISTS (SELECT 1 FROM public.cinemas WHERE name = 'Cinépolis Ahmedabad One' AND city = 'Ahmedabad');

-- Seed seats for each cinema (Auditorium 1, rows A-H, seats 1-12)
WITH rows AS (
  SELECT unnest(ARRAY['A','B','C','D','E','F','G','H']) AS row_label
), nums AS (
  SELECT generate_series(1, 12) AS seat_number
)
INSERT INTO public.seats (cinema_id, auditorium, row_label, seat_number)
SELECT c.id, 'Auditorium 1', r.row_label, n.seat_number
FROM public.cinemas c
CROSS JOIN rows r
CROSS JOIN nums n
WHERE NOT EXISTS (
  SELECT 1 FROM public.seats s
  WHERE s.cinema_id = c.id
    AND s.auditorium = 'Auditorium 1'
    AND s.row_label = r.row_label
    AND s.seat_number = n.seat_number
);

-- Seed showtimes for each cinema-movie today at 14:00 and 19:00
WITH slots AS (
  SELECT date_trunc('day', now()) + interval '14 hours' AS starts_at
  UNION ALL
  SELECT date_trunc('day', now()) + interval '19 hours'
)
INSERT INTO public.showtimes (cinema_id, movie_id, auditorium, starts_at, base_price)
SELECT c.id, m.id, 'Auditorium 1', s.starts_at, 200
FROM public.cinemas c
CROSS JOIN public.movies m
CROSS JOIN slots s
WHERE NOT EXISTS (
  SELECT 1 FROM public.showtimes st
  WHERE st.cinema_id = c.id
    AND st.movie_id = m.id
    AND st.auditorium = 'Auditorium 1'
    AND st.starts_at = s.starts_at
);
