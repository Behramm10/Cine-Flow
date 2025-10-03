-- Fix search path for the generate_future_showtimes function
CREATE OR REPLACE FUNCTION generate_future_showtimes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  movie RECORD;
  cinema RECORD;
  base_date DATE;
  day_offset INT;
  time_slot TIME;
  auditorium_num INT;
BEGIN
  -- Delete old showtimes (past dates)
  DELETE FROM showtimes WHERE starts_at < NOW();
  
  -- Get current max date from showtimes
  SELECT COALESCE(MAX(DATE(starts_at)), CURRENT_DATE) INTO base_date FROM showtimes;
  
  -- If we have less than 7 days of future showtimes, generate more
  IF (SELECT COUNT(DISTINCT DATE(starts_at)) FROM showtimes WHERE starts_at > NOW()) < 7 THEN
    -- Generate showtimes for the next 14 days
    FOR movie IN SELECT * FROM movies LOOP
      FOR cinema IN SELECT * FROM cinemas LOOP
        FOR day_offset IN 0..13 LOOP
          -- Generate 3-4 showtimes per day per cinema per movie
          FOR time_slot IN 
            SELECT * FROM (VALUES 
              ('11:00'::TIME), 
              ('14:30'::TIME), 
              ('18:00'::TIME), 
              ('21:30'::TIME)
            ) AS t(time)
          LOOP
            -- Randomly assign to screens 1-4
            auditorium_num := (RANDOM() * 3 + 1)::INT;
            
            -- Insert showtime if it doesn't exist
            INSERT INTO showtimes (
              movie_id, 
              cinema_id, 
              auditorium, 
              starts_at, 
              base_price
            )
            SELECT 
              movie.id,
              cinema.id,
              'Screen ' || auditorium_num,
              (base_date + day_offset) + time_slot,
              (RANDOM() * 200 + 200)::NUMERIC(10,2)
            WHERE NOT EXISTS (
              SELECT 1 FROM showtimes 
              WHERE movie_id = movie.id 
              AND cinema_id = cinema.id 
              AND DATE(starts_at) = base_date + day_offset
              AND starts_at::TIME = time_slot
            );
          END LOOP;
        END LOOP;
      END LOOP;
    END LOOP;
  END IF;
END;
$$;