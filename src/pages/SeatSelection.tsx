import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useBooking } from "@/context/BookingContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMovies } from "@/hooks/useMovies";
import { useCinemas } from "@/hooks/useCinemas";
import { useCities } from "@/hooks/useCities";
import { useShowtimes } from "@/hooks/useShowtimes";
import { useReservedSeats } from "@/hooks/useReservedSeats";
import { MapPin, Calendar, Clock, Users, IndianRupee, ArrowLeft } from "lucide-react";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const rows = "ABCDEFG".split("");
const cols = Array.from({ length: 12 }, (_, i) => i + 1);

// Generate random reserved seats for each movie
const generateRandomReservedSeats = (movieId: string) => {
  const seed = movieId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed + min + max) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };
  
  const numReserved = random(8, 15);
  const reserved = new Set<string>();
  const allRows = "ABCDEFG".split("");
  
  while (reserved.size < numReserved) {
    const row = allRows[random(0, allRows.length - 1)];
    const col = random(1, 12);
    reserved.add(`${row}${col}`);
  }
  
  return reserved;
};

const SeatSelection = () => {
  const { id } = useParams();
  const query = useQuery();
  const selectedDate = query.get("date") || "";
  const navigate = useNavigate();
  const { setSelection } = useBooking();

  // Data hooks
  const { movies, loading: moviesLoading } = useMovies();
  const { cities, loading: citiesLoading } = useCities();
  const initialCity = query.get("city") || "";
  const [city, setCity] = useState<string>(initialCity);
  const { cinemas, loading: cinemasLoading } = useCinemas(city);
  const [cinemaId, setCinemaId] = useState<string>("");
  const { showtimes, loading: showtimesLoading } = useShowtimes(id, cinemaId, !cinemaId);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>("");
  
  // Filter showtimes for selected date
  const filteredShowtimes = useMemo(() => {
    if (!showtimes || !selectedDate) return showtimes || [];
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
      { name: "Standard", price: basePrice, rows: ["A","B"], color: "bg-green-500/20 border-green-500/40" },
      { name: "Executive", price: basePrice * 1.5, rows: ["C","D","E"], color: "bg-blue-500/20 border-blue-500/40" },
      { name: "Premium", price: basePrice * 2, rows: ["F","G"], color: "bg-yellow-500/20 border-yellow-500/40" },
    ];
  }, [selectedShowtime]);

  const randomReservedSeats = useMemo(() => 
    id ? generateRandomReservedSeats(id) : new Set<string>(), 
    [id]
  );

  const getSeatPrice = (seat: string) => {
    const row = seat.charAt(0);
    const tier = tiers.find((t) => t.rows.includes(row));
    return tier?.price ?? (selectedShowtime?.base_price || 200);
  };

  const getSeatTier = (seat: string) => {
    const row = seat.charAt(0);
    return tiers.find((t) => t.rows.includes(row));
  };

  const isReserved = (seat: string) => randomReservedSeats.has(seat) || reservedSeats.has(seat);

  const totalAmount = selected.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

  // Loading states
  if (moviesLoading || citiesLoading) {
    return (
      <main className="container section-padding">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!movie) return (
    <main className="container section-padding">
      <Card className="glass-card border-0 text-center p-12">
        <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
        <Button onClick={() => navigate('/movies')} className="bg-gradient-brand hover:shadow-glow">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Movies
        </Button>
      </Card>
    </main>
  );

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
    <main className="container section-padding">
      <Helmet>
        <title>Select Seats – {movie.title} | CineFlow</title>
        <meta name="description" content={`Choose your premium seats for ${movie.title}${selectedDate ? ` on ${new Date(selectedDate).toLocaleDateString()}` : ''}. Interactive seating with real-time availability.`} />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-4 hover:shadow-card transition-all duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Select Your Seats</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="font-medium text-lg text-primary">{movie.title}</span>
              {selectedDate && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(selectedDate).toLocaleDateString([], { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Badge>
              )}
              {selectedShowtime && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(selectedShowtime.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              )}
            </div>
          </div>
          
          {selected.length > 0 && (
            <Card className="glass-card border-0 p-4 animate-scale-in">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  <Users className="h-4 w-4 inline mr-1" />
                  {selected.length} seat{selected.length > 1 ? 's' : ''}
                </div>
                <div className="text-lg font-bold text-primary flex items-center">
                  <IndianRupee className="h-4 w-4" />
                  {totalAmount}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Selection Controls */}
      <Card className="glass-card border-0 mb-8 animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Theater Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">City</label>
              <Select value={city || undefined} onValueChange={(v) => { 
                setCity(v); 
                setCinemaId(""); 
                setSelectedShowtimeId("");
              }}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-0">
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
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={city ? "Select cinema" : "Choose city first"} />
                </SelectTrigger>
                <SelectContent className="glass-panel border-0">
                  {cinemas.map((cn) => (
                    <SelectItem key={cn.id} value={cn.id}>{cn.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Showtime</label>
              <Select value={selectedShowtimeId || undefined} onValueChange={setSelectedShowtimeId} disabled={!cinemaId || showtimesLoading}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={cinemaId ? "Select showtime" : "Choose cinema first"} />
                </SelectTrigger>
                <SelectContent className="glass-panel border-0">
                  {filteredShowtimes.map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {new Date(st.starts_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {st.auditorium}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seating Chart */}
      {selectedShowtimeId && (
        <Card className="glass-card border-0 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-center">Theater Layout</CardTitle>
            <div className="mx-auto max-w-md">
              <div className="h-3 rounded-full bg-gradient-brand mb-2" />
              <p className="text-sm text-muted-foreground text-center">SCREEN</p>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Price Tiers */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {tiers.map((tier) => (
                  <div key={tier.name} className={`px-3 py-2 rounded-lg border ${tier.color} flex items-center gap-2`}>
                    <span className="text-sm font-medium">{tier.name}</span>
                    <span className="text-sm font-semibold flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {tier.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Seat Grid */}
              <div className="space-y-4">
                {tiers.map((tier) => (
                  <div key={tier.name} className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <span>{tier.name}</span>
                      <span className="flex items-center text-xs">
                        <IndianRupee className="h-3 w-3" />
                        {tier.price}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {tier.rows.map((row) => (
                        <div key={row} className="flex items-center gap-2 justify-center">
                          <span className="w-8 text-sm font-medium text-muted-foreground text-center">{row}</span>
                          <div className="grid grid-cols-12 gap-1 sm:gap-2">
                            {cols.map((col) => {
                              const seat = `${row}${col}`;
                              const reserved = isReserved(seat);
                              const isSelected = selected.includes(seat);
                              return (
                                <button
                                  key={seat}
                                  type="button"
                                  onClick={() => toggleSeat(seat)}
                                  disabled={reserved}
                                  aria-pressed={isSelected}
                                  aria-label={`Seat ${seat}${reserved ? ", reserved" : ""}`}
                                  className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg text-xs font-medium transition-all duration-200 border
                                    ${reserved 
                                      ? "bg-destructive/20 border-destructive/40 text-destructive cursor-not-allowed" 
                                      : isSelected 
                                        ? "bg-primary border-primary text-primary-foreground shadow-glow scale-105" 
                                        : "bg-secondary/50 border-border hover:bg-accent hover:border-accent-foreground/20 hover:scale-105"
                                    }`}
                                >
                                  {col}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-4 w-4 rounded bg-secondary/50 border" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-4 w-4 rounded bg-primary border-primary shadow-sm" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-4 w-4 rounded bg-destructive/20 border-destructive/40" />
                  <span>Reserved</span>
                </div>
              </div>

              {/* Selection Summary & Continue */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
                <div className="text-center sm:text-left">
                  {selected.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Selected: <span className="font-medium">{selected.join(", ")}</span>
                      </p>
                      <p className="text-lg font-bold text-primary flex items-center justify-center sm:justify-start">
                        Total: <IndianRupee className="h-4 w-4 ml-1" />{totalAmount}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No seats selected</p>
                  )}
                </div>
                
                <Button 
                  onClick={proceed} 
                  disabled={selected.length === 0}
                  size="lg"
                  className="bg-gradient-brand hover:shadow-glow transition-all duration-300 min-w-[140px]"
                >
                  Continue Booking
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default SeatSelection;
