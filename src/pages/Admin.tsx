import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
      <section className="space-y-4">
        <p className="text-muted-foreground">Welcome, admin. This area is reserved for administrative controls.</p>
        {/* ... keep existing code (admin tools to be added) */}
      </section>
    </main>
  );
};

export default Admin;
