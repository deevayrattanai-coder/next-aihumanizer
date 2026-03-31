"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Activity,
  Server,
  Clock,
  AlertTriangle,
  RefreshCw,
  Wifi,
  Database,
  Zap,
  Users,
  FileText,
  BarChart3,
  HardDrive,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HealthCheck {
  name: string;
  latency: number;
  status: "healthy" | "degraded" | "down";
  checkedAt: Date;
}

const AdminSystemHealth = () => {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<
    {
      time: string;
      dbLatency: number;
      authLatency: number;
      edgeLatency: number;
    }[]
  >([]);
  const [dbStats, setDbStats] = useState<{
    totalUsers: number;
    totalHistory: number;
    totalPayments: number;
    totalFeedback: number;
    totalFailedLogs: number;
    totalBlogPosts: number;
    totalTestimonials: number;
    totalAnnouncements: number;
  }>({
    totalUsers: 0,
    totalHistory: 0,
    totalPayments: 0,
    totalFeedback: 0,
    totalFailedLogs: 0,
    totalBlogPosts: 0,
    totalTestimonials: 0,
    totalAnnouncements: 0,
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runHealthChecks = async () => {
    setLoading(true);
    const results: HealthCheck[] = [];

    // 1. Database latency
    try {
      const dbStart = performance.now();
      await supabase.from("profiles").select("id").limit(1);
      const dbLatency = Math.round(performance.now() - dbStart);
      results.push({
        name: "Database",
        latency: dbLatency,
        status:
          dbLatency < 500 ? "healthy" : dbLatency < 2000 ? "degraded" : "down",
        checkedAt: new Date(),
      });
    } catch {
      results.push({
        name: "Database",
        latency: -1,
        status: "down",
        checkedAt: new Date(),
      });
    }

    // 2. Auth latency
    try {
      const authStart = performance.now();
      await supabase.auth.getSession();
      const authLatency = Math.round(performance.now() - authStart);
      results.push({
        name: "Authentication",
        latency: authLatency,
        status:
          authLatency < 500
            ? "healthy"
            : authLatency < 2000
              ? "degraded"
              : "down",
        checkedAt: new Date(),
      });
    } catch {
      results.push({
        name: "Authentication",
        latency: -1,
        status: "down",
        checkedAt: new Date(),
      });
    }

    // 3. Edge function latency
    try {
      const edgeStart = performance.now();
      await supabase.functions.invoke("humanize-relay", {
        body: { text: "test", mode: "health" },
      });
      const edgeLatency = Math.round(performance.now() - edgeStart);
      results.push({
        name: "Edge Functions",
        latency: edgeLatency,
        status:
          edgeLatency < 2000
            ? "healthy"
            : edgeLatency < 5000
              ? "degraded"
              : "down",
        checkedAt: new Date(),
      });
    } catch {
      results.push({
        name: "Edge Functions",
        latency: -1,
        status: "down",
        checkedAt: new Date(),
      });
    }

    // 4. CDN check
    try {
      const cdnStart = performance.now();
      await fetch("/favicon.ico", { cache: "no-store" });
      const cdnLatency = Math.round(performance.now() - cdnStart);
      results.push({
        name: "CDN / Static Assets",
        latency: cdnLatency,
        status:
          cdnLatency < 300
            ? "healthy"
            : cdnLatency < 1000
              ? "degraded"
              : "down",
        checkedAt: new Date(),
      });
    } catch {
      results.push({
        name: "CDN / Static Assets",
        latency: -1,
        status: "down",
        checkedAt: new Date(),
      });
    }

    // 5. Storage check
    try {
      const storageStart = performance.now();
      await supabase.storage.from("blog-images").list("", { limit: 1 });
      const storageLatency = Math.round(performance.now() - storageStart);
      results.push({
        name: "File Storage",
        latency: storageLatency,
        status:
          storageLatency < 500
            ? "healthy"
            : storageLatency < 2000
              ? "degraded"
              : "down",
        checkedAt: new Date(),
      });
    } catch {
      results.push({
        name: "File Storage",
        latency: -1,
        status: "down",
        checkedAt: new Date(),
      });
    }

    // Fetch DB stats
    const [
      usersRes,
      historyRes,
      paymentsRes,
      feedbackRes,
      failedRes,
      blogRes,
      testimonialRes,
      announcementRes,
    ] = await Promise.all([
      supabase
        .from("user_word_usage")
        .select("user_id", { count: "exact", head: true }),
      supabase
        .from("humanization_history")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("payment_orders")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("user_feedback")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("failed_humanizations")
        .select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase
        .from("testimonials")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("announcements")
        .select("id", { count: "exact", head: true }),
    ]);

    setDbStats({
      totalUsers: usersRes.count ?? 0,
      totalHistory: historyRes.count ?? 0,
      totalPayments: paymentsRes.count ?? 0,
      totalFeedback: feedbackRes.count ?? 0,
      totalFailedLogs: failedRes.count ?? 0,
      totalBlogPosts: blogRes.count ?? 0,
      totalTestimonials: testimonialRes.count ?? 0,
      totalAnnouncements: announcementRes.count ?? 0,
    });

    setChecks(results);
    setLastChecked(new Date());
    setHistory((prev) => [
      ...prev.slice(-29),
      {
        time: new Date().toLocaleTimeString(),
        dbLatency: results.find((r) => r.name === "Database")?.latency ?? -1,
        authLatency:
          results.find((r) => r.name === "Authentication")?.latency ?? -1,
        edgeLatency:
          results.find((r) => r.name === "Edge Functions")?.latency ?? -1,
      },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runHealthChecks();
  }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(runHealthChecks, 30000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh]);

  const overallStatus = checks.every((c) => c.status === "healthy")
    ? "healthy"
    : checks.some((c) => c.status === "down")
      ? "down"
      : "degraded";
  const avgLatency =
    checks.length > 0
      ? Math.round(
          checks
            .filter((c) => c.latency > 0)
            .reduce((s, c) => s + c.latency, 0) /
            checks.filter((c) => c.latency > 0).length,
        )
      : 0;

  const statusColor = (s: string) =>
    s === "healthy"
      ? "text-emerald-400"
      : s === "degraded"
        ? "text-amber-400"
        : "text-destructive";
  const statusBg = (s: string) =>
    s === "healthy"
      ? "bg-emerald-500/15"
      : s === "degraded"
        ? "bg-amber-500/15"
        : "bg-destructive/15";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons: Record<string, any> = {
    Database,
    Authentication: Server,
    "Edge Functions": Zap,
    "CDN / Static Assets": Wifi,
    "File Storage": HardDrive,
  };

  const maxHistoryLatency = Math.max(
    ...history.flatMap((h) =>
      [h.dbLatency, h.authLatency, h.edgeLatency].filter((v) => v > 0),
    ),
    1,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            System Health
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor service latency, availability, and database stats
            {lastChecked && (
              <span className="ml-2 text-[10px]">
                · Last checked {lastChecked.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${autoRefresh ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}
          >
            <Timer className="w-3 h-3" />
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </button>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${statusBg(overallStatus)} ${statusColor(overallStatus)}`}
          >
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${overallStatus === "healthy" ? "bg-emerald-400" : overallStatus === "degraded" ? "bg-amber-400" : "bg-destructive"}`}
            />
            {overallStatus === "healthy"
              ? "All Systems Operational"
              : overallStatus === "degraded"
                ? "Degraded Performance"
                : "Service Disruption"}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthChecks}
            disabled={loading}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {checks.map((check, i) => {
          const Icon = icons[check.name] || Activity;
          return (
            <motion.div
              key={check.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${statusBg(check.status)}`}
                >
                  <Icon className={`w-4 h-4 ${statusColor(check.status)}`} />
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${check.status === "healthy" ? "bg-emerald-400" : check.status === "degraded" ? "bg-amber-400" : "bg-destructive"}`}
                />
              </div>
              <p className="text-sm font-medium text-foreground">
                {check.name}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-lg font-display font-bold ${statusColor(check.status)}`}
                >
                  {check.latency > 0 ? `${check.latency}ms` : "—"}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusBg(check.status)} ${statusColor(check.status)}`}
                >
                  {check.status}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Database Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">
            Database Overview
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            {
              icon: Users,
              label: "Users",
              value: dbStats.totalUsers,
              color: "text-blue-400",
            },
            {
              icon: FileText,
              label: "Humanizations",
              value: dbStats.totalHistory,
              color: "text-emerald-400",
            },
            {
              icon: Database,
              label: "Payments",
              value: dbStats.totalPayments,
              color: "text-primary",
            },
            {
              icon: Activity,
              label: "Feedback",
              value: dbStats.totalFeedback,
              color: "text-purple-400",
            },
            {
              icon: AlertTriangle,
              label: "Failed Logs",
              value: dbStats.totalFailedLogs,
              color: "text-amber-400",
            },
            {
              icon: FileText,
              label: "Blog Posts",
              value: dbStats.totalBlogPosts,
              color: "text-secondary",
            },
            {
              icon: Activity,
              label: "Testimonials",
              value: dbStats.totalTestimonials,
              color: "text-pink-400",
            },
            {
              icon: Activity,
              label: "Announcements",
              value: dbStats.totalAnnouncements,
              color: "text-cyan-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center p-3 rounded-xl bg-accent/30"
            >
              <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <p className="text-lg font-display font-bold text-foreground">
                {s.value.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Average Latency
            </h3>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">
            {avgLatency}
            <span className="text-sm text-muted-foreground ml-1">ms</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Across all services
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-secondary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Uptime
            </h3>
          </div>
          <p className="text-3xl font-display font-bold text-emerald-400">
            {checks.filter((c) => c.status !== "down").length}/{checks.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Services operational
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Issues
            </h3>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">
            {checks.filter((c) => c.status !== "healthy").length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Services need attention
          </p>
        </motion.div>
      </div>

      {/* Latency History Chart */}
      {history.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-foreground text-sm">
              Latency History ({history.length} checks)
            </h3>
            <div className="flex items-center gap-3 ml-auto">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> DB
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Auth
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary" /> Edge
              </span>
            </div>
          </div>
          <div className="relative h-32">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border-b border-border/20 relative">
                  <span className="absolute right-0 -top-2 text-[9px] text-muted-foreground">
                    {Math.round(maxHistoryLatency * (1 - i / 3))}ms
                  </span>
                </div>
              ))}
            </div>
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              {["dbLatency", "authLatency", "edgeLatency"].map((key, ki) => {
                const colors = ["#34d399", "#60a5fa", "hsl(32,95%,55%)"];
                const points = history
                  .map((h, i) => {
                    const x = (i / (history.length - 1)) * 100;
                    const val = h[key];
                    const y =
                      val > 0 ? 100 - (val / maxHistoryLatency) * 100 : 100;
                    return `${x},${y}`;
                  })
                  .join(" ");
                return (
                  <polyline
                    key={key}
                    points={points}
                    fill="none"
                    stroke={colors[ki]}
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground">
              {history[0]?.time}
            </span>
            <span className="text-[9px] text-muted-foreground">
              {history[history.length - 1]?.time}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminSystemHealth;
