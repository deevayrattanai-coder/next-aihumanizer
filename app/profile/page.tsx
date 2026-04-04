"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useWordUsage } from "@/hooks/useWordUsage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  CreditCard,
  Clock,
  Shield,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const {
    wordsUsed,
    lifetimeLimit,
    remaining,
    plan,
    expired,
    expiresAt,
    loading: usageLoading,
  } = useWordUsage();

  // Change password
  const [showPwSection, setShowPwSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  // Humanization count
  const [totalHumanizations, setTotalHumanizations] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      const { count, error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("humanization_history" as any)
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (!error) setTotalHumanizations(count ?? 0);
    };
    fetchCount();
  }, [user]);

  const handleChangePassword = async () => {
    const errorMsg = validatePassword(newPassword);
    if (errorMsg) {
      setPwError(errorMsg);
      return;
    }

    setPwError("");
    setPwLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPwError(error.message);
    } else {
      toast({
        title: "Password updated",
        description: "Your password has been changed.",
      });
      setNewPassword("");
      setShowPwSection(false);
    }

    setPwLoading(false);
  };

  if (authLoading) return null;

  const planLabel =
    plan === "free"
      ? "Free Plan"
      : plan.charAt(0).toUpperCase() + plan.slice(1) + " Plan";
  const planLimits: Record<string, string> = {
    free: `${lifetimeLimit.toLocaleString()} words lifetime`,
    basic: "Expanded word limit",
    pro: "Pro word limit",
    ultra: "Ultra word limit",
    enterprise: "Unlimited",
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="container-tight px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Account */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-bold text-lg">Account</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-destructive gap-2"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Name</span>
                  <p className="text-sm font-medium">
                    {user?.user_metadata?.full_name || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Email</span>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
                <div className="pt-2">
                  {!showPwSection ? (
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => setShowPwSection(true)}
                    >
                      Change Password
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative max-w-xs">
                        <Input
                          type={showPw ? "text" : "password"}
                          placeholder="New password"
                          value={newPassword}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewPassword(value);
                            setPwError(validatePassword(value));
                          }}
                          className="bg-accent/50 border-border/50 pr-10"
                        />

                        <div className="text-xs text-muted-foreground space-y-1 mt-2">
                          <p
                            className={
                              newPassword.length >= 8 ? "text-green-500" : ""
                            }
                          >
                            • 8–20 characters
                          </p>
                          <p
                            className={
                              /[A-Z]/.test(newPassword) ? "text-green-500" : ""
                            }
                          >
                            • One uppercase letter
                          </p>
                          <p
                            className={
                              /[a-z]/.test(newPassword) ? "text-green-500" : ""
                            }
                          >
                            • One lowercase letter
                          </p>
                          <p
                            className={
                              /\d/.test(newPassword) ? "text-green-500" : ""
                            }
                          >
                            • One number
                          </p>
                          <p
                            className={
                              /[^A-Za-z0-9]/.test(newPassword)
                                ? "text-green-500"
                                : ""
                            }
                          >
                            • One special character
                          </p>
                        </div>

                        {pwError && (
                          <p className="text-xs text-destructive my-1">
                            {pwError}
                          </p>
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
                      <div className="flex gap-2">
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={handleChangePassword}
                          disabled={pwLoading}
                        >
                          {pwLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowPwSection(false);
                            setNewPassword("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Balance + History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-bold text-lg">Balance</h2>
                </div>
                {usageLoading ? (
                  <div className="text-muted-foreground text-sm">
                    Loading...
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-display font-bold mb-1">
                      {remaining.toLocaleString()}{" "}
                      <span className="text-base font-normal text-muted-foreground">
                        words
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mb-1">
                      {wordsUsed.toLocaleString()} used of{" "}
                      {lifetimeLimit.toLocaleString()}
                    </p>
                    {expiresAt && (
                      <p
                        className={`text-xs mb-3 ${expired ? "text-destructive font-medium" : "text-muted-foreground"}`}
                      >
                        {expired
                          ? `Expired on ${new Date(expiresAt).toLocaleDateString()}`
                          : `Expires ${new Date(expiresAt).toLocaleDateString()}`}
                      </p>
                    )}
                    {!expiresAt && <div className="mb-3" />}
                    <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all"
                        style={{
                          width: `${Math.min(100, (wordsUsed / lifetimeLimit) * 100)}%`,
                        }}
                      />
                    </div>
                    <Button variant="hero" size="sm" asChild>
                      <Link href="/pricing">Get More Words</Link>
                    </Button>
                  </>
                )}
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-bold text-lg">Activity</h2>
                </div>
                <p className="text-3xl font-display font-bold mb-1">
                  {totalHumanizations !== null ? totalHumanizations : "—"}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Total humanizations
                </p>
                <Button variant="glass" size="sm" asChild>
                  <Link href="/history">View Full History</Link>
                </Button>
              </div>
            </div>

            {/* Subscription */}
            <div className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg">Subscription</h2>
              </div>
              <p className="text-2xl font-display font-bold mb-1">
                {planLabel}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {planLimits[plan] || planLimits.free}
              </p>
              <div className="flex gap-3">
                <Button variant="hero" size="sm" asChild>
                  <Link href="/pricing">Upgrade Plan</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
