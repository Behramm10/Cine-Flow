import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useBooking } from "@/context/BookingContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMovies } from "@/hooks/useMovies";
import { useCinemas } from "@/hooks/useCinemas";
import { useCities } from "@/hooks/useCities";
import { useShowtimes } from "@/hooks/useShowtimes";
import { useReservedSeats } from "@/hooks/useReservedSeats";

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
  const selectedDate = query.get("date") || "";
  const navigate = useNavigate();
  const { setSelection } = useBooking();

  // Data hooks
  const { movies, loading: moviesLoading } = useMovies();
  const { cities, loading: citiesLoading } = useCities();
  const initialCity = query.get("city");
  const [city, setCity] = useState<string>("");
  const { cinemas, loading: cinemasLoading } = useCinemas(city);
  const [cinemaId, setCinemaId] = useState<string>("");
  const { showtimes, loading: showtimesLoading } = useShowtimes(id, cinemaId);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>("");
  
  // Filter showtimes for selected date
  const filteredShowtimes = useMemo(() => {
    if (!selectedDate) return showtimes;
    return showtimes.filter(showtime => 
      new Date(showtime.starts_at).toDateString() === selectedDate
    );
  }, [showtimes, selectedDate]);
  const { reservedSeats, loading: seatsLoading } = useReservedSeats(selectedShowtimeId);

  const movie = movies.find((m) => m.id === id);
  const [selected, setSelected] = useState<string[]>([]);
  const chosenCinema = cinemas.find((c) => c.id === cinemaId);
  const selectedShowtime = showtimes.find(s => s.id === selectedShowtimeId);
  const tiers = useMemo(() => {
    const basePrice = selectedShowtime?.base_price || 200;
    return [
      { price: basePrice, rows: ["A","B","C"] },
      { price: basePrice * 1.5, rows: ["D","E","F"] },
      { price: basePrice * 2, rows: ["G","H"] },
    ];
  }, [selectedShowtime]);

  const getSeatPrice = (seat: string) => {
    const row = seat.charAt(0);
    const t = tiers.find((t) => t.rows.includes(row));
    return t?.price ?? (selectedShowtime?.base_price || 200);
  };

  const isReserved = (seat: string) => reservedSample.has(seat) || reservedSeats.has(seat);

  // Loading states
  if (moviesLoading || citiesLoading) {
    return <main className="container py-10">Loading...</main>;
  }

  if (!movie) return <main className="container py-10">Movie not found.</main>;


  const toggleSeat = (seat: string) => {
    if (isReserved(seat)) return;
    setSelected((prev) => (prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]));
  };

  const proceed = () => {
    if (!selected.length) {
      toast("Please select at least one seat.");
      return;
    }
    if (!city) {
      toast("Please choose a city.");
      return;
    }
    if (!cinemaId) {
      toast("Please choose a cinema.");
      return;
    }
    if (!selectedShowtimeId) {
      toast("Please select a showtime.");
      return;
    }
    if (!chosenCinema || !selectedShowtime) {
      toast("Invalid selection.");
      return;
    }
    const seatPrices = selected.reduce<Record<string, number>>((acc, s) => {
      acc[s] = getSeatPrice(s);
      return acc;
    }, {});
    setSelection({
      showtimeId: selectedShowtimeId,
      movieTitle: movie.title,
      poster: movie.poster_url || "",
      seats: selected,
      seatPrices,
      showtime: new Date(selectedShowtime.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      city,
      cinema: chosenCinema.name,
      auditorium: selectedShowtime.auditorium,
    });
    navigate("/checkout");
  };

  return (
    <main className="container py-10">
      <Helmet>
        <title>Select Seats – {movie.title} | CineFlow</title>
        <meta name="description" content={`Choose your seats for ${movie.title}${selectedDate ? ` on ${new Date(selectedDate).toLocaleDateString()}` : ''}. Interactive seating with real-time selection.`} />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      <h1 className="text-2xl font-semibold mb-6">Select Seats</h1>
      <p className="text-muted-foreground mb-4">
        {movie.title} 
        {selectedDate && ` • ${new Date(selectedDate).toLocaleDateString([], { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}`}
        {selectedShowtime && ` • ${new Date(selectedShowtime.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
      </p>

      <div className="mb-4 grid gap-4 sm:grid-cols-3 max-w-4xl">
        <div>
          <label className="mb-2 block text-sm font-medium">City</label>
          <Select value={city || undefined} onValueChange={(v) => { 
            setCity(v); 
            setCinemaId(""); 
            setSelectedShowtimeId("");
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((ct) => (
                <SelectItem key={ct.id} value={ct.name}>{ct.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Cinema</label>
          <Select value={cinemaId || undefined} onValueChange={(v) => {
            setCinemaId(v);
            setSelectedShowtimeId("");
          }} disabled={!city || cinemasLoading}>
            <SelectTrigger>
              <SelectValue placeholder={city ? "Select a cinema" : "Choose city first"} />
            </SelectTrigger>
            <SelectContent>
              {cinemas.map((cn) => (
                <SelectItem key={cn.id} value={cn.id}>{cn.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Showtime</label>
          <Select value={selectedShowtimeId || undefined} onValueChange={setSelectedShowtimeId} disabled={!cinemaId || showtimesLoading}>
            <SelectTrigger>
              <SelectValue placeholder={cinemaId ? "Select showtime" : "Choose cinema first"} />
            </SelectTrigger>
            <SelectContent>
              {filteredShowtimes.map((st) => (
                <SelectItem key={st.id} value={st.id}>
                  {new Date(st.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {st.auditorium}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 h-2 rounded bg-gradient-brand" aria-hidden />
          <div className="grid gap-5">
            {tiers.map((tier) => (
              <div key={tier.price} className="grid grid-cols-[80px_1fr] items-start gap-3">
                <div className="text-sm font-medium text-muted-foreground">Rs {tier.price}</div>
                <div className="grid gap-3">
                  {tier.rows.map((r) => (
                    <div key={r} className="grid grid-cols-12 gap-2">
                      {cols.map((c) => {
                        const seat = `${r}${c}`;
                        const reserved = isReserved(seat);
                        const isSelected = selected.includes(seat);
                        return (
                          <button
                            key={seat}
                            type="button"
                            onClick={() => toggleSeat(seat)}
                            aria-pressed={isSelected}
                            aria-label={`Seat ${seat}${reserved ? ", reserved" : ""}`}
                              className={`h-9 rounded-md text-xs font-medium transition-colors border
                              ${reserved ? "bg-destructive text-destructive-foreground cursor-not-allowed" : isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}
                           >
                            {seat}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <span className="inline-flex items-center gap-2 text-sm"><span className="inline-block h-3 w-3 rounded bg-secondary" /> Available</span>
            <span className="inline-flex items-center gap-2 text-sm"><span className="inline-block h-3 w-3 rounded bg-primary" /> Selected</span>
            <span className="inline-flex items-center gap-2 text-sm"><span className="inline-block h-3 w-3 rounded bg-destructive" /> Reserved</span>
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
