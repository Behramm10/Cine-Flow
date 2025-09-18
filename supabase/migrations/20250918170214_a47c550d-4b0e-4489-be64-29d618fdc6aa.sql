-- Add trailer_url column to movies table
ALTER TABLE public.movies 
ADD COLUMN trailer_url text;