import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useBookings } from "@/hooks/useBookings";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");

const History = () => {
  const { bookings, loading } = useBookings();

  if (loading) {
    return <main className="container py-10">Loading booking history...</main>;
  }

  return (
    <main className="container py-10">
      <Helmet>
        <title>Booking History | CineFlow</title>
        <meta name="description" content="Access your movie booking history and re-open digital tickets with QR codes." />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      <h1 className="text-2xl font-semibold mb-6">Booking History</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bookings.map((b) => (
          <article key={b.id} className="glass-panel rounded-xl p-4">
            <header className="flex items-center gap-3">
              <img 
                src={b.showtimes?.movies?.poster_url || "/placeholder.svg"} 
                alt={`${b.showtimes?.movies?.title} poster`} 
                className="h-16 w-12 rounded object-cover" 
              />
              <div>
                <h2 className="font-semibold leading-tight">{b.showtimes?.movies?.title}</h2>
                <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()}</p>
              </div>
            </header>
            <p className="mt-2 text-sm">
              Seats: <strong>{b.booking_seats?.map(s => s.seat_label).join(", ") || "—"}</strong>
            </p>
            <p className="text-sm">
              Showtime: {b.showtimes?.starts_at ? new Date(b.showtimes.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "—"}
            </p>
            <p className="text-sm">
              Cinema: <strong>{b.showtimes?.cinemas?.name || "—"}</strong> • 
              City: <strong>{b.showtimes?.cinemas?.city || "—"}</strong>
            </p>
            <p className="text-sm">Total: <strong>₹{b.total_amount}</strong></p>
            <div className="mt-3">
              <Link to={`/ticket/${b.id}`} className="text-sm underline text-primary">Open ticket</Link>
            </div>
          </article>
        ))}
        {bookings.length === 0 && (
          <p className="text-muted-foreground">No bookings yet.</p>
        )}
      </div>
    </main>
  );
};

export default History;
