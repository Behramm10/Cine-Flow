import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { movies } from "@/data/movies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const movie = movies.find((m) => m.id === id);
  if (!movie) return <main className="container py-10">Movie not found.</main>;

  return (
    <main className="container py-10">
      <Helmet>
        <title>{`${movie.title} – Showtimes & Info | CineFlow`}</title>
        <meta name="description" content={`${movie.title}: ${movie.synopsis.slice(0, 150)}...`} />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      <h1 className="sr-only">{movie.title}</h1>
      <article className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
        <img src={movie.poster} alt={`${movie.title} poster`} className="w-full rounded-lg shadow-elegant" />
        <div className="space-y-4">
          <header>
            <h2 className="text-3xl font-bold leading-tight">{movie.title}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <Badge key={g} variant="secondary">{g}</Badge>
              ))}
            </div>
          </header>
          <p className="text-muted-foreground max-w-prose">{movie.synopsis}</p>
          <p className="text-sm">Language: <strong>{movie.language}</strong> • Rating: ⭐ {movie.rating.toFixed(1)} • {movie.runtime} min</p>
          <div>
            <h3 className="font-semibold mb-2">Cast</h3>
            <div className="flex flex-wrap gap-2">
              {movie.cast.map((c) => (
                <Badge key={c} variant="outline">{c}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Showtimes</h3>
            <div className="flex flex-wrap gap-3">
              {movie.showtimes.map((t) => (
                <Button key={t} variant="secondary" onClick={() => {
                  const current = new URLSearchParams(location.search);
                  const city = current.get("city");
                  const params = new URLSearchParams({ showtime: t });
                  if (city && city !== "all") params.set("city", city);
                  navigate(`/movie/${movie.id}/seats?${params.toString()}`);
                }}>
                  {t}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Button asChild variant="ghost">
              <Link to="/movies">← Back to Movies</Link>
            </Button>
          </div>
        </div>
      </article>
    </main>
  );
};

export default MovieDetails;
