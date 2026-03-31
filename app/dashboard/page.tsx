"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, FileText, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWordUsage } from "@/hooks/useWordUsage";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  //   const navigate = useNavigate();
  const router = useRouter();
  const {
    wordsUsed,
    lifetimeLimit,
    remaining,
    plan,
    loading: usageLoading,
  } = useWordUsage();
  const [docCount, setDocCount] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("humanization_history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setDocCount(count ?? 0));
  }, [user]);

  if (authLoading) return null;

  const usagePercent =
    lifetimeLimit > 0 ? Math.min(100, (wordsUsed / lifetimeLimit) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="container-tight px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-display font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account and usage
                </p>
              </div>
              <Button
                variant="hero"
                size="sm"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/#humanizer">Humanize Text</Link>
              </Button>
            </div>

            {/* Usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    Words Used
                  </span>
                  <span className="text-sm font-mono text-foreground">
                    {usageLoading
                      ? "…"
                      : `${wordsUsed.toLocaleString()} / ${lifetimeLimit.toLocaleString()}`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all"
                    style={{ width: `${usageLoading ? 0 : usagePercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {usageLoading
                    ? ""
                    : `${remaining.toLocaleString()} words remaining · ${plan} plan`}
                </p>
              </div>

              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    Documents Humanized
                  </span>
                  <span className="text-sm font-mono text-foreground">
                    {docCount !== null ? docCount.toLocaleString() : "…"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: User,
                  label: "Profile Settings",
                  desc: "Edit your account details",
                  to: "/profile",
                },
                {
                  icon: CreditCard,
                  label: "Subscription",
                  desc: "Manage your plan",
                  to: "/pricing",
                },
                {
                  icon: FileText,
                  label: "History",
                  desc: "View past humanizations",
                  to: "/history",
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.to}
                  className="glass-panel-hover p-6 group block"
                >
                  <item.icon className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-display font-semibold text-sm mb-1">
                    {item.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
