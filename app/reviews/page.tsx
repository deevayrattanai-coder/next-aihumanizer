"use client";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Quote } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setReviews((data as Testimonial[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-8 pb-16">
        <div className="container-tight px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              What Our Users <span className="gradient-text">Say</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Real feedback from writers, marketers, and content creators who
              trust DevAIHumanizer every day.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-panel p-5 md:p-6 rounded-xl space-y-3"
                >
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Skeleton key={j} className="w-3.5 h-3.5 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="pt-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-panel p-5 md:p-6 rounded-xl group hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative"
                >
                  <Quote className="absolute top-4 right-4 w-6 h-6 text-primary/10 group-hover:text-primary/20 transition-colors" />
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="w-3.5 h-3.5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90 mb-4">
                    {t.text}
                  </p>
                  <div>
                    <p className="font-display font-semibold text-sm text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reviews;
