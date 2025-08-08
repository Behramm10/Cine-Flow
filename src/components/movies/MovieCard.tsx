import { Movie } from "@/data/movies";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const MovieCard = ({ movie }: { movie: Movie }) => {
  return (
    <Card className="overflow-hidden hover:shadow-elegant transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-[3/4] w-full overflow-hidden">
          <img
            src={movie.poster}
            alt={`${movie.title} movie poster`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold leading-tight">{movie.title}</h3>
            <span className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground" aria-label="rating">
              ⭐ {movie.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <Badge key={g} variant="secondary">{g}</Badge>
            ))}
          </div>
          <Button asChild className="w-full">
            <Link to={`/movie/${movie.id}`}>Details & Showtimes</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
