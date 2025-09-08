import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/lib/auth";

const routes = [
  { to: "/movies", label: "Movies" },
  { to: "/history", label: "My Bookings" },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, isAdmin, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleSignOut = async () => {
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: 'global' }); } catch {}
      window.location.href = '/auth';
    } catch {}
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b backdrop-blur-xl">
      <nav className="container flex h-16 sm:h-18 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="CineFlow Home">
          <div className="relative">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-brand shadow-primary group-hover:shadow-glow transition-all duration-300" />
            <Film className="absolute inset-0 m-auto h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span className="text-gradient-brand font-bold text-xl sm:text-2xl tracking-tight hidden sm:block">
            CineFlow
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {routes.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className={`text-sm font-medium transition-all duration-200 hover:text-primary hover:scale-105 ${
                pathname.startsWith(r.to) 
                  ? "text-primary" 
                  : "text-muted-foreground"
              }`}
            >
              {r.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`text-sm font-medium transition-all duration-200 hover:text-primary hover:scale-105 ${
                pathname.startsWith('/admin') 
                  ? "text-primary" 
                  : "text-muted-foreground"
              }`}
            >
              Admin Panel
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="h-9 w-9 p-0 hover:shadow-card transition-all duration-200"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Actions */}
          {!user ? (
            <Button asChild className="bg-gradient-brand hover:shadow-glow transition-all duration-300 hidden sm:flex">
              <Link to="/auth">Sign In</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:inline-block font-medium">
                {profile?.display_name || user.email?.split('@')[0]}
              </span>
              <Button 
                onClick={handleSignOut} 
                variant="secondary"
                size="sm"
                className="hover:shadow-card transition-all duration-200"
              >
                Sign Out
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 p-0"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t animate-fade-in">
          <div className="container py-4 space-y-4">
            {routes.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm font-medium transition-colors ${
                  pathname.startsWith(r.to) 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {r.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin') 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                Admin Panel
              </Link>
            )}
            {!user && (
              <Button asChild className="bg-gradient-brand w-full" onClick={() => setMobileMenuOpen(false)}>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;