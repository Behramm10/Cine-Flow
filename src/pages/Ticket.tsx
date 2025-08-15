import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");

interface BookingData {
  id: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  showtimes: {
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
  } | null;
  booking_seats: {
    seat_label: string;
    price: number;
  }[];
}

const Ticket = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      
      try {
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
          .eq('id', bookingId)
          .maybeSingle();

        if (error) throw error;
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) return <main className="container py-10">Loading ticket...</main>;
  if (!booking) return <main className="container py-10">Ticket not found.</main>;

  const movieTitle = booking.showtimes?.movies?.title || "Movie";
  const cinemaName = booking.showtimes?.cinemas?.name || "Cinema";
  const cityName = booking.showtimes?.cinemas?.city || "City";
  const showtime = booking.showtimes?.starts_at 
    ? new Date(booking.showtimes.starts_at).toLocaleString() 
    : "TBD";
  const posterUrl = booking.showtimes?.movies?.poster_url || "/placeholder.svg";
  const seats = booking.booking_seats?.map(s => s.seat_label) || [];

  return (
    <main className="container py-10">
      <Helmet>
        <title>Ticket #{booking.id} | CineFlow</title>
        <meta name="description" content={`Digital ticket for ${movieTitle} at ${cinemaName}, ${cityName}. Show at ${showtime}. Scan QR at entry.`} />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      <h1 className="text-2xl font-semibold mb-6">Your Digital Ticket</h1>
      <section className="max-w-xl glass-panel rounded-xl p-6 mx-auto shadow-elegant">
        <header className="flex items-center gap-4">
          <img src={posterUrl} alt={`${movieTitle} poster`} className="h-24 w-16 rounded object-cover" />
          <div>
            <h2 className="text-xl font-semibold">{movieTitle}</h2>
            <p className="text-muted-foreground text-sm">Showtime: {showtime}</p>
            <p className="text-sm">Cinema: <strong>{cinemaName}</strong> • City: <strong>{cityName}</strong></p>
            <p className="text-sm">Seats: <strong>{seats.join(", ")}</strong></p>
            <p className="text-sm">Auditorium: <strong>{booking.showtimes?.auditorium || "—"}</strong></p>
          </div>
        </header>
        <div className="mt-6 flex justify-center">
          <div className="rounded-lg bg-white p-3">
            <QRCodeCanvas value={`cineflow:${booking.id}`} size={208} includeMargin />
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">Booking ID: {booking.id}</p>
        <p className="mt-2 text-center text-sm text-muted-foreground">Total: ₹{booking.total_amount}</p>
        <div className="mt-6 text-center">
          <Link className="underline text-primary" to="/history">View booking history</Link>
        </div>
      </section>
    </main>
  );
};

export default Ticket;
