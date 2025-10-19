import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMovies } from "@/hooks/useMovies";
import { useCities } from "@/hooks/useCities";
import { useAuth } from "@/context/AuthContext";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { movies, loading: moviesLoading } = useMovies();
  
  const [selectedCity, setSelectedCity] = useState<string>("");
  
  const { cities } = useCities();

  const movie = movies.find((m) => m.id === id);

  if (moviesLoading) return <main className="container py-10">Loading...</main>;
  if (!movie) return <main className="container py-10">Movie not found.</main>;

  const handleContinue = () => {
    if (!selectedCity) return;
    navigate(`/movie/${movie.id}/dates?city=${selectedCity}`);
  };


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

          {!user ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Sign in to book seats for this movie.</p>
              <Button asChild>
                <Link to="/auth" state={{ from: location.pathname + location.search }}>
                  Sign In to Book Seats
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select City</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleContinue} 
                disabled={!selectedCity}
                className="bg-gradient-brand hover:shadow-glow"
              >
                Continue to Select Date
              </Button>
            </div>
          )}

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
