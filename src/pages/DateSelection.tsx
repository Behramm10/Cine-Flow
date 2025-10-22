import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMovies } from "@/hooks/useMovies";
import { useShowtimes } from "@/hooks/useShowtimes";
import { ArrowLeft, Calendar } from "lucide-react";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const DateSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useQuery();
  const city = query.get("city") || "";
  
  const { movies, loading: moviesLoading } = useMovies();
  // Skip fetching if no city selected
  const { showtimes, loading: showtimesLoading } = useShowtimes(id, undefined, !city);

  const movie = movies.find((m) => m.id === id);

  // Get available dates filtered by city
  const availableDates = useMemo(() => {
    if (!showtimes || showtimes.length === 0 || !city) return [];
    const dates = new Set<string>();
    const now = new Date();
    
    showtimes.forEach(showtime => {
      const showtimeDate = new Date(showtime.starts_at);
      // Only include future showtimes in selected city
      if (showtimeDate > now && showtime.cinemas?.city === city) {
        dates.add(showtimeDate.toDateString());
      }
    });
    
    return Array.from(dates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [showtimes, city]);

  if (moviesLoading || showtimesLoading) {
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

  if (!movie) {
    return (
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
  }

  const handleSelectDate = (date: string) => {
    navigate(`/movie/${movie.id}/seats?city=${encodeURIComponent(city)}&date=${encodeURIComponent(date)}`);
  };

  return (
    <main className="container section-padding">
      <Helmet>
        <title>Select Date – {movie.title} | CineFlow</title>
        <meta name="description" content={`Choose your preferred date for ${movie.title} in ${city}. Multiple showtimes available.`} />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/movie/${id}`)}
          className="mb-4 hover:shadow-card transition-all duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Select Date</h1>
          <p className="text-muted-foreground">
            <span className="font-medium text-primary">{movie.title}</span> • {city}
          </p>
        </div>
      </div>

      {/* Date Selection */}
      <Card className="glass-card border-0 animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Available Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableDates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No showtimes available in {city} for this movie.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {availableDates.map((date) => (
                <Button
                  key={date}
                  variant="outline"
                  onClick={() => handleSelectDate(date)}
                  className="h-auto py-4 flex-col gap-1 hover:bg-accent hover:shadow-card transition-all duration-200"
                >
                  <span className="text-lg font-semibold">
                    {new Date(date).toLocaleDateString([], { 
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(date).toLocaleDateString([], { 
                      weekday: 'long'
                    })}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default DateSelection;
