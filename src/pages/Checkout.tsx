import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useBooking } from "@/context/BookingContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");

const Checkout = () => {
  const { booking, confirm } = useBooking();
  const navigate = useNavigate();

  if (!booking) return <main className="container py-10">No selection found.</main>;

  const onPay = () => {
    const id = confirm();
    toast("Payment processed (demo)");
    if (id) navigate(`/ticket/${id}`);
  };

  return (
    <main className="container py-10">
      <Helmet>
        <title>Checkout – {booking.movieTitle} | CineFlow</title>
        <meta name="description" content={`Confirm and pay for ${booking.movieTitle} at ${booking.cinema}, ${booking.city}. Digital QR ticket generated instantly.`} />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
      <Card className="p-6 grid gap-6 md:grid-cols-[160px_1fr]">
        <img src={booking.poster} alt={`${booking.movieTitle} poster`} className="w-full rounded-lg shadow-elegant" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{booking.movieTitle}</h2>
          <p className="text-sm text-muted-foreground">Showtime: {booking.showtime}</p>
          <p className="text-sm">Cinema: <strong>{booking.cinema}</strong> • City: <strong>{booking.city}</strong></p>
          <p className="text-sm">Seats: <strong>{booking.seats.join(", ")}</strong></p>
          <p className="text-lg mt-2">Total: <strong>${booking.total.toFixed(2)}</strong></p>
          <div className="pt-4">
            <Button onClick={onPay} className="bg-gradient-brand text-primary-foreground shadow-elegant">Confirm & Pay</Button>
          </div>
        </div>
      </Card>
    </main>
  );
};

export default Checkout;
