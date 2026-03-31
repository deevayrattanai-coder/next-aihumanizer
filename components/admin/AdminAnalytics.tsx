"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  format,
  subDays,
  subMonths,
  startOfDay,
  differenceInDays,
  parseISO,
} from "date-fns";
import {
  BarChart3,
  Users,
  Type,
  TrendingUp,
  FileText,
  RefreshCw,
  Calendar,
  Zap,
  Download,
  Trophy,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Globe,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker"; // ✅ proper type for calendar range

interface HistoryRow {
  word_count: number;
  is_retry: boolean;
  created_at: string;
  user_id: string;
  user_timezone?: string | null;
}

interface UsageRow {
  user_id: string;
  words_used: number;
  plan: string;
  lifetime_limit: number;
}

interface ProfileRow {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

// ✅ Fix 1: Replace `icon: any` with proper LucideIcon type
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay: number;
  trend?: number;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
  trend,
}: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel p-5 relative overflow-hidden group"
  >
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: `radial-gradient(circle at 50% 100%, ${color}15, transparent 70%)`,
      }}
    />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs font-mono ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xl font-display font-bold text-foreground">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && (
        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>
      )}
    </div>
  </motion.div>
);

const AdminAnalytics = () => {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [users, setUsers] = useState<UsageRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [blogCount, setBlogCount] = useState({ total: 0, published: 0 });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const fetchData = async () => {
    setLoading(true);
    const [historyRes, usersRes, blogsRes, profilesRes] = await Promise.all([
      supabase
        .from("humanization_history")
        .select("word_count, is_retry, created_at, user_id, user_timezone"),
      supabase
        .from("user_word_usage")
        .select("user_id, words_used, plan, lifetime_limit"),
      supabase.from("blog_posts").select("id, status"),
      supabase.from("profiles").select("user_id, full_name, avatar_url"),
    ]);
    setHistory(historyRes.data ?? []);
    setUsers(usersRes.data ?? []);
    setProfiles(profilesRes.data ?? []);
    const blogs = blogsRes.data ?? [];
    setBlogCount({
      total: blogs.length,
      published: blogs.filter((b) => b.status === "published").length,
    });
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  // Realtime subscription for live updates
  useEffect(() => {
    const channel = supabase
      .channel("admin-analytics-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "humanization_history" },
        (payload) => {
          // ✅ Fix 2: Type the realtime payload properly instead of casting
          const newRow = payload.new as HistoryRow;
          setHistory((prev) => [newRow, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const from = startOfDay(dateRange.from).toISOString();
    const to = new Date(dateRange.to.getTime() + 86400000).toISOString();
    return history.filter((h) => h.created_at >= from && h.created_at < to);
  }, [history, dateRange]);

  const stats = useMemo(() => {
    const totalWords = filtered.reduce((s, h) => s + (h.word_count || 0), 0);
    const totalRuns = filtered.length;
    const retries = filtered.filter((h) => h.is_retry).length;
    const uniqueUsers = new Set(filtered.map((h) => h.user_id)).size;
    const avgWords = totalRuns > 0 ? Math.round(totalWords / totalRuns) : 0;
    const retryRate =
      totalRuns > 0 ? Math.round((retries / totalRuns) * 100) : 0;

    const days = differenceInDays(dateRange.to, dateRange.from) || 1;
    const prevFrom = startOfDay(subDays(dateRange.from, days)).toISOString();
    const prevTo = startOfDay(dateRange.from).toISOString();
    const prevFiltered = history.filter(
      (h) => h.created_at >= prevFrom && h.created_at < prevTo,
    );
    const prevWords = prevFiltered.reduce((s, h) => s + (h.word_count || 0), 0);
    const prevRuns = prevFiltered.length;
    const wordsTrend =
      prevWords > 0
        ? Math.round(((totalWords - prevWords) / prevWords) * 100)
        : 0;
    const runsTrend =
      prevRuns > 0 ? Math.round(((totalRuns - prevRuns) / prevRuns) * 100) : 0;

    return {
      totalWords,
      totalRuns,
      retries,
      uniqueUsers,
      avgWords,
      retryRate,
      wordsTrend,
      runsTrend,
    };
  }, [filtered, history, dateRange]);

  // Daily activity chart
  const dailyActivity = useMemo(() => {
    const days = differenceInDays(dateRange.to, dateRange.from) + 1;
    const result: { date: string; count: number; words: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(dateRange.to, i), "yyyy-MM-dd");
      const dayItems = filtered.filter((h) => h.created_at?.slice(0, 10) === d);
      result.push({
        date: d,
        count: dayItems.length,
        words: dayItems.reduce((s, h) => s + (h.word_count || 0), 0),
      });
    }
    if (result.length > 30) {
      const step = Math.ceil(result.length / 30);
      const grouped: typeof result = [];
      for (let i = 0; i < result.length; i += step) {
        const chunk = result.slice(i, i + step);
        grouped.push({
          date: chunk[0].date,
          count: chunk.reduce((s, c) => s + c.count, 0),
          words: chunk.reduce((s, c) => s + c.words, 0),
        });
      }
      return grouped;
    }
    return result;
  }, [filtered, dateRange]);

  // Top users with names
  const topUsers = useMemo(() => {
    const map = new Map<string, { words: number; runs: number }>();
    filtered.forEach((h) => {
      const e = map.get(h.user_id) || { words: 0, runs: 0 };
      e.words += h.word_count || 0;
      e.runs += 1;
      map.set(h.user_id, e);
    });
    return Array.from(map.entries())
      .map(([id, v]) => {
        const p = profiles.find((pr) => pr.user_id === id);
        return { user_id: id, name: p?.full_name || null, ...v };
      })
      .sort((a, b) => b.words - a.words)
      .slice(0, 10);
  }, [filtered, profiles]);

  // Plan breakdown
  const planBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; words: number }>();
    users.forEach((u) => {
      const e = map.get(u.plan) || { count: 0, words: 0 };
      e.count += 1;
      e.words += u.words_used || 0;
      map.set(u.plan, e);
    });
    return Array.from(map.entries())
      .map(([plan, v]) => ({ plan, ...v }))
      .sort((a, b) => b.count - a.count);
  }, [users]);

  // Peak hours
  const peakHours = useMemo(() => {
    const hours = new Array(24).fill(0) as number[]; // ✅ Fix 3: typed array
    filtered.forEach((h) => {
      const hour = new Date(h.created_at).getHours();
      hours[hour]++;
    });
    return hours;
  }, [filtered]);

  // DAU/WAU/MAU
  const activeUsers = useMemo(() => {
    const now = new Date();
    const day1 = startOfDay(now).toISOString();
    const week1 = subDays(now, 7).toISOString();
    const month1 = subMonths(now, 1).toISOString();
    const dau = new Set(
      history.filter((h) => h.created_at >= day1).map((h) => h.user_id),
    ).size;
    const wau = new Set(
      history.filter((h) => h.created_at >= week1).map((h) => h.user_id),
    ).size;
    const mau = new Set(
      history.filter((h) => h.created_at >= month1).map((h) => h.user_id),
    ).size;
    return { dau, wau, mau };
  }, [history]);

  const retention = useMemo(() => {
    const userRuns = new Map<string, number>();
    history.forEach((h) =>
      userRuns.set(h.user_id, (userRuns.get(h.user_id) || 0) + 1),
    );
    const total = userRuns.size;
    const returning = Array.from(userRuns.values()).filter((c) => c > 1).length;
    return total > 0 ? Math.round((returning / total) * 100) : 0;
  }, [history]);

  const funnel = useMemo(() => {
    const totalRegistered = users.length;
    const usedOnce = new Set(history.map((h) => h.user_id)).size;
    const usedMultiple = (() => {
      const m = new Map<string, number>();
      history.forEach((h) => m.set(h.user_id, (m.get(h.user_id) || 0) + 1));
      return Array.from(m.values()).filter((c) => c >= 3).length;
    })();
    const paid = users.filter((u) => u.plan !== "free").length;
    return [
      { label: "Registered", value: totalRegistered },
      { label: "Used Once", value: usedOnce },
      { label: "Used 3+ Times", value: usedMultiple },
      { label: "Paid Users", value: paid },
    ];
  }, [users, history]);

  const exportCSV = () => {
    const rows = [["Date", "User ID", "Words", "Is Retry"]];
    filtered.forEach((h) =>
      rows.push([
        h.created_at.slice(0, 10),
        h.user_id,
        String(h.word_count),
        String(h.is_retry),
      ]),
    );
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${format(dateRange.from, "yyyy-MM-dd")}-to-${format(dateRange.to, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxWords = Math.max(...dailyActivity.map((d) => d.words), 1);
  const maxHour = Math.max(...peakHours, 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Platform Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of humanization usage and platform health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {format(dateRange.from, "MMM d")} –{" "}
                {format(dateRange.to, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex gap-2 p-3 border-b border-border">
                {[7, 14, 30, 90].map((d) => (
                  <Button
                    key={d}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() =>
                      setDateRange({
                        from: subDays(new Date(), d),
                        to: new Date(),
                      })
                    }
                  >
                    {d}d
                  </Button>
                ))}
              </div>
              {/* ✅ Fix 4: Replace `any` with proper DateRange type from react-day-picker */}
              <CalendarUI
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range: DateRange | undefined) => {
                  if (range?.from) {
                    setDateRange({
                      from: range.from,
                      to: range.to ?? range.from,
                    });
                  }
                }}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="gap-2 text-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={Type}
          label="Words Humanized"
          value={stats.totalWords}
          color="hsl(32,95%,55%)"
          delay={0}
          trend={stats.wordsTrend}
        />
        <StatCard
          icon={Zap}
          label="Total Runs"
          value={stats.totalRuns}
          sub={`${stats.retries} retries`}
          color="hsl(210,80%,60%)"
          delay={0.03}
          trend={stats.runsTrend}
        />
        <StatCard
          icon={Users}
          label="Active Users"
          value={stats.uniqueUsers}
          color="hsl(160,60%,50%)"
          delay={0.06}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Words/Run"
          value={stats.avgWords}
          color="hsl(45,90%,55%)"
          delay={0.09}
        />
        <StatCard
          icon={RefreshCw}
          label="Retry Rate"
          value={`${stats.retryRate}%`}
          color="hsl(0,70%,60%)"
          delay={0.12}
        />
        <StatCard
          icon={FileText}
          label="Blog Posts"
          value={blogCount.total}
          sub={`${blogCount.published} published`}
          color="hsl(280,60%,60%)"
          delay={0.15}
        />
      </div>

      {/* DAU/WAU/MAU + Retention + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Active Users
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "DAU",
                value: activeUsers.dau,
                color: "text-emerald-400",
              },
              { label: "WAU", value: activeUsers.wau, color: "text-blue-400" },
              {
                label: "MAU",
                value: activeUsers.mau,
                color: "text-purple-400",
              },
            ].map((m) => (
              <div
                key={m.label}
                className="text-center p-3 rounded-xl bg-[hsl(var(--glass))]"
              >
                <p className={`text-lg font-display font-bold ${m.color}`}>
                  {m.value}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-[hsl(var(--glass))] text-center">
            <p className="text-lg font-display font-bold text-primary">
              {retention}%
            </p>
            <p className="text-[10px] text-muted-foreground">
              User Retention (return rate)
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-secondary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Conversion Funnel
            </h3>
          </div>
          <div className="space-y-3">
            {funnel.map((step, i) => {
              const maxVal = funnel[0].value || 1;
              const pct = Math.round((step.value / maxVal) * 100);
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {step.label}
                    </span>
                    <span className="text-xs font-mono text-foreground">
                      {step.value} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Usage by Plan
            </h3>
          </div>
          <div className="space-y-3">
            {planBreakdown.map((p, i) => (
              <div key={p.plan} className="flex items-center gap-3">
                <span className="text-xs font-medium text-foreground capitalize w-16">
                  {p.plan}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${users.length > 0 ? (p.count / users.length) * 100 : 0}%`,
                    }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-primary"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono w-20 text-right">
                  {p.count} users · {p.words.toLocaleString()}w
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-panel p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">
            Activity Over Time
          </h3>
        </div>
        <div className="flex items-end gap-[2px] h-36 overflow-hidden">
          {dailyActivity.map((day, i) => {
            const height = maxWords > 0 ? (day.words / maxWords) * 100 : 0;
            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1 min-w-0 group relative"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 2)}%` }}
                  transition={{ delay: 0.4 + i * 0.01 }}
                  className="w-full rounded-t bg-gradient-to-t from-primary/60 to-primary min-h-[2px] cursor-pointer hover:from-primary/80 hover:to-primary transition-colors"
                />
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover border border-border rounded-lg px-2 py-1 text-[10px] z-10 whitespace-nowrap shadow-lg">
                  <p className="font-medium text-foreground">
                    {format(parseISO(day.date), "MMM d")}
                  </p>
                  <p className="text-muted-foreground">
                    {day.words.toLocaleString()} words · {day.count} runs
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">
            {format(dateRange.from, "MMM d")}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {format(dateRange.to, "MMM d")}
          </span>
        </div>
      </motion.div>

      {/* Peak Hours + Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Peak Usage Hours (UTC)
            </h3>
          </div>
          <div className="flex items-end gap-[2px] h-28">
            {peakHours.map((count, hour) => {
              const height = maxHour > 0 ? (count / maxHour) * 100 : 0;
              return (
                <div
                  key={hour}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 2)}%` }}
                    transition={{ delay: 0.45 + hour * 0.01 }}
                    className={`w-full rounded-t min-h-[2px] ${height > 70 ? "bg-primary" : height > 40 ? "bg-primary/70" : "bg-primary/40"}`}
                  />
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-popover border border-border rounded px-1.5 py-0.5 text-[9px] z-10 shadow-lg">
                    {hour}:00 — {count} runs
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground">0h</span>
            <span className="text-[9px] text-muted-foreground">6h</span>
            <span className="text-[9px] text-muted-foreground">12h</span>
            <span className="text-[9px] text-muted-foreground">18h</span>
            <span className="text-[9px] text-muted-foreground">23h</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Top Users
            </h3>
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {topUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No activity in selected period
              </p>
            ) : (
              topUsers.map((u, i) => {
                const barWidth =
                  topUsers[0].words > 0
                    ? (u.words / topUsers[0].words) * 100
                    : 0;
                return (
                  <div key={u.user_id} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-5 text-right font-mono">
                      #{i + 1}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[9px] font-bold text-primary-foreground shrink-0">
                      {u.name ? u.name[0].toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-foreground truncate">
                          {u.name || u.user_id.slice(0, 8) + "…"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono ml-2">
                          {u.words.toLocaleString()}w · {u.runs}r
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ delay: 0.5 + i * 0.03 }}
                          className="h-full rounded-full bg-gradient-to-r from-secondary to-primary"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Geographic Analytics */}
      {(() => {
        // ✅ Fix 5: Typed Map for tzMap
        const tzMap = new Map<string, number>();
        filtered.forEach((h) => {
          if (h.user_timezone) {
            const region = h.user_timezone.split("/")[0] ?? "Unknown";
            tzMap.set(region, (tzMap.get(region) || 0) + 1);
          }
        });
        // ✅ Fix 6: Explicitly typed entries array
        const regions: [string, number][] = Array.from(tzMap.entries()).sort(
          (a, b) => b[1] - a[1],
        );
        const maxRegion = regions[0]?.[1] ?? 1;
        if (regions.length === 0) return null;
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground text-sm">
                Geographic Distribution (by timezone)
              </h3>
            </div>
            <div className="space-y-2">
              {regions.slice(0, 10).map(([region, count]) => (
                <div key={region} className="flex items-center gap-3">
                  <span className="text-xs text-foreground w-24 truncate">
                    {region}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxRegion) * 100}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-secondary to-primary"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono w-10 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
};

export default AdminAnalytics;
