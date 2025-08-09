import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import hero from "@/assets/hero-cinema.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { movies } from "@/data/movies";
import { MovieCard } from "@/components/movies/MovieCard";
const canonical = () => typeof window !== "undefined" ? window.location.href : "";
const Index = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") || "";
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/movies?q=${encodeURIComponent(q)}`);
  };
  return <div>
      <Helmet>
        <title>Book Movie Tickets Online | CineFlow</title>
        <meta name="description" content="Browse movies, select seats, and get digital tickets with QR codes. Fast, simple movie booking on CineFlow." />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      <section className="relative" onMouseMove={e => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * 100;
      const y = (e.clientY - rect.top) / rect.height * 100;
      (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
      (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
    }}>
        <div className="absolute inset-0">
          <img src={hero} alt="Cinematic theater with glowing screen" className="h-[56svh] w-full object-cover" />
          <div className="absolute inset-0 hero-spotlight" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/10" />
        </div>

        <div className="container relative z-10 md:py-24 py-[50px]">
          <h1 className="text-4xl font-extrabold max-w-3xl leading-tight text-amber-50 md:text-7xl">
            <span className="text-gradient-brand font-extrabold text-amber-50">Book Movie Tickets</span> in seconds
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-50 text-base font-semibold">
            Discover new releases, pick the perfect seats, and get instant digital tickets with QR codes.
          </p>

          <form onSubmit={onSearch} className="mt-8 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 max-w-xl">
            <Input placeholder="Search by title, genre, language..." value={q} onChange={e => setParams({
            q: e.target.value
          })} aria-label="Search movies" />
            <Button type="submit" className="bg-gradient-brand text-primary-foreground shadow-elegant">Search</Button>
          </form>

          <div className="mt-6 my-0 py-0">
            <Button asChild variant="secondary">
              <Link to="/movies" className="py-0">Browse All Movies</Link>
            </Button>
          </div>
        </div>
      </section>

      <main className="container py-[10px]">
        <section aria-labelledby="trending">
          <header className="mb-6">
            <h2 id="trending" className="text-2xl font-semibold">Now Showing</h2>
            <p className="text-muted-foreground">Catch the latest hits in theaters</p>
          </header>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {movies.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </section>
      </main>
    </div>;
};
export default Index;