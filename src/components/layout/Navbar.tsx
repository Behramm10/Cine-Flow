import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
const routes = [{
  to: "/movies",
  label: "Movies"
}, {
  to: "/history",
  label: "History"
}];
const Navbar = () => {
  const { pathname } = useLocation();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="CineFlow Home">
          <div className="h-7 w-7 rounded-md bg-gradient-brand shadow-elegant" />
          <span className="tracking-tight text-gradient-brand font-bold text-3xl">Movie2Date
        </span>
        </Link>
        <div className="flex items-center gap-6">
          {routes.map(r => <Link key={r.to} to={r.to} className={`text-sm transition-colors hover:text-primary ${pathname.startsWith(r.to) ? "text-primary" : "text-muted-foreground"}`}>
              {r.label}
            </Link>)}
          <Button
            variant="outline"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="h-9 w-9 p-0"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild className="bg-gradient-brand text-primary-foreground shadow-elegant">
            <Link to="/movies">Browse Movies</Link>
          </Button>
        </div>
      </nav>
    </header>;
};
export default Navbar;