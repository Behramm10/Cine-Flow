import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface BookingWithDetails {
  id: string;
  user_id: string;
  showtime_id: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  showtimes?: {
    starts_at: string;
    auditorium: string;
    movies: {
      title: string;
      poster_url: string | null;
    };
    cinemas: {
      name: string;
      city: string;
    };
  };
  booking_seats?: Array<{
    seat_label: string;
    price: number;
  }>;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setBookings([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            showtimes:showtime_id(
              starts_at,
              auditorium,
              movies:movie_id(title, poster_url),
              cinemas:cinema_id(name, city)
            ),
            booking_seats(seat_label, price)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const refetch = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          showtimes:showtime_id(
            starts_at,
            auditorium,
            movies:movie_id(title, poster_url),
            cinemas:cinema_id(name, city)
          ),
          booking_seats(seat_label, price)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  return { bookings, loading, error, refetch };
};