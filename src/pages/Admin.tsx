import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddMovieForm } from "@/components/admin/AddMovieForm";
import { AddCityForm } from "@/components/admin/AddCityForm";
import { AddCinemaForm } from "@/components/admin/AddCinemaForm";
import { AddSeatForm } from "@/components/admin/AddSeatForm";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/auth", { replace: true });
      else if (!isAdmin) navigate("/", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) return null;

  return (
    <main className="container py-10">
      <Helmet>
        <title>Admin Dashboard | Movie2Date</title>
        <meta name="description" content="Admin dashboard to manage movies and showtimes." />
        <link rel="canonical" href={`${window.location.origin}/admin`} />
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="movies" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="cinemas">Cinemas</TabsTrigger>
          <TabsTrigger value="seats">Seats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="movies" className="mt-6">
          <AddMovieForm />
        </TabsContent>
        
        <TabsContent value="cities" className="mt-6">
          <AddCityForm />
        </TabsContent>
        
        <TabsContent value="cinemas" className="mt-6">
          <AddCinemaForm />
        </TabsContent>
        
        <TabsContent value="seats" className="mt-6">
          <AddSeatForm />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Admin;
