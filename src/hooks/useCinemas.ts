import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Cinema {
  id: string;
  name: string;
  city: string;
  address: string | null;
  created_at: string;
}

export const useCinemas = (city?: string) => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('cinemas')
          .select('*')
          .order('city, name');

        if (city) {
          query = query.eq('city', city);
        }

        const { data, error } = await query;

        if (error) throw error;
        setCinemas(data || []);
      } catch (err) {
        console.error('Error fetching cinemas:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch cinemas');
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, [city]);

  return { cinemas, loading, error };
};