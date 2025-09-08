import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MovieCard } from "@/components/movies/MovieCard";
import { useMovies } from "@/hooks/useMovies";
import { useCities } from "@/hooks/useCities";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");

const Movies = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const genre = params.get("genre") || "all";
  const city = params.get("city") || "all";

  const { movies, loading: moviesLoading } = useMovies();
  const { cities, loading: citiesLoading } = useCities();

  const genres = useMemo(() => Array.from(new Set(movies.map((m) => m.genre).filter(Boolean))), [movies]);

  const filtered = movies.filter((m) => {
    const text = (m.title + " " + (m.genre || "") + " " + (m.description || "")).toLowerCase();
    return (
      text.includes(q.toLowerCase()) &&
      (genre === "all" || m.genre === genre)
    );
  });

  if (moviesLoading || citiesLoading) {
    return (
      <main className="container section-padding">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading movies...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container section-padding">
      <Helmet>
        <title>Browse Movies - CineFlow</title>
        <meta name="description" content="Discover and filter movies by title, genre, and location. Find showtimes and book premium seats instantly on CineFlow." />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Browse Movies</h1>
        <p className="text-muted-foreground text-lg">
          Discover the latest releases and find your perfect show
        </p>
      </div>

      {/* Enhanced Filters */}
      <Card className="glass-card border-0 mb-8 animate-slide-up">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search movies..."
                value={q}
                onChange={(e) => setParams((prev) => ({ 
                  ...Object.fromEntries(prev), 
                  q: e.target.value 
                }))}
                className="pl-10 h-11"
              />
            </div>

            {/* Genre Filter */}
            <Select 
              value={genre} 
              onValueChange={(v) => setParams((prev) => ({ 
                ...Object.fromEntries(prev), 
                genre: v === "all" ? "" : v 
              }))}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-0">
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* City Filter */}
            <Select 
              value={city} 
              onValueChange={(v) => setParams((prev) => ({ 
                ...Object.fromEntries(prev), 
                city: v === "all" ? "" : v 
              }))}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-0">
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-semibold">
            {filtered.length} {filtered.length === 1 ? 'Movie' : 'Movies'} Found
          </h2>
          {(q || genre !== "all" || city !== "all") && (
            <p className="text-sm text-muted-foreground mt-1">
              {q && `"${q}"`}
              {genre !== "all" && ` in ${genre}`}
              {city !== "all" && ` in ${city}`}
            </p>
          )}
        </div>
        
        {/* Clear Filters */}
        {(q || genre !== "all" || city !== "all") && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setParams({})}
            className="hover:shadow-card transition-all duration-200"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Grid */}
      <section aria-labelledby="results" className="animate-scale-in">
        {filtered.length === 0 ? (
          <Card className="glass-card border-0 text-center p-12">
            <div className="space-y-4">
              <div className="text-6xl">🎬</div>
              <h3 className="text-xl font-semibold">No movies found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <Button 
                onClick={() => setParams({})}
                className="bg-gradient-brand hover:shadow-glow transition-all duration-300"
              >
                Browse All Movies
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((movie, index) => (
              <div 
                key={movie.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Movies;
