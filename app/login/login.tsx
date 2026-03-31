"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const isSignup = searchParams.get("mode") === "signup";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const validateFullName = (value: string) => {
    const regex = /^(?! )[A-Za-z ]{3,30}$/;

    if (!value) return "Full name is required";
    if (!regex.test(value))
      return "Name must be 3–30 characters, letters and spaces only, and cannot start with a space";

    return "";
  };

  const validateEmail = (value: string) => {
    const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,3}$/;

    if (!value) return "Email is required";
    if (!regex.test(value)) return "Enter a valid email address";

    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 8 || value.length > 20) {
      return "Password must be between 8 and 20 characters.";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must include at least one uppercase letter.";
    }
    if (!/[a-z]/.test(value)) {
      return "Password must include at least one lowercase letter.";
    }
    if (!/\d/.test(value)) {
      return "Password must include at least one number.";
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Password must include at least one special character.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    const nameError = isSignup ? validateFullName(fullName) : "";
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (nameError || emailError || passwordError) {
      setErrors({
        fullName: nameError,
        email: emailError,
        password: passwordError,
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/verify`,
          },
        });

        if (error) throw error;

        toast({
          title: "Check your email",
          description:
            "We've sent you a confirmation link to verify your account.",
        });
        router.push("/check-email");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // 🔒 Check if email is verified
        if (!data.user?.email_confirmed_at) {
          await supabase.auth.signOut();

          throw new Error("Email not verified");
        }
      }
    } catch (error) {
      toast({
        title: isSignup ? "Signup failed" : "Login failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const result = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/verify`,
        },
      });

      if (result.error) {
        toast({
          title: "Google login failed",
          description: result.error.message || "Could not sign in with Google.",
          variant: "destructive",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Google login failed",
        description: error.message || "Could not sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return null;

  console.log("Rendering Login page, user:", user);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
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
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>

          <p className="text-sm text-muted-foreground">
            {isSignup
              ? "Start humanizing AI content for free"
              : "Log in to continue humanizing"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-5">
          {isSignup && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Full Name
              </label>

              <Input
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => {
                  const value = e.target.value;
                  setFullName(value);

                  const error = validateFullName(value);
                  setErrors((prev) => ({ ...prev, fullName: error }));
                }}
                className={`bg-accent/50 ${
                  errors.fullName ? "border-red-500" : ""
                }`}
              />

              {errors.fullName && (
                <p className="text-red-500 text-xs mt-2">{errors.fullName}</p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>

            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);

                const error = validateEmail(value);
                setErrors((prev) => ({ ...prev, email: error }));
              }}
              className={`bg-accent/50 ${errors.email ? "border-red-500" : ""}`}
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-2">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Password</label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);

                  const error = validatePassword(value);
                  setErrors((prev) => ({ ...prev, password: error }));
                }}
                className={`bg-accent/50 pr-10 ${
                  errors.password ? "border-red-500" : ""
                }`}
              />

              {errors.password && (
                <div className="mt-2 text-xs text-red-500 space-y-1">
                  <p>{errors.password}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Use 8–20 characters with uppercase, lowercase, number, and
                special character.
              </p>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-5 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {!isSignup && (
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      toast({
                        title: "Enter your email first",
                        description: "We need your email to send a reset link.",
                        variant: "destructive",
                      });
                      return;
                    }
                    const { error } = await supabase.auth.resetPasswordForEmail(
                      email,
                      {
                        redirectTo: `${window.location.origin}/reset-password`,
                      },
                    );
                    if (error) {
                      toast({
                        title: "Error",
                        description: error.message,
                        variant: "destructive",
                      });
                    } else {
                      toast({
                        title: "Verify your email",
                        description:
                          "We’ve sent you a verification link. Please check your inbox before logging in.",
                      });
                    }
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          <Button
            variant="hero"
            size="lg"
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Please wait...
              </>
            ) : isSignup ? (
              "Create Account"
            ) : (
              "Log In"
            )}
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>

            <span className="relative bg-[hsl(var(--glass))] px-4 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

          <Button
            variant="glass"
            type="button"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            Google
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() =>
              router.push(`/login?mode=${isSignup ? "login" : "signup"}`)
            }
            className="text-primary font-medium hover:underline"
          >
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
