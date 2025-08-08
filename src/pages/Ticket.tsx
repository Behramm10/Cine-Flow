import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");
const key = "cineflow_bookings";

const Ticket = () => {
  const { bookingId } = useParams();
  const bookings = JSON.parse(localStorage.getItem(key) || "[]");
  const booking = bookings.find((b: any) => b.bookingId === bookingId);

  if (!booking) return <main className="container py-10">Ticket not found.</main>;

  return (
    <main className="container py-10">
      <Helmet>
        <title>Ticket #{booking.bookingId} | CineFlow</title>
        <meta name="description" content={`Digital ticket for ${booking.movieTitle} at ${booking.cinema}, ${booking.city}. Show at ${booking.showtime}. Scan QR at entry.`} />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      <h1 className="text-2xl font-semibold mb-6">Your Digital Ticket</h1>
      <section className="max-w-xl glass-panel rounded-xl p-6 mx-auto shadow-elegant">
        <header className="flex items-center gap-4">
          <img src={booking.poster} alt={`${booking.movieTitle} poster`} className="h-24 w-16 rounded object-cover" />
          <div>
            <h2 className="text-xl font-semibold">{booking.movieTitle}</h2>
            <p className="text-muted-foreground text-sm">Showtime: {booking.showtime}</p>
            <p className="text-sm">Cinema: <strong>{booking.cinema}</strong> • City: <strong>{booking.city}</strong></p>
            <p className="text-sm">Seats: <strong>{booking.seats.join(", ")}</strong></p>
          </div>
        </header>
        <div className="mt-6 flex justify-center">
          <div className="rounded-lg bg-white p-3">
            <QRCodeCanvas value={`cineflow:${booking.bookingId}`} size={208} includeMargin />
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">Booking ID: {booking.bookingId}</p>
        <div className="mt-6 text-center">
          <Link className="underline text-primary" to="/history">View booking history</Link>
        </div>
      </section>
    </main>
  );
};

export default Ticket;
