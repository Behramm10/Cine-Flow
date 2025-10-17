import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/lib/auth";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"signin" | "signup" | "forgot" | "reset">("signin");

  const from = (location.state as any)?.from || "/";

  useEffect(() => {
    // Check if we have a reset token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setView('reset');
      return;
    }

    // If already logged in, go to intended destination or home
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(from, { replace: true });
    });
  }, [navigate, from]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: "global" }); } catch {}
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast("Signed in successfully");
      navigate(from, { replace: true });
    } catch (err: any) {
      toast(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { name: email.split("@")[0] },
        },
      });
      if (error) throw error;
      toast("Check your email to confirm and sign in.");
    } catch (err: any) {
      toast(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) throw error;
      toast("Password reset email sent! Check your inbox.");
      setView("signin");
    } catch (err: any) {
      toast(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast("Password updated successfully!");
      setView("signin");
      navigate("/auth", { replace: true });
    } catch (err: any) {
      toast(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const redirectTo = `${window.location.origin}/`;
      await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    } catch (err: any) {
      toast(err.message || "Google sign-in failed");
    }
  };

  return (
    <main className="container max-w-md py-10">
      <Helmet>
        <title>Sign in | Movie2Date</title>
        <meta name="description" content="Sign in or create an account to book movie tickets." />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>

      <h1 className="text-2xl font-bold mb-6">
        {view === "forgot" && "Reset Password"}
        {view === "reset" && "Set New Password"}
        {(view === "signin" || view === "signup") && "Sign in or create account"}
      </h1>

      <div className="rounded-lg border p-6 bg-card">
        {view === "forgot" ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input 
                  id="forgot-email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setView("signin")}
              >
                Back to Sign In
              </Button>
            </form>
          </div>
        ) : view === "reset" ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your new password below.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        ) : (
          <Tabs value={view} onValueChange={(v) => setView(v as "signin" | "signup")}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email2">Email</Label>
                  <Input 
                    id="email2" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Password</Label>
                  <Input 
                    id="password2" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  );
};

export default Auth;
