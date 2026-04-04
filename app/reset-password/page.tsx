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
  const [error, setError] = useState("");
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

    const errorMsg = validatePassword(password);
    if (errorMsg) {
      setError(errorMsg);
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

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 8 || value.length > 20) {
      return "Password must be between 8 and 20 characters.";
    }
    if (!/[A-Z]/.test(value)) {
      return "At least one uppercase letter required.";
    }
    if (!/[a-z]/.test(value)) {
      return "At least one lowercase letter required.";
    }
    if (!/\d/.test(value)) {
      return "At least one number required.";
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      return "At least one special character required.";
    }
    return "";
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    setError(validatePassword(value));
                  }}
                  className="bg-accent/50 border-border/50 pr-10"
                />
                <div className="text-xs text-muted-foreground space-y-1 mt-2">
                  <p className={password.length >= 8 ? "text-green-500" : ""}>
                    • 8–20 characters
                  </p>
                  <p className={/[A-Z]/.test(password) ? "text-green-500" : ""}>
                    • One uppercase letter
                  </p>
                  <p className={/[a-z]/.test(password) ? "text-green-500" : ""}>
                    • One lowercase letter
                  </p>
                  <p className={/\d/.test(password) ? "text-green-500" : ""}>
                    • One number
                  </p>
                  <p
                    className={
                      /[^A-Za-z0-9]/.test(password) ? "text-green-500" : ""
                    }
                  >
                    • One special character
                  </p>
                </div>

                {error && (
                  <p className="text-xs text-destructive my-1">{error}</p>
                )}
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
              disabled={loading || !!error || !password}
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
