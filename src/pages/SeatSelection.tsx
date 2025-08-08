import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { movies } from "@/data/movies";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useBooking } from "@/context/BookingContext";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const rows = "ABCDEFGH".split("");
const cols = Array.from({ length: 12 }, (_, i) => i + 1);
const reservedSample = new Set(["A1","A2","B5","C7","D8","E3","F10","G6","H12"]);

const SeatSelection = () => {
  const { id } = useParams();
  const query = useQuery();
  const showtime = query.get("showtime") || "";
  const navigate = useNavigate();
  const { setSelection } = useBooking();

  const movie = movies.find((m) => m.id === id);
  const [selected, setSelected] = useState<string[]>([]);

  if (!movie) return <main className="container py-10">Movie not found.</main>;

  const toggleSeat = (seat: string) => {
    if (reservedSample.has(seat)) return;
    setSelected((prev) => (prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]));
  };

  const proceed = () => {
    if (!selected.length) {
      toast("Please select at least one seat.");
      return;
    }
    setSelection({
      movieId: movie.id,
      movieTitle: movie.title,
      poster: movie.poster,
      seats: selected,
      showtime,
      seatPrice: 9.99,
    });
    navigate("/checkout");
  };

  return (
    <main className="container py-10">
      <Helmet>
        <title>Select Seats – {movie.title} | CineFlow</title>
        <meta name="description" content={`Choose your seats for ${movie.title} at ${showtime}. Interactive seating with real-time selection.`} />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      <h1 className="text-2xl font-semibold mb-6">Select Seats</h1>
      <p className="text-muted-foreground mb-4">{movie.title} • {showtime}</p>

      <Card className="p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 h-2 rounded bg-gradient-brand" aria-hidden />
          <div className="grid gap-3">
            {rows.map((r) => (
              <div key={r} className="grid grid-cols-12 gap-2">
                {cols.map((c) => {
                  const seat = `${r}${c}`;
                  const reserved = reservedSample.has(seat);
                  const isSelected = selected.includes(seat);
                  return (
                    <button
                      key={seat}
                      type="button"
                      onClick={() => toggleSeat(seat)}
                      aria-pressed={isSelected}
                      aria-label={`Seat ${seat}${reserved ? ", reserved" : ""}`}
                      className={`h-9 rounded-md text-xs font-medium transition-colors border
                        ${reserved ? "bg-muted text-muted-foreground cursor-not-allowed" : isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
                    >
                      {seat}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <span className="inline-flex items-center gap-2 text-sm"><span className="inline-block h-3 w-3 rounded bg-secondary" /> Available</span>
            <span className="inline-flex items-center gap-2 text-sm"><span className="inline-block h-3 w-3 rounded bg-primary" /> Selected</span>
            <span className="inline-flex items-center gap-2 text-sm"><span className="inline-block h-3 w-3 rounded bg-muted" /> Reserved</span>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Selected: {selected.join(", ") || "None"}</p>
            <Button onClick={proceed} className="bg-gradient-brand text-primary-foreground shadow-elegant">Continue</Button>
          </div>
        </div>
      </Card>
    </main>
  );
};

export default SeatSelection;
