"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Fix: wrap synchronous setState in setTimeout
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setTimeout(() => setIsRecovery(true), 0);
    }

    //  This is fine - setState inside a callback is allowed
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({
        title: "Too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setDone(true);
      toast({
        title: "Password updated!",
        description: "You can now log in with your new password.",
      });
      setTimeout(() => router.push("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-secondary/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/8 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">
                D
              </span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              DevAIHumanizer
            </span>
          </Link>
          <h1 className="text-2xl font-display font-bold mb-2">
            Reset your password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {done ? (
          <div className="glass-panel p-8 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-primary mx-auto" />
            <p className="text-foreground font-medium">
              Password updated successfully!
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login…
            </p>
          </div>
        ) : !isRecovery ? (
          <div className="glass-panel p-8 text-center space-y-4">
            <p className="text-muted-foreground text-sm">
              This page is for resetting your password via the link sent to your
              email. If you have not requested a reset, go to the login page.
            </p>
            <Button variant="hero" asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-accent/50 border-border/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              variant="hero"
              size="lg"
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating…
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
