import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useShowtimeGeneration = () => {
  useEffect(() => {
    const generateShowtimes = async () => {
      try {
        const { error } = await supabase.rpc('generate_future_showtimes');
        if (error) {
          console.error('Error generating showtimes:', error);
        }
      } catch (err) {
        console.error('Failed to generate showtimes:', err);
      }
    };

    // Generate showtimes on mount
    generateShowtimes();

    // Auto-generate every 30 minutes to ensure fresh dates
    const interval = setInterval(generateShowtimes, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
