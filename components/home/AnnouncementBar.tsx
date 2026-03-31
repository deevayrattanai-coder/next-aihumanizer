"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const colorMap: Record<string, string> = {
  primary: "from-[hsl(32,95%,55%)] to-[hsl(32,95%,45%)]",
  secondary: "from-[hsl(210,80%,60%)] to-[hsl(210,80%,50%)]",
  destructive: "from-[hsl(0,84%,60%)] to-[hsl(0,84%,50%)]",
  emerald: "from-[hsl(160,60%,50%)] to-[hsl(160,60%,40%)]",
};

const AnnouncementBar = () => {
  const [announcements, setAnnouncements] = useState<
    { message: string; color: string }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("message, color")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setAnnouncements(data);
      }
    };
    fetchAnnouncements();
  }, []);

  // Auto-rotate announcements every 5 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0 || dismissed) return null;

  const current = announcements[currentIndex];

  return (
    <div
      className={`relative bg-gradient-to-r ${colorMap[current.color] || colorMap.primary} text-white z-[60]`}
      style={{ minHeight: "36px" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-xs sm:text-sm font-medium text-center"
          >
            {current.message}
          </motion.p>
        </AnimatePresence>
        {announcements.length > 1 && (
          <div className="flex items-center gap-1 ml-2">
            {announcements.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
