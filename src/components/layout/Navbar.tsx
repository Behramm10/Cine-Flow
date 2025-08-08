import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const routes = [
  { to: "/movies", label: "Movies" },
  { to: "/history", label: "History" },
];

const Navbar = () => {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="CineFlow Home">
          <div className="h-7 w-7 rounded-md bg-gradient-brand shadow-elegant" />
          <span className="font-semibold text-lg tracking-tight text-gradient-brand">CineFlow</span>
        </Link>
        <div className="flex items-center gap-6">
          {routes.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className={`text-sm transition-colors hover:text-primary ${pathname.startsWith(r.to) ? "text-primary" : "text-muted-foreground"}`}
            >
              {r.label}
            </Link>
          ))}
          <Button asChild className="bg-gradient-brand text-primary-foreground shadow-elegant">
            <Link to="/movies">Browse Movies</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
