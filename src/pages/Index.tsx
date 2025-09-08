import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowRight, Play, Star, Calendar, MapPin } from "lucide-react";
import hero from "@/assets/hero-cinema.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMovies } from "@/hooks/useMovies";
import { MovieCard } from "@/components/movies/MovieCard";

const canonical = () => typeof window !== "undefined" ? window.location.href : "";

const Index = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") || "";
  const { movies, loading } = useMovies();
  
  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/movies?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>CineFlow - Your Premium Movie Booking Experience</title>
        <meta name="description" content="Discover the latest movies, book premium seats, and enjoy seamless digital tickets with QR codes. Your cinematic journey starts here." />
        <link rel="canonical" href={canonical()} />
      </Helmet>

      {/* Hero Section */}
      <section 
        className="relative overflow-hidden"
        onMouseMove={e => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width * 100;
          const y = (e.clientY - rect.top) / rect.height * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        <div className="absolute inset-0">
          <img 
            src={hero} 
            alt="Premium cinema experience with luxury seating" 
            className="h-[70vh] sm:h-[80vh] w-full object-cover scale-105"
          />
          <div className="absolute inset-0 hero-spotlight" />
          <div className="absolute inset-0 bg-gradient-cinema" />
        </div>

        <div className="container relative z-10 section-padding">
          <div className="max-w-4xl animate-fade-in">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight text-white mb-6">
              <span className="text-gradient-brand block mb-2">Premium</span>
              <span className="text-white">Movie Experience</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-200 mb-8 max-w-2xl leading-relaxed">
              Discover blockbusters, reserve perfect seats, and get instant digital tickets. 
              Your cinematic journey begins with just a click.
            </p>

            {/* Enhanced Search */}
            <form onSubmit={onSearch} className="mb-8 animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search movies, genres, or actors..." 
                    value={q} 
                    onChange={e => setParams({ q: e.target.value })}
                    className="pl-12 h-14 text-lg glass-card border-0 text-foreground placeholder:text-muted-foreground"
                    aria-label="Search movies"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-gradient-brand hover:shadow-glow h-14 px-8 font-semibold transition-all duration-300"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 animate-scale-in">
              <Button 
                asChild 
                variant="secondary" 
                size="lg"
                className="glass-card hover:shadow-card border-0 backdrop-blur-sm"
              >
                <Link to="/movies" className="group">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Browse All Movies
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Movies Section */}
      <main className="container section-padding">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 animate-fade-in">
          {[
            { icon: Play, label: "Now Showing", value: movies.length, color: "text-primary" },
            { icon: Star, label: "Premium Experience", value: "4.9★", color: "text-yellow-500" },
            { icon: Calendar, label: "Daily Shows", value: "50+", color: "text-green-500" },
            { icon: MapPin, label: "Cities", value: "25+", color: "text-blue-500" }
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="glass-card hover:shadow-card transition-all duration-300 border-0">
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Now Showing Section */}
        <section aria-labelledby="trending" className="animate-slide-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 id="trending" className="text-3xl font-bold mb-2">Now Showing</h2>
              <p className="text-muted-foreground text-lg">Catch the latest blockbusters in premium theaters</p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link to="/movies">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-muted rounded-t-lg" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-10 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {movies.slice(0, 8).map((movie, index) => (
                <div key={movie.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          )}

          {!loading && movies.length === 0 && (
            <Card className="glass-card text-center p-12">
              <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No movies available</h3>
              <p className="text-muted-foreground">Check back soon for the latest releases!</p>
            </Card>
          )}

          {/* Mobile View All Button */}
          <div className="text-center mt-8 sm:hidden">
            <Button asChild size="lg" className="bg-gradient-brand hover:shadow-glow">
              <Link to="/movies">
                View All Movies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="mt-20 animate-fade-in">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CineFlow?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Premium Seating",
                description: "Choose from luxury recliners, premium sound systems, and the best viewing angles.",
                icon: "🎬"
              },
              {
                title: "Instant Booking",
                description: "Book tickets in seconds with our streamlined checkout and digital QR codes.",
                icon: "⚡"
              },
              {
                title: "Best Prices",
                description: "Competitive pricing with exclusive deals and member discounts available.",
                icon: "💎"
              }
            ].map((feature, index) => (
              <Card key={feature.title} className="glass-card hover:shadow-card transition-all duration-300 border-0 animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;