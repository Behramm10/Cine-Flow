import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Showtime {
  id: string;
  movie_id: string;
  cinema_id: string;
  auditorium: string;
  starts_at: string;
  base_price: number;
  created_at: string;
  movies?: {
    title: string;
    poster_url: string | null;
  };
  cinemas?: {
    name: string;
    city: string;
  };
}

export const useShowtimes = (movieId?: string, cinemaId?: string) => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('showtimes')
          .select(`
            *,
            movies:movie_id(title, poster_url),
            cinemas:cinema_id(name, city)
          `)
          .order('starts_at');

        if (movieId) {
          query = query.eq('movie_id', movieId);
        }
        
        if (cinemaId) {
          query = query.eq('cinema_id', cinemaId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setShowtimes(data || []);
      } catch (err) {
        console.error('Error fetching showtimes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch showtimes');
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId, cinemaId]);

  return { showtimes, loading, error };
};