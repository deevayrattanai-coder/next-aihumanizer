"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Clock, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface HistoryItem {
  id: string;
  original_text: string;
  humanized_text: string;
  word_count: number;
  is_retry: boolean;
  created_at: string;
}

const History = () => {
  const { user, loading: authLoading } = useAuth();
  //   const navigate = useNavigate();
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("humanization_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setItems(data);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (authLoading) return null;

  // Group items by date
  const grouped = items.reduce<Record<string, HistoryItem[]>>((acc, item) => {
    const dateKey = format(new Date(item.created_at), "MMMM d");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="container-tight px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-display font-bold">History</h1>
            </div>

            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-6 w-32" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="glass-panel p-5 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="flex gap-3 mt-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="glass-panel p-12 text-center">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-semibold text-lg mb-2">
                  No history yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your humanized texts will appear here after you start using
                  the tool.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(grouped).map(([date, dateItems]) => (
                  <div key={date}>
                    <h2 className="text-primary font-display font-semibold text-lg mb-4">
                      {date}
                    </h2>
                    <div className="space-y-4">
                      {dateItems.map((item) => {
                        const isExpanded = expandedId === item.id;
                        return (
                          <motion.div
                            key={item.id}
                            className="glass-panel-hover p-5 cursor-pointer"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : item.id)
                            }
                            layout
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                {/* Original preview */}
                                <p className="text-sm text-foreground line-clamp-2 mb-2">
                                  {item.original_text}
                                </p>
                                {/* Humanized preview */}
                                <p className="text-sm text-muted-foreground italic line-clamp-2">
                                  {item.humanized_text}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {item.is_retry && (
                                  <RefreshCw className="w-3.5 h-3.5 text-secondary" />
                                )}
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                              <span className="font-mono">
                                {item.word_count} words
                              </span>
                              <span>•</span>
                              <span>
                                {format(new Date(item.created_at), "h:mm a")}
                              </span>
                              {item.is_retry && (
                                <>
                                  <span>•</span>
                                  <span className="text-secondary">Retry</span>
                                </>
                              )}
                            </div>

                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-4 pt-4 border-t border-border/50 space-y-4"
                              >
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                    Original Text
                                  </h4>
                                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {item.original_text}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                    Humanized Text
                                  </h4>
                                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {item.humanized_text}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <p className="text-center text-sm text-muted-foreground py-6">
                  You have reached the end.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default History;
