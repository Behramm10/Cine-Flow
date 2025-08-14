import { Movie } from "@/hooks/useMovies";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export const MovieCard = ({ movie }: { movie: Movie }) => {
  const location = useLocation();
  return (
    <Card className="overflow-hidden hover:shadow-elegant transition-shadow">
      <div className="relative">
        <img 
          src={movie.poster_url || "/placeholder.svg"} 
          alt={`${movie.title} poster`} 
          className="aspect-[2/3] w-full object-cover"
        />
        {movie.rating && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {movie.rating}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg leading-tight mb-2">{movie.title}</h3>
        
        {movie.genre && (
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="outline" className="text-xs">
              {movie.genre}
            </Badge>
          </div>
        )}
        
        {movie.duration_minutes && (
          <div className="text-sm text-muted-foreground mb-3">
            <p>{movie.duration_minutes} mins</p>
          </div>
        )}
        
        {movie.description && (
          <p className="text-sm mb-4 line-clamp-3">{movie.description}</p>
        )}
        
        <Link 
          to={`/movie/${movie.id}${location.search}`}
          className="block mt-4"
        >
          <Button className="w-full bg-gradient-brand text-primary-foreground shadow-elegant">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};