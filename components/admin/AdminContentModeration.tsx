"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Shield,
  Flag,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

interface HistoryItem {
  id: string;
  user_id: string;
  original_text: string;
  humanized_text: string;
  word_count: number;
  created_at: string;
  user_name?: string | null;
}

interface ContentFlag {
  id: string;
  history_id: string;
  user_id: string;
  flag_type: string;
  status: string;
  notes: string | null;
  flagged_at: string;
  reviewed_at: string | null;
}

const AdminContentModeration = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [flags, setFlags] = useState<ContentFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [flagNotes, setFlagNotes] = useState("");
  const [view, setView] = useState<"all" | "flagged" | "reviewed">("all");

  const fetchData = async () => {
    setLoading(true);
    const [historyRes, flagsRes, profilesRes] = await Promise.all([
      supabase
        .from("humanization_history")
        .select(
          "id, user_id, original_text, humanized_text, word_count, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("content_flags").select("*"),
      supabase.from("profiles").select("user_id, full_name"),
    ]);

    const profiles = profilesRes.data ?? [];
    const items = (historyRes.data ?? []).map((h) => ({
      ...h,
      user_name: profiles.find((p) => p.user_id === h.user_id)?.full_name,
    }));
    setHistory(items);
    setFlags(flagsRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const flagContent = async (item: HistoryItem, type: string) => {
    const { error } = await supabase.from("content_flags").insert({
      history_id: item.id,
      user_id: item.user_id,
      flag_type: type,
      notes: flagNotes || null,
    });
    if (error) {
      toast.error("Failed to flag content");
      return;
    }
    toast.success("Content flagged");
    setFlagNotes("");
    fetchData();
  };

  const reviewFlag = async (flagId: string, status: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("content_flags")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq("id", flagId);
    if (error) {
      toast.error("Failed to update flag");
      return;
    }
    toast.success(`Flag marked as ${status}`);
    fetchData();
  };

  const getFlagForItem = (historyId: string) =>
    flags.find((f) => f.history_id === historyId);

  const filtered = history.filter((h) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      h.humanized_text.toLowerCase().includes(q) ||
      h.original_text.toLowerCase().includes(q) ||
      h.user_name?.toLowerCase().includes(q);
    const flag = getFlagForItem(h.id);
    if (view === "flagged")
      return matchesSearch && flag && flag.status === "pending";
    if (view === "reviewed")
      return matchesSearch && flag && flag.status !== "pending";
    return matchesSearch;
  });

  const pendingCount = flags.filter((f) => f.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">
            Content Moderation
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review humanized content · {pendingCount} pending flags
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/50 rounded-lg p-0.5">
            {(["all", "flagged", "reviewed"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {v === "all"
                  ? "All Content"
                  : v === "flagged"
                    ? `Flagged (${pendingCount})`
                    : "Reviewed"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search content…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-52 h-9 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass-panel p-8 text-center">
            <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No content to display
            </p>
          </div>
        )}
        {filtered.map((item) => {
          const flag = getFlagForItem(item.id);
          const isExpanded = expandedId === item.id;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`glass-panel overflow-hidden transition-all ${flag?.status === "pending" ? "border-destructive/30" : ""}`}
            >
              <div
                className="p-4 flex items-start gap-3 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0 mt-0.5">
                  {item.user_name ? item.user_name[0].toUpperCase() : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {item.user_name || "Anonymous"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(item.created_at), "MMM d, HH:mm")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {item.word_count}w
                    </span>
                    {flag && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          flag.status === "pending"
                            ? "bg-destructive/15 text-destructive"
                            : flag.status === "dismissed"
                              ? "bg-muted text-muted-foreground"
                              : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {flag.status === "pending"
                          ? "⚠ Flagged"
                          : flag.status === "dismissed"
                            ? "Dismissed"
                            : "Confirmed"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.humanized_text.slice(0, 150)}…
                  </p>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  className="border-t border-border/50"
                >
                  <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">
                        Original Text
                      </p>
                      <div className="p-3 rounded-lg bg-muted/30 text-xs text-foreground max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {item.original_text}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">
                        Humanized Output
                      </p>
                      <div className="p-3 rounded-lg bg-muted/30 text-xs text-foreground max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {item.humanized_text}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
                    {!flag ? (
                      <>
                        <Input
                          placeholder="Add notes (optional)…"
                          value={flagNotes}
                          onChange={(e) => setFlagNotes(e.target.value)}
                          className="h-8 text-xs flex-1 max-w-xs"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs gap-1"
                          onClick={() => flagContent(item, "abuse")}
                        >
                          <Flag className="w-3 h-3" /> Flag as Abuse
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1"
                          onClick={() => flagContent(item, "spam")}
                        >
                          <Flag className="w-3 h-3" /> Flag as Spam
                        </Button>
                      </>
                    ) : flag.status === "pending" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 text-emerald-400 border-emerald-500/30"
                          onClick={() => reviewFlag(flag.id, "dismissed")}
                        >
                          <XCircle className="w-3 h-3" /> Dismiss
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs gap-1"
                          onClick={() => reviewFlag(flag.id, "confirmed")}
                        >
                          <CheckCircle className="w-3 h-3" /> Confirm Violation
                        </Button>
                        {flag.notes && (
                          <span className="text-[10px] text-muted-foreground">
                            Notes: {flag.notes}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Reviewed · {flag.notes || "No notes"}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminContentModeration;
