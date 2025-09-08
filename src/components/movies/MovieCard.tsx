import { Movie } from "@/hooks/useMovies";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Clock, Star, Play } from "lucide-react";

export const MovieCard = ({ movie }: { movie: Movie }) => {
  const location = useLocation();
  
  return (
    <Card className="group overflow-hidden card-hover glass-card border-0 bg-card/50">
      <div className="relative overflow-hidden">
        <img 
          src={movie.poster_url || "/placeholder.svg"} 
          alt={`${movie.title} movie poster`} 
          className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        {movie.rating && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="glass-panel border-0 font-semibold">
              {movie.rating}
            </Badge>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="rounded-full bg-primary/90 p-4 backdrop-blur-sm shadow-glow">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </div>
      </div>
      
      <CardContent className="p-5 space-y-3">
        <div className="space-y-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {movie.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{movie.duration_minutes}m</span>
              </div>
            )}
            {movie.genre && (
              <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">
                {movie.genre}
              </Badge>
            )}
          </div>
        </div>
        
        {movie.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        )}
        
        <div className="pt-2">
          <Button asChild className="w-full bg-gradient-brand hover:shadow-glow transition-all duration-300 group">
            <Link to={`/movie/${movie.id}${location.search}`}>
              <span className="group-hover:scale-105 transition-transform">Book Now</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};