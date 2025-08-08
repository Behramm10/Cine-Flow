import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");
const key = "cineflow_bookings";

type Record = {
  bookingId: string;
  movieTitle: string;
  poster: string;
  seats: string[];
  showtime: string;
  total: number;
  timestamp: string;
};

const History = () => {
  const bookings: Record[] = JSON.parse(localStorage.getItem(key) || "[]");

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
          <article key={b.bookingId} className="glass-panel rounded-xl p-4">
            <header className="flex items-center gap-3">
              <img src={b.poster} alt={`${b.movieTitle} poster`} className="h-16 w-12 rounded object-cover" />
              <div>
                <h2 className="font-semibold leading-tight">{b.movieTitle}</h2>
                <p className="text-xs text-muted-foreground">{new Date(b.timestamp).toLocaleString()}</p>
              </div>
            </header>
            <p className="mt-2 text-sm">Seats: <strong>{b.seats.join(", ")}</strong></p>
            <p className="text-sm">Showtime: {b.showtime}</p>
            <div className="mt-3">
              <Link to={`/ticket/${b.bookingId}`} className="text-sm underline text-primary">Open ticket</Link>
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
