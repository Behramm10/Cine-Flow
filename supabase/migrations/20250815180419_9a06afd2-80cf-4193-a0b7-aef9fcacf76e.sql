-- Insert comprehensive showtimes for all movies in all cinemas
-- Create multiple showtimes per day for each movie in each cinema

-- Clear existing showtimes first to avoid duplicates
DELETE FROM showtimes;

-- Insert showtimes for next 7 days for all movies in all cinemas
INSERT INTO showtimes (movie_id, cinema_id, auditorium, starts_at, base_price)
SELECT 
    m.id as movie_id,
    c.id as cinema_id,
    CASE 
        WHEN (row_number() OVER (PARTITION BY m.id, c.id ORDER BY random())) % 4 = 0 THEN 'Screen 1'
        WHEN (row_number() OVER (PARTITION BY m.id, c.id ORDER BY random())) % 4 = 1 THEN 'Screen 2'
        WHEN (row_number() OVER (PARTITION BY m.id, c.id ORDER BY random())) % 4 = 2 THEN 'Screen 3'
        ELSE 'Screen 4'
    END as auditorium,
    (current_date + interval '1 day' * day_offset + 
     interval '1 hour' * time_slot + 
     interval '30 minutes' * (random() * 2)::int) as starts_at,
    CASE 
        WHEN c.city IN ('Mumbai', 'Delhi') THEN 350 + (random() * 150)::int
        WHEN c.city IN ('Bangalore', 'Bengaluru', 'Chennai', 'Hyderabad') THEN 280 + (random() * 120)::int
        ELSE 220 + (random() * 100)::int
    END as base_price
FROM 
    movies m
CROSS JOIN 
    cinemas c
CROSS JOIN 
    generate_series(0, 6) as day_offset  -- Next 7 days
CROSS JOIN 
    unnest(ARRAY[10, 13, 16, 19, 22]) as time_slot  -- 10 AM, 1 PM, 4 PM, 7 PM, 10 PM
WHERE 
    -- Only create showtimes for future dates
    (current_date + interval '1 day' * day_offset + interval '1 hour' * time_slot) > now()
ORDER BY 
    m.title, c.city, c.name, starts_at;