"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Mail,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Submission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiry_type: string;
  resume_link: string | null;
  created_at: string;
}

const AdminContactSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      setSubmissions((data as Submission[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const typeColor = (type: string) => {
    switch (type) {
      case "support":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "feedback":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "job_application":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "partnership":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold">
            Contact Submissions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {submissions.length} total submissions
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-panel p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">
            No submissions yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Contact form submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const isExpanded = expandedId === s.id;
            return (
              <div
                key={s.id}
                className="glass-panel p-5 cursor-pointer hover:border-primary/20 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="font-display font-semibold text-sm">
                        {s.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={typeColor(s.inquiry_type)}
                      >
                        {s.inquiry_type.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {s.subject}
                    </p>
                    {!isExpanded && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {s.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {s.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{" "}
                    {format(new Date(s.created_at), "MMM d, yyyy h:mm a")}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        Message
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {s.message}
                      </p>
                    </div>
                    {s.resume_link && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          Resume / Portfolio
                        </h4>
                        <a
                          href={s.resume_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {s.resume_link} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminContactSubmissions;
