import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { movies } from "@/data/movies";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MovieCard } from "@/components/movies/MovieCard";
import { CITIES } from "@/data/cinemas";

const canonical = () => (typeof window !== "undefined" ? window.location.href : "");

const Movies = () => {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const genre = params.get("genre") || "all";
  const lang = params.get("lang") || "all";
  const city = params.get("city") || "all";

  const genres = useMemo(() => Array.from(new Set(movies.flatMap((m) => m.genres))), []);
  const languages = useMemo(() => Array.from(new Set(movies.map((m) => m.language))), []);

  const filtered = movies.filter((m) => {
    const text = (m.title + " " + m.genres.join(" ") + " " + m.language).toLowerCase();
    return (
      text.includes(q.toLowerCase()) &&
      (genre === "all" || m.genres.includes(genre)) &&
      (lang === "all" || m.language === lang)
    );
  });

  return (
    <main className="container py-10">
      <Helmet>
        <title>Browse Movies | CineFlow</title>
        <meta name="description" content="Filter movies by title, genre, and language. Explore showtimes and book seats instantly on CineFlow." />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      <h1 className="sr-only">Browse Movies</h1>
      <section aria-labelledby="filters" className="mb-8">
        <h2 id="filters" className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search title, genre, language"
            value={q}
            onChange={(e) => setParams((prev) => ({ ...Object.fromEntries(prev), q: e.target.value }))}
          />
          <Select value={genre} onValueChange={(v) => setParams((prev) => ({ ...Object.fromEntries(prev), genre: v === "all" ? "" : v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={lang} onValueChange={(v) => setParams((prev) => ({ ...Object.fromEntries(prev), lang: v === "all" ? "" : v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {languages.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={city} onValueChange={(v) => setParams((prev) => ({ ...Object.fromEntries(prev), city: v === "all" ? "" : v }))}>
            <SelectTrigger>
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section aria-labelledby="results">
        <h2 id="results" className="text-xl font-semibold mb-4">Results</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground">No movies match your filters.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default Movies;
