"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface FailedRow {
  id: string;
  user_id: string;
  error_message: string;
  input_word_count: number;
  input_preview: string | null;
  created_at: string;
}

const AdminFailedLogs = () => {
  const [logs, setLogs] = useState<FailedRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("failed_humanizations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setLogs(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  // Group errors by message
  const errorGroups = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.error_message] = (acc[l.error_message] || 0) + 1;
    return acc;
  }, {});
  const topErrors = Object.entries(errorGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Failed Humanizations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track and debug failed attempts with error details
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Top errors summary */}
      {topErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-5"
        >
          <h3 className="text-sm font-display font-semibold text-foreground mb-3">
            Top Error Types
          </h3>
          <div className="space-y-2">
            {topErrors.map(([msg, count]) => (
              <div key={msg} className="flex items-center gap-3">
                <span className="text-xs font-mono text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                  {count}×
                </span>
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {msg}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Log list */}
      <div className="glass-panel overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto divide-y divide-border/50">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              No failed humanizations logged — great!
            </div>
          ) : (
            logs.map((l) => (
              <div key={l.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-destructive">
                    {l.error_message}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(l.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="font-mono">{l.user_id.slice(0, 8)}…</span>
                  <span>•</span>
                  <span>{l.input_word_count} words</span>
                  {l.input_preview && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[200px] italic">
                        {l.input_preview.slice(0, 60)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFailedLogs;
