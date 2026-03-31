"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Megaphone, Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";

interface Announcement {
  id: string;
  message: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

const colorOptions = [
  { value: "primary", label: "Orange", preview: "hsl(32,95%,55%)" },
  { value: "secondary", label: "Blue", preview: "hsl(210,80%,60%)" },
  { value: "destructive", label: "Red", preview: "hsl(0,84%,60%)" },
  { value: "emerald", label: "Green", preview: "hsl(160,60%,50%)" },
];

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [newColor, setNewColor] = useState("primary");
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setAnnouncements(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!newMessage.trim()) {
      toast.error("Enter a message");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("announcements").insert({
      message: newMessage.trim(),
      color: newColor,
      is_active: false,
    });
    if (error) toast.error("Failed to create announcement");
    else {
      toast.success("Announcement created!");
      setNewMessage("");
      fetchData();
    }
    setCreating(false);
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await supabase.from("announcements").update({ is_active }).eq("id", id);
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active } : a)),
    );
  };

  const handleDelete = async (id: string) => {
    await supabase.from("announcements").delete().eq("id", id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success("Deleted");
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
      <div>
        <h2 className="text-xl font-display font-bold text-foreground">
          Announcement Bar
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Push a banner message visible to all users at the top of the site
        </p>
      </div>

      {/* Create new */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-5"
      >
        <h3 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> New Announcement
        </h3>
        <div className="space-y-3">
          <div>
            <Label>Message</Label>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="🎉 Exciting update! We just launched..."
              className="mt-1"
            />
          </div>
          <div>
            <Label className="mb-2 block">Color</Label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setNewColor(c.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    newColor === c.value
                      ? "border-primary/50 bg-primary/10"
                      : "border-transparent bg-[hsl(var(--glass))]"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c.preview }}
                  />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleCreate} disabled={creating} size="sm">
            {creating ? "Creating…" : "Create Announcement"}
          </Button>
        </div>
      </motion.div>

      {/* List */}
      <div className="glass-panel overflow-hidden divide-y divide-border/50">
        {announcements.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Megaphone className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            No announcements yet
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="px-4 py-3 flex items-center gap-4">
              <Switch
                checked={a.is_active}
                onCheckedChange={(v) => toggleActive(a.id, v)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{a.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        colorOptions.find((c) => c.value === a.color)
                          ?.preview || "hsl(32,95%,55%)",
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {a.color}
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(a.created_at), "MMM d, yyyy")}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${a.is_active ? "bg-emerald-400/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}
                  >
                    {a.is_active ? "Live" : "Inactive"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
