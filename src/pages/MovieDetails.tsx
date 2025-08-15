import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMovies } from "@/hooks/useMovies";
import { useShowtimes } from "@/hooks/useShowtimes";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { movies, loading: moviesLoading } = useMovies();
  const { showtimes, loading: showtimesLoading } = useShowtimes(id);

  const movie = movies.find((m) => m.id === id);

  if (moviesLoading) return <main className="container py-10">Loading...</main>;
  if (!movie) return <main className="container py-10">Movie not found.</main>;

  const handleSelectDate = (date: string) => {
    const current = new URLSearchParams(location.search);
    const city = current.get("city");
    const params = new URLSearchParams({ date });
    if (city && city !== "all") params.set("city", city);
    navigate(`/movie/${movie.id}/seats?${params.toString()}`);
  };

  // Group showtimes by date
  const showtimesByDate = useMemo(() => {
    if (!showtimes || showtimes.length === 0) return {};
    
    const grouped: Record<string, typeof showtimes> = {};
    showtimes.forEach(showtime => {
      const date = new Date(showtime.starts_at).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(showtime);
    });
    return grouped;
  }, [showtimes]);

  return (
    <main className="container py-10">
      <Helmet>
        <title>{`${movie.title} – Showtimes & Info | CineFlow`}</title>
        <meta name="description" content={`${movie.title}: ${(movie.description || '').slice(0, 150)}...`} />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      <h1 className="sr-only">{movie.title}</h1>
      <article className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
        <img src={movie.poster_url || "/placeholder.svg"} alt={`${movie.title} poster`} className="w-full rounded-lg shadow-elegant" loading="lazy" />
        <div className="space-y-4">
          <header>
            <h2 className="text-3xl font-bold leading-tight">{movie.title}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {movie.genre && (
                <Badge variant="secondary">{movie.genre}</Badge>
              )}
            </div>
          </header>
          {movie.description && (
            <p className="text-muted-foreground max-w-prose">{movie.description}</p>
          )}
          <p className="text-sm">
            {movie.duration_minutes ? (<>
              Duration: <strong>{movie.duration_minutes} min</strong>
            </>) : null}
            {movie.rating ? (
              <> {movie.duration_minutes ? ' • ' : ''}Rating: <strong>{movie.rating}</strong></>
            ) : null}
          </p>

          <div>
            <h3 className="font-semibold mb-2">Available Dates</h3>
            <div className="flex flex-wrap gap-3">
              {showtimesLoading && <span className="text-sm text-muted-foreground">Loading dates...</span>}
              {!showtimesLoading && Object.keys(showtimesByDate).length === 0 && (
                <span className="text-sm text-muted-foreground">No dates available.</span>
              )}
              {!showtimesLoading && Object.keys(showtimesByDate).map((date) => (
                <Button
                  key={date}
                  variant="secondary"
                  onClick={() => handleSelectDate(date)}
                >
                  {new Date(date).toLocaleDateString([], { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Button asChild variant="ghost">
              <Link to={`/movies${location.search}`}>← Back to Movies</Link>
            </Button>
          </div>
        </div>
      </article>
    </main>
  );
};

export default MovieDetails;
