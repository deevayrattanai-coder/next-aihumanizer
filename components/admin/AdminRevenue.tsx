"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  CreditCard,
  Calendar,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";

interface UsageRow {
  user_id: string;
  plan: string;
  words_used: number;
  lifetime_limit: number;
  updated_at: string;
}

interface PaymentRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_type: string;
  plan_key: string | null;
  billing_cycle: string | null;
  words: number;
  created_at: string;
  razorpay_payment_id: string | null;
}

const AdminRevenue = () => {
  const [users, setUsers] = useState<UsageRow[]>([]);
  const [profiles, setProfiles] = useState<
    { user_id: string; full_name: string | null }[]
  >([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [usageRes, profilesRes, paymentsRes] = await Promise.all([
      supabase
        .from("user_word_usage")
        .select("user_id, plan, words_used, lifetime_limit, updated_at"),
      supabase.from("profiles").select("user_id, full_name"),
      supabase
        .from("payment_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);
    setUsers(usageRes.data ?? []);
    setProfiles(profilesRes.data ?? []);
    setPayments(paymentsRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const freeUsers = users.filter((u) => u.plan === "free").length;
    const paidUsers = totalUsers - freeUsers;
    const conversionRate =
      totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

    // Payment stats
    const completedPayments = payments.filter(
      (p) => p.status === "paid" || p.status === "captured",
    );
    const totalRevenue =
      completedPayments.reduce((s, p) => s + p.amount, 0) / 100; // cents to dollars
    const last30Days = completedPayments.filter(
      (p) => new Date(p.created_at) > subDays(new Date(), 30),
    );
    const monthlyRevenue = last30Days.reduce((s, p) => s + p.amount, 0) / 100;
    const arpu = paidUsers > 0 ? totalRevenue / paidUsers : 0;

    // Monthly revenue chart (last 6 months)
    const now = new Date();
    const sixMonthsAgo = subMonths(startOfMonth(now), 5);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });
    const monthlyData = months.map((m) => {
      const monthStart = startOfMonth(m);
      const monthEnd = endOfMonth(m);
      const monthPayments = completedPayments.filter((p) => {
        const d = new Date(p.created_at);
        return d >= monthStart && d <= monthEnd;
      });
      return {
        month: format(m, "MMM"),
        revenue: monthPayments.reduce((s, p) => s + p.amount, 0) / 100,
        count: monthPayments.length,
      };
    });

    // Plan distribution
    const planMap = new Map<string, number>();
    users.forEach((u) => planMap.set(u.plan, (planMap.get(u.plan) || 0) + 1));
    const planDistribution = Array.from(planMap.entries())
      .map(([plan, count]) => ({ plan, count }))
      .sort((a, b) => b.count - a.count);

    // Recent transactions
    const recentTransactions = completedPayments.slice(0, 10).map((p) => {
      const profile = profiles.find((pr) => pr.user_id === p.user_id);
      return { ...p, name: profile?.full_name || null };
    });

    // Payment type breakdown
    const subscriptionRevenue =
      completedPayments
        .filter((p) => p.payment_type === "subscription")
        .reduce((s, p) => s + p.amount, 0) / 100;
    const topupRevenue =
      completedPayments
        .filter((p) => p.payment_type === "topup")
        .reduce((s, p) => s + p.amount, 0) / 100;

    return {
      totalUsers,
      freeUsers,
      paidUsers,
      conversionRate,
      totalRevenue,
      monthlyRevenue,
      arpu,
      planDistribution,
      recentTransactions,
      monthlyData,
      subscriptionRevenue,
      topupRevenue,
    };
  }, [users, profiles, payments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  const planColors: Record<string, string> = {
    free: "bg-muted text-muted-foreground",
    starter: "bg-blue-500/15 text-blue-400",
    basic: "bg-blue-500/15 text-blue-400",
    pro: "bg-primary/15 text-primary",
    ultra: "bg-purple-500/15 text-purple-400",
    enterprise: "bg-purple-500/15 text-purple-400",
    banned: "bg-destructive/15 text-destructive",
  };

  const maxMonthlyRevenue = Math.max(
    ...stats.monthlyData.map((m) => m.revenue),
    1,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Revenue & Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track revenue, payments, and plan distribution
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: DollarSign,
            label: "Total Revenue",
            value: `$${stats.totalRevenue.toFixed(2)}`,
            color: "hsl(160,60%,50%)",
          },
          {
            icon: Calendar,
            label: "This Month",
            value: `$${stats.monthlyRevenue.toFixed(2)}`,
            color: "hsl(32,95%,55%)",
          },
          {
            icon: TrendingUp,
            label: "ARPU",
            value: `$${stats.arpu.toFixed(2)}`,
            color: "hsl(210,80%,60%)",
          },
          {
            icon: Users,
            label: "Conversion Rate",
            value: `${stats.conversionRate}%`,
            color: "hsl(280,60%,60%)",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel p-5"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${s.color}20` }}
            >
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-xl font-display font-bold text-foreground">
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Users",
            value: stats.totalUsers,
            color: "hsl(210,80%,60%)",
          },
          {
            label: "Paid Users",
            value: stats.paidUsers,
            color: "hsl(160,60%,50%)",
          },
          {
            label: "Free Users",
            value: stats.freeUsers,
            color: "hsl(220,10%,55%)",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="glass-panel p-4 text-center"
          >
            <p className="text-2xl font-display font-bold text-foreground">
              {s.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Monthly Revenue (6 Months)
            </h3>
          </div>
          <div className="flex items-end gap-2 h-40">
            {stats.monthlyData.map((m, i) => {
              const height =
                maxMonthlyRevenue > 0
                  ? (m.revenue / maxMonthlyRevenue) * 100
                  : 0;
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[9px] text-muted-foreground font-mono">
                    ${m.revenue.toFixed(0)}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 2)}%` }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary to-secondary min-h-[4px]"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-secondary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Revenue Breakdown
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  Subscriptions
                </span>
                <span className="text-xs font-mono text-foreground">
                  ${stats.subscriptionRevenue.toFixed(2)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${stats.totalRevenue > 0 ? (stats.subscriptionRevenue / stats.totalRevenue) * 100 : 0}%`,
                  }}
                  transition={{ delay: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Top-ups</span>
                <span className="text-xs font-mono text-foreground">
                  ${stats.topupRevenue.toFixed(2)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${stats.totalRevenue > 0 ? (stats.topupRevenue / stats.totalRevenue) * 100 : 0}%`,
                  }}
                  transition={{ delay: 0.55 }}
                  className="h-full rounded-full bg-gradient-to-r from-secondary to-blue-400"
                />
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs font-medium text-foreground mb-3">
                Plan Distribution
              </p>
              <div className="space-y-2">
                {stats.planDistribution.map((p) => {
                  const pct =
                    stats.totalUsers > 0
                      ? Math.round((p.count / stats.totalUsers) * 100)
                      : 0;
                  return (
                    <div key={p.plan} className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize w-20 text-center ${planColors[p.plan] || "bg-accent text-foreground"}`}
                      >
                        {p.plan}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground w-14 text-right">
                        {p.count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">
            Recent Transactions
          </h3>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {
              payments.filter(
                (p) => p.status === "paid" || p.status === "captured",
              ).length
            }{" "}
            total payments
          </span>
        </div>
        <div className="max-h-[400px] overflow-y-auto divide-y divide-border/30">
          {stats.recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            stats.recentTransactions.map((t) => (
              <div
                key={t.id}
                className="px-5 py-3 flex items-center gap-3 hover:bg-accent/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                  {t.name ? t.name[0].toUpperCase() : "$"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">
                    {t.name || t.user_id.slice(0, 12) + "…"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t.payment_type === "subscription"
                      ? `${t.plan_key} plan (${t.billing_cycle})`
                      : `Top-up ${t.words.toLocaleString()} words`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-display font-bold text-foreground">
                    ${(t.amount / 100).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(t.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
                <ArrowUpRight className="w-3 h-3 text-emerald-400 shrink-0" />
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRevenue;
