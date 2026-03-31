"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Star,
  Plus,
  Save,
  Trash2,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

interface FeedbackRow {
  id: string;
  user_id: string;
  history_id: string | null;
  rating: string;
  message: string | null;
  created_at: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
}

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    "feedback" | "testimonials"
  >("feedback");
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [feedbackRes, testimonialRes] = await Promise.all([
      supabase
        .from("user_feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("testimonials").select("*").order("sort_order"),
    ]);
    setFeedback(feedbackRes.data ?? []);
    setTestimonials(testimonialRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const upCount = feedback.filter((f) => f.rating === "up").length;
  const downCount = feedback.filter((f) => f.rating === "down").length;
  const withMessage = feedback.filter((f) => f.message);

  const newTestimonial = (): Testimonial => ({
    id: "",
    name: "",
    role: "",
    text: "",
    rating: 5,
    is_active: true,
    sort_order: testimonials.length,
  });

  const saveTestimonial = async () => {
    if (!editingTestimonial) return;
    if (!editingTestimonial.name.trim() || !editingTestimonial.text.trim()) {
      toast.error("Name and text are required");
      return;
    }
    setSaving(true);
    try {
      if (editingTestimonial.id) {
        // Update
        const { error } = await supabase
          .from("testimonials")
          .update({
            name: editingTestimonial.name,
            role: editingTestimonial.role,
            text: editingTestimonial.text,
            rating: editingTestimonial.rating,
            is_active: editingTestimonial.is_active,
            sort_order: editingTestimonial.sort_order,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTestimonial.id);
        if (error) throw error;
        toast.success("Testimonial updated!");
      } else {
        // Create
        const { error } = await supabase.from("testimonials").insert({
          name: editingTestimonial.name,
          role: editingTestimonial.role,
          text: editingTestimonial.text,
          rating: editingTestimonial.rating,
          is_active: editingTestimonial.is_active,
          sort_order: editingTestimonial.sort_order,
        });
        if (error) throw error;
        toast.success("Testimonial created!");
      }
      setEditingTestimonial(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    }
    setSaving(false);
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Deleted");
      fetchData();
    }
  };

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
            Feedback & Testimonials
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            User sentiment and website testimonial management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setActiveSection("feedback")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeSection === "feedback" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              User Feedback
            </button>
            <button
              onClick={() => setActiveSection("testimonials")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeSection === "testimonials" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Testimonials
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {activeSection === "feedback" && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-5 text-center"
            >
              <ThumbsUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-foreground">
                {upCount}
              </p>
              <p className="text-xs text-muted-foreground">Positive</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-panel p-5 text-center"
            >
              <ThumbsDown className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-foreground">
                {downCount}
              </p>
              <p className="text-xs text-muted-foreground">Negative</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-5 text-center"
            >
              <MessageSquare className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-display font-bold text-foreground">
                {withMessage.length}
              </p>
              <p className="text-xs text-muted-foreground">With Messages</p>
            </motion.div>
          </div>

          {/* Feedback list */}
          <div className="glass-panel overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto divide-y divide-border/50">
              {feedback.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No feedback yet
                </div>
              ) : (
                feedback.map((f) => (
                  <div key={f.id} className="px-4 py-3 flex items-start gap-3">
                    <div
                      className={`mt-0.5 p-1.5 rounded-lg ${f.rating === "up" ? "bg-emerald-400/15" : "bg-red-400/15"}`}
                    >
                      {f.rating === "up" ? (
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {f.message && (
                        <p className="text-sm text-foreground mb-1">
                          {f.message}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-mono">
                          {f.user_id.slice(0, 8)}…
                        </span>
                        <span>•</span>
                        <span>
                          {format(new Date(f.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeSection === "testimonials" && (
        <>
          {/* Edit panel */}
          {editingTestimonial && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-display font-bold text-foreground">
                  {editingTestimonial.id
                    ? "Edit Testimonial"
                    : "Add New Testimonial"}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTestimonial(null)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveTestimonial} disabled={saving}>
                    <Save className="w-3.5 h-3.5 mr-1" />{" "}
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={editingTestimonial.name}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 h-9 text-xs"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label className="text-xs">Role</Label>
                  <Input
                    value={editingTestimonial.role}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        role: e.target.value,
                      })
                    }
                    className="mt-1 h-9 text-xs"
                    placeholder="Content Manager"
                  />
                </div>
                <div>
                  <Label className="text-xs">Rating (1-5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={editingTestimonial.rating}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        rating: parseInt(e.target.value) || 5,
                      })
                    }
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Sort Order</Label>
                  <Input
                    type="number"
                    value={editingTestimonial.sort_order}
                    onChange={(e) =>
                      setEditingTestimonial({
                        ...editingTestimonial,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Active</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingTestimonial({
                          ...editingTestimonial,
                          is_active: !editingTestimonial.is_active,
                        })
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${editingTestimonial.is_active ? "bg-primary" : "bg-muted"}`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${editingTestimonial.is_active ? "translate-x-4" : "translate-x-0.5"}`}
                      />
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {editingTestimonial.is_active ? "Visible" : "Hidden"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs">Testimonial Text</Label>
                <Textarea
                  value={editingTestimonial.text}
                  onChange={(e) =>
                    setEditingTestimonial({
                      ...editingTestimonial,
                      text: e.target.value,
                    })
                  }
                  className="mt-1 text-xs min-h-[80px]"
                  placeholder="Write the testimonial..."
                />
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {testimonials.length} testimonials on site
            </p>
            <Button
              size="sm"
              onClick={() => setEditingTestimonial(newTestimonial())}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Testimonial
            </Button>
          </div>

          <div className="glass-panel overflow-hidden divide-y divide-border/50">
            {testimonials.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                No testimonials yet. Add your first one!
              </div>
            ) : (
              testimonials.map((t) => (
                <div key={t.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex items-center gap-0.5 mt-0.5 shrink-0">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="w-3 h-3 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">
                      {t.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span className="font-medium">{t.name}</span>
                      <span>•</span>
                      <span>{t.role}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${t.is_active ? "bg-emerald-400/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}
                      >
                        {t.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingTestimonial({ ...t })}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTestimonial(t.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminFeedback;
