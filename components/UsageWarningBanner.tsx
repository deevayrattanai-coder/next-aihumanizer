"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWordUsage } from "@/hooks/useWordUsage";
import { useAuth } from "@/contexts/AuthContext";

const UsageWarningBanner = () => {
  const { user } = useAuth();
  const {
    wordsUsed,
    lifetimeLimit,
    remaining,
    plan,
    loading,
    expired,
    usagePercent,
    expiresAt,
  } = useWordUsage();

  if (!user || loading || plan === "enterprise") return null;

  // Free plan credits never expire, so don't show expiry warnings for free users
  const showExpired = plan !== "free" && expired;
  const showNearLimit = !showExpired && usagePercent >= 85;
  const showExhausted = !showExpired && remaining <= 0;

  if (!showExpired && !showNearLimit && !showExhausted) return null;

  const expiryDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-xl border p-4 mb-4 ${
          showExhausted || showExpired
            ? "bg-destructive/10 border-destructive/30"
            : "bg-[hsl(var(--primary)/0.1)] border-[hsl(var(--primary)/0.3)]"
        }`}
      >
        <div className="flex items-start gap-3">
          {showExpired ? (
            <Clock className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          ) : showExhausted ? (
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          ) : (
            <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {showExpired
                ? "Your credits have expired"
                : showExhausted
                  ? "You've used all your words"
                  : `You've used ${wordsUsed.toLocaleString()} of ${lifetimeLimit.toLocaleString()} words`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {showExpired
                ? `Your plan expired on ${expiryDate}. Unused credits have lapsed. Renew or top up to continue.`
                : showExhausted
                  ? "Upgrade your plan or add a top-up to keep humanizing."
                  : `Only ${remaining.toLocaleString()} words remaining. Top up or upgrade before you run out.`}
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="hero" size="sm" asChild>
                <Link href="/pricing">Upgrade Plan</Link>
              </Button>
              <Button variant="glass" size="sm" asChild>
                <Link href="/pricing#topup">Top Up Words</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UsageWarningBanner;
