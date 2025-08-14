import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useReservedSeats = (showtimeId: string | null) => {
  const [reservedSeats, setReservedSeats] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showtimeId) {
      setReservedSeats(new Set());
      return;
    }

    const fetchReservedSeats = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('booking_seats')
          .select('seat_label')
          .eq('showtime_id', showtimeId);

        if (error) throw error;
        
        const seatLabels = data?.map(seat => seat.seat_label) || [];
        setReservedSeats(new Set(seatLabels));
      } catch (err) {
        console.error('Error fetching reserved seats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch reserved seats');
        setReservedSeats(new Set());
      } finally {
        setLoading(false);
      }
    };

    fetchReservedSeats();

    // Set up real-time subscription for seat updates
    const channel = supabase
      .channel(`reserved-seats-${showtimeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_seats',
          filter: `showtime_id=eq.${showtimeId}`,
        },
        () => {
          // Refetch seats when changes occur
          fetchReservedSeats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showtimeId]);

  return { reservedSeats, loading, error };
};